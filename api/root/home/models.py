from decimal import Decimal
from flask import request
import json
from flask_restful import Resource
import logging
from datetime import datetime, date
from root.files.models import DriveBaseResource
from root.utilis import ensure_drive_folder_structure
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required
import random
from root.helpers.logs import AuditLogger
import string


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# class AddMaintenanceTask(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         input_data = request.get_json(silent=True)
#         if not input_data:
#             AuditLogger.log(
#                 user_id=uid,
#                 action="ADD_MAINTENANCE_TASK",
#                 resource_type="maintenance_tasks",
#                 resource_id=None,
#                 success=False,
#                 error_message="No input data received",
#                 metadata={"input": input_data},
#             )
#             return {"status": 0, "message": "No input data received", "payload": {}}

#         name = input_data.get("name", "").strip()
#         date = input_data.get("date", "").strip()
#         if not name or not date:
#             AuditLogger.log(
#                 user_id=uid,
#                 action="ADD_MAINTENANCE_TASK",
#                 resource_type="maintenance_tasks",
#                 resource_id=None,
#                 success=False,
#                 error_message="Name and date are required",
#                 metadata={"input": input_data},
#             )
#             return {"status": 0, "message": "Name and date are required", "payload": {}}

#         task_data = {
#             "user_id": uid,
#             "name": name,
#             "date": date,  # Expect YYYY-MM-DD
#             "completed": input_data.get("completed", False),
#             "priority": input_data.get("priority", "").strip() or None,
#             "details": input_data.get("details", "").strip() or None,
#             "property_icon": input_data.get("property_icon", "").strip() or None,
#             "is_recurring": input_data.get("is_recurring", False),
#             "created_at": datetime.utcnow().isoformat(),
#             "updated_at": datetime.utcnow().isoformat(),
#             "is_active": 1,
#         }

#         try:
#             inserted_id = DBHelper.insert(
#                 "property_maintenance", return_column="id", **task_data
#             )
#             task_data["id"] = inserted_id

#             AuditLogger.log(
#                 user_id=uid,
#                 action="ADD_MAINTENANCE_TASK",
#                 resource_type="maintenance_tasks",
#                 resource_id=inserted_id,
#                 success=True,
#                 metadata={"task": task_data},
#             )

#             return {
#                 "status": 1,
#                 "message": "Maintenance Task Added Successfully",
#                 "payload": {"task": task_data},
#             }

#         except Exception as e:
#             AuditLogger.log(
#                 user_id=uid,
#                 action="ADD_MAINTENANCE_TASK",
#                 resource_type="maintenance_tasks",
#                 resource_id=None,
#                 success=False,
#                 error_message=str(e),
#                 metadata={"input": input_data},
#             )
#             logger.error(f"Error adding maintenance task: {str(e)}")
#             return {
#                 "status": 0,
#                 "message": f"Error adding maintenance task: {str(e)}",
#                 "payload": {},
#             }




class AddMaintenanceTask(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        name = input_data.get("name", "").strip()
        date = input_data.get("date", "").strip()
        if not name or not date:
            return {"status": 0, "message": "Name and date are required", "payload": {}}

        task_data = {
            "user_id": uid,
            "name": name,
            "date": date,  # Expect YYYY-MM-DD
            "completed": input_data.get("completed", False),
            "priority": input_data.get("priority", "").strip() or None,
            "details": input_data.get("details", "").strip() or None,
            "property_icon": input_data.get("property_icon", "").strip() or None,
            "is_recurring": input_data.get("is_recurring", False),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_active": 1,  # Set is_active to 1
        }

        try:
            inserted_id = DBHelper.insert(
                "property_maintenance", return_column="id", **task_data
            )
            task_data["id"] = inserted_id
            return {
                "status": 1,
                "message": "Maintenance Task Added Successfully",
                "payload": {"task": task_data},
            }
        except Exception as e:
            logger.error(f"Error adding maintenance task: {str(e)}")
            return {
                "status": 0,
                "message": f"Error adding maintenance task: {str(e)}",
                "payload": {},
            }

class GetMaintenanceTasks(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            tasks = DBHelper.find_all(
                table_name="property_maintenance",
                filters={"user_id": uid, "is_active": 1},  # Filter for active tasks
                select_fields=[
                    "id",
                    "name",
                    "date",
                    "completed",
                    "priority",
                    "details",
                    "property_icon",
                    "is_recurring",
                    "created_at",
                    "updated_at",
                    "is_active",  # Include is_active
                ],
            )
            user_tasks = [
                {
                    "id": str(task["id"]),
                    "name": task["name"],
                    "date": (
                        task["date"].strftime("%Y-%m-%d") if task["date"] else "No Date"
                    ),
                    "completed": task["completed"],
                    "priority": task["priority"],
                    "details": task["details"],
                    "property_icon": task["property_icon"],
                    "is_recurring": task["is_recurring"],
                    "created_at": (
                        task["created_at"].isoformat() if task["created_at"] else None
                    ),
                    "updated_at": (
                        task["updated_at"].isoformat() if task["updated_at"] else None
                    ),
                    "is_active": task["is_active"],  # Include is_active
                }
                for task in tasks
            ]
            return {
                "status": 1,
                "message": "Maintenance Tasks fetched successfully",
                "payload": {"tasks": user_tasks},
            }
        except Exception as e:
            logger.error(f"Error fetching maintenance tasks: {str(e)}")
            return {
                "status": 0,
                "message": f"Error fetching maintenance tasks: {str(e)}",
                "payload": {},
            }

class UpdateMaintenanceTask(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, task_id):
        input_data = request.get_json(silent=True)
        if not input_data:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_MAINTENANCE_TASK",
                resource_type="maintenance_tasks",
                resource_id=task_id,
                success=False,
                error_message="No input data received",
            )
            return {"status": 0, "message": "No input data received", "payload": {}}

        updates = {}
        if "name" in input_data and input_data["name"].strip():
            updates["name"] = input_data["name"].strip()
        if "date" in input_data and input_data["date"].strip():
            updates["date"] = input_data["date"]
        if "completed" in input_data:
            updates["completed"] = input_data["completed"]
        if "priority" in input_data:
            updates["priority"] = input_data["priority"].strip() or None
        if "details" in input_data:
            updates["details"] = input_data["details"].strip() or None
        if "property_icon" in input_data:
            updates["property_icon"] = input_data["property_icon"].strip() or None
        if "is_recurring" in input_data:
            updates["is_recurring"] = input_data["is_recurring"]
        if "is_active" in input_data:
            updates["is_active"] = input_data["is_active"]
        updates["updated_at"] = datetime.utcnow().isoformat()

        if not updates:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_MAINTENANCE_TASK",
                resource_type="maintenance_tasks",
                resource_id=task_id,
                success=False,
                error_message="No valid updates provided",
                metadata={"input": input_data},
            )
            return {"status": 0, "message": "No valid updates provided", "payload": {}}

        try:
            result = DBHelper.update_one(
                table_name="property_maintenance",
                filters={"id": int(task_id), "user_id": uid},
                updates=updates,
                return_fields=[
                    "id", "name", "date", "completed", "priority",
                    "details", "property_icon", "is_recurring",
                    "created_at", "updated_at", "is_active",
                ],
            )

            if result:
                updated_task = {
                    "id": str(result["id"]),
                    "name": result["name"],
                    "date": result["date"].strftime("%Y-%m-%d") if result["date"] else None,
                    "completed": result["completed"],
                    "priority": result["priority"],
                    "details": result["details"],
                    "property_icon": result["property_icon"],
                    "is_recurring": result["is_recurring"],
                    "created_at": result["created_at"].isoformat() if result["created_at"] else None,
                    "updated_at": result["updated_at"].isoformat() if result["updated_at"] else None,
                    "is_active": result["is_active"],
                }

                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_MAINTENANCE_TASK",
                    resource_type="maintenance_tasks",
                    resource_id=task_id,
                    success=True,
                    metadata={"updated_task": updated_task},
                )

                return {
                    "status": 1,
                    "message": "Maintenance Task Updated Successfully",
                    "payload": {"task": updated_task},
                }
            else:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_MAINTENANCE_TASK",
                    resource_type="maintenance_tasks",
                    resource_id=task_id,
                    success=False,
                    error_message="Task not found or not authorized",
                )
                return {"status": 0, "message": "Task not found or not authorized", "payload": {}}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_MAINTENANCE_TASK",
                resource_type="maintenance_tasks",
                resource_id=task_id,
                success=False,
                error_message=str(e),
                metadata={"input": input_data},
            )
            logger.error(f"Error updating maintenance task: {str(e)}")
            return {"status": 0, "message": f"Error updating maintenance task: {str(e)}", "payload": {}}


# class DeleteMaintenanceTask(Resource):
#     @auth_required(isOptional=True)
#     def delete(self, uid, user, task_id):
#         try:
#             try:
#                 task_id_int = int(task_id)
#             except ValueError:
#                 AuditLogger.log(
#                     user_id=uid,
#                     action="DELETE_MAINTENANCE_TASK",
#                     resource_type="maintenance_tasks",
#                     resource_id=task_id,
#                     success=False,
#                     error_message="Invalid task_id format",
#                 )
#                 return {
#                     "status": 0,
#                     "message": "Invalid task_id format, must be a valid integer",
#                     "payload": {},
#                 }, 400

#             task = DBHelper.find_one(
#                 table_name="property_maintenance",
#                 filters={"id": task_id_int, "user_id": uid, "completed": True, "is_active": 1},
#                 select_fields=[
#                     "id", "name", "date", "completed", "priority",
#                     "details", "property_icon", "is_recurring",
#                     "created_at", "updated_at", "is_active",
#                 ],
#             )
#             if not task:
#                 AuditLogger.log(
#                     user_id=uid,
#                     action="DELETE_MAINTENANCE_TASK",
#                     resource_type="maintenance_tasks",
#                     resource_id=task_id,
#                     success=False,
#                     error_message="Task not found, not completed, or already inactive",
#                 )
#                 return {"status": 0, "message": "Task not found, not completed, or already inactive", "payload": {}}, 404

#             result = DBHelper.update_one(
#                 table_name="property_maintenance",
#                 filters={"id": task_id_int, "user_id": uid},
#                 updates={"is_active": 0, "updated_at": datetime.utcnow().isoformat()},
#                 return_fields=[
#                     "id", "name", "date", "completed", "priority",
#                     "details", "property_icon", "is_recurring",
#                     "created_at", "updated_at", "is_active",
#                 ],
#             )

#             if result:
#                 AuditLogger.log(
#                     user_id=uid,
#                     action="DELETE_MAINTENANCE_TASK",
#                     resource_type="maintenance_tasks",
#                     resource_id=task_id,
#                     success=True,
#                     metadata={"deactivated_task": result},
#                 )
#                 return {
#                     "status": 1,
#                     "message": "Maintenance Task Deactivated Successfully",
#                     "payload": {"task": result},
#                 }, 200
#             else:
#                 AuditLogger.log(
#                     user_id=uid,
#                     action="DELETE_MAINTENANCE_TASK",
#                     resource_type="maintenance_tasks",
#                     resource_id=task_id,
#                     success=False,
#                     error_message="Failed to deactivate task",
#                 )
#                 return {"status": 0, "message": "Failed to deactivate task", "payload": {}}, 500

#         except Exception as e:
#             AuditLogger.log(
#                 user_id=uid,
#                 action="DELETE_MAINTENANCE_TASK",
#                 resource_type="maintenance_tasks",
#                 resource_id=task_id,
#                 success=False,
#                 error_message=str(e),
#             )
#             logger.error(f"Error deactivating task: id={task_id}, error={str(e)}")
#             return {"status": 0, "message": f"Error deactivating task: {str(e)}", "payload": {}}, 500


class DeleteMaintenanceTask(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user, task_id):
        try:
            # Validate task_id
            try:
                task_id_int = int(task_id)
            except ValueError:
                logger.error(f"Invalid task_id format: {task_id}")
                return {
                    "status": 0,
                    "message": "Invalid task_id format, must be a valid integer",
                    "payload": {},
                }, 400

            # Check if task exists and is completed
            task = DBHelper.find_one(
                table_name="property_maintenance",
                filters={"id": task_id_int, "user_id": uid, "completed": True, "is_active": 1},
                select_fields=[
                    "id",
                    "name",
                    "date",
                    "completed",
                    "priority",
                    "details",
                    "property_icon",
                    "is_recurring",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            if not task:
                logger.warning(
                    f"Task not found, not completed, or already inactive: id={task_id}, user_id={uid}"
                )
                return {
                    "status": 0,
                    "message": "Task not found, not completed, or already inactive",
                    "payload": {},
                }, 404

            # Perform soft delete
            result = DBHelper.update_one(
                table_name="property_maintenance",
                filters={"id": task_id_int, "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.now().isoformat()},
                return_fields=[
                    "id",
                    "name",
                    "date",
                    "completed",
                    "priority",
                    "details",
                    "property_icon",
                    "is_recurring",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            if result:
                logger.info(
                    f"Task deactivated successfully: id={task_id}, is_active={result['is_active']}"
                )
                deactivated_task = {
                    "id": str(result["id"]),
                    "name": result["name"],
                    "date": (
                        result["date"].strftime("%Y-%m-%d")
                        if result["date"]
                        else "No Date"
                    ),
                    "completed": result["completed"],
                    "priority": result["priority"],
                    "details": result["details"],
                    "property_icon": result["property_icon"],
                    "is_recurring": result["is_recurring"],
                    "created_at": (
                        result["created_at"].isoformat()
                        if result["created_at"]
                        else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat()
                        if result["updated_at"]
                        else None
                    ),
                    "is_active": result["is_active"],
                }
                return {
                    "status": 1,
                    "message": "Maintenance Task Deactivated Successfully",
                    "payload": {"task": deactivated_task},
                }, 200
            else:
                logger.warning(
                    f"Failed to deactivate task: id={task_id}, user_id={uid}"
                )
                return {
                    "status": 0,
                    "message": "Failed to deactivate task",
                    "payload": {},
                }, 500
        except Exception as e:
            logger.error(f"Error deactivating task: id={task_id}, error={str(e)}")
            return {
                "status": 0,
                "message": f"Error deactivating task: {str(e)}",
                "payload": {},
            }, 500

# ... (keep existing imports and other classes unchanged)
class AddUtility(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        if not input_data:
            AuditLogger.log(
                user_id=uid,
                action="ADD_UTILITY",
                resource_type="utilities",
                resource_id=None,
                success=False,
                error_message="No input data received",
            )
            return {"status": 0, "message": "No input data received", "payload": {}}

        type = input_data.get("type", "").strip()
        account_number = input_data.get("account_number", "").strip()
        monthly_cost = input_data.get("monthly_cost")
        provider_url = input_data.get("provider_url", "").strip()
        category = input_data.get("category", "").strip()
        is_active = input_data.get("is_active", 1)

        if not type or not account_number or monthly_cost is None or not provider_url or not category:
            AuditLogger.log(
                user_id=uid,
                action="ADD_UTILITY",
                resource_type="utilities",
                resource_id=None,
                success=False,
                error_message="Missing required fields",
                metadata={"payload": input_data},
            )
            return {
                "status": 0,
                "message": "All fields are required: type, account_number, monthly_cost, provider_url, category",
                "payload": {},
            }

        allowed_categories = {'Core', 'Entertainment', 'Home Services'}
        if category not in allowed_categories:
            AuditLogger.log(
                user_id=uid,
                action="ADD_UTILITY",
                resource_type="utilities",
                resource_id=None,
                success=False,
                error_message=f"Invalid category: {category}",
                metadata={"payload": input_data},
            )
            return {
                "status": 0,
                "message": f"Invalid category. Allowed values are: {', '.join(allowed_categories)}",
                "payload": {},
            }

        try:
            monthly_cost = float(monthly_cost)
            if monthly_cost < 0:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_UTILITY",
                    resource_type="utilities",
                    resource_id=None,
                    success=False,
                    error_message="Monthly cost must be non-negative",
                    metadata={"payload": input_data},
                )
                return {"status": 0, "message": "Monthly cost must be non-negative", "payload": {}}
        except (ValueError, TypeError):
            AuditLogger.log(
                user_id=uid,
                action="ADD_UTILITY",
                resource_type="utilities",
                resource_id=None,
                success=False,
                error_message="Invalid monthly cost format",
                metadata={"payload": input_data},
            )
            return {"status": 0, "message": "Invalid monthly cost format", "payload": {}}

        utility_data = {
            "user_id": uid,
            "type": type,
            "account_number": account_number,
            "monthly_cost": monthly_cost,
            "provider_url": provider_url,
            "category": category,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "is_active": is_active,
        }

        try:
            inserted_id = DBHelper.insert("home_utilities", return_column="id", **utility_data)
            utility_data["id"] = inserted_id

            AuditLogger.log(
                user_id=uid,
                action="ADD_UTILITY",
                resource_type="utilities",
                resource_id=inserted_id,
                success=True,
                metadata={"utility": utility_data},
            )

            return {
                "status": 1,
                "message": "Utility Added Successfully",
                "payload": {"utility": utility_data},
            }
        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_UTILITY",
                resource_type="utilities",
                resource_id=None,
                success=False,
                error_message=str(e),
                metadata={"payload": input_data},
            )
            logger.error(f"Error adding utility: {str(e)}")
            return {"status": 0, "message": f"Error adding utility: {str(e)}", "payload": {}}

class GetUtilities(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            logger.debug(f"Fetching utilities for user_id: {uid}")
            utilities = DBHelper.find_all(
                table_name="home_utilities",
                filters={"user_id": uid, "is_active": 1},
                select_fields=[
                    "id",
                    "type",
                    "account_number",
                    "monthly_cost",
                    "provider_url",
                    "category",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            logger.debug(f"Found {len(utilities)} utilities")
            user_utilities = [
                {
                    "id": str(utility["id"]),
                    "type": utility["type"] or "Unknown",
                    "accountNumber": utility["account_number"] or "N/A",
                    "monthlyCost": float(utility["monthly_cost"]) if utility["monthly_cost"] is not None else 0.0,
                    "providerUrl": utility["provider_url"] or "",
                    "category": utility["category"] or "Core",
                    "created_at": (
                        utility["created_at"].isoformat() if utility["created_at"] else None
                    ),
                    "updated_at": (
                        utility["updated_at"].isoformat() if utility["updated_at"] else None
                    ),
                    "is_active": utility["is_active"] if utility["is_active"] is not None else 1,
                }
                for utility in utilities
            ]
            return {
                "status": 1,
                "message": "Utilities fetched successfully",
                "payload": {"utilities": user_utilities},
            }
        except Exception as e:
            logger.error(f"Error fetching utilities for user {uid}: {str(e)}", exc_info=True)
            return {
                "status": 0,
                "message": f"Error fetching utilities: {str(e)}",
                "payload": {},
            }
class CustomJSONEncoder(json.# The above code is written in Python and it seems to be a comment. It
# mentions "JSONEncoder" which is a class in Python's `json` module used
# for encoding JSON data. However, the code itself does not contain any
# functional implementation, it is just a comment.
JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)  # Convert Decimal to float for JSON serialization
        return super().default(o)

# Apply custom JSON encoder to Flask app (assuming app is accessible)
from flask import current_app
# current_app.json_encoder = CustomJSONEncoder

# ... (other imports and classes remain unchanged)

class UpdateUtility(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, utility_id):
        input_data = request.get_json(silent=True)
        if not input_data:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_UTILITY",
                resource_type="utilities",
                resource_id=utility_id,
                success=False,
                error_message="No input data received",
            )
            return {"status": 0, "message": "No input data received", "payload": {}}

        updates = {}
        if "type" in input_data and input_data["type"].strip():
            updates["type"] = input_data["type"].strip()
        if "account_number" in input_data and input_data["account_number"].strip():
            updates["account_number"] = input_data["account_number"].strip()
        if "monthly_cost" in input_data and input_data["monthly_cost"] is not None:
            try:
                updates["monthly_cost"] = float(input_data["monthly_cost"])
            except (ValueError, TypeError):
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_UTILITY",
                    resource_type="utilities",
                    resource_id=utility_id,
                    success=False,
                    error_message="Invalid monthly cost format",
                    metadata={"payload": input_data},
                )
                return {"status": 0, "message": "Invalid monthly cost format", "payload": {}}
        if "provider_url" in input_data and input_data["provider_url"].strip():
            updates["provider_url"] = input_data["provider_url"].strip()
        if "category" in input_data and input_data["category"].strip():
            allowed_categories = {'Core', 'Entertainment', 'Home Services'}
            if input_data["category"] not in allowed_categories:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_UTILITY",
                    resource_type="utilities",
                    resource_id=utility_id,
                    success=False,
                    error_message=f"Invalid category: {input_data['category']}",
                    metadata={"payload": input_data},
                )
                return {
                    "status": 0,
                    "message": f"Invalid category. Allowed values are: {', '.join(allowed_categories)}",
                    "payload": {},
                }
            updates["category"] = input_data["category"].strip()
        if "is_active" in input_data:
            updates["is_active"] = input_data["is_active"]
        updates["updated_at"] = datetime.utcnow().isoformat()

        if not updates:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_UTILITY",
                resource_type="utilities",
                resource_id=utility_id,
                success=False,
                error_message="No valid updates provided",
                metadata={"payload": input_data},
            )
            return {"status": 0, "message": "No valid updates provided", "payload": {}}

        try:
            result = DBHelper.update_one(
                table_name="home_utilities",
                filters={"id": int(utility_id), "user_id": uid},
                updates=updates,
                return_fields=[
                    "id", "type", "account_number", "monthly_cost",
                    "provider_url", "category", "created_at",
                    "updated_at", "is_active",
                ],
            )
            if result:
                updated_utility = {
                    "id": str(result["id"]),
                    "type": result["type"],
                    "account_number": result["account_number"],
                    "monthly_cost": float(result["monthly_cost"]),
                    "provider_url": result["provider_url"],
                    "category": result["category"],
                    "created_at": result["created_at"].isoformat() if result["created_at"] else None,
                    "updated_at": result["updated_at"].isoformat() if result["updated_at"] else None,
                    "is_active": result["is_active"],
                }

                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_UTILITY",
                    resource_type="utilities",
                    resource_id=utility_id,
                    success=True,
                    metadata={"utility": updated_utility},
                )

                return {
                    "status": 1,
                    "message": "Utility Updated Successfully",
                    "payload": {"utility": updated_utility},
                }
            else:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_UTILITY",
                    resource_type="utilities",
                    resource_id=utility_id,
                    success=False,
                    error_message="Utility not found or not authorized",
                    metadata={"payload": input_data},
                )
                return {"status": 0, "message": "Utility not found or not authorized", "payload": {}}, 404

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_UTILITY",
                resource_type="utilities",
                resource_id=utility_id,
                success=False,
                error_message=str(e),
                metadata={"payload": input_data},
            )
            logger.error(f"Error updating utility: {str(e)}")
            return {"status": 0, "message": f"Error updating utility: {str(e)}", "payload": {}}, 500


class DeleteUtility(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user, utility_id):
        try:
            utility = DBHelper.find_one(
                table_name="home_utilities",
                filters={"id": int(utility_id), "user_id": uid},
                select_fields=["id", "type", "account_number", "category"],
            )
            if not utility:
                AuditLogger.log(
                    user_id=uid,
                    action="DELETE_UTILITY",
                    resource_type="utilities",
                    resource_id=utility_id,
                    success=False,
                    error_message="Utility not found or not authorized",
                )
                return {"status": 0, "message": "Utility not found or not authorized", "payload": {}}

            DBHelper.delete_all(
                table_name="home_utilities",
                filters={"id": int(utility_id), "user_id": uid},
            )

            AuditLogger.log(
                user_id=uid,
                action="DELETE_UTILITY",
                resource_type="utilities",
                resource_id=utility_id,
                success=True,
                metadata={"deleted_utility": utility},
            )

            return {"status": 1, "message": "Utility Deleted Successfully", "payload": {}}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="DELETE_UTILITY",
                resource_type="utilities",
                resource_id=utility_id,
                success=False,
                error_message=str(e),
            )
            logger.error(f"Error deleting utility: {str(e)}")
            return {"status": 0, "message": f"Error deleting utility: {str(e)}", "payload": {}}


# ... (keep other classes unchanged)

class AddInsurance(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        # Required fields
        name = input_data.get("name", "").strip()
        meta = input_data.get("meta", "").strip()
        type_ = input_data.get("type", "").strip()
        years = input_data.get("years")
        payment = input_data.get("payment")

        # Optional fields
        renewal_date = input_data.get("renewal_date")
        description = input_data.get("description")

        # Validate required fields
        if not name or not meta or not type_ or years is None or payment is None:
            return {
                "status": 0,
                "message": "Required fields: name, meta, type, years, payment",
                "payload": {},
            }

        try:
            years = int(years)
            if years < 1:
                return {
                    "status": 0,
                    "message": "Years must be a positive integer",
                    "payload": {},
                }
        except (ValueError, TypeError):
            return {"status": 0, "message": "Invalid years format", "payload": {}}

        try:
            payment = float(payment)
            if payment < 0:
                return {
                    "status": 0,
                    "message": "Payment must be non-negative",
                    "payload": {},
                }
        except (ValueError, TypeError):
            return {"status": 0, "message": "Invalid payment format", "payload": {}}

        # Handle optional fields
        renewal_date = renewal_date.strip() if isinstance(renewal_date, str) else None
        description = description.strip() if isinstance(description, str) else None

        # Generate unique ID
        insurance_id = uniqueId(digit=15, isNum=True)

        insurance_data = {
            "id": insurance_id,
            "user_id": uid,
            "name": name,
            "meta": meta,
            "type": type_,
            "years": years,
            "payment": payment,
            "renewal_date": renewal_date,
            "description": description,
            "is_active": input_data.get("is_active", 1),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        try:
            DBHelper.insert(
                "insurance", return_column="id", **insurance_data
            )

            # 🔹 Audit log entry
            AuditLogger.log_action(
                user_id=uid,
                action="ADD_INSURANCE",
                resource_id=insurance_id,
                resource_type="insurance",
                new_values=insurance_data,
                performed_by=user.get("user_name") if user else "system"
            )

            return {
                "status": 1,
                "message": "Insurance Added Successfully",
                "payload": {"insurance": insurance_data},
            }
        except Exception as e:
            logger.error(f"Error adding insurance: {str(e)}")
            return {
                "status": 0,
                "message": f"Error adding insurance: {str(e)}",
                "payload": {},
            }

class GetInsurance(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            insurances = DBHelper.find_all(
                table_name="insurance",
                filters={"user_id": uid, "is_active": 1},
                select_fields=[
                    "id",
                    "name",
                    "meta",
                    "type",
                    "years",
                    "payment",
                    "renewal_date",
                    "description",
                    "is_active",
                    "created_at",
                    "updated_at",
                ],
            )
            user_insurances = [
                {
                    "id": str(insurance["id"]),
                    "name": insurance["name"],
                    "meta": insurance["meta"],
                    "type": insurance["type"],
                    "years": int(insurance["years"]),
                    "payment": float(insurance["payment"]),
                    "renewal_date": (
                        insurance["renewal_date"].strftime("%Y-%m-%d")
                        if insurance["renewal_date"]
                        else None
                    ),
                    "description": insurance["description"],
                    "is_active": insurance["is_active"],
                    "created_at": (
                        insurance["created_at"].isoformat()
                        if insurance["created_at"]
                        else None
                    ),
                    "updated_at": (
                        insurance["updated_at"].isoformat()
                        if insurance["updated_at"]
                        else None
                    ),
                }
                for insurance in insurances
            ]
            return {
                "status": 1,
                "message": "Insurances fetched successfully",
                "payload": {"insurances": user_insurances},
            }
        except Exception as e:
            logger.error(f"Error fetching insurances: {str(e)}")
            return {
                "status": 0,
                "message": f"Error fetching insurances: {str(e)}",
                "payload": {},
            }

class UpdateInsurance(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, insurance_id):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        updates = {}
        if "name" in input_data and input_data["name"].strip():
            updates["name"] = input_data["name"].strip()
        if "meta" in input_data and input_data["meta"].strip():
            updates["meta"] = input_data["meta"].strip()
        if "type" in input_data and input_data["type"].strip():
            updates["type"] = input_data["type"].strip()
        if "years" in input_data:
            try:
                years = int(input_data["years"])
                if years > 0:
                    updates["years"] = years
                else:
                    return {
                        "status": 0,
                        "message": "Years must be a positive integer",
                        "payload": {},
                    }
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid years format",
                    "payload": {},
                }
        if "payment" in input_data:
            try:
                payment = float(input_data["payment"])
                if payment >= 0:
                    updates["payment"] = payment
                else:
                    return {
                        "status": 0,
                        "message": "Payment must be non-negative",
                        "payload": {},
                    }
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid payment format",
                    "payload": {},
                }
        if "renewal_date" in input_data:
            updates["renewal_date"] = input_data["renewal_date"] or None
        if "description" in input_data:
            updates["description"] = input_data["description"].strip() or None
        updates["updated_at"] = datetime.now().isoformat()

        if not updates:
            return {"status": 0, "message": "No valid updates provided", "payload": {}}

        try:
            result = DBHelper.update_one(
                table_name="insurance",
                filters={"id": insurance_id, "user_id": uid},
                updates=updates,
                return_fields=[
                    "id",
                    "name",
                    "meta",
                    "type",
                    "years",
                    "payment",
                    "renewal_date",
                    "description",
                    "is_active",
                    "created_at",
                    "updated_at",
                ],
            )
            if result:
                updated_insurance = {
                    "id": str(result["id"]),
                    "name": result["name"],
                    "meta": result["meta"],
                    "type": result["type"],
                    "years": int(result["years"]),
                    "payment": float(result["payment"]),
                    "renewal_date": (
                        result["renewal_date"].strftime("%Y-%m-%d")
                        if result["renewal_date"]
                        else None
                    ),
                    "description": result["description"],
                    "is_active": result["is_active"],
                    "created_at": (
                        result["created_at"].isoformat() if result["created_at"] else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat() if result["updated_at"] else None
                    ),
                }

                # 🔹 Audit log entry
                AuditLogger.log_action(
                    user_id=uid,
                    action="UPDATE_INSURANCE",
                    resource_id=insurance_id,
                    resource_type="insurance",
                    new_values=updates,
                    performed_by=user.get("user_name") if user else "system"
                )

                return {
                    "status": 1,
                    "message": "Insurance Updated Successfully",
                    "payload": {"insurance": updated_insurance},
                }
            else:
                return {
                    "status": 0,
                    "message": "Insurance not found or not authorized",
                    "payload": {},
                }
        except Exception as e:
            logger.error(f"Error updating insurance: {str(e)}")
            return {
                "status": 0,
                "message": f"Error updating insurance: {str(e)}",
                "payload": {},
            }


class DeleteInsurance(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user, insurance_id):
        try:
            insurance = DBHelper.find_one(
                table_name="insurance",
                filters={"id": insurance_id, "user_id": uid},
                select_fields=["id", "name", "type"],
            )
            if not insurance:
                return {
                    "status": 0,
                    "message": "Insurance not found or not authorized",
                    "payload": {},
                }

            DBHelper.delete_all(
                table_name="insurance",
                filters={"id": insurance_id, "user_id": uid},
            )

            # 🔹 Audit log entry
            AuditLogger.log_action(
                user_id=uid,
                action="DELETE_INSURANCE",
                resource_id=insurance_id,
                resource_type="insurance",
                old_values=insurance,
                performed_by=user.get("user_name") if user else "system"
            )

            return {
                "status": 1,
                "message": "Insurance Deleted Successfully",
                "payload": {},
            }
        except Exception as e:
            logger.error(f"Error deleting insurance: {str(e)}")
            return {
                "status": 0,
                "message": f"Error deleting insurance: {str(e)}",
                "payload": {},
            }

class AddProperty(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        address = input_data.get("address", "").strip()
        type_ = input_data.get("type", "").strip()  # renamed variable to avoid shadowing
        purchase_date = input_data.get("purchase_date", "").strip()
        purchase_price = input_data.get("purchase_price")
        square_footage = input_data.get("square_footage", "").strip()
        lot_size = input_data.get("lot_size", "").strip()
        property_tax_id = input_data.get("property_tax_id", "").strip()
        is_active = input_data.get("is_active", 1)

        if not address or not type_:
            return {
                "status": 0,
                "message": "Address and type are required",
                "payload": {},
            }

        property_id = uniqueId(digit=15, isNum=True)  # Generate unique ID

        property_data = {
            "id": property_id,
            "user_id": uid,
            "address": address,
            "type": type_,
            "purchase_date": purchase_date or None,
            "purchase_price": float(purchase_price) if purchase_price is not None else None,
            "square_footage": square_footage or None,
            "lot_size": lot_size or None,
            "property_tax_id": property_tax_id or None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_active": is_active,
        }

        try:
            inserted_id = DBHelper.insert(
                "property_information", return_column="id", **property_data
            )
            property_data["id"] = inserted_id if inserted_id else property_data["id"]

            # 🔹 Audit log entry
            AuditLogger.log_action(
                user_id=uid,
                action="ADD_PROPERTY",
                resource_id=property_data["id"],
                resource_type="property_information",
                new_values=property_data,
                performed_by=user.get("user_name") if user else "system"
            )

            return {
                "status": 1,
                "message": "Property Added Successfully",
                "payload": {"property": property_data},
            }
        except Exception as e:
            logger.error(f"Error adding property: {str(e)}")

            # 🔹 Audit log failure
            AuditLogger.log_action(
                user_id=uid,
                action="ADD_PROPERTY_FAILED",
                resource_id=property_id,
                resource_type="property_information",
                error=str(e),
                performed_by=user.get("user_name") if user else "system"
            )

            return {
                "status": 0,
                "message": f"Error adding property: {str(e)}",
                "payload": {},
            }

class GetProperties(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            properties = DBHelper.find_all(
                table_name="property_information",
                filters={"user_id": uid, "is_active": 1},
                select_fields=[
                    "id",
                    "address",
                    "type",
                    "purchase_date",
                    "purchase_price",
                    "square_footage",
                    "lot_size",
                    "property_tax_id",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            user_properties = [
                {
                    "id": str(property["id"]),
                    "address": property["address"],
                    "type": property["type"],
                    "purchaseDate": (
                        property["purchase_date"].strftime("%Y-%m-%d")
                        if property["purchase_date"]
                        else None
                    ),
                    "purchasePrice": (
                        float(property["purchase_price"])
                        if property["purchase_price"] is not None
                        else None
                    ),
                    "squareFootage": property["square_footage"],
                    "lotSize": property["lot_size"],
                    "propertyTaxId": property["property_tax_id"],
                    "created_at": (
                        property["created_at"].isoformat()
                        if property["created_at"]
                        else None
                    ),
                    "updated_at": (
                        property["updated_at"].isoformat()
                        if property["updated_at"]
                        else None
                    ),
                    "is_active": property["is_active"],
                }
                for property in properties
            ]
            return {
                "status": 1,
                "message": "Properties fetched successfully",
                "payload": {"properties": user_properties},
            }
        except Exception as e:
            logger.error(f"Error fetching properties: {str(e)}")
            return {
                "status": 0,
                "message": f"Error fetching properties: {str(e)}",
                "payload": {},
            }
 # adjust import path if needed

class UpdateProperty(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, property_id):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        updates = {}
        if "address" in input_data and input_data["address"].strip():
            updates["address"] = input_data["address"].strip()
        if "type" in input_data and input_data["type"].strip():
            updates["type"] = input_data["type"].strip()
        if "purchase_date" in input_data:
            updates["purchase_date"] = input_data["purchase_date"] or None
        if "purchase_price" in input_data:
            updates["purchase_price"] = (
                float(input_data["purchase_price"])
                if input_data["purchase_price"] is not None
                else None
            )
        if "square_footage" in input_data:
            updates["square_footage"] = input_data["square_footage"].strip() or None
        if "lot_size" in input_data:
            updates["lot_size"] = input_data["lot_size"].strip() or None
        if "property_tax_id" in input_data:
            updates["property_tax_id"] = input_data["property_tax_id"].strip() or None
        if "is_active" in input_data:
            updates["is_active"] = input_data["is_active"]
        updates["updated_at"] = datetime.now().isoformat()

        if not updates:
            return {"status": 0, "message": "No valid updates provided", "payload": {}}

        try:
            result = DBHelper.update_one(
                table_name="property_information",
                filters={"id": property_id, "user_id": uid},
                updates=updates,
                return_fields=[
                    "id",
                    "address",
                    "type",
                    "purchase_date",
                    "purchase_price",
                    "square_footage",
                    "lot_size",
                    "property_tax_id",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            if result:
                updated_property = {
                    "id": str(result["id"]),
                    "address": result["address"],
                    "type": result["type"],
                    "purchaseDate": (
                        result["purchase_date"].strftime("%Y-%m-%d")
                        if result["purchase_date"]
                        else None
                    ),
                    "purchasePrice": (
                        float(result["purchase_price"])
                        if result["purchase_price"] is not None
                        else None
                    ),
                    "squareFootage": result["square_footage"],
                    "lotSize": result["lot_size"],
                    "propertyTaxId": result["property_tax_id"],
                    "created_at": (
                        result["created_at"].isoformat()
                        if result["created_at"]
                        else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat()
                        if result["updated_at"]
                        else None
                    ),
                    "is_active": result["is_active"],
                }

                # 🔹 Log success
                AuditLogger.log(
                    user_id=uid,
                    action="update",
                    resource_type="property",
                    resource_id=property_id,
                    success=True,
                    metadata={"updates": updates},
                )

                return {
                    "status": 1,
                    "message": "Property Updated Successfully",
                    "payload": {"property": updated_property},
                }
            else:
                # 🔹 Log failure
                AuditLogger.log(
                    user_id=uid,
                    action="update",
                    resource_type="property",
                    resource_id=property_id,
                    success=False,
                    error_message="Property not found or not authorized",
                )

                return {
                    "status": 0,
                    "message": "Property not found or not authorized",
                    "payload": {},
                }
        except Exception as e:
            logger.error(f"Error updating property: {str(e)}")

            # 🔹 Log exception
            AuditLogger.log(
                user_id=uid,
                action="update",
                resource_type="property",
                resource_id=property_id,
                success=False,
                error_message=str(e),
            )

            return {
                "status": 0,
                "message": f"Error updating property: {str(e)}",
                "payload": {},
            }
class DeleteProperty(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user, property_id):
        try:
            property = DBHelper.find_one(
                table_name="property_information",
                filters={"id": property_id, "user_id": uid, "is_active": 1},
                select_fields=[
                    "id", "address", "type", "purchase_date", "purchase_price",
                    "square_footage", "lot_size", "property_tax_id",
                    "created_at", "updated_at", "is_active",
                ],
            )
            if not property:
                logger.warning(f"Property not found or already inactive: id={property_id}, user_id={uid}")

                # 🔹 Log not found
                AuditLogger.log(
                    user_id=uid,
                    action="delete",
                    resource_type="property",
                    resource_id=property_id,
                    success=False,
                    error_message="Property not found or already inactive",
                )

                return {
                    "status": 0,
                    "message": f"Property not found or already inactive: id={property_id}",
                    "payload": {},
                }, 404

            result = DBHelper.update_one(
                table_name="property_information",
                filters={"id": property_id, "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.now().isoformat()},
                return_fields=[
                    "id", "address", "type", "purchase_date", "purchase_price",
                    "square_footage", "lot_size", "property_tax_id",
                    "created_at", "updated_at", "is_active",
                ],
            )
            if result:
                logger.info(f"Property deactivated successfully: id={property_id}, is_active={result['is_active']}")

                # 🔹 Log success
                AuditLogger.log(
                    user_id=uid,
                    action="delete",
                    resource_type="property",
                    resource_id=property_id,
                    success=True,
                    metadata={"previous_state": property},
                )

                deactivated_property = {
                    "id": str(result["id"]),
                    "address": result["address"],
                    "type": result["type"],
                    "purchaseDate": (
                        result["purchase_date"].strftime("%Y-%m-%d")
                        if result["purchase_date"]
                        else None
                    ),
                    "purchasePrice": (
                        float(result["purchase_price"])
                        if result["purchase_price"] is not None
                        else None
                    ),
                    "squareFootage": result["square_footage"],
                    "lotSize": result["lot_size"],
                    "propertyTaxId": result["property_tax_id"],
                    "created_at": (
                        result["created_at"].isoformat()
                        if result["created_at"]
                        else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat()
                        if result["updated_at"]
                        else None
                    ),
                    "is_active": result["is_active"],
                }
                return {
                    "status": 1,
                    "message": "Property Deactivated Successfully",
                    "payload": {"property": deactivated_property},
                }, 200
            else:
                logger.warning(f"Failed to deactivate property: id={property_id}, user_id={uid}")

                # 🔹 Log failure
                AuditLogger.log(
                    user_id=uid,
                    action="delete",
                    resource_type="property",
                    resource_id=property_id,
                    success=False,
                    error_message="Failed to deactivate property",
                )

                return {
                    "status": 0,
                    "message": f"Failed to deactivate property: id={property_id}",
                    "payload": {},
                }, 500
        except Exception as e:
            logger.error(f"Error deactivating property: id={property_id}, error={str(e)}")

            # 🔹 Log exception
            AuditLogger.log(
                user_id=uid,
                action="delete",
                resource_type="property",
                resource_id=property_id,
                success=False,
                error_message=str(e),
            )

            return {
                "status": 0,
                "message": f"Error deactivating property: {str(e)}",
                "payload": {},
            }, 500


class AddMortgageLoan(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        mortgage_id = input_data.get("id", "").strip()
        mortgage_name = input_data.get("name", "").strip()
        type = input_data.get("type", "").strip()
        
        if not mortgage_id or not mortgage_name or not type:
            return {
                "status": 0,
                "message": "Mortgage ID, Mortgage Name, and Type are required",
                "payload": {},
            }

        try:
            term = int(input_data.get("term", 0))  # Cast to int for INTEGER column
            interest_rate = float(input_data.get("interestRate", 0))
            amount = float(input_data.get("amount", 0))
            remaining_balance = float(input_data.get("remainingBalance", 0))
        except (ValueError, TypeError):
            return {
                "status": 0,
                "message": "Invalid numeric format for term, interest rate, amount, or remaining balance",
                "payload": {},
            }

        mortgage_data = {
            "id": uniqueId(digit=15, isNum=True),
            "user_id": uid,
            "mortgage_id": mortgage_id,
            "mortgage_name": mortgage_name,
            "type": type,
            "term": term,
            "interest_rate": interest_rate,
            "amount": amount,
            "remaining_balance": remaining_balance,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_active": 1,
        }

        try:
            inserted_id = DBHelper.insert(
                "mortgages_loans", return_column="id", **mortgage_data
            )
            mortgage_data["id"] = inserted_id
            mortgage_data["interestRate"] = mortgage_data.pop("interest_rate")
            mortgage_data["name"] = mortgage_data.pop("mortgage_name")
            mortgage_data["mortgageId"] = mortgage_data.pop("mortgage_id")
            return {
                "status": 1,
                "message": "Mortgage Loan Added Successfully",
                "payload": {"loans": [mortgage_data]},
            }
        except Exception as e:
            logger.error(f"Error adding mortgage loan: {str(e)}")
            return {
                "status": 0,
                "message": f"Error adding mortgage loan: {str(e)}",
                "payload": {},
            }

class GetMortgageLoans(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            mortgages = DBHelper.find_all(
                table_name="mortgages_loans",
                filters={"user_id": uid},
                select_fields=[
                    "id",
                    "mortgage_id",
                    "mortgage_name",
                    "type",
                    "term",
                    "interest_rate",
                    "amount",
                    "remaining_balance",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            user_mortgages = [
                {
                    "id": str(mortgage["id"]),
                    "mortgageId": mortgage["mortgage_id"],
                    "name": mortgage["mortgage_name"],
                    "type": mortgage["type"],
                    "term": int(mortgage["term"]),
                    "interestRate": float(mortgage["interest_rate"]),
                    "amount": float(mortgage["amount"]),
                    "remainingBalance": float(mortgage["remaining_balance"]),
                    "created_at": (
                        mortgage["created_at"].isoformat() if mortgage["created_at"] else None
                    ),
                    "updated_at": (
                        mortgage["updated_at"].isoformat() if mortgage["updated_at"] else None
                    ),
                    "is_active": mortgage["is_active"],
                }
                for mortgage in mortgages
            ]
            return {
                "status": 1,
                "message": "Mortgage Loans fetched successfully",
                "payload": {"loans": user_mortgages},
            }
        except Exception as e:
            logger.error(f"Error fetching mortgage loans: {str(e)}")
            return {
                "status": 0,
                "message": f"Error fetching mortgage loans: {str(e)}",
                "payload": {},
            }

class UpdateMortgageLoan(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, mortgage_id):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        updates = {}
        if "name" in input_data and input_data["name"].strip():
            updates["mortgage_name"] = input_data["name"].strip()
        if "id" in input_data and input_data["id"].strip():
            updates["mortgage_id"] = input_data["id"].strip()
        if "type" in input_data and input_data["type"].strip():
            updates["type"] = input_data["type"].strip()
        if "term" in input_data:
            try:
                updates["term"] = int(input_data["term"])  # Cast to int for INTEGER column
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid term format, must be an integer",
                    "payload": {},
                }
        if "interestRate" in input_data:
            try:
                updates["interest_rate"] = float(input_data["interestRate"])
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid interest rate format, must be a number",
                    "payload": {},
                }
        if "amount" in input_data:
            try:
                updates["amount"] = float(input_data["amount"])
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid amount format, must be a number",
                    "payload": {},
                }
        if "remainingBalance" in input_data:
            try:
                updates["remaining_balance"] = float(input_data["remainingBalance"])
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid remaining balance format, must be a number",
                    "payload": {},
                }
        updates["updated_at"] = datetime.now().isoformat()

        if not updates:
            return {"status": 0, "message": "No valid updates provided", "payload": {}}

        try:
            result = DBHelper.update_one(
                table_name="mortgages_loans",
                filters={"id": mortgage_id, "user_id": uid},
                updates=updates,
                return_fields=[
                    "id",
                    "mortgage_id",
                    "mortgage_name",
                    "type",
                    "term",
                    "interest_rate",
                    "amount",
                    "remaining_balance",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            if result:
                updated_mortgage = {
                    "id": str(result["id"]),
                    "mortgageId": result["mortgage_id"],
                    "name": result["mortgage_name"],
                    "type": result["type"],
                    "term": int(result["term"]),
                    "interestRate": float(result["interest_rate"]),
                    "amount": float(result["amount"]),
                    "remainingBalance": float(result["remaining_balance"]),
                    "created_at": (
                        result["created_at"].isoformat() if result["created_at"] else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat() if result["updated_at"] else None
                    ),
                    "is_active": result["is_active"],
                }
                return {
                    "status": 1,
                    "message": "Mortgage Loan Updated Successfully",
                    "payload": {"loans": [updated_mortgage]},
                }
            else:
                return {
                    "status": 0,
                    "message": "Mortgage loan not found or not authorized",
                    "payload": {},
                }
        except Exception as e:
            logger.error(f"Error updating mortgage loan: {str(e)}")
            return {
                "status": 0,
                "message": f"Error updating mortgage loan: {str(e)}",
                "payload": {},
            }

class DeleteMortgageLoan(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user, mortgage_id):
        try:
            mortgage = DBHelper.find_one(
                table_name="mortgages_loans",
                filters={"id": mortgage_id, "user_id": uid, "is_active": 1},
                select_fields=[
                    "id",
                    "mortgage_id",
                    "mortgage_name",
                    "type",
                    "term",
                    "interest_rate",
                    "amount",
                    "remaining_balance",
                    "is_active",
                ],
            )
            if not mortgage:
                logger.warning(
                    f"Mortgage loan not found or already inactive: id={mortgage_id}, user_id={uid}"
                )
                return {
                    "status": 0,
                    "message": "Mortgage loan not found or already inactive",
                    "payload": {},
                }

            result = DBHelper.update_one(
                table_name="mortgages_loans",
                filters={"id": mortgage_id, "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.now().isoformat()},
                return_fields=[
                    "id",
                    "mortgage_id",
                    "mortgage_name",
                    "type",
                    "term",
                    "interest_rate",
                    "amount",
                    "remaining_balance",
                    "is_active",
                ],
            )
            if result:
                logger.info(
                    f"Mortgage loan deactivated successfully: id={mortgage_id}, is_active={result['is_active']}"
                )
                deactivated_mortgage = {
                    "id": str(result["id"]),
                    "mortgageId": result["mortgage_id"],
                    "name": result["mortgage_name"],
                    "type": result["type"],
                    "term": int(result["term"]),
                    "interestRate": float(result["interest_rate"]),
                    "amount": float(result["amount"]),
                    "remainingBalance": float(result["remaining_balance"]),
                    "is_active": result["is_active"],
                }
                return {
                    "status": 1,
                    "message": "Mortgage Loan Deactivated Successfully",
                    "payload": {"loans": [deactivated_mortgage]},
                }
            else:
                logger.warning(
                    f"Failed to deactivate mortgage loan: id={mortgage_id}, user_id={uid}"
                )
                return {
                    "status": 0,
                    "message": "Failed to deactivate mortgage loan",
                    "payload": {},
                }
        except Exception as e:
            logger.error(
                f"Error deactivating mortgage loan: id={mortgage_id}, error={str(e)}"
            )
            return {
                "status": 0,
                "message": f"Error deactivating mortgage loan: {str(e)}",
                "payload": {},
            }

class AddVehicle(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        vin = input_data.get("vin", "").strip()
        make = input_data.get("make", "").strip()
        model = input_data.get("model", "").strip()
        year = input_data.get("year")
        registration_number = input_data.get("registration_number", "").strip()
        insurance_provider = input_data.get("insurance_provider", "").strip()
        insurance_id = input_data.get("insurance_id", "").strip()

        if not vin or not make or not model or not year:
            return {"status": 0, "message": "VIN, make, model, and year are required", "payload": {}}

        try:
            year = int(year)
            if year < 1900 or year > datetime.now().year + 1:
                return {"status": 0, "message": "Invalid year", "payload": {}}
        except (ValueError, TypeError):
            return {"status": 0, "message": "Invalid year format", "payload": {}}

        vehicle_data = {
            "user_id": uid,
            "vin": vin,
            "make": make,
            "model": model,
            "year": year,
            "registration_number": registration_number or None,
            "insurance_provider": insurance_provider or None,
            "insurance_id": insurance_id or None,
            "is_active": 1,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        try:
            inserted_id = DBHelper.insert("vehicles", return_column="id", **vehicle_data)
            vehicle_data["id"] = inserted_id

            # 🔹 Log success
            AuditLogger.log(
                user_id=uid,
                action="create",
                resource_type="vehicle",
                resource_id=inserted_id,
                success=True,
                metadata=vehicle_data,
            )

            return {
                "status": 1,
                "message": "Vehicle Added Successfully",
                "payload": {"vehicles": [vehicle_data]},
            }
        except Exception as e:
            logger.error(f"Error adding vehicle: {str(e)}")

            # 🔹 Log failure
            AuditLogger.log(
                user_id=uid,
                action="create",
                resource_type="vehicle",
                resource_id=None,
                success=False,
                error_message=str(e),
            )

            return {
                "status": 0,
                "message": f"Error adding vehicle: {str(e)}",
                "payload": {},
            }


class UpdateVehicle(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, vehicle_id):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        updates = {}
        if "vin" in input_data and input_data["vin"].strip():
            updates["vin"] = input_data["vin"].strip()
        if "make" in input_data and input_data["make"].strip():
            updates["make"] = input_data["make"].strip()
        if "model" in input_data and input_data["model"].strip():
            updates["model"] = input_data["model"].strip()
        if "year" in input_data:
            try:
                year = int(input_data["year"])
                if year < 1900 or year > datetime.now().year + 1:
                    return {"status": 0, "message": "Invalid year", "payload": {}}
                updates["year"] = year
            except (ValueError, TypeError):
                return {"status": 0, "message": "Invalid year format", "payload": {}}
        if "registration_number" in input_data:
            updates["registration_number"] = input_data["registration_number"].strip() or None
        if "insurance_provider" in input_data:
            updates["insurance_provider"] = input_data["insurance_provider"].strip() or None
        if "insurance_id" in input_data:
            updates["insurance_id"] = input_data["insurance_id"].strip() or None
        updates["updated_at"] = datetime.now().isoformat()

        if not updates:
            return {"status": 0, "message": "No valid updates provided", "payload": {}}

        try:
            result = DBHelper.update_one(
                table_name="vehicles",
                filters={"id": vehicle_id, "user_id": uid},
                updates=updates,
                return_fields=[
                    "id", "vin", "make", "model", "year",
                    "registration_number", "insurance_provider",
                    "insurance_id", "created_at", "updated_at", "is_active",
                ],
            )
            if result:
                updated_vehicle = {
                    "id": str(result["id"]),
                    "vin": result["vin"],
                    "make": result["make"],
                    "model": result["model"],
                    "year": int(result["year"]),
                    "registration_number": result["registration_number"],
                    "insurance_provider": result["insurance_provider"],
                    "insurance_id": result["insurance_id"],
                    "created_at": result["created_at"].isoformat() if result["created_at"] else None,
                    "updated_at": result["updated_at"].isoformat() if result["updated_at"] else None,
                    "is_active": result["is_active"],
                }

                # 🔹 Log success
                AuditLogger.log(
                    user_id=uid,
                    action="update",
                    resource_type="vehicle",
                    resource_id=vehicle_id,
                    success=True,
                    metadata={"updates": updates},
                )

                return {
                    "status": 1,
                    "message": "Vehicle Updated Successfully",
                    "payload": {"vehicles": [updated_vehicle]},
                }
            else:
                # 🔹 Log failure
                AuditLogger.log(
                    user_id=uid,
                    action="update",
                    resource_type="vehicle",
                    resource_id=vehicle_id,
                    success=False,
                    error_message="Vehicle not found or not authorized",
                )

                return {
                    "status": 0,
                    "message": "Vehicle not found or not authorized",
                    "payload": {},
                }
        except Exception as e:
            logger.error(f"Error updating vehicle: {str(e)}")

            # 🔹 Log exception
            AuditLogger.log(
                user_id=uid,
                action="update",
                resource_type="vehicle",
                resource_id=vehicle_id,
                success=False,
                error_message=str(e),
            )

            return {
                "status": 0,
                "message": f"Error updating vehicle: {str(e)}",
                "payload": {},
            }


class DeleteVehicle(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user, vehicle_id):
        logger.debug(f"Attempting to delete vehicle: id={vehicle_id}, user_id={uid}")
        try:
            try:
                vehicle_id_int = int(vehicle_id)
            except ValueError:
                logger.error(f"Invalid vehicle_id format: {vehicle_id}")
                return {
                    "status": 0,
                    "message": "Invalid vehicle_id format, must be a valid integer",
                    "payload": {},
                }, 400

            vehicle = DBHelper.find_one(
                table_name="vehicles",
                filters={"id": vehicle_id_int, "user_id": uid, "is_active": 1},
                select_fields=[
                    "id", "vin", "make", "model", "year",
                    "registration_number", "insurance_provider",
                    "insurance_id", "created_at", "updated_at", "is_active",
                ],
            )
            if not vehicle:
                logger.warning(f"Vehicle not found or already inactive: id={vehicle_id}, user_id={uid}")

                # 🔹 Log failure
                AuditLogger.log(
                    user_id=uid,
                    action="delete",
                    resource_type="vehicle",
                    resource_id=vehicle_id,
                    success=False,
                    error_message="Vehicle not found or already inactive",
                )

                return {
                    "status": 0,
                    "message": f"Vehicle not found or already inactive: id={vehicle_id}",
                    "payload": {},
                }, 404

            result = DBHelper.update_one(
                table_name="vehicles",
                filters={"id": vehicle_id_int, "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.now().isoformat()},
                return_fields=[
                    "id", "vin", "make", "model", "year",
                    "registration_number", "insurance_provider",
                    "insurance_id", "created_at", "updated_at", "is_active",
                ],
            )
            if result:
                logger.info(f"Vehicle deactivated successfully: id={vehicle_id}, is_active={result['is_active']}")

                # 🔹 Log success
                AuditLogger.log(
                    user_id=uid,
                    action="delete",
                    resource_type="vehicle",
                    resource_id=vehicle_id,
                    success=True,
                    metadata={"previous_state": vehicle},
                )

                deactivated_vehicle = {
                    "id": str(result["id"]),
                    "vin": result["vin"],
                    "make": result["make"],
                    "model": result["model"],
                    "year": result["year"],
                    "registration_number": result["registration_number"],
                    "insurance_provider": result["insurance_provider"],
                    "insurance_id": result["insurance_id"],
                    "created_at": result["created_at"].isoformat() if result["created_at"] else None,
                    "updated_at": result["updated_at"].isoformat() if result["updated_at"] else None,
                    "is_active": result["is_active"],
                }
                return {
                    "status": 1,
                    "message": "Vehicle Deactivated Successfully",
                    "payload": {"vehicle": deactivated_vehicle},
                }, 200
            else:
                logger.warning(f"Failed to deactivate vehicle: id={vehicle_id}, user_id={uid}")

                # 🔹 Log failure
                AuditLogger.log(
                    user_id=uid,
                    action="delete",
                    resource_type="vehicle",
                    resource_id=vehicle_id,
                    success=False,
                    error_message="Failed to deactivate vehicle",
                )

                return {
                    "status": 0,
                    "message": f"Failed to deactivate vehicle: id={vehicle_id}",
                    "payload": {},
                }, 500
        except Exception as e:
            logger.error(f"Error deactivating vehicle: id={vehicle_id}, error={str(e)}")

            # 🔹 Log exception
            AuditLogger.log(
                user_id=uid,
                action="delete",
                resource_type="vehicle",
                resource_id=vehicle_id,
                success=False,
                error_message=str(e),
            )

            return {
                "status": 0,
                "message": f"Error deactivating vehicle: {str(e)}",
                "payload": {},
            }, 500

# ... (keep all existing classes below UpdateVehicle)            
def uniqueId(digit=15, isNum=True):
    if isNum:
        return "".join(random.choices(string.digits, k=digit))
    else:
        return "".join(random.choices(string.ascii_letters + string.digits, k=digit))


from werkzeug.utils import secure_filename
from googleapiclient.http import MediaIoBaseUpload
import io


class DeleteHomeDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        file_id = request.args.get("file_id")
        if not file_id:
            return {"status": 0, "message": "Missing file_id", "payload": {}}, 400

        service = self.get_drive_service(uid)
        if not service:
            return {"status": 0, "message": "Google Drive not connected", "payload": {}}, 401

        try:
            service.files().delete(fileId=file_id).execute()
            return {
                "status": 1,
                "message": "File deleted successfully",
                "payload": {"file_id": file_id},
            }, 200
        except Exception as e:
            logger.error(f"Error deleting file from Drive: {str(e)}")
            return {
                "status": 0,
                "message": f"Delete failed: {str(e)}",
                "payload": {},
            }, 500


class UploadHomeDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if "file" not in request.files:
                return {"status": 0, "message": "No file provided", "payload": {}}, 400

            file = request.files["file"]
            if not file.filename:
                return {"status": 0, "message": "Empty filename", "payload": {}}, 400

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }, 401

            # Ensure folder structure exists
            folder_data = ensure_drive_folder_structure(service)
            home_folder_id = folder_data["subfolders"].get("Home")
            if not home_folder_id:
                return {
                    "status": 0,
                    "message": "Home folder not found in Drive",
                    "payload": {},
                }, 404

            file_metadata = {
                "name": secure_filename(file.filename),
                "parents": [home_folder_id],
            }

            media = MediaIoBaseUpload(
                io.BytesIO(file.read()),
                mimetype=file.content_type or "application/octet-stream",
                resumable=True,
            )

            uploaded = (
                service.files()
                .create(body=file_metadata, media_body=media, fields="id, name, mimeType, webViewLink")
                .execute()
            )

            return {
                "status": 1,
                "message": "File uploaded to Home folder",
                "payload": {"file": uploaded},
            }, 200

        except Exception as e:
            logger.error(f"Error uploading file to Drive: {str(e)}")
            return {
                "status": 0,
                "message": f"Failed to upload file: {str(e)}",
                "payload": {},
            }, 500


class GetHomeDriveFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Drive not connected",
                    "payload": {},
                }, 401

            folder_data = ensure_drive_folder_structure(service)
            home_folder_id = folder_data["subfolders"].get("Home")

            if not home_folder_id:
                return {
                    "status": 0,
                    "message": "Home folder not found",
                    "payload": {},
                }, 404

            query = f"'{home_folder_id}' in parents and trashed = false"
            results = (
                service.files()
                .list(q=query, fields="files(id, name, webViewLink)", spaces="drive")
                .execute()
            )
            files = results.get("files", [])

            return {
                "status": 1,
                "message": "Files fetched",
                "payload": {"files": files},
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Fetch failed: {str(e)}"}, 500


class AddOtherAsset(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        if not input_data:
            AuditLogger.log(
                user_id=uid,
                action="CREATE",
                resource_type="OtherAsset",
                resource_id=None,
                success=False,
                error_message="No input data received",
                metadata={"endpoint": "AddOtherAsset.post"}
            )
            return {"status": 0, "message": "No input data received", "payload": {}}

        required_fields = ["name", "type", "value", "payment", "icon"]
        for field in required_fields:
            if field not in input_data or input_data[field] is None:
                msg = f"{field.capitalize()} is required"
                AuditLogger.log(
                    user_id=uid,
                    action="CREATE",
                    resource_type="OtherAsset",
                    resource_id=None,
                    success=False,
                    error_message=msg,
                    metadata={"missing_field": field, "endpoint": "AddOtherAsset.post"}
                )
                return {"status": 0, "message": msg, "payload": {}}

        asset_data = {
            "user_id": uid,
            "name": input_data["name"].strip(),
            "type": input_data["type"].strip(),
            "value": float(input_data["value"]),
            "payment": input_data["payment"].strip(),
            "icon": input_data["icon"].strip(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_active": 1,
        }

        try:
            inserted_id = DBHelper.insert(
                "other_assets", return_column="id", **asset_data
            )
            asset_data["id"] = inserted_id

            # ✅ Successful audit log
            AuditLogger.log(
                user_id=uid,
                action="CREATE",
                resource_type="OtherAsset",
                resource_id=inserted_id,
                success=True,
                metadata={"asset_name": asset_data["name"], "value": asset_data["value"]}
            )

            return {
                "status": 1,
                "message": "Other Asset Added Successfully",
                "payload": {"asset": asset_data},
            }

        except Exception as e:
            error_msg = f"Error adding other asset: {str(e)}"

            # ❌ Failed audit log
            AuditLogger.log(
                user_id=uid,
                action="CREATE",
                resource_type="OtherAsset",
                resource_id=None,
                success=False,
                error_message=error_msg,
                metadata={"input_data": input_data}
            )

            return {
                "status": 0,
                "message": error_msg,
                "payload": {},
            }


class GetOtherAssets(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            assets = DBHelper.find_all(
                table_name="other_assets",
                filters={"user_id": uid, "is_active": 1},  # UPDATED: Added is_active filter
                select_fields=[
                    "id",
                    "name",
                    "type",
                    "value",
                    "payment",
                    "icon",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            user_assets = [
                {
                    "id": str(asset["id"]),
                    "name": asset["name"],
                    "type": asset["type"],
                    "value": float(asset["value"]),
                    "payment": asset["payment"],
                    "icon": asset["icon"],
                    "created_at": (
                        asset["created_at"].isoformat() if asset["created_at"] else None
                    ),
                    "updated_at": (
                        asset["updated_at"].isoformat() if asset["updated_at"] else None
                    ),
                    "is_active": asset["is_active"],
                }
                for asset in assets
            ]
            return {
                "status": 1,
                "message": "Other Assets fetched successfully",
                "payload": {"assets": user_assets},
            }
        except Exception as e:
            logger.error(f"Error fetching other assets: {str(e)}")
            return {
                "status": 0,
                "message": f"Error fetching other assets: {str(e)}",
                "payload": {},
            }

class UpdateOtherAsset(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, asset_id):
        input_data = request.get_json(silent=True)
        if not input_data:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE",
                resource_type="OtherAsset",
                resource_id=asset_id,
                success=False,
                error_message="No input data received",
                metadata={"endpoint": "UpdateOtherAsset.put"}
            )
            return {"status": 0, "message": "No input data received", "payload": {}}

        updates = {}
        if "name" in input_data and input_data["name"].strip():
            updates["name"] = input_data["name"].strip()
        if "type" in input_data and input_data["type"].strip():
            updates["type"] = input_data["type"].strip()
        if "value" in input_data:
            updates["value"] = float(input_data["value"])
        if "payment" in input_data and input_data["payment"].strip():
            updates["payment"] = input_data["payment"].strip()
        if "icon" in input_data and input_data["icon"].strip():
            updates["icon"] = input_data["icon"].strip()
        updates["updated_at"] = datetime.now().isoformat()

        if not updates:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE",
                resource_type="OtherAsset",
                resource_id=asset_id,
                success=False,
                error_message="No valid updates provided",
                metadata={"input_data": input_data}
            )
            return {"status": 0, "message": "No valid updates provided", "payload": {}}

        try:
            result = DBHelper.update_one(
                table_name="other_assets",
                filters={"id": int(asset_id), "user_id": uid},
                updates=updates,
                return_fields=[
                    "id",
                    "name",
                    "type",
                    "value",
                    "payment",
                    "icon",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            if result:
                updated_asset = {
                    "id": str(result["id"]),
                    "name": result["name"],
                    "type": result["type"],
                    "value": float(result["value"]),
                    "payment": result["payment"],
                    "icon": result["icon"],
                    "created_at": (
                        result["created_at"].isoformat()
                        if result["created_at"] else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat()
                        if result["updated_at"] else None
                    ),
                    "is_active": result["is_active"],
                }

                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE",
                    resource_type="OtherAsset",
                    resource_id=asset_id,
                    success=True,
                    metadata={"updated_fields": list(updates.keys())}
                )

                return {
                    "status": 1,
                    "message": "Other Asset Updated Successfully",
                    "payload": {"asset": updated_asset},
                }
            else:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE",
                    resource_type="OtherAsset",
                    resource_id=asset_id,
                    success=False,
                    error_message="Asset not found or not authorized"
                )
                return {
                    "status": 0,
                    "message": "Asset not found or not authorized",
                    "payload": {},
                }
        except Exception as e:
            error_msg = f"Error updating other asset: {str(e)}"
            AuditLogger.log(
                user_id=uid,
                action="UPDATE",
                resource_type="OtherAsset",
                resource_id=asset_id,
                success=False,
                error_message=error_msg,
                metadata={"input_data": input_data}
            )
            return {"status": 0, "message": error_msg, "payload": {}}


class DeleteOtherAsset(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user, asset_id):
        logger.debug(f"Attempting to delete other asset: id={asset_id}, user_id={uid}")
        try:
            asset = DBHelper.find_one(
                table_name="other_assets",
                filters={"id": int(asset_id), "user_id": uid, "is_active": 1},
                select_fields=[
                    "id",
                    "name",
                    "type",
                    "value",
                    "payment",
                    "icon",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            if not asset:
                msg = f"Other asset not found or already inactive: id={asset_id}"
                AuditLogger.log(
                    user_id=uid,
                    action="DELETE",
                    resource_type="OtherAsset",
                    resource_id=asset_id,
                    success=False,
                    error_message=msg
                )
                return {"status": 0, "message": msg, "payload": {}}, 404

            result = DBHelper.update_one(
                table_name="other_assets",
                filters={"id": int(asset_id), "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.now().isoformat()},
                return_fields=[
                    "id",
                    "name",
                    "type",
                    "value",
                    "payment",
                    "icon",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            if result:
                deactivated_asset = {
                    "id": str(result["id"]),
                    "name": result["name"],
                    "type": result["type"],
                    "value": float(result["value"]),
                    "payment": result["payment"],
                    "icon": result["icon"],
                    "created_at": (
                        result["created_at"].isoformat() if result["created_at"] else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat() if result["updated_at"] else None
                    ),
                    "is_active": result["is_active"],
                }

                AuditLogger.log(
                    user_id=uid,
                    action="DELETE",
                    resource_type="OtherAsset",
                    resource_id=asset_id,
                    success=True,
                    metadata={"asset_name": result["name"]}
                )

                return {
                    "status": 1,
                    "message": "Other Asset Deactivated Successfully",
                    "payload": {"asset": deactivated_asset},
                }, 200
            else:
                msg = f"Failed to deactivate other asset: id={asset_id}"
                AuditLogger.log(
                    user_id=uid,
                    action="DELETE",
                    resource_type="OtherAsset",
                    resource_id=asset_id,
                    success=False,
                    error_message=msg
                )
                return {"status": 0, "message": msg, "payload": {}}, 500
        except Exception as e:
            error_msg = f"Error deactivating other asset: {str(e)}"
            AuditLogger.log(
                user_id=uid,
                action="DELETE",
                resource_type="OtherAsset",
                resource_id=asset_id,
                success=False,
                error_message=error_msg
            )
            return {"status": 0, "message": error_msg, "payload": {}}, 500

class GetVehicles(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            vehicles = DBHelper.find_all(
                table_name="vehicles",
                filters={"user_id": uid, "is_active": 1},
                select_fields=[
                    "id",
                    "vin",
                    "make",
                    "model",
                    "year",
                    "registration_number",
                    "insurance_provider",
                    "insurance_id",
                    "created_at",
                    "updated_at",
                    "is_active",
                ],
            )
            user_vehicles = [
                {
                    "id": str(vehicle["id"]),
                    "vin": vehicle["vin"],
                    "make": vehicle["make"],
                    "model": vehicle["model"],
                    "year": vehicle["year"],
                    "registration_number": vehicle["registration_number"],
                    "insurance_provider": vehicle["insurance_provider"],
                    "insurance_id": vehicle["insurance_id"],
                    "created_at": (
                        vehicle["created_at"].isoformat() if vehicle["created_at"] else None
                    ),
                    "updated_at": (
                        vehicle["updated_at"].isoformat() if vehicle["updated_at"] else None
                    ),
                    "is_active": vehicle["is_active"],
                }
                for vehicle in vehicles
            ]
            return {
                "status": 1,
                "message": "Vehicles fetched successfully",
                "payload": {"vehicles": user_vehicles},
            }
        except Exception as e:
            logger.error(f"Error fetching vehicles: {str(e)}")
            return {
                "status": 0,
                "message": f"Error fetching vehicles: {str(e)}",
                "payload": {},
            }, 500