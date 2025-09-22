from flask import Blueprint
from flask_restful import Api

# Create insurance blueprint with full path to match frontend API calls
insurance_bp = Blueprint("insurance", __name__, url_prefix="/server/api/health/insurance")
insurance_api = Api(insurance_bp)

from . import __routes__