from flask import Blueprint
from flask_restful import Api

vault_bp = Blueprint("vault", __name__, url_prefix="/server/api/vault")
vault_api = Api(vault_bp)

from . import __routes__

# from flask import Blueprint
# from flask_restful import Api
# from flask_cors import CORS

# vault_bp = Blueprint("vault", __name__, url_prefix="/server/api/vault")
# vault_api = Api(vault_bp)

# CORS(vault_bp, resources={r"/*": {"origins": "http://localhost:3000"}})

# from . import __routes__
