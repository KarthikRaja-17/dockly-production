from flask import Blueprint
from flask_restful import Api

settings_bp = Blueprint("settings", __name__, url_prefix="/server/api/settings")
settings_api = Api(settings_bp)

from . import __routes__
