from .models import *
from . import summary_api

# Health Summary Info routes
summary_api.add_resource(HealthSummaryInfo, "/info")

# User Allergies routes
summary_api.add_resource(UserAllergies, "/allergies")
summary_api.add_resource(ManageAllergy, "/allergies/<int:allergy_id>")

# User Conditions routes
summary_api.add_resource(UserConditions, "/conditions")
summary_api.add_resource(ManageCondition, "/conditions/<int:condition_id>")

# Family Medical History routes
summary_api.add_resource(FamilyMedicalHistory, "/family-history")
summary_api.add_resource(ManageFamilyHistory, "/family-history/<int:history_id>")
