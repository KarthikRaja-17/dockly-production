from .models import AddNotifications
from . import settings_api


settings_api.add_resource(AddNotifications, "/notifications")
