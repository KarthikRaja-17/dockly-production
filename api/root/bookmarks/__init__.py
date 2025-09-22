from flask import Blueprint
from flask_restful import Api

bookmarks_bp = Blueprint("bookmarks", __name__, url_prefix="/server/api/bookmarks")
bookmarks_api = Api(bookmarks_bp)

from . import __routes__
