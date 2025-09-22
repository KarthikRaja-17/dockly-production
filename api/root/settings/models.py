from flask import request
from flask_restful import Resource
from root.db.dbHelper import DBHelper
from root.helpers.logs import AuditLogger

from root.auth.auth import auth_required


class AddNotifications(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json()
        notifications = input_data.get("notifications", [])

        if not notifications:
            AuditLogger.log(
                user_id=uid,
                action="ADD_NOTIFICATIONS_FAILED",
                resource_type="user_settings",
                resource_id=uid,
                success=False,
                error_message="No notifications provided",
            )
            return {"status": 0, "message": "No notifications provided", "payload": {}}

        try:
            user_notifications = DBHelper.insert(
                "user_settings",
                return_column="user_id",
                user_id=uid,
                theme="light",
                language="en",
                email_notifications=notifications.get("email_notifications", False),
                push_notifications=notifications.get("push_notifications", False),
                reminder_days_before=notifications.get("reminder_days_before", 0),
            )

            # Log successful addition
            AuditLogger.log(
                user_id=uid,
                action="ADD_NOTIFICATIONS",
                resource_type="user_settings",
                resource_id=uid,
                success=True,
                metadata={"notifications": notifications},
            )

            return {
                "status": 1,
                "message": "Notifications added successfully",
                "payload": {"userNotifications": user_notifications},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_NOTIFICATIONS_FAILED",
                resource_type="user_settings",
                resource_id=uid,
                success=False,
                error_message=str(e),
                metadata={"notifications": notifications},
            )
            return {"status": 0, "message": f"Failed to add notifications: {str(e)}", "payload": {}}
