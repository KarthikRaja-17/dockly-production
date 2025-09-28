from .models import GetSubscriptions, CreateCheckoutSession, StripeWebhook
from . import subscriptions_api

subscriptions_api.add_resource(GetSubscriptions, "/get/subscriptions")
subscriptions_api.add_resource(CreateCheckoutSession, "/create-checkout-session")
subscriptions_api.add_resource(StripeWebhook, "/webhooks/stripe")
