from flask import Blueprint
from flask_restful import Api

microsoft_bp = Blueprint("microsoft", __name__, url_prefix="/server/api")
microsoft_api = Api(microsoft_bp)

from . import __routes__
