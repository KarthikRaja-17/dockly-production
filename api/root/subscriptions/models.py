
from datetime import datetime
import stripe
import hmac
import hashlib
import os

# Stripe Configuration (replace with your actual keys)
# stripe.api_key = "sk_test_51RGVBuRqPKPiQK9cvyrtIcgRULawrBzhSnsa4RuLooncYOJIIplMuDOvR4QTgsCg5yTpze2Enyke9tBDkbFBZXFq00SGAKtm5z"
# STRIPE_WEBHOOK_SECRET = "whsec_2rfwaUq7CNSS3WFikrj7SWbND7BLIIOL"
from root.config import STRIPE_WEBHOOK_SECRET, WEB_URL

# from root.config import STRIPE_API_KEY
# STRIPE_API_KEY = stripe.api_key
# stripe.api_key = STRIPE_API_KEY
from root.common import Status, TrialPeriod
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required
from flask_restful import Resource
from root.helpers.logs import AuditLogger
from datetime import datetime, timedelta
from flask import request
import json

print(f"DEBUG: stripe.api_key in models.py = '{stripe.api_key}'")
print(f"DEBUG: stripe.api_key type = {type(stripe.api_key)}")
print(f"DEBUG: STRIPE_WEBHOOK_SECRET = '{STRIPE_WEBHOOK_SECRET}'")


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
            # Fetch all active subscription plans with stripe data
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
                    "stripe_price_id",
                    "trial_period_days",
                ],
            )

            plans = []
            for sub in subscriptions:
                if sub.get("id") == "free-trial":
                    continue
                plans.append(
                    {
                        "id": sub.get("id"),
                        "name": sub.get("plan_name"),
                        "type": sub.get("plan_type"),
                        "price": str(sub.get("price")),
                        "period": sub.get("billing_cycle"),
                        "features": sub.get("features"),
                        "stripe_price_id": sub.get("stripe_price_id"),
                        "trial_period_days": sub.get("trial_period_days"),
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
                    "next_billing_date": str(
                        user_subscription.get("next_billing_date")
                    ),
                    "days_used": days_used,
                }

            return {
                "status": 1,
                "message": "Fetched subscription details",
                "payload": {"user": user_data, "subscriptions": plans},
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
            return {
                "status": 0,
                "message": f"Failed to fetch subscriptions: {str(e)}",
                "payload": {},
            }


class CreateCheckoutSession(Resource):
    @auth_required()
    def post(self, uid, user):
        try:
            data = request.get_json()
            plan_id = data.get("plan_id")
            # success_url = data.get("success_url", "https://dockly.me/success")
            # cancel_url = data.get("cancel_url", "https://dockly.me/cancel")
            success_url = f"{WEB_URL}/{user.get('user_name')}/success"
            cancel_url = f"{WEB_URL}/{user.get('user_name')}/cancel"

            if not plan_id:
                return {"status": 0, "message": "Plan ID is required", "payload": {}}

            # Get plan details including trial period
            plan = DBHelper.find_one(
                table_name="subscription_plans",
                filters={"id": plan_id, "is_active": Status.ACTIVE.value},
                select_fields=[
                    "id",
                    "plan_name",
                    "stripe_price_id",
                    "trial_period_days",
                ],
            )

            if not plan or not plan.get("stripe_price_id"):
                return {
                    "status": 0,
                    "message": "Invalid subscription plan or missing Stripe configuration",
                    "payload": {},
                }

            # Create Stripe checkout session with trial period
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price": plan.get("stripe_price_id"),
                        "quantity": 1,
                    }
                ],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=user.get("email"),
                subscription_data={
                    "trial_period_days": plan.get("trial_period_days"),
                    "metadata": {
                        "user_id": uid,
                        "plan_id": plan_id,
                        "user_email": user.get("email"),
                    },
                },
                metadata={
                    "user_id": uid,
                    "plan_id": plan_id,
                    "user_email": user.get("email"),
                },
            )

            AuditLogger.log(
                user_id=uid,
                action="CREATE_CHECKOUT_SESSION",
                resource_type="stripe_checkout",
                resource_id=checkout_session.id,
                success=True,
                metadata={
                    "stripe_price_id": plan.get("stripe_price_id"),
                    "trial_days": plan.get("trial_period_days"),
                    "plan_id": plan_id,
                },
            )

            return {
                "status": 1,
                "message": "Checkout session created successfully",
                "payload": {
                    "checkout_url": checkout_session.url,
                    "session_id": checkout_session.id,
                    "trial_days": plan.get("trial_period_days", 7),
                },
            }

        except stripe.error.StripeError as e:
            AuditLogger.log(
                user_id=uid,
                action="CREATE_CHECKOUT_SESSION_FAILED",
                resource_type="stripe_checkout",
                resource_id=uid,
                success=False,
                error_message=str(e),
            )
            return {"status": 0, "message": f"Stripe error: {str(e)}", "payload": {}}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="CREATE_CHECKOUT_SESSION_FAILED",
                resource_type="stripe_checkout",
                resource_id=uid,
                success=False,
                error_message=str(e),
            )
            return {
                "status": 0,
                "message": f"Failed to create checkout session: {str(e)}",
                "payload": {},
            }


class StripeWebhook(Resource):
    def post(self):
        """Handle Stripe webhook events - no authentication required"""
        payload = request.get_data()
        sig_header = request.headers.get("Stripe-Signature")

        try:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )

            AuditLogger.log(
                user_id="system",
                action="WEBHOOK_RECEIVED",
                resource_type="stripe_webhook",
                resource_id=event.get("id"),
                success=True,
                metadata={"event_type": event["type"]},
            )

            # Handle different webhook events
            if event["type"] == "checkout.session.completed":
                return self._handle_checkout_completed(event)

            elif event["type"] == "customer.subscription.created":
                return self._handle_subscription_created(event)

            elif event["type"] == "customer.subscription.updated":
                return self._handle_subscription_updated(event)

            elif event["type"] == "customer.subscription.deleted":
                return self._handle_subscription_cancelled(event)

            elif event["type"] == "invoice.payment_succeeded":
                return self._handle_payment_succeeded(event)

            elif event["type"] == "invoice.payment_failed":
                return self._handle_payment_failed(event)

            # Return success for unhandled but valid events
            return {"status": 1, "message": f"Webhook received: {event['type']}"}, 200

        except stripe.error.SignatureVerificationError as e:
            AuditLogger.log(
                user_id="system",
                action="WEBHOOK_SIGNATURE_FAILED",
                resource_type="stripe_webhook",
                resource_id="unknown",
                success=False,
                error_message=str(e),
            )
            return {"status": 0, "message": "Invalid signature"}, 400

        except Exception as e:
            AuditLogger.log(
                user_id="system",
                action="WEBHOOK_PROCESSING_FAILED",
                resource_type="stripe_webhook",
                resource_id="unknown",
                success=False,
                error_message=str(e),
            )
            return {"status": 0, "message": f"Webhook error: {str(e)}"}, 500

    def _handle_checkout_completed(self, event):
        """Handle successful checkout completion"""
        session = event["data"]["object"]
        user_id = session.get("metadata", {}).get("user_id")
        plan_id = session.get("metadata", {}).get("plan_id")
        user_email = session.get("metadata", {}).get("user_email")

        # DEBUG: Add debug output for extracted metadata
        print(f"DEBUG: user_id = '{user_id}', type = {type(user_id)}")
        print(f"DEBUG: plan_id = '{plan_id}'")
        print(f"DEBUG: user_email = '{user_email}'")
        print(
            f"DEBUG: Status.ACTIVE.value = '{Status.ACTIVE.value}', type = {type(Status.ACTIVE.value)}"
        )

        if not user_id and user_email:
            print("DEBUG: user_id not found, trying to find by email")
            # Fallback: find user by email
            user = DBHelper.find_one(
                table_name="users", filters={"email": user_email}, select_fields=["uid"]
            )
            user_id = user.get("uid") if user else None
            print(f"DEBUG: Found user_id from email: '{user_id}'")

        if not user_id or not plan_id:
            print(
                f"DEBUG: Missing required metadata - user_id: {user_id}, plan_id: {plan_id}"
            )
            AuditLogger.log(
                user_id=user_id or "unknown",
                action="CHECKOUT_COMPLETED_FAILED",
                resource_type="subscription_activation",
                resource_id=session.get("id"),
                success=False,
                error_message="Missing user_id or plan_id in session metadata",
            )
            return {"status": 0, "message": "Missing required metadata"}, 400

        try:
            print("DEBUG: About to retrieve Stripe subscription")
            # Get subscription from Stripe session
            if session.get("subscription"):
                stripe_subscription = stripe.Subscription.retrieve(
                    session["subscription"]
                )
                print(f"DEBUG: Retrieved Stripe subscription: {stripe_subscription.id}")

                # Calculate trial and billing dates
                now = datetime.utcnow()
                trial_end = None
                next_billing_date = None

                # Safely check for trial_end (exists during trial period)
                if (
                    hasattr(stripe_subscription, "trial_end")
                    and stripe_subscription.trial_end
                ):
                    trial_end = datetime.fromtimestamp(stripe_subscription.trial_end)
                    print(f"DEBUG: trial_end = {trial_end}")

                # Safely check for current_period_end (may not exist during trial)
                if (
                    hasattr(stripe_subscription, "current_period_end")
                    and stripe_subscription.current_period_end
                ):
                    next_billing_date = datetime.fromtimestamp(
                        stripe_subscription.current_period_end
                    )
                    print(f"DEBUG: next_billing_date = {next_billing_date}")
                else:
                    print(
                        "DEBUG: current_period_end not available (probably in trial period)"
                    )

                print("DEBUG: About to check for existing subscription")
                # Check if user already has an active subscription
                existing_subscription = DBHelper.find_one(
                    table_name="user_subscriptions",
                    filters={
                        "user_id": user_id,
                        "subscription_status": Status.ACTIVE.value,
                    },
                )

                print(f"DEBUG: existing_subscription = {existing_subscription}")

                if existing_subscription:
                    print("DEBUG: About to update existing subscription")
                    # Update existing subscription
                    result = DBHelper.update_one(
                        table_name="user_subscriptions",
                        filters={
                            "user_id": user_id,
                            "subscription_status": Status.ACTIVE.value,
                        },
                        updates={
                            "plan_id": plan_id,
                            "stripe_subscription_id": session["subscription"],
                            "trial_ends_at": trial_end,
                            "next_billing_date": next_billing_date,
                            "updated_at": now,
                        },
                    )
                    print(f"DEBUG: Update result = {result}")
                    if not result:
                        print("WARNING: No records were updated!")
                    else:
                        print("SUCCESS: Subscription updated successfully")
                else:
                    print("DEBUG: About to create new subscription")
                    # Create new subscription
                    result = DBHelper.insert(
                        table_name="user_subscriptions",
                        user_id=user_id,
                        plan_id=plan_id,
                        subscription_status=Status.ACTIVE.value,
                        stripe_subscription_id=session["subscription"],
                        started_at=now,
                        trial_ends_at=trial_end,
                        next_billing_date=next_billing_date,
                        auto_renew=True,
                        created_at=now,
                        updated_at=now,
                    )
                    print(f"DEBUG: Insert result = {result}")

                print("DEBUG: About to log audit entry")
                AuditLogger.log(
                    user_id=user_id,
                    action="SUBSCRIPTION_ACTIVATED_VIA_WEBHOOK",
                    resource_type="user_subscriptions",
                    resource_id=user_id,
                    success=True,
                    metadata={
                        "stripe_session_id": session.get("id"),
                        "stripe_subscription_id": session["subscription"],
                        "plan_id": plan_id,
                        "trial_end": str(trial_end) if trial_end else None,
                    },
                )
                print("DEBUG: Audit log completed successfully")

                return {
                    "status": 1,
                    "message": "Subscription activated successfully",
                }, 200
            else:
                print("DEBUG: No subscription found in session")
                return {"status": 0, "message": "No subscription found in session"}, 400

        except Exception as e:
            print(f"DEBUG: Exception occurred: {str(e)}")
            print(f"DEBUG: Exception type: {type(e)}")
            import traceback

            traceback.print_exc()

            AuditLogger.log(
                user_id=user_id,
                action="SUBSCRIPTION_ACTIVATION_FAILED",
                resource_type="user_subscriptions",
                resource_id=user_id,
                success=False,
                error_message=str(e),
            )
            return {
                "status": 0,
                "message": f"Failed to activate subscription: {str(e)}",
            }, 500

    def _handle_subscription_created(self, event):
        """Handle subscription creation events"""
        subscription = event["data"]["object"]
        user_id = subscription.get("metadata", {}).get("user_id")

        AuditLogger.log(
            user_id=user_id or "unknown",
            action="SUBSCRIPTION_CREATED_WEBHOOK",
            resource_type="stripe_subscription",
            resource_id=subscription.get("id"),
            success=True,
            metadata={"subscription_id": subscription.get("id")},
        )

        return {"status": 1, "message": "Subscription created event processed"}, 200

    def _handle_subscription_updated(self, event):
        """Handle subscription updates (plan changes, trial ending, etc.)"""
        subscription = event["data"]["object"]
        stripe_subscription_id = subscription.get("id")

        try:
            # Find and update the subscription in our database
            user_subscription = DBHelper.find_one(
                table_name="user_subscriptions",
                filters={"stripe_subscription_id": stripe_subscription_id},
            )

            if user_subscription:
                # Update subscription details
                next_billing_date = None
                if subscription.get("current_period_end"):
                    next_billing_date = datetime.fromtimestamp(
                        subscription["current_period_end"]
                    )

                DBHelper.update_one(
                    table_name="user_subscriptions",
                    filters={"stripe_subscription_id": stripe_subscription_id},
                    updates={
                        "next_billing_date": next_billing_date,
                        "updated_at": datetime.utcnow(),
                    },
                )

                AuditLogger.log(
                    user_id=user_subscription.get("user_id"),
                    action="SUBSCRIPTION_UPDATED_VIA_WEBHOOK",
                    resource_type="user_subscriptions",
                    resource_id=user_subscription.get("user_id"),
                    success=True,
                    metadata={"stripe_subscription_id": stripe_subscription_id},
                )

        except Exception as e:
            AuditLogger.log(
                user_id="unknown",
                action="SUBSCRIPTION_UPDATE_FAILED",
                resource_type="stripe_subscription",
                resource_id=stripe_subscription_id,
                success=False,
                error_message=str(e),
            )

        return {"status": 1, "message": "Subscription updated event processed"}, 200

    def _handle_subscription_cancelled(self, event):
        """Handle subscription cancellation"""
        subscription = event["data"]["object"]
        stripe_subscription_id = subscription.get("id")

        try:
            # Update subscription status to cancelled
            DBHelper.update_one(
                table_name="user_subscriptions",
                filters={"stripe_subscription_id": stripe_subscription_id},
                updates={
                    "subscription_status": Status.REMOVED.value,  # or whatever cancelled status you use
                    "cancelled_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                },
            )

            AuditLogger.log(
                user_id="unknown",  # Could enhance this by finding user_id
                action="SUBSCRIPTION_CANCELLED_VIA_WEBHOOK",
                resource_type="stripe_subscription",
                resource_id=stripe_subscription_id,
                success=True,
                metadata={"stripe_subscription_id": stripe_subscription_id},
            )

        except Exception as e:
            AuditLogger.log(
                user_id="unknown",
                action="SUBSCRIPTION_CANCELLATION_FAILED",
                resource_type="stripe_subscription",
                resource_id=stripe_subscription_id,
                success=False,
                error_message=str(e),
            )

        return {"status": 1, "message": "Subscription cancelled event processed"}, 200

    def _handle_payment_succeeded(self, event):
        """Handle successful payments"""
        invoice = event["data"]["object"]
        stripe_subscription_id = invoice.get("subscription")

        AuditLogger.log(
            user_id="unknown",
            action="PAYMENT_SUCCEEDED_WEBHOOK",
            resource_type="stripe_payment",
            resource_id=invoice.get("id"),
            success=True,
            metadata={
                "invoice_id": invoice.get("id"),
                "subscription_id": stripe_subscription_id,
                "amount": invoice.get("amount_paid"),
            },
        )

        return {"status": 1, "message": "Payment succeeded event processed"}, 200

    def _handle_payment_failed(self, event):
        """Handle failed payments"""
        invoice = event["data"]["object"]
        stripe_subscription_id = invoice.get("subscription")

        AuditLogger.log(
            user_id="unknown",
            action="PAYMENT_FAILED_WEBHOOK",
            resource_type="stripe_payment",
            resource_id=invoice.get("id"),
            success=False,
            metadata={
                "invoice_id": invoice.get("id"),
                "subscription_id": stripe_subscription_id,
                "amount": invoice.get("amount_due"),
            },
        )

        return {"status": 1, "message": "Payment failed event processed"},200
