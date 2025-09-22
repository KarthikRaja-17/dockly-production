from flask import Blueprint
from flask_restful import Api

wellness_bp = Blueprint("wellness", __name__, url_prefix="/server/api/health/wellness")
wellness_api = Api(wellness_bp)

from . import __routes__