from .models import *
from . import medications_api

medications_api.add_resource(AddMedication, "")
medications_api.add_resource(GetMedications, "")
medications_api.add_resource(UpdateMedication, "/<int:medication_id>")
medications_api.add_resource(GetRefillAlerts, "/refill-alerts")