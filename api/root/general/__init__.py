from flask import Blueprint
from flask_restful import Api


general_bp = Blueprint('general', __name__, url_prefix='/server/api')
general_api = Api(general_bp)

from . import __routes__
