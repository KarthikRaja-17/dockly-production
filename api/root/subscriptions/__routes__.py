from .models import GetSubscriptions
from . import subscriptions_api

subscriptions_api.add_resource(GetSubscriptions, "/get/subscriptions")
