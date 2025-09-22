
from flask import Blueprint
from flask_restful import Api

# Create main health blueprint - but don't give it the full URL prefix yet
health_bp = Blueprint("health", __name__)

# Import and register the sub-blueprints directly
from .wellness import wellness_bp
from .medications import medications_bp
from .providers import providers_bp
from .insurance import insurance_bp
from .summary import summary_bp

# Register sub-blueprints on the main health blueprint
health_bp.register_blueprint(wellness_bp)
health_bp.register_blueprint(medications_bp)
health_bp.register_blueprint(providers_bp)
health_bp.register_blueprint(insurance_bp)
health_bp.register_blueprint(summary_bp)
