from flask import Blueprint
from flask_restful import Api


dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/server/api")
dashboard_api = Api(dashboard_bp)

from . import __routes__
