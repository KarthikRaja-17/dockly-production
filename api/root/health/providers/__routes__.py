from .models import *
from . import providers_api

providers_api.add_resource(AddProvider, "")
providers_api.add_resource(GetProviders, "")
providers_api.add_resource(UpdateProvider, "/<int:provider_id>")