from dotenv import load_dotenv, find_dotenv
import os
from datetime import timedelta
import firebase_admin
from firebase_admin import auth, credentials
import stripe
load_dotenv(find_dotenv()) 

load_dotenv()  # Load variables from .env file

# Configs
POSTGRES_URI = os.getenv("POSTGRES_URI")
print(f"POSTGRES_URI loaded: {POSTGRES_URI}")
WISHLIST_POSTGRES_URI = os.getenv("WISHLIST_POSTGRES_URI")

CLIENT_SECRET = os.getenv("CLIENT_SECRET")
DROPBOX_CLIENT_ID = os.getenv("DROPBOX_CLIENT_ID")
DROPBOX_CLIENT_SECRET = os.getenv("DROPBOX_CLIENT_SECRET")
DROPBOX_REDIRECT_URI = os.getenv("DROPBOX_REDIRECT_URI")
CLIENT_ID = os.getenv("CLIENT_ID")

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT") or 587)
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
G_ACCESS_EXPIRES = timedelta(minutes=50000000)
G_REFRESH_EXPIRES = timedelta(days=30)
G_SECRET_KEY = os.getenv("G_SECRET_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
SEND_GRID_EMAIL = os.getenv("SEND_GRID_EMAIL")

AUTH_ENDPOINT = os.getenv("QUILTT_API_SECRET_KEY")

API_SECRET_KEY = "https://auth.quiltt.io/v1/users/sessions"
# API_URL = "http://localhost:5000/server/api"
# API_URL = "https://dockly.onrender.com/server/api"
# # WEB_URL = "http://192.168.1.14:3000"
# WEB_URL = "https://docklyme.vercel.app"

API_URL = os.getenv("API_URL", "http://localhost:5000/server/api")
print(f"API_URL: {API_URL}")
WEB_URL = os.getenv("WEB_URL", "http://localhost:3000")
print(f"WEB_URL: {WEB_URL}")
uri = "https://oauth2.googleapis.com/token"

SCOPE = (
    "email profile "
    "https://www.googleapis.com/auth/calendar "
    "https://www.googleapis.com/auth/drive "
    "https://www.googleapis.com/auth/fitness.activity.read "
    "https://www.googleapis.com/auth/fitness.body.read "
    "https://www.googleapis.com/auth/fitness.location.read "
    "https://www.googleapis.com/auth/fitness.sleep.read "
    "https://www.googleapis.com/auth/userinfo.email "
    "https://www.googleapis.com/auth/userinfo.profile "
    "openid"
)


# firebase_cred_path = os.getenv("FIREBASE_CRED_PATH")
# cred = credentials.Certificate(firebase_cred_path)
# firebase_admin.initialize_app(cred)


# Fitbit Configuration
FITBIT_CLIENT_ID = os.getenv("FITBIT_CLIENT_ID")
FITBIT_CLIENT_SECRET = os.getenv("FITBIT_CLIENT_SECRET")
FITBIT_REDIRECT_URI = os.getenv("FITBIT_REDIRECT_URI", f"{API_URL}/auth/callback/fitbit")
FITBIT_API_BASE = "https://api.fitbit.com/1"
FITBIT_TOKEN_URI = "https://api.fitbit.com/oauth2/token"
FITBIT_SCOPES = "activity heartrate profile sleep weight"

stripe.api_key = os.getenv("STRIPE_API_KEY")
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")