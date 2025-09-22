from datetime import datetime
from flask import request
import json

from root.db.dbHelper import DBHelper


class AuditLogger:
    @staticmethod
    def log(
        user_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        success: bool,
        error_message: str = None,
        metadata: dict = None,
    ):
        """
        Inserts an audit log entry using DBHelper.insert.
        Converts datetime objects in metadata to ISO strings for JSON serialization.
        Returns the log ID if available, else True/False depending on success.
        """

        def serialize(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            elif isinstance(obj, dict):
                return {k: serialize(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [serialize(i) for i in obj]
            return obj

        ip_address = request.remote_addr if request else None
        user_agent = request.headers.get("User-Agent") if request else None

        try:
            safe_metadata = serialize(metadata) if metadata else {}

            log_id = DBHelper.insert(
                table_name="audit_logs",
                return_column="id",
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=ip_address,
                user_agent=user_agent,
                success=success,
                error_message=error_message,
                metadata=json.dumps(safe_metadata),  # ensure JSON storage
                created_at=datetime.utcnow().isoformat(),  # store as string
            )
            return log_id if log_id else True
        except Exception as e:
            # Important: Do not raise further, just log internally
            print(f"⚠ Failed to write audit log: {str(e)}")
            return False
