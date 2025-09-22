from flask import Blueprint
from flask_restful import Api

# Create providers blueprint with full path to match frontend API calls
providers_bp = Blueprint("providers", __name__, url_prefix="/server/api/health/providers")
providers_api = Api(providers_bp)

from . import __routes__