from flask import Blueprint
from flask_restful import Api


home_bp = Blueprint("home", __name__, url_prefix="/server/api")
home_api = Api(home_bp)

from . import __routes__
