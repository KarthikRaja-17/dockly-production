import datetime
import os
import traceback
from flask import request
from flask_restful import Resource
from root.common import Status
from root.files.models import DriveBaseResource
from root.utilis import ensure_drive_folder_structure
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required
from root.helpers.logs import AuditLogger


class GetBoards(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        if not uid:
            return {"status": 0, "message": "User ID is required", "payload": {}}

        boards = []

        # Check for Home
        # home = DBHelper.find_one("homeDetails", filters={"uid": uid})
        # if home:
        #     boards.append(
        #         {
        #             "icon": "home",  # Frontend should map this to <Home />
        #             "title": "Home Management",
        #             "accounts": 8,
        #             "documents": 12,
        #             "items": [
        #                 {"type": "urgent", "text": "Mortgage payment due in 2 days"},
        #                 {"type": "pending", "text": "3 utility bills this week"},
        #             ],
        #         }
        #     )

        # Check for Family
        # family = DBHelper.find_one("familyDetails", filters={"uid": uid})
        # if family:
        #     boards.append(
        #         {
        #             "icon": "users",  # Frontend should map to <Users />
        #             "title": "Family Hub",
        #             "accounts": 4,
        #             "documents": 15,
        #             "items": [
        #                 {"type": "pending", "text": "Emma's school permission slip"},
        #                 {"type": "complete", "text": "All health records updated"},
        #             ],
        #         }
        #     )

        # Check for Finance
        bank = DBHelper.find_one("bankDetails", filters={"uid": uid})
        if bank:
            boards.append(
                {
                    "icon": "dollar",  # Frontend should map to <DollarSign />
                    "title": "Finance",
                    "accounts": 6,
                    "documents": 9,
                    "items": [
                        {"type": "complete", "text": "Credit card autopay active"},
                        {"type": "pending", "text": "Review investment portfolio"},
                    ],
                }
            )

        # Check for Health
        # health = DBHelper.find_one("healthDetails", filters={"uid": uid})
        # if health:
        #     boards.append(
        #         {
        #             "icon": "heart",  # Frontend should map to <Heart />
        #             "title": "Health",
        #             "accounts": 3,
        #             "documents": 7,
        #             "items": [
        #                 {"type": "urgent", "text": "Dental checkup overdue"},
        #                 {"type": "pending", "text": "Prescription refill needed"},
        #             ],
        #         }
        #     )

        return {
            "status": 1,
            "message": "Boards fetched successfully",
            "payload": {
                "username": user.get("username", ""),
                "uid": uid,
                "boards": boards,
            },
        }


class GetUserHubs(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        # print(f"uid: {uid}")
        hubs = DBHelper.find_all(
            table_name="users_access_hubs",
            select_fields=[
                "id",
                "hubs",
            ],
            filters={"user_id": uid},
        )
        # utilities = DBHelper.find_all(
        #     table_name="users_access_utilities",
        #     select_fields=[
        #         "id",
        #         "utilities",
        #     ],
        #     filters={"user_id": uid},
        # )
        hub_ids = [row["hubs"] for row in hubs]
        # utilities_ids = [row["utilities"] for row in utilities]

        if not hub_ids:
            return {"status": 1, "payload": {"hubs": []}}

        hubs_details = DBHelper.find_in(
            table_name="hubs",
            select_fields=["hid", "name", "title"],
            field="hid",
            values=hub_ids,
        )
        # print(f"hubs_details: {hubs_details}")

        # utilities_details = DBHelper.find_in(
        #     table_name="utilities",
        #     select_fields=["utid", "name", "title"],
        #     field="utid",
        #     values=utilities_ids,
        # )
        userHubs = []
        userUtilities = []
        for hubs in hubs_details:
            userHubs.append(hubs)

        # for utilities in utilities_details:
        #     userUtilities.append(utilities)

        return {"status": 1, "payload": {"hubs": userHubs, "utilities": userUtilities}}


class GetConnectedAccounts(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            accounts = DBHelper.find_all(
                table_name="connected_accounts",
                select_fields=["provider", "email", "user_object", "id"],
                filters={"user_id": uid, "is_active": 1},
            )

            connectedAccounts = []
            for account in accounts:
                connectedAccounts.append(
                    {
                        "id": account.get("id"),
                        "provider": account.get("provider"),
                        "email": account.get("email"),
                        "user_object": account.get("user_object"),
                    }
                )

            # Success log
            AuditLogger.log(
                user_id=uid,
                action="GET_CONNECTED_ACCOUNTS",
                resource_type="connected_accounts",
                resource_id=None,
                success=True,
                error_message=None,
                metadata={"count": len(connectedAccounts)},
            )

            return {
                "status": 1,
                "payload": {"connectedAccounts": connectedAccounts},
                "message": "Accounts fetched successfully",
            }

        except Exception as e:
            # Error log
            AuditLogger.log(
                user_id=uid,
                action="GET_CONNECTED_ACCOUNTS_FAILED",
                resource_type="connected_accounts",
                resource_id=None,
                success=False,
                error_message="Failed to fetch connected accounts",
                metadata={"input": {"uid": uid}, "trace": traceback.format_exc(), "error": str(e)},
            )

            return {
                "status": 0,
                "payload": {},
                "message": "Failed to fetch connected accounts",
            }


class RemoveConnectedAccount(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(silent=True)
            account_id = data.get("id")

            if not account_id:
                AuditLogger.log(
                    user_id=uid,
                    action="REMOVE_CONNECTED_ACCOUNT",
                    resource_type="connected_accounts",
                    resource_id=None,
                    success=False,
                    error_message="Account ID missing",
                    metadata={"input": data},
                )
                return {"status": 0, "message": "Account ID is required"}, 400

            account = DBHelper.find_one(
                table_name="connected_accounts",
                filters={
                    "id": account_id,
                    "user_id": uid,
                    "is_active": Status.ACTIVE.value,
                },
            )

            if not account:
                AuditLogger.log(
                    user_id=uid,
                    action="REMOVE_CONNECTED_ACCOUNT",
                    resource_type="connected_accounts",
                    resource_id=account_id,
                    success=False,
                    error_message="Account not found or already removed",
                    metadata={"input": {"account_id": account_id}},
                )
                return {"status": 0, "message": "Account not found or already removed"}, 404

            DBHelper.update(
                table_name="connected_accounts",
                update_fields={"is_active": 0},
                filters={"id": account_id, "user_id": uid},
            )

            # Success log
            AuditLogger.log(
                user_id=uid,
                action="REMOVE_CONNECTED_ACCOUNT",
                resource_type="connected_accounts",
                resource_id=account_id,
                success=True,
                error_message=None,
                metadata={"account_id": account_id},
            )

            return {"status": 1, "message": "Account disconnected successfully"}

        except Exception as e:
            # Error log
            AuditLogger.log(
                user_id=uid,
                action="REMOVE_CONNECTED_ACCOUNT_FAILED",
                resource_type="connected_accounts",
                resource_id=None,
                success=False,
                error_message="Failed to disconnect account",
                metadata={
                    "input": request.get_json(silent=True),
                    "trace": traceback.format_exc(),
                    "error": str(e),
                },
            )
            return {"status": 0, "message": "Failed to disconnect account"}, 500

    
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload
import io
from werkzeug.utils import secure_filename

class UploadDocklyRootFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if "file" not in request.files:
                AuditLogger.log(
                    user_id=uid,
                    action="UPLOAD_FILE_FAILED",
                    resource_type="dockly_drive",
                    resource_id=None,
                    success=False,
                    error_message="No file provided",
                    metadata={"input": {}},
                )
                return {"status": 0, "message": "No file provided"}, 400

            file = request.files["file"]

            service = self.get_drive_service(uid)
            if not service:
                AuditLogger.log(
                    user_id=uid,
                    action="UPLOAD_FILE_FAILED",
                    resource_type="dockly_drive",
                    resource_id=None,
                    success=False,
                    error_message="Drive not connected",
                    metadata={"input": {"file_name": file.filename}},
                )
                return {"status": 0, "message": "Drive not connected"}, 401

            folder_data = ensure_drive_folder_structure(service)
            dockly_root_id = folder_data["root"]

            # Keep original filename & extension
            filename = secure_filename(file.filename)
            file_ext = os.path.splitext(filename)[1].lower() if "." in filename else None

            file_metadata = {
                "name": filename,
                "parents": [dockly_root_id],
            }

            media = MediaIoBaseUpload(
                io.BytesIO(file.read()),
                mimetype=file.content_type or "application/octet-stream",
            )

            uploaded = (
                service.files()
                .create(
                    body=file_metadata,
                    media_body=media,
                    fields="id, name, webViewLink, mimeType",
                )
                .execute()
            )

            # ✅ Success log
            AuditLogger.log(
                user_id=uid,
                action="UPLOAD_FILE_SUCCESS",
                resource_type="dockly_drive",
                resource_id=uploaded.get("id"),
                success=True,
                metadata={
                    "file_name": uploaded.get("name"),
                    "extension": file_ext,
                    "mimeType": uploaded.get("mimeType"),
                    "webViewLink": uploaded.get("webViewLink"),
                },
            )

            return {
                "status": 1,
                "message": "Uploaded to DOCKLY root",
                "payload": {
                    "file": uploaded,
                    "extension": file_ext,
                },
            }, 200

        except Exception as e:
            # ✅ Failure log with traceback
            AuditLogger.log(
                user_id=uid,
                action="UPLOAD_FILE_FAILED",
                resource_type="dockly_drive",
                resource_id=None,
                success=False,
                error_message="Upload failed",
                metadata={
                    "error": str(e),
                    "trace": traceback.format_exc(),
                },
            )
            return {"status": 0, "message": f"Upload failed: {str(e)}"}, 500
