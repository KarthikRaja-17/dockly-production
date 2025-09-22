from flask import Blueprint
from flask_restful import Api


subscriptions_bp = Blueprint("subscriptions", __name__, url_prefix="/server/api")
subscriptions_api = Api(subscriptions_bp)

from . import __routes__
