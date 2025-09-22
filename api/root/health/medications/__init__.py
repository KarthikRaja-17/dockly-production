from flask import Blueprint
from flask_restful import Api

# Create medications blueprint with full path to match frontend API calls
medications_bp = Blueprint("medications", __name__, url_prefix="/server/api/health/medications")
medications_api = Api(medications_bp)

from . import __routes__