from flask import request
from flask_restful import Resource
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required
from datetime import datetime, date
from root.helpers.logs import AuditLogger
from email.message import EmailMessage
import smtplib
from root.config import EMAIL_PASSWORD, EMAIL_SENDER, SMTP_PORT, SMTP_SERVER


class AddWellnessTask(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        if not inputData:
            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_FAILED",
                resource_type="wellness_tasks",
                resource_id=None,
                success=False,
                error_message="Invalid or empty input",
                metadata={"raw_request": str(request.data)},
            )
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        task_id = inputData.get("id")
        editing = inputData.get("editing")

        # Helper: Convert Python list to PostgreSQL array
        def format_pg_array(py_list):
            if not py_list:
                return "{}"
            return "{" + ",".join(f'"{str(i)}"' for i in py_list) + "}"

        # Helper: Parse date string to date object
        def parse_date(date_str):
            if not date_str:
                return None
            try:
                # Handle various date formats
                if isinstance(date_str, str):
                    # Try different formats
                    for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y/%m/%d']:
                        try:
                            return datetime.strptime(date_str, fmt).date()
                        except ValueError:
                            continue
                    # If none of the formats work, raise an error
                    raise ValueError(f"Invalid date format: {date_str}")
                elif isinstance(date_str, date):
                    return date_str
                else:
                    return None
            except Exception as e:
                raise ValueError(f"Error parsing date '{date_str}': {str(e)}")

        # Handle tagged_ids safely
        tagged_members = inputData.get("tagged_members", [])
        tagged_ids_array = format_pg_array(tagged_members) if isinstance(tagged_members, list) else "{}"

        try:
            # Parse dates
            start_date = parse_date(inputData.get("start_date"))
            due_date = parse_date(inputData.get("due_date"))
            recurring = inputData.get("recurring", False)
            
            # Validation for recurring tasks: both dates are required
            if recurring and (not start_date or not due_date):
                return {"status": 0, "message": "Recurring tasks require both start date and due date", "payload": {}}, 400
            
            # Validation: start_date should be <= due_date (when both are provided)
            if start_date and due_date and start_date > due_date:
                return {"status": 0, "message": "Start date cannot be after due date", "payload": {}}, 400
            
            # For non-recurring tasks, dates are optional
            # If only one date is provided for non-recurring tasks, use it for both
            if not recurring:
                if not start_date and due_date:
                    start_date = due_date
                elif start_date and not due_date:
                    due_date = start_date
                # For non-recurring tasks, both dates can be None

            if editing and task_id:
                # UPDATE task
                payload = {
                    "icon": inputData.get("icon", ""),
                    "text": inputData.get("text", ""),
                    "start_date": start_date,
                    "due_date": due_date,
                    "recurring": recurring,
                    "details": inputData.get("details", ""),
                    "completed": inputData.get("completed", False),
                    "tagged_ids": tagged_ids_array,
                    "updated_at": datetime.now(),
                }

                DBHelper.update_one(
                    table_name="wellness_tasks",
                    filters={"id": task_id, "user_id": uid},
                    updates=payload,
                )

                AuditLogger.log(
                    user_id=uid,
                    action="WELLNESS_TASK_UPDATED",
                    resource_type="wellness_tasks",
                    resource_id=task_id,
                    success=True,
                    metadata=payload,
                )

                return {"status": 1, "message": f"Wellness task '{inputData.get('text')}' updated successfully", "payload": {}}
            else:
                # INSERT new task
                payload = {
                    "user_id": uid,
                    "icon": inputData.get("icon", ""),
                    "text": inputData.get("text", ""),
                    "start_date": start_date,
                    "due_date": due_date,
                    "recurring": recurring,
                    "details": inputData.get("details", ""),
                    "completed": inputData.get("completed", False),
                    "tagged_ids": tagged_ids_array,
                    "created_at": datetime.now(),
                    "updated_at": datetime.now(),
                }

                new_id = DBHelper.insert("wellness_tasks", return_column="id", **payload)

                AuditLogger.log(
                    user_id=uid,
                    action="WELLNESS_TASK_ADDED",
                    resource_type="wellness_tasks",
                    resource_id=new_id,
                    success=True,
                    metadata=payload,
                )

                return {"status": 1, "message": f"Wellness task '{inputData.get('text')}' added successfully", "payload": {"id": new_id}}

        except ValueError as e:
            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_FAILED",
                resource_type="wellness_tasks",
                resource_id=task_id if editing else None,
                success=False,
                error_message=str(e),
                metadata={"input": inputData},
            )
            return {"status": 0, "message": str(e), "payload": {}}, 400

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_FAILED",
                resource_type="wellness_tasks",
                resource_id=task_id if editing else None,
                success=False,
                error_message="Failed to save wellness task",
                metadata={"input": inputData, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to save wellness task: {str(e)}", "payload": {}}, 500


class GetWellnessTasks(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            tasks = DBHelper.find_with_or_and_array_match(
                table_name="wellness_tasks",
                select_fields=[
                    "id", "icon", "text", "start_date", "due_date", "recurring", 
                    "details", "completed", "created_at", "updated_at", "tagged_ids"
                ],
                uid=uid,
                array_field="tagged_ids",
                filters={"is_active": 1},
            )

            user_tasks = []
            for task in tasks:
                user_tasks.append({
                    "id": task["id"],
                    "icon": task["icon"],
                    "text": task["text"],
                    "start_date": task["start_date"].isoformat() if task["start_date"] else None,
                    "due_date": task["due_date"].isoformat() if task["due_date"] else None,
                    "recurring": task["recurring"],
                    "details": task["details"],
                    "completed": task["completed"],
                    "tagged_ids": task.get("tagged_ids", []),
                    "createdAt": task["created_at"].isoformat() if task["created_at"] else None,
                    "updatedAt": task["updated_at"].isoformat() if task["updated_at"] else None,
                    # Legacy support - send due_date as 'date' for backwards compatibility
                    "date": task["due_date"].isoformat() if task["due_date"] else None,
                })

            AuditLogger.log(
                user_id=uid,
                action="GET_WELLNESS_TASKS",
                resource_type="wellness_tasks",
                resource_id=None,
                success=True,
                metadata={"count": len(user_tasks)},
            )

            return {
                "status": 1,
                "message": "Wellness tasks fetched successfully",
                "payload": {"tasks": user_tasks},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="GET_WELLNESS_TASKS_FAILED",
                resource_type="wellness_tasks",
                resource_id=None,
                success=False,
                error_message="Failed to fetch wellness tasks",
                metadata={"error": str(e)},
            )
            return {
                "status": 0,
                "message": "Failed to fetch wellness tasks",
                "error": str(e),
            }, 500


class UpdateWellnessTask(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, task_id):
        inputData = request.get_json(silent=True)
        if not inputData:
            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_UPDATE_FAILED",
                resource_type="wellness_tasks",
                resource_id=task_id,
                success=False,
                error_message="Invalid or empty input",
                metadata={"raw_request": str(request.data)},
            )
            return {"status": 0, "message": "Invalid input data", "payload": {}}

        # Helper: Parse date string to date object
        def parse_date(date_str):
            if not date_str:
                return None
            try:
                if isinstance(date_str, str):
                    for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y/%m/%d']:
                        try:
                            return datetime.strptime(date_str, fmt).date()
                        except ValueError:
                            continue
                    raise ValueError(f"Invalid date format: {date_str}")
                elif isinstance(date_str, date):
                    return date_str
                else:
                    return None
            except Exception as e:
                raise ValueError(f"Error parsing date '{date_str}': {str(e)}")

        try:
            # Check if task exists and belongs to user
            existing_task = DBHelper.find_one(
                table_name="wellness_tasks",
                filters={"id": task_id, "user_id": uid, "is_active": 1}
            )

            if not existing_task:
                AuditLogger.log(
                    user_id=uid,
                    action="WELLNESS_TASK_UPDATE_FAILED",
                    resource_type="wellness_tasks",
                    resource_id=task_id,
                    success=False,
                    error_message="Wellness task not found",
                )
                return {"status": 0, "message": "Wellness task not found", "payload": {}}

            # Helper: Convert Python list to PostgreSQL array
            def format_pg_array(py_list):
                if not py_list:
                    return "{}"
                return "{" + ",".join(f'"{str(i)}"' for i in py_list) + "}"

            # Handle tagged_ids safely
            tagged_members = inputData.get("tagged_members", [])
            tagged_ids_array = format_pg_array(tagged_members) if isinstance(tagged_members, list) else existing_task.get("tagged_ids", "{}")

            # Parse dates
            start_date = parse_date(inputData.get("start_date")) if "start_date" in inputData else existing_task["start_date"]
            due_date = parse_date(inputData.get("due_date")) if "due_date" in inputData else existing_task["due_date"]
            recurring = inputData.get("recurring", existing_task["recurring"])
            
            # Legacy support: if 'date' is provided instead of 'due_date'
            if "date" in inputData and "due_date" not in inputData:
                due_date = parse_date(inputData.get("date"))
            
            # Validation for recurring tasks: both dates are required
            if recurring and (not start_date or not due_date):
                return {"status": 0, "message": "Recurring tasks require both start date and due date", "payload": {}}, 400
            
            # Validation: start_date should be <= due_date (when both are provided)
            if start_date and due_date and start_date > due_date:
                return {"status": 0, "message": "Start date cannot be after due date", "payload": {}}, 400
            
            # For non-recurring tasks, dates are optional
            # If only one date is provided for non-recurring tasks, use it for both
            if not recurring:
                if not start_date and due_date:
                    start_date = due_date
                elif start_date and not due_date:
                    due_date = start_date

            # Update task
            payload = {
                "icon": inputData.get("icon", existing_task["icon"]),
                "text": inputData.get("text", existing_task["text"]),
                "start_date": start_date,
                "due_date": due_date,
                "recurring": recurring,
                "details": inputData.get("details", existing_task["details"]),
                "completed": inputData.get("completed", existing_task["completed"]),
                "tagged_ids": tagged_ids_array,
                "updated_at": datetime.now(),
            }

            DBHelper.update_one(
                table_name="wellness_tasks",
                filters={"id": task_id, "user_id": uid},
                updates=payload,
            )

            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_UPDATED",
                resource_type="wellness_tasks",
                resource_id=task_id,
                success=True,
                metadata=payload,
            )

            return {"status": 1, "message": "Wellness task updated successfully", "payload": {}}

        except ValueError as e:
            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_UPDATE_FAILED",
                resource_type="wellness_tasks",
                resource_id=task_id,
                success=False,
                error_message=str(e),
                metadata={"input": inputData},
            )
            return {"status": 0, "message": str(e), "payload": {}}, 400

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_UPDATE_FAILED",
                resource_type="wellness_tasks",
                resource_id=task_id,
                success=False,
                error_message="Failed to update wellness task",
                metadata={"input": inputData, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to update wellness task: {str(e)}", "payload": {}}, 500

    @auth_required(isOptional=True)
    def delete(self, uid, user, task_id):
        try:
            # Check if task exists and belongs to user
            existing_task = DBHelper.find_one(
                table_name="wellness_tasks",
                filters={"id": task_id, "user_id": uid, "is_active": 1}
            )

            if not existing_task:
                AuditLogger.log(
                    user_id=uid,
                    action="WELLNESS_TASK_DELETE_FAILED",
                    resource_type="wellness_tasks",
                    resource_id=task_id,
                    success=False,
                    error_message="Wellness task not found",
                )
                return {"status": 0, "message": "Wellness task not found", "payload": {}}

            # Soft delete by setting is_active to 0
            DBHelper.update_one(
                table_name="wellness_tasks",
                filters={"id": task_id, "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.now()},
            )

            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_DELETED",
                resource_type="wellness_tasks",
                resource_id=task_id,
                success=True,
                metadata={"task_text": existing_task.get("text"), "deleted_by": user.get("user_name")},
            )

            return {"status": 1, "message": "Wellness task deleted successfully", "payload": {}}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_DELETE_FAILED",
                resource_type="wellness_tasks",
                resource_id=task_id,
                success=False,
                error_message="Failed to delete wellness task",
                metadata={"error": str(e)},
            )
            return {"status": 0, "message": f"Failed to delete wellness task: {str(e)}", "payload": {}}, 500


class ToggleWellnessTask(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, task_id):
        try:
            # Check if task exists and belongs to user
            existing_task = DBHelper.find_one(
                table_name="wellness_tasks",
                filters={"id": task_id, "user_id": uid, "is_active": 1}
            )

            if not existing_task:
                AuditLogger.log(
                    user_id=uid,
                    action="WELLNESS_TASK_TOGGLE_FAILED",
                    resource_type="wellness_tasks",
                    resource_id=task_id,
                    success=False,
                    error_message="Wellness task not found",
                )
                return {"status": 0, "message": "Wellness task not found", "payload": {}}

            # Toggle completed status
            new_completed_status = not existing_task["completed"]
            DBHelper.update_one(
                table_name="wellness_tasks",
                filters={"id": task_id, "user_id": uid},
                updates={"completed": new_completed_status, "updated_at": datetime.now()},
            )

            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_TOGGLED",
                resource_type="wellness_tasks",
                resource_id=task_id,
                success=True,
                metadata={
                    "task_text": existing_task.get("text"),
                    "new_status": new_completed_status,
                    "toggled_by": user.get("user_name") if user else None,
                },
            )

            return {
                "status": 1, 
                "message": f"Wellness task {'completed' if new_completed_status else 'uncompleted'} successfully", 
                "payload": {"completed": new_completed_status}
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_TOGGLE_FAILED",
                resource_type="wellness_tasks",
                resource_id=task_id,
                success=False,
                error_message="Failed to toggle wellness task",
                metadata={"error": str(e)},
            )
            return {"status": 0, "message": f"Failed to toggle wellness task: {str(e)}", "payload": {}}, 500


class GetUpcomingWellnessTasks(Resource):
    """New endpoint to get tasks that are coming up (for email notifications)"""
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            from datetime import timedelta
            
            # Get tasks that start in 1-2 days
            today = date.today()
            tomorrow = today + timedelta(days=1)
            day_after = today + timedelta(days=2)
            
            upcoming_tasks = DBHelper.find_many(
                table_name="wellness_tasks",
                select_fields=[
                    "id", "icon", "text", "start_date", "due_date", "recurring", 
                    "details", "completed", "user_id"
                ],
                filters={
                    "user_id": uid,
                    "is_active": 1,
                    "completed": False,  # Only get incomplete tasks
                    "recurring": True,  # Only recurring tasks have relevant start dates
                },
                custom_where="start_date IS NOT NULL AND start_date BETWEEN %s AND %s",
                custom_where_values=[tomorrow, day_after]
            )

            tasks = []
            for task in upcoming_tasks:
                tasks.append({
                    "id": task["id"],
                    "icon": task["icon"],
                    "text": task["text"],
                    "start_date": task["start_date"].isoformat() if task["start_date"] else None,
                    "due_date": task["due_date"].isoformat() if task["due_date"] else None,
                    "recurring": task["recurring"],
                    "details": task["details"],
                    "days_until_start": (task["start_date"] - today).days if task["start_date"] else 0,
                })

            return {
                "status": 1,
                "message": f"Found {len(tasks)} upcoming wellness tasks",
                "payload": {"tasks": tasks, "date_range": {"from": tomorrow.isoformat(), "to": day_after.isoformat()}},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="GET_UPCOMING_WELLNESS_TASKS_FAILED",
                resource_type="wellness_tasks",
                resource_id=None,
                success=False,
                error_message="Failed to fetch upcoming wellness tasks",
                metadata={"error": str(e)},
            )
            return {
                "status": 0,
                "message": "Failed to fetch upcoming wellness tasks",
                "error": str(e),
            }, 500


class WellnessEmailSender:
    def __init__(self):
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.smtp_user = EMAIL_SENDER
        self.smtp_password = EMAIL_PASSWORD

    def send_wellness_task_email(self, recipient_email, wellness_task, sender_name="Someone"):
        msg = EmailMessage()
        msg["Subject"] = f"Shared Wellness Task: {wellness_task['text']}"
        msg["From"] = self.smtp_user
        msg["To"] = recipient_email

        # Format dates properly
        start_date_str = wellness_task.get("start_date", "Not specified")
        due_date_str = wellness_task.get("due_date", "Not specified")
        
        if isinstance(start_date_str, date):
            start_date_str = start_date_str.strftime("%B %d, %Y")
        if isinstance(due_date_str, date):
            due_date_str = due_date_str.strftime("%B %d, %Y")

        created = wellness_task.get("created_at") or ""
        if created:
            created = created.split("T")[0] if "T" in str(created) else str(created)

        msg.set_content(
            f"""
Hi there!

{sender_name} wanted to share this Wellness Task with you:

Task: {wellness_task['text']}
Start Date: {start_date_str}
Due Date: {due_date_str}
Details: {wellness_task.get('details', 'No additional details')}
Recurring: {'Yes' if wellness_task.get('recurring') else 'No'}
Status: {'Completed' if wellness_task.get('completed') else 'Pending'}

Created: {created}

Best regards!
""".strip()
        )

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            return True, "Email sent successfully"
        except Exception as e:
            return False, str(e)

    def send_wellness_reminder_email(self, recipient_email, wellness_task, days_until_start=1):
        """New method for sending reminder emails for upcoming tasks"""
        msg = EmailMessage()
        msg["Subject"] = f"Wellness Task Reminder: {wellness_task['text']}"
        msg["From"] = self.smtp_user
        msg["To"] = recipient_email

        # Format dates properly
        start_date_str = wellness_task.get("start_date", "Not specified")
        due_date_str = wellness_task.get("due_date", "Not specified")
        
        if isinstance(start_date_str, date):
            start_date_str = start_date_str.strftime("%B %d, %Y")
        if isinstance(due_date_str, date):
            due_date_str = due_date_str.strftime("%B %d, %Y")

        reminder_text = f"in {days_until_start} day{'s' if days_until_start != 1 else ''}"
        if days_until_start == 0:
            reminder_text = "today"

        msg.set_content(
            f"""
Hi!

This is a friendly reminder that your wellness task is starting {reminder_text}:

Task: {wellness_task['text']}
Start Date: {start_date_str}
Due Date: {due_date_str}
Details: {wellness_task.get('details', 'No additional details')}
Recurring: {'Yes' if wellness_task.get('recurring') else 'No'}

Don't forget to take care of your wellness goals!

Best regards!
""".strip()
        )

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            return True, "Reminder email sent successfully"
        except Exception as e:
            return False, str(e)


class ShareWellnessTask(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        if not data:
            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_SHARE_FAILED",
                resource_type="wellness_tasks",
                resource_id=None,
                success=False,
                error_message="Invalid or empty input",
                metadata={"raw_request": str(request.data)},
            )
            return {"status": 0, "message": "Invalid input", "payload": {}}, 400

        emails = data.get("email")
        wellness_task = data.get("wellness_task")
        tagged_members = data.get("tagged_members", [])

        if not emails or not wellness_task:
            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_SHARE_FAILED",
                resource_type="wellness_tasks",
                resource_id=wellness_task.get("id") if wellness_task else None,
                success=False,
                error_message="Missing 'email' or 'wellness_task' in request",
                metadata={"input": data},
            )
            return {
                "status": 0,
                "message": "Both 'email' and 'wellness_task' are required.",
                "payload": {}
            }, 422

        try:
            if isinstance(emails, str):
                emails = [emails]

            email_sender = WellnessEmailSender()
            failures, notifications_created, resolved_tagged_ids = [], [], []

            # Resolve tagged members -> user IDs
            for member_identifier in tagged_members:
                family_member = DBHelper.find_one(
                    "family_members",
                    filters={"email": member_identifier},
                    select_fields=["fm_user_id"],
                )
                if family_member:
                    resolved_tagged_ids.append(family_member["fm_user_id"])

            # Send emails
            for email in emails:
                success, message = email_sender.send_wellness_task_email(
                    email, wellness_task, user["user_name"]
                )
                if not success:
                    failures.append((email, message))

            # Create notifications for tagged members
            for member_email in tagged_members:
                family_member = DBHelper.find_one(
                    "family_members",
                    filters={"email": member_email},
                    select_fields=["id", "name", "email", "fm_user_id"],
                )
                if not family_member:
                    continue

                receiver_uid = family_member.get("fm_user_id")
                if not receiver_uid:
                    user_record = DBHelper.find_one(
                        "users",
                        filters={"email": family_member["email"]},
                        select_fields=["uid"],
                    )
                    receiver_uid = user_record.get("uid") if user_record else None

                if not receiver_uid:
                    continue

                notification_data = {
                    "sender_id": uid,
                    "receiver_id": receiver_uid,
                    "message": f"{user['user_name']} tagged a wellness task '{wellness_task.get('text', 'Untitled')}' with you",
                    "task_type": "tagged",
                    "action_required": False,
                    "status": "unread",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "metadata": {
                        "wellness_task": {
                            "id": wellness_task.get("id"),
                            "text": wellness_task.get("text"),
                            "start_date": wellness_task.get("start_date"),
                            "due_date": wellness_task.get("due_date"),
                            "details": wellness_task.get("details", ""),
                            "recurring": wellness_task.get("recurring", False),
                            "completed": wellness_task.get("completed", False),
                        },
                        "sender_name": user["user_name"],
                        "tagged_member": {
                            "name": family_member["name"],
                            "email": family_member["email"],
                        },
                    },
                }

                notification_id = DBHelper.insert(
                    "notifications", return_column="id", **notification_data
                )

                notifications_created.append(
                    {
                        "notification_id": notification_id,
                        "member_name": family_member["name"],
                        "member_email": family_member["email"],
                        "receiver_uid": receiver_uid,
                    }
                )

            # Update tagged_ids in wellness_tasks
            if resolved_tagged_ids:
                task_record = DBHelper.find_one(
                    "wellness_tasks",
                    filters={"id": wellness_task.get("id")},
                    select_fields=["tagged_ids"],
                )
                existing_ids = task_record.get("tagged_ids") or []
                combined_ids = list(set(existing_ids + resolved_tagged_ids))
                pg_array_str = "{" + ",".join(f'"{str(i)}"' for i in combined_ids) + "}"
                DBHelper.update_one(
                    table_name="wellness_tasks",
                    filters={"id": wellness_task.get("id")},
                    updates={"tagged_ids": pg_array_str},
                )

            if failures:
                AuditLogger.log(
                    user_id=uid,
                    action="WELLNESS_TASK_SHARE_PARTIAL",
                    resource_type="wellness_tasks",
                    resource_id=wellness_task.get("id"),
                    success=False,
                    error_message=f"Failed to send to {len(failures)} recipients",
                    metadata={"failures": failures, "wellness_task": wellness_task},
                )
                return {
                    "status": 0,
                    "message": f"Failed to send to {len(failures)} recipients",
                    "errors": failures,
                }, 500

            # Success log
            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_SHARED",
                resource_type="wellness_tasks",
                resource_id=wellness_task.get("id"),
                success=True,
                metadata={
                    "emails_sent": emails,
                    "notifications_created": len(notifications_created),
                    "tagged_members": tagged_members,
                },
            )

            return {
                "status": 1,
                "message": f"Wellness task shared successfully and {len(notifications_created)} notifications created.",
                "payload": {"notifications_created": notifications_created},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="WELLNESS_TASK_SHARE_FAILED",
                resource_type="wellness_tasks",
                resource_id=wellness_task.get("id") if wellness_task else None,
                success=False,
                error_message="Failed to share wellness task",
                metadata={"input": data, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to share wellness task: {str(e)}", "payload": {}}, 500