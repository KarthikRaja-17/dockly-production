import os
import json
import traceback
import requests
from datetime import datetime, timedelta
from flask import Request, request, jsonify, send_file
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import io
import zipfile
import hashlib
import dropbox
from dropbox import files
from root.helpers.logs import AuditLogger
from dropbox.files import WriteMode

from root.auth.auth import auth_required
from root.common import Status
from root.db.dbHelper import DBHelper


class DropboxBaseResource(Resource):
    """Base class for Dropbox operations"""

    def get_user_credentials(self, user_id):
        """Get user's Dropbox credentials from database with proper error handling"""
        try:
            account = DBHelper.find_one(
                "connected_accounts",
                filters={
                    "user_id": user_id,
                    "provider": "dropbox",
                    "is_active": Status.ACTIVE.value,
                },
            )
            if not account:
                AuditLogger.log(
                    user_id=user_id,
                    action="get_dropbox_credentials",
                    resource_type="dropbox_account",
                    resource_id="N/A",
                    success=False,
                    error_message="No active Dropbox account found",
                    metadata={},
                )
                return None

            access_token = account.get("access_token")
            if not access_token:
                AuditLogger.log(
                    user_id=user_id,
                    action="get_dropbox_credentials",
                    resource_type="dropbox_account",
                    resource_id="N/A",
                    success=False,
                    error_message="No access token found for Dropbox account",
                    metadata={},
                )
                return None

            return access_token

        except Exception as e:
            AuditLogger.log(
                user_id=user_id,
                action="get_dropbox_credentials",
                resource_type="dropbox_account",
                resource_id="N/A",
                success=False,
                error_message=str(e),
                metadata={},
            )
            return None

    def get_dropbox_client(self, user_id):
        """Get Dropbox client with error handling"""
        try:
            access_token = self.get_user_credentials(user_id)
            if not access_token:
                return None
            return dropbox.Dropbox(access_token)
        except Exception as e:
            AuditLogger.log(
                user_id=user_id,
                action="create_dropbox_client",
                resource_type="dropbox_account",
                resource_id="N/A",
                success=False,
                error_message=str(e),
                metadata={},
            )
            return None

    def get_dropbox_client_for_account(self, access_token):
        """Create a Dropbox client for a specific account using its token"""
        try:
            return dropbox.Dropbox(access_token)
        except Exception as e:
            AuditLogger.log(
                user_id="unknown",
                action="create_dropbox_client_for_account",
                resource_type="dropbox_account",
                resource_id="N/A",
                success=False,
                error_message=str(e),
                metadata={},
            )
            return None

    def format_bytes(self, bytes_value):
        """Format bytes to human readable format"""
        if bytes_value == 0:
            return "0 B"
        sizes = ["B", "KB", "MB", "GB", "TB"]
        i = 0
        while bytes_value >= 1024 and i < len(sizes) - 1:
            bytes_value /= 1024
            i += 1
        return f"{bytes_value:.1f} {sizes[i]}"

    def log_activity(self, user_id, action, file_name, file_path=None, details=None, success=True):
        """Log user activity and audit log"""
        try:
            # Insert activity in Dropbox-specific table
            DBHelper.insert(
                "dropbox_activity_log",
                {
                    "user_id": user_id,
                    "action": action,
                    "file_path": file_path,
                    "file_name": file_name,
                    "details": details,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )

            # Create audit log
            AuditLogger.log(
                user_id=user_id,
                action=action,
                resource_type="dropbox_file",
                resource_id=file_name or "N/A",
                success=success,
                error_message=None if success else details,
                metadata={"file_path": file_path, "details": details},
            )

        except Exception as e:
            print(f"Error logging activity or audit: {str(e)}")


class ListDropboxFiles(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            folder_path = data.get("folderPath", "")
            sort_by = data.get("sortBy", "server_modified")
            sort_order = data.get("sortOrder", "desc")
            page_size = data.get("pageSize", 100)

            # Get all Dropbox accounts for the user
            select_fields = ["access_token", "email", "provider", "user_object"]

            all_accounts = DBHelper.find(
                "connected_accounts",
                filters={
                    "user_id": uid,
                    "provider": "dropbox",
                    "is_active": Status.ACTIVE.value,
                },
                select_fields=select_fields,
            )

            if not all_accounts:
                AuditLogger.log(
                    user_id=uid,
                    action="list_dropbox_files",
                    resource_type="dropbox_account",
                    resource_id="none",
                    success=False,
                    error_message="No Dropbox accounts connected",
                )
                return {
                    "status": 0,
                    "message": "No Dropbox accounts connected.",
                    "payload": {"files": [], "folders": [], "connected_accounts": [], "errors": []},
                }

            merged_files = []
            merged_folders = []
            connected_accounts = []
            errors = []

            processed_file_paths = set()
            processed_folder_paths = set()

            for account in all_accounts:
                email = account.get("email")
                access_token = account.get("access_token")
                user_object = account.get("user_object")

                try:
                    user_object_data = json.loads(user_object) if user_object else {}
                except json.JSONDecodeError:
                    user_object_data = {}

                try:
                    # Create Dropbox client
                    dbx = self.get_dropbox_client_for_account(access_token)
                    if not dbx:
                        error_msg = "Failed to create Dropbox client - token may be expired"
                        errors.append({"email": email, "error": error_msg})
                        AuditLogger.log(
                            user_id=uid,
                            action="list_dropbox_files",
                            resource_type="dropbox_account",
                            resource_id=email,
                            success=False,
                            error_message=error_msg,
                        )
                        continue

                    # List files/folders
                    try:
                        result = dbx.files_list_folder(folder_path or "")
                    except dropbox.exceptions.ApiError as e:
                        if "not_found" in str(e):
                            result = dbx.files_list_folder("")
                        else:
                            raise e

                    entries = result.entries

                    while result.has_more:
                        result = dbx.files_list_folder_continue(result.cursor)
                        entries.extend(result.entries)

                    account_files = []
                    account_folders = []

                    for entry in entries:
                        entry_path = entry.path_lower
                        is_folder = isinstance(entry, dropbox.files.FolderMetadata)

                        if is_folder:
                            if entry_path in processed_folder_paths:
                                continue
                            processed_folder_paths.add(entry_path)
                        else:
                            if entry_path in processed_file_paths:
                                continue
                            processed_file_paths.add(entry_path)

                        base_info = {
                            "id": entry.path_lower,
                            "name": entry.name,
                            "modifiedTime": getattr(entry, "server_modified", datetime.utcnow()).isoformat()
                            if hasattr(entry, "server_modified") else datetime.utcnow().isoformat(),
                            "createdTime": getattr(entry, "client_modified", datetime.utcnow()).isoformat()
                            if hasattr(entry, "client_modified") else datetime.utcnow().isoformat(),
                            "shared": False,
                            "trashed": False,
                            "path": entry.path_display,
                            "path_lower": entry.path_lower,
                            "source_email": email,
                            "account_name": user_object_data.get("name", email.split("@")[0] if email else "Unknown"),
                            "provider": "dropbox",
                            "owners": [
                                {
                                    "displayName": user_object_data.get("name", email.split("@")[0] if email else "Unknown"),
                                    "emailAddress": email or "",
                                    "photoLink": user_object_data.get("picture"),
                                }
                            ],
                        }

                        if is_folder:
                            account_folders.append(base_info)
                        else:
                            file_info = {
                                **base_info,
                                "size": getattr(entry, "size", 0),
                                "server_modified": getattr(entry, "server_modified", None).isoformat()
                                if hasattr(entry, "server_modified") else None,
                                "client_modified": getattr(entry, "client_modified", None).isoformat()
                                if hasattr(entry, "client_modified") else None,
                                "content_hash": getattr(entry, "content_hash", None),
                                "is_downloadable": True,
                                "mimeType": self.get_mime_type_from_name(entry.name),
                                "webViewLink": f"https://www.dropbox.com/home{entry.path_display}",
                                "starred": False,
                            }
                            account_files.append(file_info)

                    merged_files.extend(account_files)
                    merged_folders.extend(account_folders)

                    connected_accounts.append(
                        {
                            "email": email or "Unknown",
                            "provider": "dropbox",
                            "userName": user_object_data.get("name", email.split("@")[0] if email else "Unknown"),
                            "displayName": user_object_data.get("name", email.split("@")[0] if email else "Unknown"),
                            "picture": user_object_data.get("picture", ""),
                            "files_count": len(account_files),
                            "folders_count": len(account_folders),
                        }
                    )

                    AuditLogger.log(
                        user_id=uid,
                        action="list_dropbox_files",
                        resource_type="dropbox_account",
                        resource_id=email,
                        success=True,
                        metadata={
                            "files_count": len(account_files),
                            "folders_count": len(account_folders),
                            "folder_path": folder_path,
                        },
                    )

                except Exception as e:
                    error_msg = str(e)
                    errors.append({"email": email, "error": error_msg})
                    AuditLogger.log(
                        user_id=uid,
                        action="list_dropbox_files",
                        resource_type="dropbox_account",
                        resource_id=email,
                        success=False,
                        error_message=error_msg,
                    )

                    # Token deactivation if auth error
                    if any(keyword in error_msg.lower() for keyword in ["invalid_access_token","401","invalid_token","expired"]):
                        DBHelper.update_one(
                            table_name="connected_accounts",
                            filters={"user_id": uid, "email": email, "provider": "dropbox"},
                            updates={"is_active": Status.REMOVED.value},
                        )
                        AuditLogger.log(
                            user_id=uid,
                            action="deactivate_dropbox_token",
                            resource_type="dropbox_account",
                            resource_id=email,
                            success=True,
                            metadata={"reason": error_msg}
                        )

            # Sort merged results
            sort_key = "server_modified" if sort_by == "server_modified" else "name"
            reverse_order = sort_order == "desc"

            merged_files.sort(key=lambda f: f.get(sort_key, "") or "", reverse=reverse_order)
            merged_folders.sort(key=lambda f: f.get("name", "") or "", reverse=reverse_order)

            message_text = (
                f"Retrieved {len(merged_files)} files and {len(merged_folders)} folders from Dropbox."
                if (merged_files or merged_folders)
                else "No files found."
            )

            # Overall audit log for the request
            AuditLogger.log(
                user_id=uid,
                action="list_dropbox_files_request",
                resource_type="user_dropbox",
                resource_id=str(uid),
                success=True,
                metadata={"total_files": len(merged_files), "total_folders": len(merged_folders)},
            )

            return {
                "status": 1,
                "message": message_text,
                "payload": {
                    "files": merged_files,
                    "folders": merged_folders,
                    "connected_accounts": connected_accounts,
                    "errors": errors,
                    "nextPageToken": None,
                },
            }

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="list_dropbox_files_request",
                resource_type="user_dropbox",
                resource_id=str(uid),
                success=False,
                error_message=str(e),
            )
            return {
                "status": 0,
                "message": f"Failed to fetch Dropbox files: {str(e)}",
                "payload": {
                    "files": [],
                    "folders": [],
                    "connected_accounts": [],
                    "errors": [{"error": str(e)}],
                },
            }

    def get_mime_type_from_name(self, file_name):
        extension = file_name.split(".").pop().lower() if "." in file_name else ""
        mime_types = {
            "pdf": "application/pdf",
            "doc": "application/msword",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "xls": "application/vnd.ms-excel",
            "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "ppt": "application/vnd.ms-powerpoint",
            "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "gif": "image/gif",
            "svg": "image/svg+xml",
            "mp4": "video/mp4",
            "avi": "video/avi",
            "mov": "video/quicktime",
            "mp3": "audio/mpeg",
            "wav": "audio/wav",
            "zip": "application/zip",
            "rar": "application/rar",
            "txt": "text/plain",
            "csv": "text/csv",
            "json": "application/json",
            "xml": "application/xml",
            "html": "text/html",
            "css": "text/css",
            "js": "application/javascript",
            "ts": "application/typescript",
        }
        return mime_types.get(extension, "application/octet-stream")

class UploadDropboxFile(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if "file" not in request.files:
                AuditLogger.log(
                    user_id=uid,
                    action="upload_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id="none",
                    success=False,
                    error_message="No file provided",
                )
                return {"status": 0, "message": "No file provided", "payload": {}}

            file = request.files["file"]
            folder_path = request.form.get("folderPath", "")

            if file.filename == "":
                AuditLogger.log(
                    user_id=uid,
                    action="upload_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id="none",
                    success=False,
                    error_message="No file selected",
                )
                return {"status": 0, "message": "No file selected", "payload": {}}

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                AuditLogger.log(
                    user_id=uid,
                    action="upload_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id=file.filename,
                    success=False,
                    error_message="Dropbox not connected or token expired",
                )
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            # Prepare file path
            filename = secure_filename(file.filename)
            if folder_path and not folder_path.startswith("/"):
                folder_path = "/" + folder_path
            if folder_path and not folder_path.endswith("/"):
                folder_path += "/"
            file_path = f"{folder_path}{filename}" if folder_path else f"/{filename}"

            # Read file content
            file_content = file.read()

            # Upload file
            if len(file_content) <= 150 * 1024 * 1024:  # 150MB simple upload
                uploaded_file = dbx.files_upload(
                    file_content,
                    file_path,
                    mode=WriteMode("overwrite"),
                    autorename=True,
                )
            else:
                # Upload session for large files
                session_start_result = dbx.files_upload_session_start(
                    file_content[: 4 * 1024 * 1024]
                )
                cursor = dropbox.files.UploadSessionCursor(
                    session_id=session_start_result.session_id,
                    offset=4 * 1024 * 1024,
                )

                remaining_content = file_content[4 * 1024 * 1024 :]
                while len(remaining_content) > 4 * 1024 * 1024:
                    chunk = remaining_content[: 4 * 1024 * 1024]
                    dbx.files_upload_session_append_v2(chunk, cursor)
                    cursor.offset += len(chunk)
                    remaining_content = remaining_content[4 * 1024 * 1024 :]

                uploaded_file = dbx.files_upload_session_finish(
                    remaining_content,
                    cursor,
                    dropbox.files.CommitInfo(
                        path=file_path, mode=WriteMode("overwrite"), autorename=True
                    ),
                )

            # Log successful upload
            AuditLogger.log(
                user_id=uid,
                action="upload_dropbox_file",
                resource_type="dropbox_file",
                resource_id=uploaded_file.path_lower,
                success=True,
                metadata={
                    "file_name": uploaded_file.name,
                    "file_path": uploaded_file.path_display,
                    "size": uploaded_file.size,
                },
            )

            return {
                "status": 1,
                "message": f"File '{file.filename}' uploaded successfully",
                "payload": {
                    "file": {
                        "id": uploaded_file.path_lower,
                        "name": uploaded_file.name,
                        "path": uploaded_file.path_display,
                        "size": uploaded_file.size,
                        "server_modified": (
                            uploaded_file.server_modified.isoformat()
                            if uploaded_file.server_modified
                            else None
                        ),
                    }
                },
            }

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="upload_dropbox_file",
                resource_type="dropbox_file",
                resource_id=file.filename if "file" in locals() else "unknown",
                success=False,
                error_message=str(e),
            )
            return {
                "status": 0,
                "message": f"Failed to upload file: {str(e)}",
                "payload": {},
            }


class DownloadDropboxFile(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_path = data.get("filePath")

            if not file_path:
                AuditLogger.log(
                    user_id=uid,
                    action="download_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id="none",
                    success=False,
                    error_message="File path required",
                )
                return {"status": 0, "message": "File path required", "payload": {}}

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                AuditLogger.log(
                    user_id=uid,
                    action="download_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id=file_path,
                    success=False,
                    error_message="Dropbox not connected or token expired",
                )
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            # Download file
            metadata, response = dbx.files_download(file_path)
            file_content = response.content
            file_buffer = io.BytesIO(file_content)

            # Log successful download
            AuditLogger.log(
                user_id=uid,
                action="download_dropbox_file",
                resource_type="dropbox_file",
                resource_id=metadata.path_lower,
                success=True,
                metadata={
                    "file_name": metadata.name,
                    "file_path": metadata.path_display,
                    "size": getattr(metadata, "size", None),
                },
            )

            return send_file(
                file_buffer,
                as_attachment=True,
                download_name=metadata.name,
                mimetype="application/octet-stream",
            )

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="download_dropbox_file",
                resource_type="dropbox_file",
                resource_id=file_path if "file_path" in locals() else "unknown",
                success=False,
                error_message=str(e),
            )
            return {
                "status": 0,
                "message": f"Failed to download file: {str(e)}",
                "payload": {},
            }

class DeleteDropboxFile(DropboxBaseResource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        try:
            data = request.get_json() or {}
            file_path = data.get("filePath")

            if not file_path:
                AuditLogger.log(
                    user_id=uid,
                    action="delete_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id="none",
                    success=False,
                    error_message="File path required",
                )
                return {"status": 0, "message": "File path required", "payload": {}}

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                AuditLogger.log(
                    user_id=uid,
                    action="delete_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id=file_path,
                    success=False,
                    error_message="Dropbox not connected or token expired",
                )
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            # Get file name before deletion
            try:
                metadata = dbx.files_get_metadata(file_path)
                file_name = metadata.name
            except:
                file_name = "Unknown file"

            # Delete file
            dbx.files_delete_v2(file_path)

            # Log successful deletion
            AuditLogger.log(
                user_id=uid,
                action="delete_dropbox_file",
                resource_type="dropbox_file",
                resource_id=file_path,
                success=True,
                metadata={"file_name": file_name, "file_path": file_path},
            )

            return {
                "status": 1,
                "message": f"File '{file_name}' deleted successfully",
                "payload": {},
            }

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="delete_dropbox_file",
                resource_type="dropbox_file",
                resource_id=file_path if "file_path" in locals() else "unknown",
                success=False,
                error_message=str(e),
            )
            return {
                "status": 0,
                "message": f"Failed to delete file: {str(e)}",
                "payload": {},
            }

class CreateDropboxFolder(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            folder_name = data.get("name")
            parent_path = data.get("parentPath", "")

            if not folder_name:
                AuditLogger.log(
                    user_id=uid,
                    action="create_dropbox_folder",
                    resource_type="dropbox_folder",
                    resource_id="none",
                    success=False,
                    error_message="Folder name required",
                )
                return {"status": 0, "message": "Folder name required", "payload": {}}

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                AuditLogger.log(
                    user_id=uid,
                    action="create_dropbox_folder",
                    resource_type="dropbox_folder",
                    resource_id=folder_name,
                    success=False,
                    error_message="Dropbox not connected or token expired",
                )
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            # Create folder path
            if parent_path and not parent_path.startswith("/"):
                parent_path = "/" + parent_path
            if parent_path and not parent_path.endswith("/"):
                parent_path += "/"

            folder_path = f"{parent_path}{folder_name}" if parent_path else f"/{folder_name}"

            # Create folder
            folder = dbx.files_create_folder_v2(folder_path, autorename=True)

            # Log successful creation
            AuditLogger.log(
                user_id=uid,
                action="create_dropbox_folder",
                resource_type="dropbox_folder",
                resource_id=folder_path,
                success=True,
                metadata={"folder_name": folder_name, "folder_path": folder_path},
            )

            return {
                "status": 1,
                "message": f"Folder '{folder_name}' created successfully",
                "payload": {
                    "folder": {
                        "id": folder.metadata.path_lower,
                        "name": folder.metadata.name,
                        "path": folder.metadata.path_display,
                    }
                },
            }

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="create_dropbox_folder",
                resource_type="dropbox_folder",
                resource_id=folder_name if "folder_name" in locals() else "unknown",
                success=False,
                error_message=str(e),
            )
            return {
                "status": 0,
                "message": f"Failed to create folder: {str(e)}",
                "payload": {},
            }

class ShareDropboxFile(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_path = data.get("filePath")
            access_level = data.get("accessLevel", "viewer")

            if not file_path:
                AuditLogger.log(
                    user_id=uid,
                    action="share_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id="none",
                    success=False,
                    error_message="File path required",
                )
                return {
                    "status": 0,
                    "message": "File path required",
                    "payload": {},
                }

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                AuditLogger.log(
                    user_id=uid,
                    action="share_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id=file_path,
                    success=False,
                    error_message="Dropbox not connected or token expired",
                )
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            # Get file name for response
            try:
                metadata = dbx.files_get_metadata(file_path)
                file_name = metadata.name
            except:
                file_name = "Unknown file"

            # Create shared link
            shared_link = dbx.sharing_create_shared_link_with_settings(
                file_path,
                settings=dropbox.sharing.SharedLinkSettings(
                    requested_visibility=dropbox.sharing.RequestedVisibility.public
                ),
            )

            # Log successful sharing
            AuditLogger.log(
                user_id=uid,
                action="share_dropbox_file",
                resource_type="dropbox_file",
                resource_id=file_path,
                success=True,
                metadata={
                    "file_name": file_name,
                    "access_level": access_level,
                    "shared_link": shared_link.url,
                },
            )

            return {
                "status": 1,
                "message": f"File '{file_name}' shared successfully",
                "payload": {
                    "shared_link": shared_link.url,
                    "file_name": file_name,
                    "access_level": access_level,
                },
            }

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="share_dropbox_file",
                resource_type="dropbox_file",
                resource_id=file_path if "file_path" in locals() else "unknown",
                success=False,
                error_message=str(e),
            )
            return {
                "status": 0,
                "message": f"Failed to share file: {str(e)}",
                "payload": {},
            }



class GetDropboxFileInfo(DropboxBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user, file_path):
        try:
            # Decode file path if it's URL encoded
            import urllib.parse

            file_path = urllib.parse.unquote(file_path)

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            # Get file info
            file_info = dbx.files_get_metadata(file_path, include_media_info=True)

            file_data = {
                "id": file_info.path_lower,
                "name": file_info.name,
                "path": file_info.path_display,
                "path_lower": file_info.path_lower,
            }

            # Add file-specific metadata
            if isinstance(file_info, dropbox.files.FileMetadata):
                file_data.update(
                    {
                        "size": file_info.size,
                        "server_modified": (
                            file_info.server_modified.isoformat()
                            if file_info.server_modified
                            else None
                        ),
                        "client_modified": (
                            file_info.client_modified.isoformat()
                            if file_info.client_modified
                            else None
                        ),
                        "content_hash": getattr(file_info, "content_hash", None),
                        "is_downloadable": True,
                        "mimeType": self.get_mime_type_from_name(file_info.name),
                    }
                )

            return {
                "status": 1,
                "message": "File information retrieved successfully",
                "payload": {"file": file_data},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to get file info: {str(e)}",
                "payload": {},
            }

    def get_mime_type_from_name(self, file_name):
        """Helper function to determine mime type from file extension"""
        extension = file_name.split(".").pop().lower() if "." in file_name else ""
        mime_types = {
            "pdf": "application/pdf",
            "doc": "application/msword",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "gif": "image/gif",
            "mp4": "video/mp4",
            "mp3": "audio/mpeg",
            "txt": "text/plain",
            "zip": "application/zip",
        }
        return mime_types.get(extension, "application/octet-stream")


class GetDropboxStorage(DropboxBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        """Get storage information for all connected Dropbox accounts"""
        try:
            # Get all Dropbox accounts for the user
            all_accounts = DBHelper.find(
                "connected_accounts",
                filters={
                    "user_id": uid,
                    "provider": "dropbox",
                    "is_active": Status.ACTIVE.value,
                },
                select_fields=["email", "user_object", "access_token"],
            )

            if not all_accounts:
                return {
                    "status": 0,
                    "message": "No Dropbox accounts connected.",
                    "payload": {
                        "storage_info": [],
                        "total_storage": {"used": 0, "limit": 0},
                    },
                }

            storage_info = []
            total_used = 0
            total_limit = 0

            for account in all_accounts:
                email = account.get("email")
                access_token = account.get("access_token")

                try:
                    dbx = self.get_dropbox_client_for_account(access_token)
                    if not dbx:
                        continue

                    # Get storage usage
                    space_usage = dbx.users_get_space_usage()
                    current_user = dbx.users_get_current_account()

                    used = space_usage.used
                    limit = (
                        space_usage.allocation.get_individual().allocated
                        if hasattr(space_usage.allocation, "get_individual")
                        else 0
                    )

                    storage_info.append(
                        {
                            "email": email,
                            "displayName": current_user.name.display_name,
                            "used": used,
                            "limit": limit,
                            "usage_percentage": (
                                round((used / limit * 100), 2) if limit > 0 else 0
                            ),
                            "used_formatted": self.format_bytes(used),
                            "limit_formatted": self.format_bytes(limit),
                        }
                    )

                    total_used += used
                    total_limit += limit

                except Exception as e:
                    print(f"Error getting storage info for {email}: {str(e)}")
                    continue

            return {
                "status": 1,
                "message": f"Storage information retrieved for {len(storage_info)} accounts",
                "payload": {
                    "storage_info": storage_info,
                    "total_storage": {
                        "used": total_used,
                        "limit": total_limit,
                        "usage_percentage": (
                            round((total_used / total_limit * 100), 2)
                            if total_limit > 0
                            else 0
                        ),
                        "used_formatted": self.format_bytes(total_used),
                        "limit_formatted": self.format_bytes(total_limit),
                    },
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to get storage info: {str(e)}",
                "payload": {
                    "storage_info": [],
                    "total_storage": {"used": 0, "limit": 0},
                },
            }



class RenameDropboxFile(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_path = data.get("filePath")
            new_name = data.get("newName")

            if not file_path or not new_name:
                AuditLogger.log(
                    user_id=uid,
                    action="rename_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id=file_path or "none",
                    success=False,
                    error_message="File path and new name required",
                )
                return {
                    "status": 0,
                    "message": "File path and new name required",
                    "payload": {},
                }

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                AuditLogger.log(
                    user_id=uid,
                    action="rename_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id=file_path,
                    success=False,
                    error_message="Dropbox not connected or token expired",
                )
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            # Create new path with new name
            parent_path = "/".join(file_path.split("/")[:-1])
            new_path = f"{parent_path}/{new_name}" if parent_path else f"/{new_name}"

            # Rename file (move to new name)
            updated_file = dbx.files_move_v2(file_path, new_path)

            # Log successful rename
            AuditLogger.log(
                user_id=uid,
                action="rename_dropbox_file",
                resource_type="dropbox_file",
                resource_id=file_path,
                success=True,
                metadata={
                    "old_path": file_path,
                    "new_path": new_path,
                    "new_name": new_name,
                },
            )

            return {
                "status": 1,
                "message": f"File renamed to '{new_name}' successfully",
                "payload": {
                    "file": {
                        "path": updated_file.metadata.path_display,
                        "name": updated_file.metadata.name,
                    }
                },
            }

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="rename_dropbox_file",
                resource_type="dropbox_file",
                resource_id=file_path if "file_path" in locals() else "unknown",
                success=False,
                error_message=str(e),
            )
            return {
                "status": 0,
                "message": f"Failed to rename file: {str(e)}",
                "payload": {},
            }


class CopyDropboxFile(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_path = data.get("filePath")
            target_path = data.get("targetPath")
            name = data.get("name")

            if not file_path:
                AuditLogger.log(
                    user_id=uid,
                    action="copy_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id="none",
                    success=False,
                    error_message="File path required",
                )
                return {"status": 0, "message": "File path required", "payload": {}}

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                AuditLogger.log(
                    user_id=uid,
                    action="copy_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id=file_path,
                    success=False,
                    error_message="Dropbox not connected or token expired",
                )
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            # Get original file name if no name provided
            if not name:
                metadata = dbx.files_get_metadata(file_path)
                name = f"Copy of {metadata.name}"

            # Prepare copy path
            if not target_path:
                parent_path = "/".join(file_path.split("/")[:-1])
                target_path = f"{parent_path}/{name}" if parent_path else f"/{name}"
            else:
                if not target_path.endswith("/"):
                    target_path += "/"
                target_path = f"{target_path}{name}"

            # Copy file
            copied_file = dbx.files_copy_v2(file_path, target_path, autorename=True)

            # Log successful copy
            AuditLogger.log(
                user_id=uid,
                action="copy_dropbox_file",
                resource_type="dropbox_file",
                resource_id=file_path,
                success=True,
                metadata={
                    "source_path": file_path,
                    "target_path": target_path,
                    "new_name": copied_file.metadata.name,
                },
            )

            return {
                "status": 1,
                "message": f"File copied successfully as '{copied_file.metadata.name}'",
                "payload": {
                    "file": {
                        "path": copied_file.metadata.path_display,
                        "name": copied_file.metadata.name,
                    }
                },
            }

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="copy_dropbox_file",
                resource_type="dropbox_file",
                resource_id=file_path if "file_path" in locals() else "unknown",
                success=False,
                error_message=str(e),
            )
            return {"status": 0, "message": f"Failed to copy file: {str(e)}", "payload": {}}


class MoveDropboxFile(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_path = data.get("filePath")
            target_folder_path = data.get("targetFolderPath")

            if not file_path or target_folder_path is None:
                AuditLogger.log(
                    user_id=uid,
                    action="move_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id="none",
                    success=False,
                    error_message="File path and target folder path required",
                )
                return {
                    "status": 0,
                    "message": "File path and target folder path required",
                    "payload": {},
                }

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                AuditLogger.log(
                    user_id=uid,
                    action="move_dropbox_file",
                    resource_type="dropbox_file",
                    resource_id=file_path,
                    success=False,
                    error_message="Dropbox not connected or token expired",
                )
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            # Get file name
            metadata = dbx.files_get_metadata(file_path)
            file_name = metadata.name

            # Create new path
            if target_folder_path and not target_folder_path.endswith("/"):
                target_folder_path += "/"
            new_path = f"{target_folder_path}{file_name}"

            # Move file
            updated_file = dbx.files_move_v2(file_path, new_path, autorename=True)

            # Log successful move
            AuditLogger.log(
                user_id=uid,
                action="move_dropbox_file",
                resource_type="dropbox_file",
                resource_id=file_path,
                success=True,
                metadata={
                    "source_path": file_path,
                    "target_path": new_path,
                    "file_name": file_name,
                },
            )

            return {
                "status": 1,
                "message": f"File '{file_name}' moved successfully",
                "payload": {
                    "file": {
                        "path": updated_file.metadata.path_display,
                        "name": updated_file.metadata.name,
                    }
                },
            }

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="move_dropbox_file",
                resource_type="dropbox_file",
                resource_id=file_path if "file_path" in locals() else "unknown",
                success=False,
                error_message=str(e),
            )
            return {
                "status": 0,
                "message": f"Failed to move file: {str(e)}",
                "payload": {},
            }


# Bulk Operations
class BulkDownloadDropboxFiles(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_paths = data.get("filePaths", [])

            if not file_paths:
                AuditLogger.log(
                    user_id=uid,
                    action="bulk_download_dropbox_files",
                    resource_type="dropbox_files",
                    resource_id="none",
                    success=False,
                    error_message="File paths required",
                )
                return {"status": 0, "message": "File paths required", "payload": {}}

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                AuditLogger.log(
                    user_id=uid,
                    action="bulk_download_dropbox_files",
                    resource_type="dropbox_files",
                    resource_id="none",
                    success=False,
                    error_message="Dropbox not connected or token expired",
                )
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            # Create a zip file in memory
            zip_buffer = io.BytesIO()
            downloaded_files = []
            failed_files = []

            with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
                for file_path in file_paths:
                    try:
                        # Download file
                        metadata, response = dbx.files_download(file_path)
                        file_content = response.content

                        # Add file to zip
                        zip_file.writestr(metadata.name, file_content)
                        downloaded_files.append(metadata.name)
                    except Exception as e:
                        print(f"Error downloading file {file_path}: {str(e)}")
                        failed_files.append({"file_path": file_path, "error": str(e)})
                        continue

            zip_buffer.seek(0)

            # Log successful bulk download
            AuditLogger.log(
                user_id=uid,
                action="bulk_download_dropbox_files",
                resource_type="dropbox_files",
                resource_id=", ".join(downloaded_files) if downloaded_files else "none",
                success=True if downloaded_files else False,
                metadata={
                    "requested_files_count": len(file_paths),
                    "downloaded_files_count": len(downloaded_files),
                    "failed_files": failed_files,
                },
            )

            if not downloaded_files:
                return {
                    "status": 0,
                    "message": "Failed to download any files",
                    "payload": {"errors": failed_files},
                }

            return send_file(
                zip_buffer,
                as_attachment=True,
                download_name="bulk_download.zip",
                mimetype="application/zip",
            )

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="bulk_download_dropbox_files",
                resource_type="dropbox_files",
                resource_id="unknown",
                success=False,
                error_message=str(e),
            )
            return {
                "status": 0,
                "message": f"Failed to bulk download files: {str(e)}",
                "payload": {},
            }


class BulkDeleteDropboxFiles(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_paths = data.get("filePaths", [])

            if not file_paths:
                return {"status": 0, "message": "File paths required", "payload": {}}

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            deleted_files = []
            errors = []

            for file_path in file_paths:
                try:
                    # Get file name before deletion
                    try:
                        metadata = dbx.files_get_metadata(file_path)
                        file_name = metadata.name
                    except:
                        file_name = "Unknown file"

                    # Delete file
                    dbx.files_delete_v2(file_path)
                    deleted_files.append({"path": file_path, "name": file_name})

                except Exception as e:
                    errors.append({"path": file_path, "error": str(e)})

            # Log activity
            self.log_activity(uid, "bulk_delete", f"{len(deleted_files)} files")

            return {
                "status": 1,
                "message": f"Bulk delete completed. {len(deleted_files)} files deleted, {len(errors)} errors",
                "payload": {
                    "deleted_files": deleted_files,
                    "errors": errors,
                    "success_count": len(deleted_files),
                    "error_count": len(errors),
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to bulk delete files: {str(e)}",
                "payload": {},
            }


class BulkMoveDropboxFiles(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_paths = data.get("filePaths", [])
            target_folder_path = data.get("targetFolderPath")

            if not file_paths or target_folder_path is None:
                return {
                    "status": 0,
                    "message": "File paths and target folder path required",
                    "payload": {},
                }

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            moved_files = []
            errors = []

            for file_path in file_paths:
                try:
                    # Get file name
                    metadata = dbx.files_get_metadata(file_path)
                    file_name = metadata.name

                    # Create new path
                    if target_folder_path and not target_folder_path.endswith("/"):
                        target_folder_path += "/"
                    new_path = f"{target_folder_path}{file_name}"

                    # Move file
                    moved_metadata = dbx.files_move_v2(
                        file_path, new_path, autorename=True
                    )

                    moved_files.append(
                        {
                            "old_path": file_path,
                            "new_path": moved_metadata.metadata.path_display,
                            "name": file_name,
                        }
                    )

                except Exception as e:
                    errors.append({"path": file_path, "error": str(e)})

            # Log activity
            self.log_activity(uid, "bulk_move", f"{len(moved_files)} files")

            return {
                "status": 1,
                "message": f"Bulk move completed. {len(moved_files)} files moved, {len(errors)} errors",
                "payload": {
                    "moved_files": moved_files,
                    "errors": errors,
                    "success_count": len(moved_files),
                    "error_count": len(errors),
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to bulk move files: {str(e)}",
                "payload": {},
            }


class BulkCopyDropboxFiles(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_paths = data.get("filePaths", [])
            target_folder_path = data.get("targetFolderPath")

            if not file_paths or target_folder_path is None:
                return {
                    "status": 0,
                    "message": "File paths and target folder path required",
                    "payload": {},
                }

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            copied_files = []
            errors = []

            for file_path in file_paths:
                try:
                    # Get file name
                    metadata = dbx.files_get_metadata(file_path)
                    file_name = metadata.name

                    # Create new path with "Copy of" prefix
                    if target_folder_path and not target_folder_path.endswith("/"):
                        target_folder_path += "/"
                    new_path = f"{target_folder_path}Copy of {file_name}"

                    # Copy file
                    copied_metadata = dbx.files_copy_v2(
                        file_path, new_path, autorename=True
                    )

                    copied_files.append(
                        {
                            "original_path": file_path,
                            "copy_path": copied_metadata.metadata.path_display,
                            "name": copied_metadata.metadata.name,
                        }
                    )

                except Exception as e:
                    errors.append({"path": file_path, "error": str(e)})

            # Log activity
            self.log_activity(uid, "bulk_copy", f"{len(copied_files)} files")

            return {
                "status": 1,
                "message": f"Bulk copy completed. {len(copied_files)} files copied, {len(errors)} errors",
                "payload": {
                    "copied_files": copied_files,
                    "errors": errors,
                    "success_count": len(copied_files),
                    "error_count": len(errors),
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to bulk copy files: {str(e)}",
                "payload": {},
            }


class BulkShareDropboxFiles(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_paths = data.get("filePaths", [])
            access_level = data.get("accessLevel", "viewer")

            if not file_paths:
                return {
                    "status": 0,
                    "message": "File paths required",
                    "payload": {},
                }

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            shared_files = []
            errors = []

            for file_path in file_paths:
                try:
                    # Get file name
                    metadata = dbx.files_get_metadata(file_path)
                    file_name = metadata.name

                    # Create shared link
                    shared_link = dbx.sharing_create_shared_link_with_settings(
                        file_path,
                        settings=dropbox.sharing.SharedLinkSettings(
                            requested_visibility=dropbox.sharing.RequestedVisibility.public
                        ),
                    )

                    shared_files.append(
                        {
                            "path": file_path,
                            "name": file_name,
                            "shared_link": shared_link.url,
                        }
                    )

                except Exception as e:
                    errors.append({"path": file_path, "error": str(e)})

            # Log activity
            self.log_activity(uid, "bulk_share", f"{len(shared_files)} files")

            return {
                "status": 1,
                "message": f"Bulk share completed. {len(shared_files)} files shared, {len(errors)} errors",
                "payload": {
                    "shared_files": shared_files,
                    "errors": errors,
                    "success_count": len(shared_files),
                    "error_count": len(errors),
                    "access_level": access_level,
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to bulk share files: {str(e)}",
                "payload": {},
            }


# Advanced Features
class AdvancedDropboxSearch(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            query = data.get("query", "")
            folder_path = data.get("folderPath", "")
            file_extensions = data.get("fileExtensions", [])
            max_results = data.get("maxResults", 100)

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                AuditLogger.log(
                    user_id=uid,
                    action="advanced_search_dropbox_files",
                    resource_type="dropbox_files",
                    resource_id="none",
                    success=False,
                    error_message="Dropbox not connected or token expired",
                    metadata={"query": query, "folderPath": folder_path},
                )
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            # Prepare search options
            search_options = dropbox.files.SearchOptions(
                path=folder_path or "",
                max_results=max_results,
                file_status=dropbox.files.FileStatus.active,
                filename_only=False,
            )

            # Execute search
            search_results = dbx.files_search_v2(query, options=search_options)

            files = []
            for match in search_results.matches:
                if hasattr(match.metadata, "metadata"):
                    file_metadata = match.metadata.metadata

                    # Filter by file extensions if specified
                    if file_extensions:
                        file_extension = file_metadata.name.split(".")[-1].lower()
                        if file_extension not in [ext.lower() for ext in file_extensions]:
                            continue

                    if isinstance(file_metadata, dropbox.files.FileMetadata):
                        files.append(
                            {
                                "id": file_metadata.path_lower,
                                "name": file_metadata.name,
                                "path": file_metadata.path_display,
                                "size": file_metadata.size,
                                "server_modified": (
                                    file_metadata.server_modified.isoformat()
                                    if file_metadata.server_modified
                                    else None
                                ),
                                "client_modified": (
                                    file_metadata.client_modified.isoformat()
                                    if file_metadata.client_modified
                                    else None
                                ),
                            }
                        )

            # Log successful search
            AuditLogger.log(
                user_id=uid,
                action="advanced_search_dropbox_files",
                resource_type="dropbox_files",
                resource_id=", ".join([f["id"] for f in files]) if files else "none",
                success=True,
                metadata={
                    "query": query,
                    "folderPath": folder_path,
                    "fileExtensions": file_extensions,
                    "results_count": len(files),
                },
            )

            return {
                "status": 1,
                "message": f"Advanced search completed. Found {len(files)} files",
                "payload": {
                    "files": files,
                    "search_query": query,
                    "total_results": len(files),
                },
            }

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="advanced_search_dropbox_files",
                resource_type="dropbox_files",
                resource_id="unknown",
                success=False,
                error_message=str(e),
                metadata={"query": query, "folderPath": folder_path},
            )
            return {
                "status": 0,
                "message": f"Advanced search failed: {str(e)}",
                "payload": {},
            }



class FindDuplicateDropboxFiles(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            folder_path = data.get("folderPath", "")

            dbx = self.get_dropbox_client(uid)
            if not dbx:
                AuditLogger.log(
                    user_id=uid,
                    action="find_duplicate_dropbox_files",
                    resource_type="dropbox_files",
                    resource_id="none",
                    success=False,
                    error_message="Dropbox not connected or token expired",
                    metadata={"folderPath": folder_path},
                )
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            # Get all files in the specified folder
            result = dbx.files_list_folder(folder_path if folder_path else "", recursive=True)
            entries = result.entries

            # Handle pagination
            while result.has_more:
                result = dbx.files_list_folder_continue(result.cursor)
                entries.extend(result.entries)

            # Filter only files
            files = [entry for entry in entries if isinstance(entry, dropbox.files.FileMetadata)]

            # Group files by name and size
            file_groups = {}
            for file in files:
                key = f"{file.name}_{file.size}"
                if key not in file_groups:
                    file_groups[key] = []
                file_groups[key].append(
                    {
                        "id": file.path_lower,
                        "name": file.name,
                        "path": file.path_display,
                        "size": file.size,
                        "server_modified": file.server_modified.isoformat() if file.server_modified else None,
                        "content_hash": getattr(file, "content_hash", None),
                    }
                )

            # Find duplicates
            duplicates = []
            for group in file_groups.values():
                if len(group) > 1:
                    duplicates.append(
                        {
                            "name": group[0]["name"],
                            "size": group[0]["size"],
                            "files": group,
                            "count": len(group),
                            "total_size": sum(f["size"] for f in group),
                        }
                    )

            # Log activity
            AuditLogger.log(
                user_id=uid,
                action="find_duplicate_dropbox_files",
                resource_type="dropbox_files",
                resource_id=", ".join([f["id"] for g in duplicates for f in g["files"]]) if duplicates else "none",
                success=True,
                metadata={
                    "folderPath": folder_path,
                    "total_files_scanned": len(files),
                    "total_duplicate_sets": len(duplicates),
                },
            )

            return {
                "status": 1,
                "message": f"Found {len(duplicates)} sets of duplicate files",
                "payload": {
                    "duplicates": duplicates,
                    "total_duplicate_sets": len(duplicates),
                    "total_files_scanned": len(files),
                },
            }

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="find_duplicate_dropbox_files",
                resource_type="dropbox_files",
                resource_id="unknown",
                success=False,
                error_message=str(e),
                metadata={"folderPath": folder_path},
            )
            return {
                "status": 0,
                "message": f"Failed to find duplicates: {str(e)}",
                "payload": {},
            }


class GetDropboxStorageAnalytics(DropboxBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            dbx = self.get_dropbox_client(uid)
            if not dbx:
                return {
                    "status": 0,
                    "message": "Dropbox not connected or token expired",
                    "payload": {},
                }

            # Get storage usage
            space_usage = dbx.users_get_space_usage()

            # Get all files for analysis
            result = dbx.files_list_folder("", recursive=True)
            entries = result.entries

            # Get all entries (handle pagination)
            while result.has_more:
                result = dbx.files_list_folder_continue(result.cursor)
                entries.extend(result.entries)

            # Filter only files
            files = [
                entry
                for entry in entries
                if isinstance(entry, dropbox.files.FileMetadata)
            ]

            # Analyze by file type
            type_analysis = {}
            total_files = len(files)

            for file in files:
                # Get file extension
                extension = (
                    file.name.split(".")[-1].lower()
                    if "." in file.name
                    else "no_extension"
                )

                if extension not in type_analysis:
                    type_analysis[extension] = {
                        "count": 0,
                        "total_size": 0,
                        "percentage": 0,
                    }

                type_analysis[extension]["count"] += 1
                type_analysis[extension]["total_size"] += file.size

            # Calculate percentages
            total_size = sum(data["total_size"] for data in type_analysis.values())
            for data in type_analysis.values():
                data["percentage"] = (
                    (data["total_size"] / total_size * 100) if total_size > 0 else 0
                )

            used = space_usage.used
            limit = (
                space_usage.allocation.get_individual().allocated
                if hasattr(space_usage.allocation, "get_individual")
                else 0
            )

            return {
                "status": 1,
                "message": "Storage analytics retrieved successfully",
                "payload": {
                    "storage_quota": {
                        "used": used,
                        "limit": limit,
                        "usage_percentage": (used / limit * 100) if limit > 0 else 0,
                    },
                    "file_type_analysis": type_analysis,
                    "total_files": total_files,
                    "total_size": total_size,
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to get storage analytics: {str(e)}",
                "payload": {},
            }


# Activity Tracking
class GetDropboxActivityLog(DropboxBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            limit = request.args.get("limit", 50, type=int)
            offset = request.args.get("offset", 0, type=int)

            # Get activity from database
            activities = DBHelper.find(
                "dropbox_activity_log",
                filters={"user_id": uid},
                select_fields=[
                    "id",
                    "action",
                    "file_name",
                    "file_path",
                    "timestamp",
                    "details",
                ],
            )

            # Sort by timestamp descending and apply pagination
            activities = sorted(
                activities, key=lambda x: x.get("timestamp", ""), reverse=True
            )
            paginated_activities = activities[offset : offset + limit]

            return {
                "status": 1,
                "message": f"Retrieved {len(paginated_activities)} activity records",
                "payload": {
                    "activities": paginated_activities,
                    "limit": limit,
                    "offset": offset,
                    "total": len(activities),
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to get activity log: {str(e)}",
                "payload": {},
            }


class LogDropboxActivity(DropboxBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            action = data.get("action")
            file_path = data.get("filePath")
            file_name = data.get("fileName")
            details = data.get("details")

            if not action or not file_name:
                AuditLogger.log(
                    user_id=uid,
                    action="log_dropbox_activity",
                    resource_type="dropbox_files",
                    resource_id=file_path or "unknown",
                    success=False,
                    error_message="Action and file name required",
                    metadata={"details": details},
                )
                return {
                    "status": 0,
                    "message": "Action and file name required",
                    "payload": {},
                }

            # Insert activity log
            activity_id = DBHelper.insert(
                "dropbox_activity_log",
                {
                    "user_id": uid,
                    "action": action,
                    "file_path": file_path,
                    "file_name": file_name,
                    "details": details,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )

            # Audit log for this activity
            AuditLogger.log(
                user_id=uid,
                action="log_dropbox_activity",
                resource_type="dropbox_files",
                resource_id=file_path or "unknown",
                success=True,
                metadata={"activity_id": activity_id, "action": action, "file_name": file_name},
            )

            return {
                "status": 1,
                "message": "Activity logged successfully",
                "payload": {"activity_id": activity_id},
            }

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="log_dropbox_activity",
                resource_type="dropbox_files",
                resource_id="unknown",
                success=False,
                error_message=str(e),
                metadata={"details": data},
            )
            return {
                "status": 0,
                "message": f"Failed to log activity: {str(e)}",
                "payload": {},
            }
