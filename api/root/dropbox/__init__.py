from flask import Blueprint
from flask_restful import Api

dropbox_bp = Blueprint("dropbox", __name__, url_prefix="/server/api")
dropbox_api = Api(dropbox_bp)

from . import __routes__
