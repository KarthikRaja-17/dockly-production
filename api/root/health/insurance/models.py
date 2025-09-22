from flask import request
from flask_restful import Resource
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required
from datetime import datetime
import json


class AddInsurance(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        insurance_id = inputData.get("id")  # This will be None if not passed

        if inputData.get("editing") and insurance_id:
            # UPDATE insurance account
            DBHelper.update_one(
                table_name="insurance_accounts",
                filters={"id": insurance_id, "user_id": uid},
                updates={
                    "provider_name": inputData.get("providerName", ""),
                    "plan_name": inputData.get("planName", ""),
                    "account_type": inputData.get("accountType", ""),
                    "details": json.dumps(inputData.get("details", [])),
                    "contact_info": inputData.get("contactInfo", ""),
                    "logo_text": inputData.get("logoText", ""),
                    "gradient_style": inputData.get("gradientStyle", "linear-gradient(135deg, #dbeafe, #e0e7ff)"),
                    "notes": inputData.get("notes", ""),
                    "updated_at": datetime.now(),
                },
            )
            return {"status": 1, "message": "Insurance account updated successfully", "payload": {}}
        else:
            # INSERT new insurance account
            DBHelper.insert(
                "insurance_accounts",
                user_id=uid,
                provider_name=inputData.get("providerName", ""),
                plan_name=inputData.get("planName", ""),
                account_type=inputData.get("accountType", ""),
                details=json.dumps(inputData.get("details", [])),
                contact_info=inputData.get("contactInfo", ""),
                logo_text=inputData.get("logoText", ""),
                gradient_style=inputData.get("gradientStyle", "linear-gradient(135deg, #dbeafe, #e0e7ff)"),
                notes=inputData.get("notes", ""),
            )
            return {"status": 1, "message": "Insurance account added successfully", "payload": {}}


class GetInsurance(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        insurance_accounts = DBHelper.find_all(
            table_name="insurance_accounts",
            filters={"user_id": uid, "is_active": 1},
            select_fields=[
                "id", "provider_name", "plan_name", "account_type", "details", 
                "contact_info", "logo_text", "gradient_style", "notes", "created_at", "updated_at"
            ],
        )
        user_insurance = []
        for account in insurance_accounts:
            # Parse the JSON details back to list
            try:
                details = json.loads(account["details"]) if account["details"] else []
                print(details)
            except (json.JSONDecodeError, TypeError):
                details = []

            user_insurance.append(
                {
                    "id": account["id"],
                    "providerName": account["provider_name"],
                    "planName": account["plan_name"],
                    "accountType": account["account_type"],
                    "details": account["details"],
                    "contactInfo": account["contact_info"],
                    "logoText": account["logo_text"],
                    "gradientStyle": account["gradient_style"],
                    "notes": account["notes"],
                    "createdAt": account["created_at"].isoformat() if account["created_at"] else None,
                    "updatedAt": account["updated_at"].isoformat() if account["updated_at"] else None,
                }
            )
        return {
            "status": 1,
            "message": "Insurance accounts fetched successfully",
            "payload": {"insuranceAccounts": user_insurance},
        }


class UpdateInsurance(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, insurance_id):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        # Check if insurance account exists and belongs to user
        existing_insurance = DBHelper.find_one(
            table_name="insurance_accounts",
            filters={"id": insurance_id, "user_id": uid, "is_active": 1}
        )

        if not existing_insurance:
            return {"status": 0, "message": "Insurance account not found", "payload": {}}

        # Parse existing details for fallback
        try:
            existing_details = json.loads(existing_insurance["details"]) if existing_insurance["details"] else []
        except (json.JSONDecodeError, TypeError):
            existing_details = []

        # Update insurance account
        DBHelper.update_one(
            table_name="insurance_accounts",
            filters={"id": insurance_id, "user_id": uid},
            updates={
                "provider_name": inputData.get("providerName", existing_insurance["provider_name"]),
                "plan_name": inputData.get("planName", existing_insurance["plan_name"]),
                "account_type": inputData.get("accountType", existing_insurance["account_type"]),
                "details": json.dumps(inputData.get("details", existing_details)),
                "contact_info": inputData.get("contactInfo", existing_insurance["contact_info"]),
                "logo_text": inputData.get("logoText", existing_insurance["logo_text"]),
                "gradient_style": inputData.get("gradientStyle", existing_insurance["gradient_style"]),
                "notes": inputData.get("notes", existing_insurance["notes"]),
                "updated_at": datetime.now(),
            },
        )
        return {"status": 1, "message": "Insurance account updated successfully", "payload": {}}

    @auth_required(isOptional=True)
    def delete(self, uid, user, insurance_id):
        # Check if insurance account exists and belongs to user
        existing_insurance = DBHelper.find_one(
            table_name="insurance_accounts",
            filters={"id": insurance_id, "user_id": uid, "is_active": 1}
        )

        if not existing_insurance:
            return {"status": 0, "message": "Insurance account not found", "payload": {}}

        # Soft delete by setting is_active to 0
        DBHelper.update_one(
            table_name="insurance_accounts",
            filters={"id": insurance_id, "user_id": uid},
            updates={"is_active": 0, "updated_at": datetime.now()},
        )
        return {"status": 1, "message": "Insurance account deleted successfully", "payload": {}}
 