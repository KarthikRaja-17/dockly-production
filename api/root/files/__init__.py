from flask import Blueprint
from flask_restful import Api

google_drive_bp = Blueprint("google_drive", __name__, url_prefix="/server/api/drive")
google_drive_api = Api(google_drive_bp)

from . import __routes__
