"""
Background job to send wellness task reminders
Run this as a daily cron job or scheduled task
"""

from datetime import date, timedelta
from root.db.dbHelper import DBHelper
from wellness.models import WellnessEmailSender
from root.helpers.logs import AuditLogger


class WellnessReminderJob:
    def __init__(self):
        self.email_sender = WellnessEmailSender()
    
    def send_daily_reminders(self):
        """
        Main method to send reminders for wellness tasks starting in 1-2 days
        This should be called daily by a cron job
        """
        print(f"Starting wellness reminder job at {date.today()}")
        
        try:
            # Get tasks that start in 1-2 days (only recurring tasks have meaningful start dates)
            today = date.today()
            tomorrow = today + timedelta(days=1)
            day_after = today + timedelta(days=2)
            
            # Find all users with upcoming recurring wellness tasks
            upcoming_tasks = DBHelper.execute_query(
                """
                SELECT wt.*, u.email, u.user_name 
                FROM wellness_tasks wt 
                JOIN users u ON wt.user_id = u.uid 
                WHERE wt.is_active = 1 
                AND wt.completed = FALSE 
                AND wt.recurring = TRUE 
                AND wt.start_date IS NOT NULL 
                AND wt.start_date BETWEEN %s AND %s
                AND u.email IS NOT NULL
                AND u.is_active = 1
                """,
                [tomorrow, day_after]
            )
            
            sent_count = 0
            failed_count = 0
            
            for task in upcoming_tasks:
                try:
                    days_until_start = (task["start_date"] - today).days
                    
                    # Prepare task data for email
                    task_data = {
                        "id": task["id"],
                        "text": task["text"],
                        "start_date": task["start_date"],
                        "due_date": task["due_date"],
                        "details": task["details"] or "",
                        "recurring": task["recurring"],
                        "completed": task["completed"],
                    }
                    
                    # Send reminder email
                    success, message = self.email_sender.send_wellness_reminder_email(
                        recipient_email=task["email"],
                        wellness_task=task_data,
                        days_until_start=days_until_start
                    )
                    
                    if success:
                        sent_count += 1
                        AuditLogger.log(
                            user_id=task["user_id"],
                            action="WELLNESS_REMINDER_SENT",
                            resource_type="wellness_tasks",
                            resource_id=task["id"],
                            success=True,
                            metadata={
                                "task_text": task["text"],
                                "recipient_email": task["email"],
                                "days_until_start": days_until_start,
                                "sent_via": "background_job"
                            },
                        )
                        print(f"✓ Sent reminder to {task['email']} for task: {task['text']}")
                    else:
                        failed_count += 1
                        AuditLogger.log(
                            user_id=task["user_id"],
                            action="WELLNESS_REMINDER_FAILED",
                            resource_type="wellness_tasks",
                            resource_id=task["id"],
                            success=False,
                            error_message=message,
                            metadata={
                                "task_text": task["text"],
                                "recipient_email": task["email"],
                                "days_until_start": days_until_start,
                                "error": message
                            },
                        )
                        print(f"✗ Failed to send reminder to {task['email']}: {message}")
                        
                except Exception as e:
                    failed_count += 1
                    print(f"✗ Error processing task {task.get('id', 'unknown')}: {str(e)}")
                    AuditLogger.log(
                        user_id=task.get("user_id"),
                        action="WELLNESS_REMINDER_ERROR",
                        resource_type="wellness_tasks",
                        resource_id=task.get("id"),
                        success=False,
                        error_message=str(e),
                        metadata={"task": task, "error": str(e)},
                    )
            
            print(f"Wellness reminder job completed:")
            print(f"- Found {len(upcoming_tasks)} upcoming tasks")
            print(f"- Sent {sent_count} reminders successfully")
            print(f"- Failed to send {failed_count} reminders")
            
            return {
                "total_tasks": len(upcoming_tasks),
                "sent_count": sent_count,
                "failed_count": failed_count,
                "success_rate": (sent_count / len(upcoming_tasks) * 100) if upcoming_tasks else 100
            }
            
        except Exception as e:
            print(f"Critical error in wellness reminder job: {str(e)}")
            AuditLogger.log(
                user_id="SYSTEM",
                action="WELLNESS_REMINDER_JOB_FAILED",
                resource_type="system",
                resource_id=None,
                success=False,
                error_message=str(e),
                metadata={"job": "wellness_reminder", "error": str(e)},
            )
            return {"error": str(e)}


def run_wellness_reminders():
    """
    Entry point for the cron job
    Add this to your crontab: 0 9 * * * /path/to/python /path/to/this/script.py
    (runs daily at 9 AM)
    """
    job = WellnessReminderJob()
    result = job.send_daily_reminders()
    return result


if __name__ == "__main__":
    # Run the job when script is executed directly
    result = run_wellness_reminders()
    print(f"Job result: {result}")