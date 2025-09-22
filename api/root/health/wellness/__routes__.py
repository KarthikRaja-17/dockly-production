from .models import *
from . import wellness_api

wellness_api.add_resource(AddWellnessTask, "/tasks")
wellness_api.add_resource(GetWellnessTasks, "/tasks")
wellness_api.add_resource(UpdateWellnessTask, "/tasks/<int:task_id>")
wellness_api.add_resource(ToggleWellnessTask, "/tasks/<int:task_id>/toggle")