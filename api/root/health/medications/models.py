from flask import request
from flask_restful import Resource
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required
from datetime import datetime


class AddMedication(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        medication_id = inputData.get("id")  # This will be None if not passed

        if inputData.get("editing") and medication_id:
            # UPDATE medication
            DBHelper.update_one(
                table_name="medications",
                filters={"id": medication_id, "user_id": uid},
                updates={
                    "name": inputData.get("name", ""),
                    "dosage": inputData.get("dosage", ""),
                    "condition_treated": inputData.get("conditionTreated", ""),
                    "prescribing_doctor": inputData.get("prescribingDoctor", ""),
                    "schedule": inputData.get("schedule", ""),
                    "refill_days_left": inputData.get("refillDaysLeft", 30),
                    "icon": inputData.get("icon", ""),
                    "is_refill_soon": inputData.get("isRefillSoon", False),
                    "updated_at": datetime.now(),  # Use Python datetime
                },
            )
            return {"status": 1, "message": "Medication updated successfully", "payload": {}}
        else:
            # INSERT new medication
            DBHelper.insert(
                "medications",
                user_id=uid,
                name=inputData.get("name", ""),
                dosage=inputData.get("dosage", ""),
                condition_treated=inputData.get("conditionTreated", ""),
                prescribing_doctor=inputData.get("prescribingDoctor", ""),
                schedule=inputData.get("schedule", ""),
                refill_days_left=inputData.get("refillDaysLeft", 30),
                icon=inputData.get("icon", ""),
                is_refill_soon=inputData.get("isRefillSoon", False),
            )
            return {"status": 1, "message": "Medication added successfully", "payload": {}}


class GetMedications(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        medications = DBHelper.find_all(
            table_name="medications",
            filters={"user_id": uid, "is_active": 1},
            select_fields=[
                "id", "name", "dosage", "condition_treated", "prescribing_doctor", 
                "schedule", "refill_days_left", "icon", "is_refill_soon", "created_at", "updated_at"
            ],
        )
        user_medications = []
        for medication in medications:
            user_medications.append(
                {
                    "id": medication["id"],
                    "name": medication["name"],
                    "dosage": medication["dosage"],
                    "conditionTreated": medication["condition_treated"],
                    "prescribingDoctor": medication["prescribing_doctor"],
                    "schedule": medication["schedule"],
                    "refillDaysLeft": medication["refill_days_left"],
                    "icon": medication["icon"],
                    "isRefillSoon": medication["is_refill_soon"],
                    "createdAt": medication["created_at"].isoformat() if medication["created_at"] else None,
                    "updatedAt": medication["updated_at"].isoformat() if medication["updated_at"] else None,
                }
            )
        return {
            "status": 1,
            "message": "Medications fetched successfully",
            "payload": {"medications": user_medications},
        }


class UpdateMedication(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, medication_id):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        # Check if medication exists and belongs to user
        existing_medication = DBHelper.find_one(
            table_name="medications",
            filters={"id": medication_id, "user_id": uid, "is_active": 1}
        )

        if not existing_medication:
            return {"status": 0, "message": "Medication not found", "payload": {}}

        # Update medication
        DBHelper.update_one(
            table_name="medications",
            filters={"id": medication_id, "user_id": uid},
            updates={
                "name": inputData.get("name", existing_medication["name"]),
                "dosage": inputData.get("dosage", existing_medication["dosage"]),
                "condition_treated": inputData.get("conditionTreated", existing_medication["condition_treated"]),
                "prescribing_doctor": inputData.get("prescribingDoctor", existing_medication["prescribing_doctor"]),
                "schedule": inputData.get("schedule", existing_medication["schedule"]),
                "refill_days_left": inputData.get("refillDaysLeft", existing_medication["refill_days_left"]),
                "icon": inputData.get("icon", existing_medication["icon"]),
                "is_refill_soon": inputData.get("isRefillSoon", existing_medication["is_refill_soon"]),
                "updated_at": datetime.now(),  # Use Python datetime
            },
        )
        return {"status": 1, "message": "Medication updated successfully", "payload": {}}

    @auth_required(isOptional=True)
    def delete(self, uid, user, medication_id):
        # Check if medication exists and belongs to user
        existing_medication = DBHelper.find_one(
            table_name="medications",
            filters={"id": medication_id, "user_id": uid, "is_active": 1}
        )

        if not existing_medication:
            return {"status": 0, "message": "Medication not found", "payload": {}}

        # Soft delete by setting is_active to 0
        DBHelper.update_one(
            table_name="medications",
            filters={"id": medication_id, "user_id": uid},
            updates={"is_active": 0, "updated_at": datetime.now()},  # Use Python datetime
        )
        return {"status": 1, "message": "Medication deleted successfully", "payload": {}}


class GetRefillAlerts(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        # Get medications that need refills soon (less than 7 days or marked as refill soon)
        medications = DBHelper.find_all(
            table_name="medications",
            filters={"user_id": uid, "is_active": 1},
            select_fields=[
                "id", "name", "dosage", "condition_treated", "prescribing_doctor", 
                "schedule", "refill_days_left", "icon", "is_refill_soon"
            ],
        )

        refill_alerts = []
        for medication in medications:
            if medication["refill_days_left"] <= 7 or medication["is_refill_soon"]:
                refill_alerts.append(
                    {
                        "id": medication["id"],
                        "name": medication["name"],
                        "dosage": medication["dosage"],
                        "conditionTreated": medication["condition_treated"],
                        "prescribingDoctor": medication["prescribing_doctor"],
                        "schedule": medication["schedule"],
                        "refillDaysLeft": medication["refill_days_left"],
                        "icon": medication["icon"],
                        "isRefillSoon": medication["is_refill_soon"],
                    }
                )

        return {
            "status": 1,
            "message": "Refill alerts fetched successfully",
            "payload": {"refillAlerts": refill_alerts, "count": len(refill_alerts)},
        }

