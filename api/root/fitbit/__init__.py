from flask import Blueprint
from flask_restful import Api

fitbit_bp = Blueprint("fitbit", __name__, url_prefix="/server/api")
fitbit_api = Api(fitbit_bp)

from . import __routes__