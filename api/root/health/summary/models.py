from flask import request
from flask_restful import Resource
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required
from datetime import datetime


class HealthSummaryInfo(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        # Check if user already has health summary info
        existing_info = DBHelper.find_one(
            table_name="health_summary_info",
            filters={"user_id": uid, "is_active": 1}
        )

        if existing_info:
            # UPDATE existing record
            DBHelper.update_one(
                table_name="health_summary_info",
                filters={"user_id": uid, "is_active": 1},
                updates={
                    "blood_type": inputData.get("bloodType", ""),
                    "date_of_birth": inputData.get("dateOfBirth"),
                    "height": inputData.get("height", ""),
                    "emergency_contact_name": inputData.get("emergencyContactName", ""),
                    "emergency_contact_phone": inputData.get("emergencyContactPhone", ""),
                    "primary_doctor": inputData.get("primaryDoctor", ""),
                    "medical_record_number": inputData.get("medicalRecordNumber", ""),
                    "updated_at": datetime.now(),
                },
            )
            return {"status": 1, "message": "Health summary updated successfully", "payload": {}}
        else:
            # INSERT new record
            DBHelper.insert(
                "health_summary_info",
                user_id=uid,
                blood_type=inputData.get("bloodType", ""),
                date_of_birth=inputData.get("dateOfBirth"),
                height=inputData.get("height", ""),
                emergency_contact_name=inputData.get("emergencyContactName", ""),
                emergency_contact_phone=inputData.get("emergencyContactPhone", ""),
                primary_doctor=inputData.get("primaryDoctor", ""),
                medical_record_number=inputData.get("medicalRecordNumber", ""),
            )
            return {"status": 1, "message": "Health summary added successfully", "payload": {}}

    @auth_required(isOptional=True)
    def get(self, uid, user):
        health_info = DBHelper.find_one(
            table_name="health_summary_info",
            filters={"user_id": uid, "is_active": 1},
            select_fields=[
                "id", "blood_type", "date_of_birth", "height", "emergency_contact_name",
                "emergency_contact_phone", "primary_doctor", "medical_record_number",
                "created_at", "updated_at"
            ],
        )

        if health_info:
            response_data = {
                "id": health_info["id"],
                "bloodType": health_info["blood_type"],
                "dateOfBirth": health_info["date_of_birth"].isoformat() if health_info["date_of_birth"] else None,
                "height": health_info["height"],
                "emergencyContactName": health_info["emergency_contact_name"],
                "emergencyContactPhone": health_info["emergency_contact_phone"],
                "primaryDoctor": health_info["primary_doctor"],
                "medicalRecordNumber": health_info["medical_record_number"],
                "createdAt": health_info["created_at"].isoformat() if health_info["created_at"] else None,
                "updatedAt": health_info["updated_at"].isoformat() if health_info["updated_at"] else None,
            }
        else:
            response_data = {}

        return {
            "status": 1,
            "message": "Health summary fetched successfully",
            "payload": {"healthInfo": response_data},
        }


class UserAllergies(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        allergy_id = inputData.get("id")

        if inputData.get("editing") and allergy_id:
            # UPDATE allergy
            DBHelper.update_one(
                table_name="user_allergies",
                filters={"id": allergy_id, "user_id": uid},
                updates={
                    "allergy_name": inputData.get("allergyName", ""),
                    "severity_level": inputData.get("severityLevel", "mild"),
                    "allergy_type": inputData.get("allergyType", ""),
                    "reaction_symptoms": inputData.get("reactionSymptoms", ""),
                    "notes": inputData.get("notes", ""),
                    "updated_at": datetime.now(),
                },
            )
            return {"status": 1, "message": "Allergy updated successfully", "payload": {}}
        else:
            # INSERT new allergy
            DBHelper.insert(
                "user_allergies",
                user_id=uid,
                allergy_name=inputData.get("allergyName", ""),
                severity_level=inputData.get("severityLevel", "mild"),
                allergy_type=inputData.get("allergyType", ""),
                reaction_symptoms=inputData.get("reactionSymptoms", ""),
                notes=inputData.get("notes", ""),
            )
            return {"status": 1, "message": "Allergy added successfully", "payload": {}}

    @auth_required(isOptional=True)
    def get(self, uid, user):
        allergies = DBHelper.find_all(
            table_name="user_allergies",
            filters={"user_id": uid, "is_active": 1},
            select_fields=[
                "id", "allergy_name", "severity_level", "allergy_type", 
                "reaction_symptoms", "notes", "created_at", "updated_at"
            ],
        )

        user_allergies = []
        for allergy in allergies:
            user_allergies.append({
                "id": allergy["id"],
                "allergyName": allergy["allergy_name"],
                "severityLevel": allergy["severity_level"],
                "allergyType": allergy["allergy_type"],
                "reactionSymptoms": allergy["reaction_symptoms"],
                "notes": allergy["notes"],
                "createdAt": allergy["created_at"].isoformat() if allergy["created_at"] else None,
                "updatedAt": allergy["updated_at"].isoformat() if allergy["updated_at"] else None,
            })

        return {
            "status": 1,
            "message": "Allergies fetched successfully",
            "payload": {"allergies": user_allergies},
        }


class ManageAllergy(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, allergy_id):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        # Check if allergy exists and belongs to user
        existing_allergy = DBHelper.find_one(
            table_name="user_allergies",
            filters={"id": allergy_id, "user_id": uid, "is_active": 1}
        )

        if not existing_allergy:
            return {"status": 0, "message": "Allergy not found", "payload": {}}

        # Update allergy
        DBHelper.update_one(
            table_name="user_allergies",
            filters={"id": allergy_id, "user_id": uid},
            updates={
                "allergy_name": inputData.get("allergyName", existing_allergy["allergy_name"]),
                "severity_level": inputData.get("severityLevel", existing_allergy["severity_level"]),
                "allergy_type": inputData.get("allergyType", existing_allergy["allergy_type"]),
                "reaction_symptoms": inputData.get("reactionSymptoms", existing_allergy["reaction_symptoms"]),
                "notes": inputData.get("notes", existing_allergy["notes"]),
                "updated_at": datetime.now(),
            },
        )
        return {"status": 1, "message": "Allergy updated successfully", "payload": {}}

    @auth_required(isOptional=True)
    def delete(self, uid, user, allergy_id):
        # Check if allergy exists and belongs to user
        existing_allergy = DBHelper.find_one(
            table_name="user_allergies",
            filters={"id": allergy_id, "user_id": uid, "is_active": 1}
        )

        if not existing_allergy:
            return {"status": 0, "message": "Allergy not found", "payload": {}}

        # Soft delete by setting is_active to 0
        DBHelper.update_one(
            table_name="user_allergies",
            filters={"id": allergy_id, "user_id": uid},
            updates={"is_active": 0, "updated_at": datetime.now()},
        )
        return {"status": 1, "message": "Allergy deleted successfully", "payload": {}}


class UserConditions(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        condition_id = inputData.get("id")

        if inputData.get("editing") and condition_id:
            # UPDATE condition
            DBHelper.update_one(
                table_name="user_conditions",
                filters={"id": condition_id, "user_id": uid},
                updates={
                    "condition_name": inputData.get("conditionName", ""),
                    "status": inputData.get("status", "active"),
                    "diagnosis_date": inputData.get("diagnosisDate"),
                    "treating_doctor": inputData.get("treatingDoctor", ""),
                    "notes": inputData.get("notes", ""),
                    "updated_at": datetime.now(),
                },
            )
            return {"status": 1, "message": "Condition updated successfully", "payload": {}}
        else:
            # INSERT new condition
            DBHelper.insert(
                "user_conditions",
                user_id=uid,
                condition_name=inputData.get("conditionName", ""),
                status=inputData.get("status", "active"),
                diagnosis_date=inputData.get("diagnosisDate"),
                treating_doctor=inputData.get("treatingDoctor", ""),
                notes=inputData.get("notes", ""),
            )
            return {"status": 1, "message": "Condition added successfully", "payload": {}}

    @auth_required(isOptional=True)
    def get(self, uid, user):
        conditions = DBHelper.find_all(
            table_name="user_conditions",
            filters={"user_id": uid, "is_active": 1},
            select_fields=[
                "id", "condition_name", "status", "diagnosis_date", 
                "treating_doctor", "notes", "created_at", "updated_at"
            ],
        )

        user_conditions = []
        for condition in conditions:
            user_conditions.append({
                "id": condition["id"],
                "conditionName": condition["condition_name"],
                "status": condition["status"],
                "diagnosisDate": condition["diagnosis_date"].isoformat() if condition["diagnosis_date"] else None,
                "treatingDoctor": condition["treating_doctor"],
                "notes": condition["notes"],
                "createdAt": condition["created_at"].isoformat() if condition["created_at"] else None,
                "updatedAt": condition["updated_at"].isoformat() if condition["updated_at"] else None,
            })

        return {
            "status": 1,
            "message": "Conditions fetched successfully",
            "payload": {"conditions": user_conditions},
        }


class ManageCondition(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, condition_id):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        # Check if condition exists and belongs to user
        existing_condition = DBHelper.find_one(
            table_name="user_conditions",
            filters={"id": condition_id, "user_id": uid, "is_active": 1}
        )

        if not existing_condition:
            return {"status": 0, "message": "Condition not found", "payload": {}}

        # Update condition
        DBHelper.update_one(
            table_name="user_conditions",
            filters={"id": condition_id, "user_id": uid},
            updates={
                "condition_name": inputData.get("conditionName", existing_condition["condition_name"]),
                "status": inputData.get("status", existing_condition["status"]),
                "diagnosis_date": inputData.get("diagnosisDate", existing_condition["diagnosis_date"]),
                "treating_doctor": inputData.get("treatingDoctor", existing_condition["treating_doctor"]),
                "notes": inputData.get("notes", existing_condition["notes"]),
                "updated_at": datetime.now(),
            },
        )
        return {"status": 1, "message": "Condition updated successfully", "payload": {}}

    @auth_required(isOptional=True)
    def delete(self, uid, user, condition_id):
        # Check if condition exists and belongs to user
        existing_condition = DBHelper.find_one(
            table_name="user_conditions",
            filters={"id": condition_id, "user_id": uid, "is_active": 1}
        )

        if not existing_condition:
            return {"status": 0, "message": "Condition not found", "payload": {}}

        # Soft delete by setting is_active to 0
        DBHelper.update_one(
            table_name="user_conditions",
            filters={"id": condition_id, "user_id": uid},
            updates={"is_active": 0, "updated_at": datetime.now()},
        )
        return {"status": 1, "message": "Condition deleted successfully", "payload": {}}


class FamilyMedicalHistory(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        history_id = inputData.get("id")

        if inputData.get("editing") and history_id:
            # UPDATE family medical history
            DBHelper.update_one(
                table_name="family_medical_history",
                filters={"id": history_id, "user_id": uid},
                updates={
                    "family_member_relation": inputData.get("familyMemberRelation", ""),
                    "condition_name": inputData.get("conditionName", ""),
                    "age_of_onset": inputData.get("ageOfOnset"),
                    "status": inputData.get("status", ""),
                    "notes": inputData.get("notes", ""),
                    "updated_at": datetime.now(),
                },
            )
            return {"status": 1, "message": "Family medical history updated successfully", "payload": {}}
        else:
            # INSERT new family medical history
            DBHelper.insert(
                "family_medical_history",
                user_id=uid,
                family_member_relation=inputData.get("familyMemberRelation", ""),
                condition_name=inputData.get("conditionName", ""),
                age_of_onset=inputData.get("ageOfOnset"),
                status=inputData.get("status", ""),
                notes=inputData.get("notes", ""),
            )
            return {"status": 1, "message": "Family medical history added successfully", "payload": {}}

    @auth_required(isOptional=True)
    def get(self, uid, user):
        family_history = DBHelper.find_all(
            table_name="family_medical_history",
            filters={"user_id": uid, "is_active": 1},
            select_fields=[
                "id", "family_member_relation", "condition_name", "age_of_onset", 
                "status", "notes", "created_at", "updated_at"
            ],
        )

        user_family_history = []
        for history in family_history:
            user_family_history.append({
                "id": history["id"],
                "familyMemberRelation": history["family_member_relation"],
                "conditionName": history["condition_name"],
                "ageOfOnset": history["age_of_onset"],
                "status": history["status"],
                "notes": history["notes"],
                "createdAt": history["created_at"].isoformat() if history["created_at"] else None,
                "updatedAt": history["updated_at"].isoformat() if history["updated_at"] else None,
            })

        return {
            "status": 1,
            "message": "Family medical history fetched successfully",
            "payload": {"familyHistory": user_family_history},
        }


class ManageFamilyHistory(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, history_id):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        # Check if family history exists and belongs to user
        existing_history = DBHelper.find_one(
            table_name="family_medical_history",
            filters={"id": history_id, "user_id": uid, "is_active": 1}
        )

        if not existing_history:
            return {"status": 0, "message": "Family medical history not found", "payload": {}}

        # Update family medical history
        DBHelper.update_one(
            table_name="family_medical_history",
            filters={"id": history_id, "user_id": uid},
            updates={
                "family_member_relation": inputData.get("familyMemberRelation", existing_history["family_member_relation"]),
                "condition_name": inputData.get("conditionName", existing_history["condition_name"]),
                "age_of_onset": inputData.get("ageOfOnset", existing_history["age_of_onset"]),
                "status": inputData.get("status", existing_history["status"]),
                "notes": inputData.get("notes", existing_history["notes"]),
                "updated_at": datetime.now(),
            },
        )
        return {"status": 1, "message": "Family medical history updated successfully", "payload": {}}

    @auth_required(isOptional=True)
    def delete(self, uid, user, history_id):
        # Check if family history exists and belongs to user
        existing_history = DBHelper.find_one(
            table_name="family_medical_history",
            filters={"id": history_id, "user_id": uid, "is_active": 1}
        )

        if not existing_history:
            return {"status": 0, "message": "Family medical history not found", "payload": {}}

        # Soft delete by setting is_active to 0
        DBHelper.update_one(
            table_name="family_medical_history",
            filters={"id": history_id, "user_id": uid},
            updates={"is_active": 0, "updated_at": datetime.now()},
        )
        return {"status": 1, "message": "Family medical history deleted successfully", "payload": {}}
