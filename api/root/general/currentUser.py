from flask import request
from flask_restful import Resource
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required


class CurrentUser(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        if not uid:
            return {"status": 0, "msg": "Not logged in", "payload": {}}

        return {
            "status": 1,
            "msg": "Success",
            "payload": {"user": user, "uid": uid},
        }
