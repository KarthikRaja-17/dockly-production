from flask import request
from flask_restful import Resource
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required
from datetime import datetime


class AddProvider(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        provider_id = inputData.get("id")  # This will be None if not passed

        if inputData.get("editing") and provider_id:
            # UPDATE provider
            DBHelper.update_one(
                table_name="healthcare_providers_new",
                filters={"id": provider_id, "user_id": uid},
                updates={
                    "name": inputData.get("name", ""),
                    "specialty": inputData.get("specialty", ""),
                    "phone": inputData.get("phone", ""),
                    "practice_name": inputData.get("practiceName", ""),
                    "address": inputData.get("address", ""),
                    "icon": inputData.get("icon", "👨‍⚕️"),
                    "notes": inputData.get("notes", ""),
                    "updated_at": datetime.now(),
                },
            )
            return {"status": 1, "message": "Healthcare provider updated successfully", "payload": {}}
        else:
            # INSERT new provider
            DBHelper.insert(
                "healthcare_providers_new",
                user_id=uid,
                name=inputData.get("name", ""),
                specialty=inputData.get("specialty", ""),
                phone=inputData.get("phone", ""),
                practice_name=inputData.get("practiceName", ""),
                address=inputData.get("address", ""),
                icon=inputData.get("icon", "👨‍⚕️"),
                notes=inputData.get("notes", ""),
            )
            return {"status": 1, "message": "Healthcare provider added successfully", "payload": {}}


class GetProviders(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        providers = DBHelper.find_all(
            table_name="healthcare_providers_new",
            filters={"user_id": uid, "is_active": 1},
            select_fields=[
                "id", "name", "specialty", "phone", "practice_name", 
                "address", "icon", "notes", "created_at", "updated_at"
            ],
        )
        user_providers = []
        for provider in providers:
            user_providers.append(
                {
                    "id": provider["id"],
                    "name": provider["name"],
                    "specialty": provider["specialty"],
                    "phone": provider["phone"],
                    "practiceName": provider["practice_name"],
                    "address": provider["address"],
                    "icon": provider["icon"] or "👨‍⚕️",
                    "notes": provider["notes"],
                    "createdAt": provider["created_at"].isoformat() if provider["created_at"] else None,
                    "updatedAt": provider["updated_at"].isoformat() if provider["updated_at"] else None,
                }
            )
        return {
            "status": 1,
            "message": "Healthcare providers fetched successfully",
            "payload": {"providers": user_providers},
        }


class UpdateProvider(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, provider_id):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        # Check if provider exists and belongs to user
        existing_provider = DBHelper.find_one(
            table_name="healthcare_providers_new",
            filters={"id": provider_id, "user_id": uid, "is_active": 1}
        )

        if not existing_provider:
            return {"status": 0, "message": "Healthcare provider not found", "payload": {}}

        # Update provider
        DBHelper.update_one(
            table_name="healthcare_providers_new",
            filters={"id": provider_id, "user_id": uid},
            updates={
                "name": inputData.get("name", existing_provider["name"]),
                "specialty": inputData.get("specialty", existing_provider["specialty"]),
                "phone": inputData.get("phone", existing_provider["phone"]),
                "practice_name": inputData.get("practiceName", existing_provider["practice_name"]),
                "address": inputData.get("address", existing_provider["address"]),
                "icon": inputData.get("icon", existing_provider["icon"]),
                "notes": inputData.get("notes", existing_provider["notes"]),
                "updated_at": datetime.now(),
            },
        )
        return {"status": 1, "message": "Healthcare provider updated successfully", "payload": {}}

    @auth_required(isOptional=True)
    def delete(self, uid, user, provider_id):
        # Check if provider exists and belongs to user
        existing_provider = DBHelper.find_one(
            table_name="healthcare_providers_new",
            filters={"id": provider_id, "user_id": uid, "is_active": 1}
        )

        if not existing_provider:
            return {"status": 0, "message": "Healthcare provider not found", "payload": {}}

        # Soft delete by setting is_active to 0
        DBHelper.update_one(
            table_name="healthcare_providers_new",
            filters={"id": provider_id, "user_id": uid},
            updates={"is_active": 0, "updated_at": datetime.now()},
        )
        return {"status": 1, "message": "Healthcare provider deleted successfully", "payload": {}}