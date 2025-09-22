import traceback
from flask import request, make_response, redirect, session
from flask_jwt_extended import create_access_token
from flask_restful import Resource
import requests
import json
from datetime import datetime, timedelta
from urllib.parse import quote

from root.common import Status
from root.config import (
    DROPBOX_CLIENT_ID,
    DROPBOX_CLIENT_SECRET,
    DROPBOX_REDIRECT_URI,
    WEB_URL,
)
from root.helpers.logs import AuditLogger

from root.db.dbHelper import DBHelper

class AddDropbox(Resource):
    """
    Initiate Dropbox OAuth flow
    """

    def get(self):
        try:  
            username = request.args.get("username")
            uid = request.args.get("userId")

            if not username or not uid:
                AuditLogger.log(
                    user_id=uid or "unknown",
                    action="dropbox_oauth_init",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message="Missing username or userId",
                    metadata={"params": request.args.to_dict()}
                )
                return {"error": "Missing username or userId"}, 400

            # Store user data in session
            session["username"] = username
            session["user_id"] = uid

            # Create state data
            state_data = json.dumps({"user_id": uid, "username": username})
            encoded_state = quote(state_data)

            # Dropbox OAuth URL
            auth_url = (
                "https://www.dropbox.com/oauth2/authorize"
                f"?response_type=code"
                f"&client_id={DROPBOX_CLIENT_ID}"
                f"&redirect_uri={DROPBOX_REDIRECT_URI}"
                f"&state={encoded_state}"
                f"&token_access_type=offline"
                f"&force_reapprove=false"
            )

            # Log success
            AuditLogger.log(
                user_id=uid,
                action="dropbox_oauth_init",
                resource_type="dropbox",
                resource_id=None,
                success=True,
                metadata={
                    "username": username,
                    "redirect_uri": DROPBOX_REDIRECT_URI,
                    "state": state_data,
                    "auth_url": auth_url,
                }
            )

            return make_response(redirect(auth_url))

        except Exception as e:
            # ✅ Any error gets logged with stack trace info
            AuditLogger.log(
                user_id=request.args.get("userId") or "unknown",
                action="dropbox_oauth_init",
                resource_type="dropbox",
                resource_id=None,
                success=False,
                error_message="Dropbox OAuth init failed", 
                metadata={
                    "error_type": type(e).__name__,
                    "error": str(e),
                    "params": request.args.to_dict(),
                }
            )
            return {"error": f"Dropbox OAuth init failed: {str(e)}"}, 500



class DropboxCallback(Resource):
    """
    Handle Dropbox OAuth callback
    """

    def get(self):
        try:
            code = request.args.get("code")
            state = request.args.get("state")
            error = request.args.get("error")

            # Handle OAuth errors
            if error:
                AuditLogger.log(
                    user_id="unknown",
                    action="dropbox_oauth_callback",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message=f"Dropbox OAuth error: {error}",
                    metadata={"params": request.args.to_dict()},
                )
                return {"error": f"Dropbox OAuth error: {error}"}, 400

            if not code or not state:
                AuditLogger.log(
                    user_id="unknown",
                    action="dropbox_oauth_callback",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message="Missing authorization code or state",
                    metadata={"params": request.args.to_dict()},
                )
                return {"error": "Missing authorization code or state"}, 400

            # Validate and extract state data
            try:
                state_data = json.loads(state)
                user_id = state_data.get("user_id")
                username = state_data.get("username")

                if not user_id:
                    AuditLogger.log(
                        user_id="unknown",
                        action="dropbox_oauth_callback",
                        resource_type="dropbox",
                        resource_id=None,
                        success=False,
                        error_message="Invalid state data: missing user_id",
                        metadata={"state": state},
                    )
                    return {"error": "Invalid state data"}, 400

            except json.JSONDecodeError as e:
                AuditLogger.log(
                    user_id="unknown",
                    action="dropbox_oauth_callback",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message=str(e),  # store actual parsing error
                    metadata={"state": state, "error_type": type(e).__name__},
                )
                return {"error": "Invalid state format"}, 400

            # Step 1: Exchange authorization code for access token
            token_url = "https://api.dropboxapi.com/oauth2/token"
            token_data = {
                "code": code,
                "grant_type": "authorization_code",
                "client_id": DROPBOX_CLIENT_ID,
                "client_secret": DROPBOX_CLIENT_SECRET,
                "redirect_uri": DROPBOX_REDIRECT_URI,
            }

            try:
                token_response = requests.post(token_url, data=token_data)
            except Exception as e:
                AuditLogger.log(
                    user_id=user_id,
                    action="dropbox_oauth_token_exchange",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message=str(e),
                    metadata={"error_type": type(e).__name__, "token_url": token_url},
                )
                return {"error": "Token request failed"}, 500

            if token_response.status_code != 200:
                AuditLogger.log(
                    user_id=user_id,
                    action="dropbox_oauth_token_exchange",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message=f"Token exchange failed ({token_response.status_code})",
                    metadata={"response": token_response.text},
                )
                return {"error": "Token exchange failed"}, 400

            token_json = token_response.json()
            access_token = token_json.get("access_token")
            refresh_token = token_json.get("refresh_token")
            expires_in = token_json.get("expires_in", 14400)

            if not access_token:
                AuditLogger.log(
                    user_id=user_id,
                    action="dropbox_oauth_token_exchange",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message="No access token received",
                    metadata={"response": token_json},
                )
                return {"error": "No access token received"}, 400

            # Step 2: Get user account info
            try:
                user_info_response = requests.post(
                    "https://api.dropboxapi.com/2/users/get_current_account",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/json",
                    },
                    data=json.dumps(None),
                )
            except Exception as e:
                AuditLogger.log(
                    user_id=user_id,
                    action="dropbox_oauth_userinfo",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message=str(e),
                    metadata={"error_type": type(e).__name__},
                )
                return {"error": "User info request failed"}, 500

            if user_info_response.status_code != 200:
                AuditLogger.log(
                    user_id=user_id,
                    action="dropbox_oauth_userinfo",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message=f"Failed to fetch user info ({user_info_response.status_code})",
                    metadata={"response": user_info_response.text},
                )
                return {
                    "error": "Failed to fetch user info",
                    "details": user_info_response.text,
                }, 400

            user_info = user_info_response.json()
            email = user_info.get("email")

            if not email:
                AuditLogger.log(
                    user_id=user_id,
                    action="dropbox_oauth_userinfo",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message="Email not found in Dropbox account",
                    metadata={"user_info": user_info},
                )
                return {"error": "Email not found in Dropbox account"}, 400

            # Step 3: Get space usage
            try:
                space_usage_response = requests.post(
                    "https://api.dropboxapi.com/2/users/get_space_usage",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                space_info = (
                    space_usage_response.json()
                    if space_usage_response.status_code == 200
                    else {}
                )
            except Exception as e:
                AuditLogger.log(
                    user_id=user_id,
                    action="dropbox_oauth_space_usage",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message=str(e),
                    metadata={"error_type": type(e).__name__},
                )
                space_info = {}

            # Step 4: Create user object
            user = {
                "id": user_id,
                "email": email,
                "name": user_info.get("name", {}).get("display_name", email.split("@")[0]),
                "account_id": user_info.get("account_id"),
                "country": user_info.get("country"),
                "locale": user_info.get("locale"),
                "profile_photo_url": user_info.get("profile_photo_url"),
                "space_usage": space_info.get("used", 0),
                "space_allocation": space_info.get("allocation", {}).get("allocated", 0),
            }

            # Step 5: Upsert connected account
            try:
                existing_account = DBHelper.find_one(
                    "connected_accounts",
                    filters={"user_id": user_id, "email": email, "provider": "dropbox"},
                    select_fields=["id"],
                )

                if existing_account:
                    updates = {
                        "access_token": access_token,
                        "is_active": Status.ACTIVE.value,
                        "expires_at": (datetime.utcnow() + timedelta(seconds=expires_in)).isoformat(),
                        "user_object": json.dumps(user),
                    }
                    if refresh_token:
                        updates["refresh_token"] = refresh_token

                    DBHelper.update_one(
                        table_name="connected_accounts",
                        filters={"id": existing_account["id"]},
                        updates=updates,
                    )
                    account_id = existing_account["id"]
                else:
                    insert_data = {
                        "user_id": user_id,
                        "email": email,
                        "access_token": access_token,
                        "provider": "dropbox",
                        "is_active": Status.ACTIVE.value,
                        "expires_at": (datetime.utcnow() + timedelta(seconds=expires_in)).isoformat(),
                        "user_object": json.dumps(user),
                    }
                    if refresh_token:
                        insert_data["refresh_token"] = refresh_token

                    account_id = DBHelper.insert("connected_accounts", return_column="id", **insert_data)

            except Exception as e:
                AuditLogger.log(
                    user_id=user_id,
                    action="dropbox_oauth_db_upsert",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message=str(e),
                    metadata={"error_type": type(e).__name__},
                )
                return {"error": "Failed to save Dropbox account"}, 500

            # ✅ Audit success
            AuditLogger.log(
                user_id=user_id,
                action="dropbox_oauth_connected",
                resource_type="dropbox",
                resource_id=account_id,
                success=True,
                metadata={"email": email, "account_id": user.get("account_id")},
            )

            # Step 6: Create JWT token
            jwt_token = create_access_token(
                identity=user["id"],
                additional_claims={
                    "email": user["email"],
                    "name": user["name"],
                    "profile_photo_url": user.get("profile_photo_url"),
                    "provider": "dropbox",
                },
            )

            # Step 7: Redirect back to client
            redirect_url = f"{WEB_URL}/{username}/oauth/callback?token={jwt_token}"
            return redirect(redirect_url)

        except Exception as e:
            # ✅ Log unexpected errors with type + message
            AuditLogger.log(
                user_id="unknown",
                action="dropbox_oauth_callback",
                resource_type="dropbox",
                resource_id=None,
                success=False,
                error_message=str(e),
                metadata={
                    "error_type": type(e).__name__,
                    "params": request.args.to_dict(),
                },
            )
            return {"error": f"Unexpected error in Dropbox callback: {str(e)}"}, 500

class RefreshDropboxToken(Resource):
    """
    Refresh Dropbox access token using refresh token
    """

    def post(self):
        data = request.get_json(silent=True) or {}
        refresh_token = data.get("refresh_token")
        user_id = data.get("user_id")

        if not refresh_token or not user_id:
            AuditLogger.log(
                user_id=user_id or "unknown",
                action="DROPBOX_REFRESH_TOKEN_FAILED",
                resource_type="dropbox",
                resource_id=None,
                success=False,
                error_message="Missing refresh_token or user_id",
                metadata={"input": data},
            )
            return {"status": 0, "message": "Missing refresh_token or user_id"}, 400

        try:
            # Step 1: Refresh token request
            token_url = "https://api.dropboxapi.com/oauth2/token"
            token_data = {
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": DROPBOX_CLIENT_ID,
                "client_secret": DROPBOX_CLIENT_SECRET,
            }

            response = requests.post(token_url, data=token_data)

            if response.status_code != 200:
                AuditLogger.log(
                    user_id=user_id,
                    action="DROPBOX_REFRESH_TOKEN_FAILED",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message="Token refresh failed",
                    metadata={
                        "status_code": response.status_code,
                        "response": response.text,
                    },
                )
                return {"status": 0, "message": "Token refresh failed"}, 400

            token_json = response.json()
            new_access_token = token_json.get("access_token")
            expires_in = token_json.get("expires_in", 14400)

            if not new_access_token:
                AuditLogger.log(
                    user_id=user_id,
                    action="DROPBOX_REFRESH_TOKEN_FAILED",
                    resource_type="dropbox",
                    resource_id=None,
                    success=False,
                    error_message="No access token received",
                    metadata=token_json,
                )
                return {"status": 0, "message": "No access token received"}, 400

            # Step 2: Update DB
            DBHelper.update_one(
                table_name="connected_accounts",
                filters={"user_id": user_id, "provider": "dropbox"},
                updates={
                    "access_token": new_access_token,
                    "expires_at": (datetime.utcnow() + timedelta(seconds=expires_in)).isoformat(),
                },
            )

            # ✅ Success log
            AuditLogger.log(
                user_id=user_id,
                action="DROPBOX_REFRESH_TOKEN_SUCCESS",
                resource_type="dropbox",
                resource_id="connected_accounts",
                success=True,
                metadata={
                    "expires_in": expires_in,
                    "new_token": "******",  # don’t log actual token
                },
            )

            return {
                "status": 1,
                "message": "Token refreshed successfully",
                "payload": {
                    "access_token": new_access_token,
                    "expires_in": expires_in,
                },
            }, 200

        except requests.RequestException as re:
            # Network or HTTP-specific issues
            AuditLogger.log(
                user_id=user_id,
                action="DROPBOX_REFRESH_TOKEN_FAILED",
                resource_type="dropbox",
                resource_id=None,
                success=False,
                error_message=f"RequestException: {str(re)}",
                metadata={"refresh_token": "******"},
            )
            return {"status": 0, "message": f"Network error: {str(re)}"}, 502

        except Exception as e:
            # Unexpected failure
            AuditLogger.log(
                user_id=user_id,
                action="DROPBOX_REFRESH_TOKEN_FAILED",
                resource_type="dropbox",
                resource_id=None,
                success=False,
                error_message="Unexpected Error",
                metadata={
                    "input": data,
                    "trace": traceback.format_exc(),
                    "error": str(e),
                },
            )
            return {"status": 0, "message": f"Unexpected error: {str(e)}"}, 500
