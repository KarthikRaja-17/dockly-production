from datetime import datetime
from root.common import Status, TrialPeriod
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required
from flask_restful import Resource
from root.helpers.logs import AuditLogger


from datetime import datetime, timedelta

class GetSubscriptions(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        if not uid:
            AuditLogger.log(
                user_id=uid or "unknown",
                action="FETCH_SUBSCRIPTIONS_FAILED",
                resource_type="user_subscriptions",
                resource_id=uid or "unknown",
                success=False,
                error_message="User ID is required",
            )
            return {"status": 0, "message": "User ID is required", "payload": {}}

        try:
            # Fetch all active subscription plans
            subscriptions = DBHelper.find_all(
                table_name="subscription_plans",
                filters={"is_active": Status.ACTIVE.value},
                select_fields=[
                    "id",
                    "plan_name",
                    "plan_type",
                    "price",
                    "billing_cycle",
                    "features",
                    "max_integrations",
                    "max_family_members",
                    "storage_limit_gb",
                ],
            )

            plans = []
            for sub in subscriptions:
                if sub.get("id") == "free_trial":
                    continue

                plans.append(
                    {
                        "id": sub.get("id"),
                        "name": sub.get("plan_name"),
                        "type": sub.get("plan_type"),
                        "price": str(sub.get("price")),
                        "period": sub.get("billing_cycle"),
                        "features": sub.get("features"),
                        "limits": {
                            "integrations": sub.get("max_integrations"),
                            "family_members": sub.get("max_family_members"),
                            "storage_gb": sub.get("storage_limit_gb"),
                        },
                    }
                )

            # Fetch current user subscription
            user_subscription = DBHelper.find_one(
                table_name="user_subscriptions",
                filters={"user_id": uid, "subscription_status": Status.ACTIVE.value},
                select_fields=[
                    "plan_id",
                    "subscription_status",
                    "started_at",
                    "expires_at",
                    "auto_renew",
                    "next_billing_date",
                ],
            )

            user_data = {}
            if user_subscription:
                started_at = user_subscription.get("started_at")
                days_used = 0
                if started_at:
                    if isinstance(started_at, str):
                        started_at = datetime.fromisoformat(started_at.replace("Z", ""))
                    now = datetime.utcnow()
                    days_used = (now - started_at).days

                user_data = {
                    "email": user.get("email"),
                    "plan": user_subscription.get("plan_id"),
                    "status": user_subscription.get("subscription_status"),
                    "started_at": str(user_subscription.get("started_at")),
                    "expires_at": str(user_subscription.get("expires_at")),
                    "auto_renew": user_subscription.get("auto_renew"),
                    "next_billing_date": str(user_subscription.get("next_billing_date")),
                    "days_used": days_used,
                }

            # Log successful fetch
            AuditLogger.log(
                user_id=uid,
                action="FETCH_SUBSCRIPTIONS",
                resource_type="user_subscriptions",
                resource_id=uid,
                success=True,
                metadata={"fetched_plans_count": len(plans), "user_plan": user_data.get("plan")},
            )

            return {
                "status": 1,
                "message": "Fetched subscription details",
                "payload": {
                    "user": user_data,
                    "subscriptions": plans,
                },
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="FETCH_SUBSCRIPTIONS_FAILED",
                resource_type="user_subscriptions",
                resource_id=uid,
                success=False,
                error_message=str(e),
            )
            return {"status": 0, "message": f"Failed to fetch subscriptions: {str(e)}", "payload": {}}
