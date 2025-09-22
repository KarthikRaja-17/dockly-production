from flask import Blueprint
from flask_restful import Api

google_bp = Blueprint("google", __name__, url_prefix="/server/api")
google_api = Api(google_bp)

from . import __routes__
