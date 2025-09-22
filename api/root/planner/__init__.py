from flask import Blueprint
from flask_restful import Api

planner_bp = Blueprint("planner", __name__, url_prefix="/server/api")
planner_api = Api(planner_bp)

from . import __routes__
