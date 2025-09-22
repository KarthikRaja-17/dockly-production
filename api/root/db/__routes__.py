# from .createTables import CreateTables
from .createTables import CreateTables
from . import db_api

db_api.add_resource(CreateTables, "/create-tables")
