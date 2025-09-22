from flask_restful import Resource
from root.db.db import init_tables_from_json, upload_static_data_from_json


class CreateTables(Resource):
    def post(self):
        table_result = init_tables_from_json()
        data_result = upload_static_data_from_json()

        return {"tables_created": table_result, "static_data_inserted": data_result}
