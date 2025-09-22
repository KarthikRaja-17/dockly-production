# Fixed OneDrive API - Following the same pattern as your working calendar code

import requests
from datetime import datetime, timedelta
import json
import traceback
from flask import request
from flask_restful import Resource
from root.auth.auth import auth_required
from root.common import Status
from root.db.dbHelper import DBHelper

# Microsoft Graph API endpoints - Same as your calendar code
MS_GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0"


def get_outlook_headers(access_token):
    return {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }


def fetch_onedrive_files(access_token, folder_id="root", page_size=100):
    """
    Fetch files from OneDrive using Microsoft Graph API.
    Requires Files.Read or Files.Read.All permission.
    """
    try:
        # ✅ Remove incorrect JWT format check
        if not access_token or len(access_token) < 100:
            print("❌ Access token is missing or unusually short.")
            return []

        headers = get_outlook_headers(access_token)
        print(f"🔐 Using token (length: {len(access_token)})")

        endpoint = (
            f"{MS_GRAPH_BASE_URL}/me/drive/root/children"
            if folder_id == "root"
            else f"{MS_GRAPH_BASE_URL}/me/drive/items/{folder_id}/children"
        )

        params = {
            "$top": page_size,
            "$orderby": "lastModifiedDateTime desc",
            "$select": ",".join(
                [
                    "id",
                    "name",
                    "size",
                    "lastModifiedDateTime",
                    "createdDateTime",
                    "webUrl",
                    "folder",
                    "file",
                    "parentReference",
                ]
            ),
        }

        print(f"🌐 Requesting files from: {endpoint}")
        response = requests.get(endpoint, headers=headers, params=params, timeout=30)
        print(f"📥 Response Code: {response.status_code}")

        if response.status_code == 200:
            items = response.json().get("value", [])
            print(f"✅ Retrieved {len(items)} item(s) from OneDrive.")
            return items

        elif response.status_code == 401:
            print(
                "❌ Unauthorized - Token might be expired or missing required scopes."
            )
            print(f"🔍 Response: {response.text}")

        else:
            print(f"❌ Error {response.status_code} - {response.text}")

    except requests.exceptions.Timeout:
        print("⏳ Request timed out.")
    except Exception as e:
        print(f"❌ Exception: {e}")
        traceback.print_exc()

    return []


def upload_onedrive_file(access_token, file_data, filename, parent_id="root"):
    """Upload file to OneDrive - Following calendar pattern"""
    try:
        # For file uploads, we need different headers
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/octet-stream",
        }

        # Build upload endpoint
        if parent_id == "root":
            url = f"{MS_GRAPH_BASE_URL}/me/drive/root:/{filename}:/content"
        else:
            url = f"{MS_GRAPH_BASE_URL}/me/drive/items/{parent_id}:/{filename}:/content"

        print(f"📤 Uploading file: {filename}")
        response = requests.put(url, headers=headers, data=file_data, timeout=90)

        if response.status_code in [200, 201]:
            print(f"✅ File uploaded successfully: {filename}")
            return response.json()
        else:
            print(f"❌ Error uploading file: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        print(f"❌ Exception uploading file: {e}")
        traceback.print_exc()
        return None


def delete_onedrive_file(access_token, file_id):
    """Delete file from OneDrive - Following calendar pattern"""
    try:
        headers = get_outlook_headers(access_token)
        url = f"{MS_GRAPH_BASE_URL}/me/drive/items/{file_id}"

        print(f"🗑️ Deleting file: {file_id}")
        response = requests.delete(url, headers=headers, timeout=30)

        if response.status_code in [200, 204]:
            print(f"✅ File deleted successfully")
            return True
        else:
            print(f"❌ Error deleting file: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"❌ Exception deleting file: {e}")
        traceback.print_exc()
        return False


def create_onedrive_folder(access_token, folder_name, parent_id="root"):
    """Create folder in OneDrive - Following calendar pattern"""
    try:
        headers = get_outlook_headers(access_token)

        if parent_id == "root":
            url = f"{MS_GRAPH_BASE_URL}/me/drive/root/children"
        else:
            url = f"{MS_GRAPH_BASE_URL}/me/drive/items/{parent_id}/children"

        folder_data = {
            "name": folder_name,
            "folder": {},
            "@microsoft.graph.conflictBehavior": "rename",
        }

        print(f"📁 Creating folder: {folder_name}")
        response = requests.post(url, headers=headers, json=folder_data, timeout=30)

        if response.status_code in [200, 201]:
            print(f"✅ Folder created successfully: {folder_name}")
            return response.json()
        else:
            print(f"❌ Error creating folder: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        print(f"❌ Exception creating folder: {e}")
        traceback.print_exc()
        return None


def transform_onedrive_item(item, source_email=""):
    """Transform OneDrive item to unified format - Similar to calendar transform"""
    try:
        is_folder = "folder" in item

        return {
            "id": item.get("id"),
            "name": item.get("name", "Unknown"),
            "size": item.get("size", 0) if not is_folder else None,
            "modifiedTime": item.get("lastModifiedDateTime"),
            "createdTime": item.get("createdDateTime"),
            "webViewLink": item.get("webUrl"),
            "mimeType": item.get("file", {}).get("mimeType") if not is_folder else None,
            "isFolder": is_folder,
            "source_email": source_email,
            "provider": "onedrive",
            "parents": [item.get("parentReference", {}).get("id", "root")],
        }
    except Exception as e:
        print(f"❌ Error transforming OneDrive item: {e}")
        return None


# Flask Resource Classes - Simplified like your calendar code


class ListOutlookFiles(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            folder_id = data.get("folderId", "root")
            page_size = min(data.get("pageSize", 100), 200)

            print(f"📂 Listing OneDrive files for user {uid}")

            # Get user credentials - same pattern as calendar
            account = DBHelper.find_one(
                "connected_accounts",
                filters={
                    "user_id": str(uid),
                    "provider": "outlook",
                    "is_active": Status.ACTIVE.value,
                },
            )

            if not account:
                return {
                    "status": 0,
                    "message": "No active Outlook account found",
                    "payload": {"files": [], "folders": []},
                }

            access_token = account.get("access_token")
            email = account.get("email", "")

            if not access_token:
                return {
                    "status": 0,
                    "message": "No access token available",
                    "payload": {"files": [], "folders": []},
                }

            # Fetch files using the same pattern as calendar
            items = fetch_onedrive_files(access_token, folder_id, page_size)

            if not items:
                return {
                    "status": 0,
                    "message": "No files found or API error",
                    "payload": {"files": [], "folders": []},
                }

            # Transform items
            files = []
            folders = []

            for item in items:
                transformed = transform_onedrive_item(item, email)
                if transformed:
                    if transformed["isFolder"]:
                        folders.append(transformed)
                    else:
                        files.append(transformed)

            return {
                "status": 1,
                "message": f"Retrieved {len(files)} files and {len(folders)} folders",
                "payload": {
                    "files": files,
                    "folders": folders,
                    "connected_accounts": [
                        {
                            "email": email,
                            "provider": "outlook",
                            "files_count": len(files),
                            "folders_count": len(folders),
                        }
                    ],
                    "errors": [],
                },
            }

        except Exception as e:
            print(f"❌ Error in ListOutlookFiles: {str(e)}")
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to fetch files: {str(e)}",
                "payload": {"files": [], "folders": [], "errors": [str(e)]},
            }


class UploadOutlookFile(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if "file" not in request.files:
                return {"status": 0, "message": "No file provided"}

            file = request.files["file"]
            parent_id = request.form.get("parentId", "root")

            if file.filename == "":
                return {"status": 0, "message": "No file selected"}

            # Get credentials
            account = DBHelper.find_one(
                "connected_accounts",
                filters={
                    "user_id": str(uid),
                    "provider": "outlook",
                    "is_active": Status.ACTIVE.value,
                },
            )

            if not account or not account.get("access_token"):
                return {"status": 0, "message": "No valid Outlook account"}

            # Upload file
            file_data = file.read()
            result = upload_onedrive_file(
                account["access_token"], file_data, file.filename, parent_id
            )

            if result:
                return {
                    "status": 1,
                    "message": f"File '{file.filename}' uploaded successfully",
                    "payload": {"file": result},
                }
            else:
                return {"status": 0, "message": "Upload failed"}

        except Exception as e:
            print(f"❌ Upload error: {str(e)}")
            return {"status": 0, "message": f"Upload failed: {str(e)}"}


class DeleteOutlookFile(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")

            if not file_id:
                return {"status": 0, "message": "File ID required"}

            # Get credentials
            account = DBHelper.find_one(
                "connected_accounts",
                filters={
                    "user_id": str(uid),
                    "provider": "outlook",
                    "is_active": Status.ACTIVE.value,
                },
            )

            if not account or not account.get("access_token"):
                return {"status": 0, "message": "No valid Outlook account"}

            # Delete file
            success = delete_onedrive_file(account["access_token"], file_id)

            if success:
                return {"status": 1, "message": "File deleted successfully"}
            else:
                return {"status": 0, "message": "Delete failed"}

        except Exception as e:
            print(f"❌ Delete error: {str(e)}")
            return {"status": 0, "message": f"Delete failed: {str(e)}"}


class CreateOutlookFolder(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            folder_name = data.get("name")
            parent_id = data.get("parentId", "root")

            if not folder_name:
                return {"status": 0, "message": "Folder name required"}

            # Get credentials
            account = DBHelper.find_one(
                "connected_accounts",
                filters={
                    "user_id": str(uid),
                    "provider": "outlook",
                    "is_active": Status.ACTIVE.value,
                },
            )

            if not account or not account.get("access_token"):
                return {"status": 0, "message": "No valid Outlook account"}

            # Create folder
            result = create_onedrive_folder(
                account["access_token"], folder_name, parent_id
            )

            if result:
                return {
                    "status": 1,
                    "message": f"Folder '{folder_name}' created successfully",
                    "payload": {"folder": result},
                }
            else:
                return {"status": 0, "message": "Folder creation failed"}

        except Exception as e:
            print(f"❌ Create folder error: {str(e)}")
            return {"status": 0, "message": f"Folder creation failed: {str(e)}"}
