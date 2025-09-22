from flask import Blueprint
from flask_restful import Api

family_bp = Blueprint("family", __name__, url_prefix="/server/api")
family_api = Api(family_bp)

from . import __routes__
