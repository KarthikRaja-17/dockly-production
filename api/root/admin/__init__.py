from flask import Blueprint
from flask_restful import Api

admin_users_bp = Blueprint("admin_users", __name__, url_prefix="/server/api")
admin_users_api = Api(admin_users_bp)

from . import __routes__
