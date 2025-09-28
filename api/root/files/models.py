import os
import json
import traceback
import uuid
import requests
from datetime import datetime, timedelta
from flask import Request, request, jsonify, send_file
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload
from google.oauth2.credentials import Credentials
import io
from root.auth.auth import auth_required
from root.common import Status
from root.config import CLIENT_ID, CLIENT_SECRET, SCOPE
from root.db.dbHelper import DBHelper
from google.auth.exceptions import RefreshError
from root.utilis import ensure_drive_folder_structure, get_or_create_subfolder
from root.helpers.logs import AuditLogger

class DriveBaseResource(Resource):
    """Base class for Google Drive operations"""

    def get_user_credentials(self, user_id):
        """Get user's Google credentials from database with proper error handling"""
        try:
            account = DBHelper.find_one(
                "connected_accounts",
                filters={
                    "user_id": user_id,
                    "provider": "google",
                    "is_active": Status.ACTIVE.value,
                },
            )

            if not account:
                return None

            access_token = account.get("access_token")
            refresh_token = account.get("refresh_token")
            expires_at = account.get("expires_at")

            if isinstance(expires_at, str):
                try:
                    expires_at = datetime.fromisoformat(expires_at)
                except ValueError:
                    expires_at = None

            # Create credentials with refresh info
            creds = Credentials(
                token=access_token,
                refresh_token=refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=CLIENT_ID,
                client_secret=CLIENT_SECRET,
                scopes=SCOPE.split(),
            )

            # Check if credentials need refresh
            if not creds.valid or creds.expired:
                try:
                    creds.refresh(Request())

                    # Update DB with new token if refresh succeeded
                    # DBHelper.update_one(
                    #     "connected_accounts",
                    #     filters={"id": account["id"]},
                    # updates={
                    #     "access_token": creds.token,
                    #     "expires_at": (
                    #         datetime.utcnow()  timedelta(seconds=3500)
                    #     ).isoformat(),
                    # },
                    # )
                    DBHelper.update_one(
                        "connected_accounts",
                        filters={"id": account["id"]},
                        updates={
                            "access_token": creds.token,
                            "expires_at": (
                                datetime.utcnow() + timedelta(seconds=3500)
                            ).isoformat(),
                        },
                    )
                    print(f"Token refreshed successfully for user {user_id}")

                except RefreshError as e:
                    print(f"Token refresh failed for user {user_id}: {e}")

                    # Mark the account inactive
                    DBHelper.update_one(
                        "connected_accounts",
                        filters={"id": account["id"]},
                        updates={"is_active": Status.REMOVED.value},
                    )
                    return None

            return creds

        except Exception as e:
            print(f"Error getting credentials for user {user_id}: {str(e)}")
            return None

    def get_drive_service(self, user_id):
        """Get Google Drive service with error handling"""
        try:
            credentials = self.get_user_credentials(user_id)
            if not credentials:
                return None

            return build("drive", "v3", credentials=credentials)
        except Exception as e:
            print(f"Error creating Drive service for user {user_id}: {str(e)}")
            return None


class ListDriveFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            folder_id = data.get("folderId", "root")
            sort_by = data.get("sortBy", "modifiedTime")
            sort_order = data.get("sortOrder", "desc")
            page_size = data.get("pageSize", 100)

            # Get all Google accounts for the user
            select_fields = [
                "access_token",
                "refresh_token",
                "email",
                "provider",
                "user_object",
            ]

            all_accounts = DBHelper.find(
                "connected_accounts",
                filters={
                    "user_id": uid,
                    "provider": "google",
                    "is_active": Status.ACTIVE.value,
                },
                select_fields=select_fields,
            )

            if not all_accounts:
                return {
                    "status": 0,
                    "message": "No Google Drive accounts connected.",
                    "payload": {
                        "files": [],
                        "folders": [],
                        "connected_accounts": [],
                        "errors": [],
                    },
                }

            merged_files = []
            merged_folders = []
            connected_accounts = []
            errors = []

            # Track processed files to avoid duplicates
            processed_file_ids = set()
            processed_folder_ids = set()

            for account in all_accounts:
                email = account.get("email")
                access_token = account.get("access_token")
                refresh_token = account.get("refresh_token")
                user_object = account.get("user_object")

                try:
                    user_object_data = json.loads(user_object) if user_object else {}
                except json.JSONDecodeError:
                    user_object_data = {}

                try:
                    # Create account-specific Drive service
                    service = self.get_drive_service_for_account(
                        access_token, refresh_token, email
                    )
                    if not service:
                        errors.append(
                            {
                                "email": email,
                                "error": "Failed to create Drive service - token may be expired",
                            }
                        )
                        continue

                    # Build query
                    query = f"'{folder_id}' in parents and trashed=false"

                    # Sort mapping
                    sort_mapping = {
                        "name": "name",
                        "modifiedTime": "modifiedTime",
                        "size": "quotaBytesUsed",
                    }

                    order_by = f"{sort_mapping.get(sort_by, 'modifiedTime')} {'desc' if sort_order == 'desc' else ''}".strip()

                    # Get files from Drive
                    results = (
                        service.files()
                        .list(
                            q=query,
                            pageSize=page_size,
                            orderBy=order_by,
                            fields="nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, thumbnailLink, webViewLink, webContentLink, owners, shared, starred, parents)",
                        )
                        .execute()
                    )

                    items = results.get("files", [])

                    # Process files and folders
                    account_files = []
                    account_folders = []

                    for item in items:
                        item_id = item.get("id")
                        mime_type = item.get("mimeType", "")
                        is_folder = mime_type == "application/vnd.google-apps.folder"

                        # Skip if we've already processed this file/folder
                        if is_folder:
                            if item_id in processed_folder_ids:
                                continue
                            processed_folder_ids.add(item_id)
                        else:
                            if item_id in processed_file_ids:
                                continue
                            processed_file_ids.add(item_id)

                        base_info = {
                            "id": item_id,
                            "name": item.get("name"),
                            "modifiedTime": item.get("modifiedTime"),
                            "shared": item.get("shared", False),
                            "parents": item.get("parents", []),
                            "source_email": email,
                            "account_name": user_object_data.get(
                                "name", email.split("@")[0]
                            ),
                        }

                        if is_folder:
                            account_folders.append(base_info)
                        else:
                            account_files.append(
                                {
                                    **base_info,
                                    "mimeType": mime_type,
                                    "size": (
                                        int(item.get("size", 0))
                                        if item.get("size")
                                        else None
                                    ),
                                    "createdTime": item.get("createdTime"),
                                    "thumbnailLink": item.get("thumbnailLink"),
                                    "webViewLink": item.get("webViewLink"),
                                    "webContentLink": item.get("webContentLink"),
                                    "owners": item.get("owners", []),
                                    "starred": item.get("starred", False),
                                    "trashed": False,
                                }
                            )

                    merged_files.extend(account_files)
                    merged_folders.extend(account_folders)

                    # Add to connected accounts
                    connected_accounts.append(
                        {
                            "email": email,
                            "provider": "google",
                            "userName": user_object_data.get(
                                "name", email.split("@")[0]
                            ),
                            "displayName": user_object_data.get(
                                "name", email.split("@")[0]
                            ),
                            "picture": user_object_data.get("picture", ""),
                            "files_count": len(account_files),
                            "folders_count": len(account_folders),
                        }
                    )

                    print(
                        f"[GOOGLE DRIVE] {email}: {len(account_files)} files, {len(account_folders)} folders fetched"
                    )

                except Exception as e:
                    error_msg = str(e)
                    print(f"Error fetching Drive files for {email}: {error_msg}")
                    errors.append({"email": email, "error": error_msg})

                    # Mark token as inactive if it's an auth error
                    if any(
                        keyword in error_msg.lower()
                        for keyword in [
                            "invalid_grant",
                            "401",
                            "invalid_token",
                            "expired",
                        ]
                    ):
                        DBHelper.update_one(
                            table_name="connected_accounts",
                            filters={
                                "user_id": uid,
                                "email": email,
                                "provider": "google",
                            },
                            updates={"is_active": Status.REMOVED.value},
                        )

            # Sort merged results
            merged_files.sort(
                key=lambda f: f.get("modifiedTime", ""), reverse=(sort_order == "desc")
            )
            merged_folders.sort(
                key=lambda f: f.get("modifiedTime", ""), reverse=(sort_order == "desc")
            )

            return {
                "status": 1,
                "message": (
                    f"Retrieved {len(merged_files)} files and {len(merged_folders)} folders from Google Drive."
                    if (merged_files or merged_folders)
                    else "No files found."
                ),
                "payload": {
                    "files": merged_files,
                    "folders": merged_folders,
                    "connected_accounts": connected_accounts,
                    "errors": errors,
                    "nextPageToken": None,  # For future pagination support
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to fetch Drive files: {str(e)}",
                "payload": {
                    "files": [],
                    "folders": [],
                    "connected_accounts": [],
                    "errors": [{"error": str(e)}],
                },
            }

    def get_drive_service_for_account(self, access_token, refresh_token, email):
        """Create a Drive service for a specific account using its tokens"""
        try:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build

            # Create credentials from the account's tokens
            credentials = Credentials(
                token=access_token,
                refresh_token=refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=CLIENT_ID,  # You'll need to implement this
                client_secret=CLIENT_SECRET,  # You'll need to implement this
            )

            # Build the Drive service
            service = build("drive", "v3", credentials=credentials)
            return service

        except Exception as e:
            print(f"Error creating Drive service for {email}: {str(e)}")
            return None


class UploadDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if "file" not in request.files:
                return {"status": 0, "message": "No file provided", "payload": {}}

            file = request.files["file"]
            parent_id = request.form.get("parentId", "root")

            if file.filename == "":
                return {"status": 0, "message": "No file selected", "payload": {}}

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Prepare file metadata
            file_metadata = {
                "name": secure_filename(file.filename),
                "parents": [parent_id] if parent_id != "root" else [],
            }

            # Create media upload
            media = MediaIoBaseUpload(
                io.BytesIO(file.read()),
                mimetype=file.content_type or "application/octet-stream",
                resumable=True,
            )

            # Upload file
            uploaded_file = (
                service.files()
                .create(
                    body=file_metadata,
                    media_body=media,
                    fields="id, name, mimeType, size, modifiedTime, webViewLink",
                )
                .execute()
            )

            return {
                "status": 1,
                "message": f"File '{file.filename}' uploaded successfully",
                "payload": {"file": uploaded_file},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to upload file: {str(e)}",
                "payload": {},
            }


class DownloadDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")

            if not file_id:
                return {"status": 0, "message": "File ID required", "payload": {}}

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Get file metadata
            file_metadata = service.files().get(fileId=file_id).execute()

            # Download file
            request_download = service.files().get_media(fileId=file_id)
            file_buffer = io.BytesIO()
            downloader = MediaIoBaseDownload(file_buffer, request_download)

            done = False
            while done is False:
                status, done = downloader.next_chunk()

            file_buffer.seek(0)

            return send_file(
                file_buffer,
                as_attachment=True,
                download_name=file_metadata["name"],
                mimetype="application/octet-stream",
            )

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to download file: {str(e)}",
                "payload": {},
            }


class DeleteDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")

            if not file_id:
                return {"status": 0, "message": "File ID required", "payload": {}}

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Get file name before deletion
            try:
                file_metadata = (
                    service.files().get(fileId=file_id, fields="name").execute()
                )
                file_name = file_metadata.get("name", "Unknown file")
            except:
                file_name = "Unknown file"

            # Delete file (move to trash)
            service.files().delete(fileId=file_id).execute()

            return {
                "status": 1,
                "message": f"File '{file_name}' deleted successfully",
                "payload": {},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to delete file: {str(e)}",
                "payload": {},
            }


class CreateDriveFolder(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            folder_name = data.get("name")
            parent_id = data.get("parentId", "root")

            if not folder_name:
                return {"status": 0, "message": "Folder name required", "payload": {}}

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Create folder metadata
            folder_metadata = {
                "name": folder_name,
                "mimeType": "application/vnd.google-apps.folder",
                "parents": [parent_id] if parent_id != "root" else [],
            }

            # Create folder
            folder = (
                service.files()
                .create(
                    body=folder_metadata, fields="id, name, modifiedTime, webViewLink"
                )
                .execute()
            )

            return {
                "status": 1,
                "message": f"Folder '{folder_name}' created successfully",
                "payload": {"folder": folder},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to create folder: {str(e)}",
                "payload": {},
            }


class ShareDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")
            email = data.get("email")
            role = data.get("role", "reader")  # reader, writer, commenter

            if not file_id or not email:
                return {
                    "status": 0,
                    "message": "File ID and email required",
                    "payload": {},
                }

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Get file name for response
            try:
                file_metadata = (
                    service.files().get(fileId=file_id, fields="name").execute()
                )
                file_name = file_metadata.get("name", "Unknown file")
            except:
                file_name = "Unknown file"

            # Create permission
            permission = {"type": "user", "role": role, "emailAddress": email}

            # Share file
            service.permissions().create(
                fileId=file_id, body=permission, sendNotificationEmail=True
            ).execute()

            return {
                "status": 1,
                "message": f"File '{file_name}' shared successfully with {email}",
                "payload": {"shared_with": email, "role": role, "file_name": file_name},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to share file: {str(e)}",
                "payload": {},
            }


class GetDriveFileInfo(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user, file_id):
        try:
            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Get file info
            file_info = (
                service.files()
                .get(
                    fileId=file_id,
                    fields="id, name, mimeType, size, modifiedTime, createdTime, thumbnailLink, webViewLink, webContentLink, owners, shared, starred, parents, permissions",
                )
                .execute()
            )

            return {
                "status": 1,
                "message": "File information retrieved successfully",
                "payload": {"file": file_info},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to get file info: {str(e)}",
                "payload": {},
            }


class GetDriveStorage(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        """Get storage information for all connected Google accounts"""
        try:
            # Get all Google accounts for the user
            all_accounts = DBHelper.find(
                "connected_accounts",
                filters={
                    "user_id": uid,
                    "provider": "google",
                    "is_active": Status.ACTIVE.value,
                },
                select_fields=["email", "user_object"],
            )

            if not all_accounts:
                return {
                    "status": 0,
                    "message": "No Google Drive accounts connected.",
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

                try:
                    service = self.get_drive_service(uid)
                    if not service:
                        continue

                    # Get storage info
                    about = service.about().get(fields="storageQuota, user").execute()
                    storage_quota = about.get("storageQuota", {})
                    user_info = about.get("user", {})

                    used = int(storage_quota.get("usage", 0))
                    limit = int(storage_quota.get("limit", 0))

                    storage_info.append(
                        {
                            "email": email,
                            "displayName": user_info.get(
                                "displayName", email.split("@")[0]
                            ),
                            "photoLink": user_info.get("photoLink", ""),
                            "used": used,
                            "limit": limit,
                            "usage_percentage": (
                                round((used / limit * 100), 2) if limit > 0 else 0
                            ),
                            "used_formatted": self.format_bytes(used),
                            "limit_formatted": self.format_bytes(limit),
                        }
                    )

                    total_used = used
                    total_limit = limit

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

    def format_bytes(self, bytes_value):
        """Format bytes to human readable format"""
        if bytes_value == 0:
            return "0 B"

        sizes = ["B", "KB", "MB", "GB", "TB"]
        i = 0
        while bytes_value >= 1024 and i < len(sizes) - 1:
            bytes_value /= 1024
            i = 1

        return f"{bytes_value:.1f} {sizes[i]}"


class GetDriveStorage(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        """Get storage information for all connected Google accounts"""
        try:
            # Get all Google accounts for the user
            all_accounts = DBHelper.find(
                "connected_accounts",
                filters={
                    "user_id": uid,
                    "provider": "google",
                    "is_active": Status.ACTIVE.value,
                },
                select_fields=["email", "user_object"],
            )

            if not all_accounts:
                return {
                    "status": 0,
                    "message": "No Google Drive accounts connected.",
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

                try:
                    service = self.get_drive_service(uid)
                    if not service:
                        continue

                    # Get storage info
                    about = service.about().get(fields="storageQuota, user").execute()
                    storage_quota = about.get("storageQuota", {})
                    user_info = about.get("user", {})

                    used = int(storage_quota.get("usage", 0))
                    limit = int(storage_quota.get("limit", 0))

                    storage_info.append(
                        {
                            "email": email,
                            "displayName": user_info.get(
                                "displayName", email.split("@")[0]
                            ),
                            "photoLink": user_info.get("photoLink", ""),
                            "used": used,
                            "limit": limit,
                            "usage_percentage": (
                                round((used / limit * 100), 2) if limit > 0 else 0
                            ),
                            "used_formatted": self.format_bytes(used),
                            "limit_formatted": self.format_bytes(limit),
                        }
                    )

                    total_used = used
                    total_limit = limit

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

    def format_bytes(self, bytes_value):
        """Format bytes to human readable format"""
        if bytes_value == 0:
            return "0 B"

        sizes = ["B", "KB", "MB", "GB", "TB"]
        i = 0
        while bytes_value >= 1024 and i < len(sizes) - 1:
            bytes_value /= 1024
            i = 1

        return f"{bytes_value:.1f} {sizes[i]}"


# Bulk Operations
class BulkDownloadFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_ids = data.get("fileIds", [])

            if not file_ids:
                return {"status": 0, "message": "File IDs required", "payload": {}}

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Create a zip file in memory
            import zipfile

            zip_buffer = io.BytesIO()

            with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
                for file_id in file_ids:
                    try:
                        # Get file metadata
                        file_metadata = service.files().get(fileId=file_id).execute()
                        file_name = file_metadata["name"]

                        # Download file
                        request_download = service.files().get_media(fileId=file_id)
                        file_buffer = io.BytesIO()
                        downloader = MediaIoBaseDownload(file_buffer, request_download)

                        done = False
                        while done is False:
                            status, done = downloader.next_chunk()

                        file_buffer.seek(0)
                        zip_file.writestr(file_name, file_buffer.read())

                    except Exception as e:
                        print(f"Error downloading file {file_id}: {str(e)}")
                        continue

            zip_buffer.seek(0)

            return send_file(
                zip_buffer,
                as_attachment=True,
                download_name="bulk_download.zip",
                mimetype="application/zip",
            )

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to bulk download files: {str(e)}",
                "payload": {},
            }


class BulkDeleteFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_ids = data.get("fileIds", [])

            if not file_ids:
                return {"status": 0, "message": "File IDs required", "payload": {}}

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            deleted_files = []
            errors = []

            for file_id in file_ids:
                try:
                    # Get file name before deletion
                    file_metadata = (
                        service.files().get(fileId=file_id, fields="name").execute()
                    )
                    file_name = file_metadata.get("name", "Unknown file")

                    # Delete file
                    service.files().delete(fileId=file_id).execute()
                    deleted_files.append({"id": file_id, "name": file_name})

                except Exception as e:
                    errors.append({"id": file_id, "error": str(e)})

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


class BulkMoveFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_ids = data.get("fileIds", [])
            target_folder_id = data.get("targetFolderId")

            if not file_ids or not target_folder_id:
                return {
                    "status": 0,
                    "message": "File IDs and target folder ID required",
                    "payload": {},
                }

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            moved_files = []
            errors = []

            for file_id in file_ids:
                try:
                    # Get current parents
                    file_metadata = (
                        service.files()
                        .get(fileId=file_id, fields="parents,name")
                        .execute()
                    )
                    previous_parents = ",".join(file_metadata.get("parents", []))

                    # Move file
                    service.files().update(
                        fileId=file_id,
                        addParents=target_folder_id,
                        removeParents=previous_parents,
                        fields="id,parents",
                    ).execute()

                    moved_files.append(
                        {
                            "id": file_id,
                            "name": file_metadata.get("name", "Unknown file"),
                        }
                    )

                except Exception as e:
                    errors.append({"id": file_id, "error": str(e)})

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


class BulkCopyFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_ids = data.get("fileIds", [])
            target_folder_id = data.get("targetFolderId")

            if not file_ids or not target_folder_id:
                return {
                    "status": 0,
                    "message": "File IDs and target folder ID required",
                    "payload": {},
                }

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            copied_files = []
            errors = []

            for file_id in file_ids:
                try:
                    # Get original file metadata
                    original_file = (
                        service.files().get(fileId=file_id, fields="name").execute()
                    )

                    # Copy file
                    copied_file = (
                        service.files()
                        .copy(
                            fileId=file_id,
                            body={
                                "name": f"Copy of {original_file['name']}",
                                "parents": [target_folder_id],
                            },
                        )
                        .execute()
                    )

                    copied_files.append(
                        {
                            "original_id": file_id,
                            "copy_id": copied_file["id"],
                            "name": copied_file["name"],
                        }
                    )

                except Exception as e:
                    errors.append({"id": file_id, "error": str(e)})

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


class BulkShareFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_ids = data.get("fileIds", [])
            email = data.get("email")
            role = data.get("role", "reader")

            if not file_ids or not email:
                return {
                    "status": 0,
                    "message": "File IDs and email required",
                    "payload": {},
                }

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            shared_files = []
            errors = []

            for file_id in file_ids:
                try:
                    # Get file name
                    file_metadata = (
                        service.files().get(fileId=file_id, fields="name").execute()
                    )

                    # Create permission
                    permission = {"type": "user", "role": role, "emailAddress": email}
                    service.permissions().create(
                        fileId=file_id, body=permission, sendNotificationEmail=True
                    ).execute()

                    shared_files.append(
                        {
                            "id": file_id,
                            "name": file_metadata.get("name", "Unknown file"),
                        }
                    )

                except Exception as e:
                    errors.append({"id": file_id, "error": str(e)})

            return {
                "status": 1,
                "message": f"Bulk share completed. {len(shared_files)} files shared, {len(errors)} errors",
                "payload": {
                    "shared_files": shared_files,
                    "errors": errors,
                    "success_count": len(shared_files),
                    "error_count": len(errors),
                    "shared_with": email,
                    "role": role,
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to bulk share files: {str(e)}",
                "payload": {},
            }


# File Operations
class RenameDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")
            new_name = data.get("newName")

            if not file_id or not new_name:
                return {
                    "status": 0,
                    "message": "File ID and new name required",
                    "payload": {},
                }

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Rename file
            updated_file = (
                service.files()
                .update(
                    fileId=file_id,
                    body={"name": new_name},
                    fields="id,name,modifiedTime",
                )
                .execute()
            )

            return {
                "status": 1,
                "message": f"File renamed to '{new_name}' successfully",
                "payload": {"file": updated_file},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to rename file: {str(e)}",
                "payload": {},
            }


class CopyDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")
            parent_id = data.get("parentId")
            name = data.get("name")

            if not file_id:
                return {"status": 0, "message": "File ID required", "payload": {}}

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Get original file name if no name provided
            if not name:
                original_file = (
                    service.files().get(fileId=file_id, fields="name").execute()
                )
                name = f"Copy of {original_file['name']}"

            # Prepare copy metadata
            copy_metadata = {"name": name}
            if parent_id:
                copy_metadata["parents"] = [parent_id]

            # Copy file
            copied_file = (
                service.files()
                .copy(
                    fileId=file_id,
                    body=copy_metadata,
                    fields="id,name,mimeType,modifiedTime,webViewLink",
                )
                .execute()
            )

            return {
                "status": 1,
                "message": f"File copied successfully as '{name}'",
                "payload": {"file": copied_file},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to copy file: {str(e)}",
                "payload": {},
            }


class MoveDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")
            target_folder_id = data.get("targetFolderId")

            if not file_id or not target_folder_id:
                return {
                    "status": 0,
                    "message": "File ID and target folder ID required",
                    "payload": {},
                }

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Get current parents
            file_metadata = (
                service.files().get(fileId=file_id, fields="parents,name").execute()
            )
            previous_parents = ",".join(file_metadata.get("parents", []))

            # Move file
            updated_file = (
                service.files()
                .update(
                    fileId=file_id,
                    addParents=target_folder_id,
                    removeParents=previous_parents,
                    fields="id,name,parents,modifiedTime",
                )
                .execute()
            )

            return {
                "status": 1,
                "message": f"File '{file_metadata['name']}' moved successfully",
                "payload": {"file": updated_file},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to move file: {str(e)}",
                "payload": {},
            }


class StarDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")
            starred = data.get("starred", True)

            if not file_id:
                return {"status": 0, "message": "File ID required", "payload": {}}

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Update starred status
            updated_file = (
                service.files()
                .update(
                    fileId=file_id, body={"starred": starred}, fields="id,name,starred"
                )
                .execute()
            )

            action = "starred" if starred else "unstarred"
            return {
                "status": 1,
                "message": f"File {action} successfully",
                "payload": {"file": updated_file},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to update star status: {str(e)}",
                "payload": {},
            }


# Advanced Search
class AdvancedSearch(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            query = data.get("query", "")
            mime_type = data.get("mimeType")
            modified_time_range = data.get("modifiedTimeRange")
            size_range = data.get("sizeRange")
            starred = data.get("starred")
            shared = data.get("shared")
            owned_by_me = data.get("ownedByMe")
            parent_id = data.get("parentId")

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Build search query
            search_parts = []

            if query:
                search_parts.append(f"name contains '{query}'")

            if mime_type:
                search_parts.append(f"mimeType='{mime_type}'")

            if modified_time_range:
                if modified_time_range.get("start"):
                    search_parts.append(
                        f"modifiedTime >= '{modified_time_range['start']}'"
                    )
                if modified_time_range.get("end"):
                    search_parts.append(
                        f"modifiedTime <= '{modified_time_range['end']}'"
                    )

            if starred is not None:
                search_parts.append(f"starred = {str(starred).lower()}")

            if shared is not None:
                search_parts.append(f"shared = {str(shared).lower()}")

            if owned_by_me is not None:
                search_parts.append(
                    "'me' in owners" if owned_by_me else "not 'me' in owners"
                )

            if parent_id:
                search_parts.append(f"'{parent_id}' in parents")

            # Always exclude trashed files
            search_parts.append("trashed = false")

            search_query = (
                " and ".join(search_parts) if search_parts else "trashed = false"
            )

            # Execute search
            results = (
                service.files()
                .list(
                    q=search_query,
                    pageSize=100,
                    fields="nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, thumbnailLink, webViewLink, owners, shared, starred, parents)",
                )
                .execute()
            )

            files = results.get("files", [])

            # Filter by size if specified
            if size_range:
                min_size = size_range.get("min")
                max_size = size_range.get("max")

                if min_size is not None or max_size is not None:
                    filtered_files = []
                    for file in files:
                        file_size = int(file.get("size", 0)) if file.get("size") else 0

                        if (
                            min_size is not None and file_size < min_size * 1024 * 1024
                        ):  # Convert MB to bytes
                            continue
                        if (
                            max_size is not None and file_size > max_size * 1024 * 1024
                        ):  # Convert MB to bytes
                            continue

                        filtered_files.append(file)

                    files = filtered_files

            return {
                "status": 1,
                "message": f"Advanced search completed. Found {len(files)} files",
                "payload": {
                    "files": files,
                    "search_query": search_query,
                    "total_results": len(files),
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Advanced search failed: {str(e)}",
                "payload": {},
            }


# Duplicate Detection
class FindDuplicateFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            folder_id = data.get("folderId", "root")

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Get all files in the specified folder
            query = f"'{folder_id}' in parents and trashed=false and mimeType != 'application/vnd.google-apps.folder'"

            results = (
                service.files()
                .list(
                    q=query,
                    pageSize=1000,
                    fields="files(id, name, size, md5Checksum, modifiedTime)",
                )
                .execute()
            )

            files = results.get("files", [])

            # Group files by name and size
            file_groups = {}
            for file in files:
                key = f"{file['name']}_{file.get('size', 0)}"
                if key not in file_groups:
                    file_groups[key] = []
                file_groups[key].append(file)

            # Find duplicates
            duplicates = []
            for group in file_groups.values():
                if len(group) > 1:
                    duplicates.append(
                        {
                            "name": group[0]["name"],
                            "size": group[0].get("size", 0),
                            "files": group,
                            "count": len(group),
                            "total_size": sum(int(f.get("size", 0)) for f in group),
                        }
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
            return {
                "status": 0,
                "message": f"Failed to find duplicates: {str(e)}",
                "payload": {},
            }


# Storage Analytics
class GetStorageAnalytics(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Get storage quota
            about = service.about().get(fields="storageQuota").execute()
            storage_quota = about.get("storageQuota", {})

            # Get file type breakdown
            results = (
                service.files()
                .list(q="trashed=false", pageSize=1000, fields="files(mimeType, size)")
                .execute()
            )

            files = results.get("files", [])

            # Analyze by file type
            type_analysis = {}
            total_files = len(files)

            for file in files:
                mime_type = file.get("mimeType", "unknown")
                size = int(file.get("size", 0)) if file.get("size") else 0

                # Group by main type
                main_type = mime_type.split("/")[0] if "/" in mime_type else mime_type

                if main_type not in type_analysis:
                    type_analysis[main_type] = {
                        "count": 0,
                        "total_size": 0,
                        "percentage": 0,
                    }

                type_analysis[main_type]["count"] = 1
                type_analysis[main_type]["total_size"] = size

            # Calculate percentages
            total_size = sum(data["total_size"] for data in type_analysis.values())
            for data in type_analysis.values():
                data["percentage"] = (
                    (data["total_size"] / total_size * 100) if total_size > 0 else 0
                )

            return {
                "status": 1,
                "message": "Storage analytics retrieved successfully",
                "payload": {
                    "storage_quota": {
                        "used": int(storage_quota.get("usage", 0)),
                        "limit": int(storage_quota.get("limit", 0)),
                        "usage_percentage": (
                            int(storage_quota.get("usage", 0))
                            / int(storage_quota.get("limit", 1))
                            * 100
                            if storage_quota.get("limit")
                            else 0
                        ),
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
class GetActivityLog(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            limit = request.args.get("limit", 50, type=int)
            offset = request.args.get("offset", 0, type=int)

            # Get activity from database (you'll need to create this table)
            activities = DBHelper.find(
                "drive_activity_log",
                filters={"user_id": uid},
                select_fields=[
                    "id",
                    "action",
                    "file_name",
                    "file_id",
                    "timestamp",
                    "details",
                ],
                order_by="timestamp DESC",
                limit=limit,
                offset=offset,
            )

            return {
                "status": 1,
                "message": f"Retrieved {len(activities)} activity records",
                "payload": {
                    "activities": activities,
                    "limit": limit,
                    "offset": offset,
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to get activity log: {str(e)}",
                "payload": {},
            }


class LogActivity(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            action = data.get("action")
            file_id = data.get("fileId")
            file_name = data.get("fileName")
            details = data.get("details")

            if not action or not file_name:
                return {
                    "status": 0,
                    "message": "Action and file name required",
                    "payload": {},
                }

            # Insert activity log
            activity_id = DBHelper.insert(
                "drive_activity_log",
                {
                    "user_id": uid,
                    "action": action,
                    "file_id": file_id,
                    "file_name": file_name,
                    "details": details,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )

            return {
                "status": 1,
                "message": "Activity logged successfully",
                "payload": {"activity_id": activity_id},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to log activity: {str(e)}",
                "payload": {},
            }


class UploadHubFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if "file" not in request.files:
                return {"status": 0, "message": "No file provided"}, 400

            file = request.files["file"]
            hub = request.form.get("hub", "").capitalize()

            if not hub:
                return {"status": 0, "message": "Missing hub name"}, 400

            # Get Google Drive service
            service = self.get_drive_service(uid)
            if not service:
                return {"status": 0, "message": "Google Drive not connected or token expired"}, 401

            # Get storage account ID
            account = DBHelper.find_one(
                table_name="connected_accounts",
                filters={"user_id": uid, "provider": "google", "is_active": 1},
                select_fields=["id"],
            )
            if not account:
                return {"status": 0, "message": "Google Drive not connected"}, 401

            # Ensure DOCKLY root and subfolders
            folder_info = ensure_drive_folder_structure(service, uid, account["id"])
            if hub not in folder_info["subfolders"]:
                # create dynamically if hub not in default list
                hub_folder = get_or_create_subfolder(
                    service,
                    hub,
                    parent_google_id=folder_info["root"],
                    parent_db_id=folder_info["root_db"],
                    user_id=uid,
                    storage_account_id=account["id"],
                )
                hub_google_id = hub_folder["google_id"]
                hub_db_id = hub_folder["db_id"]
            else:
                hub_google_id = folder_info["subfolders"][hub]
                hub_db_id = folder_info["subfolders_db"][hub]

            # Upload file to Google Drive
            file_metadata = {"name": secure_filename(file.filename), "parents": [hub_google_id]}
            media = MediaIoBaseUpload(io.BytesIO(file.read()), mimetype=file.content_type or "application/octet-stream", resumable=True)
            uploaded_file = service.files().create(
                body=file_metadata,
                media_body=media,
                fields="id, name, webViewLink, mimeType, size, modifiedTime",
            ).execute()

            # Insert file in DB
            file_db_id = DBHelper.insert(
                table_name="files_index",
                id=str(uuid.uuid4()),
                return_column="id",
                user_id=uid,
                storage_account_id=account["id"],
                file_path=uploaded_file.get("webViewLink"),
                file_name=uploaded_file.get("name"),
                file_size=int(uploaded_file.get("size", 0)),
                file_type=uploaded_file.get("mimeType"),
                mime_type=uploaded_file.get("mimeType"),
                is_folder=False,
                parent_folder_id=hub_db_id,
                external_file_id=uploaded_file["id"],
                last_modified=uploaded_file.get("modifiedTime", datetime.now().isoformat()),
                created_at=datetime.now().isoformat(),
                indexed_at=datetime.now().isoformat(),
            )

            return {
                "status": 1,
                "message": f"File uploaded to {hub} hub successfully",
                "payload": {"file": uploaded_file, "db_id": file_db_id},
            }, 200

        except Exception as e:
            traceback.print_exc()
            return {"status": 0, "message": f"Failed to upload file: {str(e)}"}, 500


class GetHubFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            hub = request.args.get("hub", "").capitalize()
            if not hub:
                return {"status": 0, "message": "Missing hub name"}, 400

            # Get family members
            family_members = self._get_family_members(uid)
            all_user_ids = list({uid} | {m.get("user_id") for m in family_members if m.get("user_id")})

            # Fetch user details
            user_details = self._get_users_details(all_user_ids)

            files_by_member = []

            # Fetch connected Google accounts for all members
            connected_accounts = DBHelper.find_multi_users(
                {
                    "connected_accounts": {
                        "filters": {"is_active": 1, "provider": "google"},
                        "select_fields": [
                            "user_id", "access_token", "refresh_token", "email", "provider", "user_object", "id"
                        ],
                    }
                },
                all_user_ids,
            ).get("connected_accounts", [])

            for account in connected_accounts:
                user_id = account.get("user_id")
                email = account.get("email")
                username = user_details.get(user_id, {}).get("user_name", email.split("@")[0])

                try:
                    creds = Credentials(
                        token=account["access_token"],
                        refresh_token=account["refresh_token"],
                        token_uri="https://oauth2.googleapis.com/token",
                        client_id=CLIENT_ID,
                        client_secret=CLIENT_SECRET,
                        scopes=SCOPE.split(),
                    )

                    if not creds.valid or creds.expired:
                        if creds.refresh_token:
                            creds.refresh(Request())
                            DBHelper.update(
                                "connected_accounts",
                                filters={"user_id": user_id, "provider": "google"},
                                data={"access_token": creds.token, "token_expiry": creds.expiry},
                            )
                        else:
                            continue

                    service = build("drive", "v3", credentials=creds, cache_discovery=False)

                    # Ensure folders
                    folder_info = ensure_drive_folder_structure(service, user_id, account["id"])
                    if hub not in folder_info["subfolders"]:
                        hub_folder = get_or_create_subfolder(
                            service,
                            hub,
                            parent_google_id=folder_info["root"],
                            parent_db_id=folder_info["root_db"],
                            user_id=user_id,
                            storage_account_id=account["id"],
                        )
                        hub_google_id = hub_folder["google_id"]
                    else:
                        hub_google_id = folder_info["subfolders"][hub]

                    # Fetch files from Google Drive
                    query = f"'{hub_google_id}' in parents and trashed=false"
                    results = service.files().list(
                        q=query,
                        fields="files(id, name, mimeType, size, modifiedTime, webViewLink)",
                    ).execute()
                    member_files = results.get("files", [])

                    files_by_member.append({
                        "user_id": user_id,
                        "username": username,
                        "email": email,
                        "files": member_files,
                    })

                except Exception as e:
                    print(f"Error fetching files for {email}: {e}")
                    continue

            # Prepare payload
            if hub == "Family":
                payload = {"files_by_member": files_by_member}
            else:
                my_files = next(
                    (f for f in files_by_member if f["user_id"] == uid),
                    {"user_id": uid, "username": user_details.get(uid, {}).get("user_name", user.get("email").split("@")[0]), "email": user.get("email"), "files": []},
                )
                payload = {"files_by_member": [my_files]}

            return {
                "status": 1,
                "message": f"Files from {hub} hub fetched successfully",
                "payload": {"payload": payload},
            }, 200

        except Exception as e:
            traceback.print_exc()
            return {"status": 0, "message": f"Failed to fetch files: {str(e)}"}, 500
        
    def _get_family_members(self, user_id):
        """Get all family members (including the current user) for a user."""
        try:
            # Step 1: Get the family group ID for the user
            gid = DBHelper.find_one(
                table_name="family_members",
                select_fields=["family_group_id"],
                filters={"user_id": user_id}
            )

            family_group_id = gid.get("family_group_id") if gid else None
            if not family_group_id:
                # No family group — return just the current user
                user = DBHelper.find_one(
                    table_name="users",
                    filters={"uid": user_id},
                    select_fields=["uid", "email", "user_name"]
                )
                return [{
                    "user_id": user_id,
                    "email": user.get("email"),
                    "name": user.get("user_name"),
                    "relationship": "me"
                }]

            # Step 2: Get all members of that family group
            group_members = DBHelper.find_all(
                table_name="family_members",
                select_fields=["fm_user_id", "email", "name", "relationship", "user_id","color"],
                filters={"family_group_id": family_group_id}
            )

            # Step 3: Remove duplicates by fm_user_id
            seen_fm_ids = set()
            unique_members = []
            for m in group_members:
                fm_uid = m.get("fm_user_id") or m.get("user_id")
                if fm_uid not in seen_fm_ids:
                    seen_fm_ids.add(fm_uid)
                    unique_members.append({
                        "user_id": fm_uid,
                        "email": m.get("email"),
                        "name": m.get("name"),
                        "relationship": "me" if fm_uid == user_id else m.get("relationship"),
                        "color":m.get("color")
                    })

            return unique_members

        except Exception as e:
            print(f"Error fetching family members: {e}")
            return []


    def _get_users_details(self, user_ids):
        """Get user details for multiple users"""
        try:
            if not user_ids:
                return {}

            users = DBHelper.find_in(
                "users",
                select_fields=["uid", "email", "user_name"],
                field="uid",
                values=user_ids,
            )

            return {user["uid"]: user for user in users}
        except Exception as e:
            print(f"Error fetching user details: {e}")
            return {}

class DeleteHubFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        file_id = request.args.get("file_id")
        if not file_id:
            return {"status": 0, "message": "Missing file_id"}, 400

        service = self.get_drive_service(uid)
        if not service:
            return {"status": 0, "message": "Drive not connected"}, 401

        try:
            service.files().delete(fileId=file_id).execute()
            return {"status": 1, "message": "File deleted successfully"}, 200
        except Exception as e:
            traceback.print_exc()
            return {"status": 0, "message": f"Delete failed: {str(e)}"}, 500