from .models import *
from . import insurance_api

insurance_api.add_resource(AddInsurance, "")
insurance_api.add_resource(GetInsurance, "")
insurance_api.add_resource(UpdateInsurance, "/<int:insurance_id>")