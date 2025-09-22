from flask import Blueprint
from flask_restful import Api

db_bp = Blueprint("db", __name__, url_prefix="/server/api")
db_api = Api(db_bp)

from . import __routes__
