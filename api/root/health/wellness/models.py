from flask import request
from flask_restful import Resource
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required
from datetime import datetime


class AddWellnessTask(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        task_id = inputData.get("id")  # This will be None if not passed

        if inputData.get("editing") and task_id:
            # UPDATE task
            DBHelper.update_one(
                table_name="wellness_tasks",
                filters={"id": task_id, "user_id": uid},
                updates={
                    "icon": inputData.get("icon", ""),
                    "text": inputData.get("text", ""),
                    "date": inputData.get("date", ""),
                    "recurring": inputData.get("recurring", False),
                    "details": inputData.get("details", ""),
                    "completed": inputData.get("completed", False),
                    "updated_at": datetime.now(),  # Use Python datetime
                },
            )
            return {"status": 1, "message": "Wellness task updated successfully", "payload": {}}
        else:
            # INSERT new task
            DBHelper.insert(
                "wellness_tasks",
                user_id=uid,
                icon=inputData.get("icon", ""),
                text=inputData.get("text", ""),
                date=inputData.get("date", ""),
                recurring=inputData.get("recurring", False),
                details=inputData.get("details", ""),
                completed=inputData.get("completed", False),
            )
            return {"status": 1, "message": "Wellness task added successfully", "payload": {}}


class GetWellnessTasks(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        tasks = DBHelper.find_all(
            table_name="wellness_tasks",
            filters={"user_id": uid, "is_active": 1},
            select_fields=["id", "icon", "text", "date", "recurring", "details", "completed", "created_at", "updated_at"],
        )
        user_tasks = []
        for task in tasks:
            user_tasks.append(
                {
                    "id": task["id"],
                    "icon": task["icon"],
                    "text": task["text"],
                    "date": task["date"],
                    "recurring": task["recurring"],
                    "details": task["details"],
                    "completed": task["completed"],
                    "createdAt": task["created_at"].isoformat() if task["created_at"] else None,
                    "updatedAt": task["updated_at"].isoformat() if task["updated_at"] else None,
                }
            )
        return {
            "status": 1,
            "message": "Wellness tasks fetched successfully",
            "payload": {"tasks": user_tasks},
        }


class UpdateWellnessTask(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, task_id):
        inputData = request.get_json(silent=True)
        if not inputData:
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        # Check if task exists and belongs to user
        existing_task = DBHelper.find_one(
            table_name="wellness_tasks",
            filters={"id": task_id, "user_id": uid, "is_active": 1}
        )

        if not existing_task:
            return {"status": 0, "message": "Wellness task not found", "payload": {}}

        # Update task
        DBHelper.update_one(
            table_name="wellness_tasks",
            filters={"id": task_id, "user_id": uid},
            updates={
                "icon": inputData.get("icon", existing_task["icon"]),
                "text": inputData.get("text", existing_task["text"]),
                "date": inputData.get("date", existing_task["date"]),
                "recurring": inputData.get("recurring", existing_task["recurring"]),
                "details": inputData.get("details", existing_task["details"]),
                "completed": inputData.get("completed", existing_task["completed"]),
                "updated_at": datetime.now(),  # Use Python datetime
            },
        )
        return {"status": 1, "message": "Wellness task updated successfully", "payload": {}}

    @auth_required(isOptional=True)
    def delete(self, uid, user, task_id):
        # Check if task exists and belongs to user
        existing_task = DBHelper.find_one(
            table_name="wellness_tasks",
            filters={"id": task_id, "user_id": uid, "is_active": 1}
        )

        if not existing_task:
            return {"status": 0, "message": "Wellness task not found", "payload": {}}

        # Soft delete by setting is_active to 0
        DBHelper.update_one(
            table_name="wellness_tasks",
            filters={"id": task_id, "user_id": uid},
            updates={"is_active": 0, "updated_at": datetime.now()},  # Use Python datetime
        )
        return {"status": 1, "message": "Wellness task deleted successfully", "payload": {}}


class ToggleWellnessTask(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, task_id):
        # Check if task exists and belongs to user
        existing_task = DBHelper.find_one(
            table_name="wellness_tasks",
            filters={"id": task_id, "user_id": uid, "is_active": 1}
        )

        if not existing_task:
            return {"status": 0, "message": "Wellness task not found", "payload": {}}

        # Toggle completed status
        new_completed_status = not existing_task["completed"]
        DBHelper.update_one(
            table_name="wellness_tasks",
            filters={"id": task_id, "user_id": uid},
            updates={"completed": new_completed_status, "updated_at": datetime.now()},  # Use Python datetime
        )

        return {
            "status": 1, 
            "message": f"Wellness task {'completed' if new_completed_status else 'uncompleted'} successfully", 
            "payload": {"completed": new_completed_status}
        }