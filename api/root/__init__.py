
from datetime import timedelta

from flask import Flask, app, json, jsonify, request
from flask_jwt_extended import JWTManager
from flask_restful import Api
from flask_cors import CORS
from root.config import G_SECRET_KEY, WEB_URL
from root.db.db import postgres

api = Api()
jwt = JWTManager()


def create_app(test_config=None):
    app = Flask(
        __name__,
        instance_relative_config=True,
        #   static_folder="assets",
        #   static_url_path="/static",
    )
    app.secret_key = G_SECRET_KEY
    CORS(app)
    postgres.init_app()
    jwt.init_app(app)
    #     base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../web"))

    # # Launch the frontend
    #     subprocess.Popen(["yarn.cmd", "start"], cwd=base_dir, shell=True)
    from root.users import users_bp

    app.register_blueprint(users_bp)
    from root.db import db_bp

    app.register_blueprint(db_bp)
    from root.bookmarks import bookmarks_bp

    app.register_blueprint(bookmarks_bp)
    from root.general import general_bp

    app.register_blueprint(general_bp)
    from root.google import google_bp

    app.register_blueprint(google_bp)
    from root.dropbox import dropbox_bp

    app.register_blueprint(dropbox_bp)
    from root.microsoft import microsoft_bp

    app.register_blueprint(microsoft_bp)
    from root.settings import settings_bp

    from root.family import family_bp

    app.register_blueprint(family_bp)

    app.register_blueprint(settings_bp)

  
    from root.dashboard import dashboard_bp

    app.register_blueprint(dashboard_bp)
    from root.planner import planner_bp

    app.register_blueprint(planner_bp)
    from root.notifications import notifications_bp

    app.register_blueprint(notifications_bp)
    from root.home import home_bp

    app.register_blueprint(home_bp)
    from root.files import google_drive_bp

    app.register_blueprint(google_drive_bp)

    app.permanent_session_lifetime = timedelta(minutes=60)
    # initialize_firebase()

    # Import health modules
    from root.health.wellness import wellness_bp
    from root.health.medications import medications_bp
    from root.health.providers import providers_bp
    from root.health.insurance import insurance_bp
    from root.health.summary import summary_bp
    from root.admin import admin_users_bp

    app.register_blueprint(admin_users_bp)

    # Register all health modules
    app.register_blueprint(wellness_bp)
    app.register_blueprint(medications_bp)
    app.register_blueprint(providers_bp)
    app.register_blueprint(insurance_bp)
    app.register_blueprint(summary_bp)
    
    # Import and register Fitbit module
    from root.fitbit import fitbit_bp
    app.register_blueprint(fitbit_bp)


    #  from root.admin.users import admin_users_bp

    #  app.register_blueprint(admin_users_bp)
    return app


