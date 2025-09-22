from flask import Blueprint
from flask_restful import Api

# Create summary blueprint with full path to match frontend API calls
summary_bp = Blueprint("summary", __name__, url_prefix="/server/api/health/summary")
summary_api = Api(summary_bp)

from . import __routes__