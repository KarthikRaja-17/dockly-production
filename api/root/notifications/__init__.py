from flask import Blueprint
from flask_restful import Api


notifications_bp = Blueprint("notifications", __name__, url_prefix="/server/api")
notifications_api = Api(notifications_bp)

from . import __routes__
