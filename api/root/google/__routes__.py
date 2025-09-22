from .models import (
    AddEvent,
    AddGoogleCalendar,
    AddGoogleCalendarEvent,
    GetCalendarEvents,
    GoogleCallback,
  
)
from . import google_api


google_api.add_resource(AddGoogleCalendar, "/add-googleCalendar")
google_api.add_resource(GoogleCallback, "/auth/callback/google")
# google_api.add_resource(GetCalendarEvents, "/get/calendar/events")
google_api.add_resource(AddGoogleCalendarEvent, "/add/calendar/events")
google_api.add_resource(AddEvent, "/add/event")
