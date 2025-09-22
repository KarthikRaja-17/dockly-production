"""
Microsoft OAuth Integration - Complete Backend Implementation
Handles OAuth flow, token management, and file operations
"""

from datetime import datetime, timedelta
import json
import os
from flask import redirect, request, session, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_restful import Resource
import requests
from urllib.parse import quote, unquote
import urllib.parse
import time
from root.db.dbHelper import DBHelper
from root.config import API_URL, WEB_URL

# Use environment variables for security
MS_CLIENT_ID = os.getenv("MICROSOFT_CLIENT_ID", "")
MS_CLIENT_SECRET = os.getenv("MICROSOFT_CLIENT_SECRET", "")
MS_TENANT_ID = os.getenv("MICROSOFT_TENANT_ID", "common")

MS_AUTHORITY = f"https://login.microsoftonline.com/{MS_TENANT_ID}"
MS_REDIRECT_URI = f"{API_URL}/auth/callback"
print(f"MS_REDIRECT_URI: {MS_REDIRECT_URI}")
MS_SCOPES = [
    "openid",
    "profile",
    "email",
    "offline_access",
    "https://graph.microsoft.com/User.Read",
    "https://graph.microsoft.com/Files.ReadWrite",
    "https://graph.microsoft.com/Files.ReadWrite.All",
    "https://graph.microsoft.com/Sites.ReadWrite.All",
    "https://graph.microsoft.com/Mail.Read",
    "https://graph.microsoft.com/Calendars.Read",
]

# Reduced timeout for OAuth sessions (authorization codes typically expire in 5-10 minutes)
OAUTH_SESSION_TIMEOUT = 300  # 5 minutes instead of 10


class AddMicrosoftAccount(Resource):
    def get(self):
        """Initiate Microsoft OAuth flow"""
        try:
            # Get and validate parameters
            uid = request.args.get("userId")
            username = request.args.get("username")

            if not uid or not username:
                return {
                    "status": 0,
                    "message": "Missing userId or username",
                    "payload": {},
                }, 400

            # Ensure parameters are strings and clean
            uid = str(uid).strip()
            username = str(username).strip()

            # Validate environment variables
            if not MS_CLIENT_ID or not MS_CLIENT_SECRET:
                print("❌ Microsoft OAuth credentials not configured")
                return {
                    "status": 0,
                    "message": "Microsoft OAuth not configured properly",
                    "payload": {},
                }, 500

            # Clear any existing session data to prevent conflicts
            session.pop("username", None)
            session.pop("uid", None)
            session.pop("oauth_start_time", None)

            # Store in session for callback
            session["username"] = username
            session["uid"] = uid
            session["oauth_start_time"] = time.time()

            # Create state parameter with timestamp for validation
            state_data = {
                "uid": uid,
                "username": username,
                "timestamp": datetime.utcnow().isoformat(),
                "nonce": str(int(time.time() * 1000)),
            }
            state = quote(json.dumps(state_data))

            # Build authorization URL with additional parameters to ensure fresh auth
            params = {
                "client_id": MS_CLIENT_ID,
                "response_type": "code",
                "redirect_uri": MS_REDIRECT_URI,
                "scope": " ".join(MS_SCOPES),
                "state": state,
                "prompt": "select_account",  # Force account selection
                "response_mode": "query",
                "access_type": "offline",
                "approval_prompt": "force",  # Force consent screen
            }

            auth_url = f"{MS_AUTHORITY}/oauth2/v2.0/authorize"
            param_string = urllib.parse.urlencode(params)
            auth_uri = f"{auth_url}?{param_string}"

            print(f"✅ Initiating OAuth flow for user {uid} at {datetime.utcnow()}")
            return redirect(auth_uri)

        except Exception as e:
            print(f"❌ Error in AddMicrosoftAccount: {str(e)}")
            return {
                "status": 0,
                "message": f"Failed to initiate OAuth flow: {str(e)}",
                "payload": {},
            }, 500


class MicrosoftCallback(Resource):
    def get(self):
        """Handle Microsoft OAuth callback"""
        callback_start_time = datetime.utcnow()
        print(f"📞 Callback received at {callback_start_time}")

        try:
            # Check for OAuth errors first
            error = request.args.get("error")
            if error:
                error_description = request.args.get(
                    "error_description", "Unknown error"
                )
                print(f"❌ OAuth error: {error} - {error_description}")

                # Handle specific error types
                if error == "access_denied":
                    return redirect(
                        f"{WEB_URL}/auth/error?error=user_cancelled&description=User cancelled the authorization"
                    )
                else:
                    return redirect(
                        f"{WEB_URL}/auth/error?error={error}&description={urllib.parse.quote(error_description)}"
                    )

            # Check session timeout with reduced window
            oauth_start_time = session.get("oauth_start_time")
            if not oauth_start_time:
                print("❌ No OAuth session found")
                return redirect(
                    f"{WEB_URL}/auth/error?error=no_session&description=OAuth session not found. Please try again."
                )

            session_duration = time.time() - oauth_start_time
            if session_duration > OAUTH_SESSION_TIMEOUT:
                print(
                    f"❌ OAuth session timeout: {session_duration}s > {OAUTH_SESSION_TIMEOUT}s"
                )
                # Clear expired session
                session.pop("username", None)
                session.pop("uid", None)
                session.pop("oauth_start_time", None)
                return redirect(
                    f"{WEB_URL}/auth/error?error=session_timeout&description=OAuth session expired. Please try again."
                )

            print(f"✅ Session valid, duration: {session_duration:.2f}s")

            # Validate state parameter
            state = request.args.get("state")
            if not state:
                print("❌ Missing state parameter")
                return redirect(
                    f"{WEB_URL}/auth/error?error=missing_state&description=Security validation failed"
                )

            # Decode and validate state
            try:
                decoded_state = unquote(state)
                state_data = json.loads(decoded_state)
                uid = str(state_data.get("uid", "")).strip()
                username = str(state_data.get("username", "")).strip()

                if not uid or not username:
                    raise ValueError("Invalid state data")

                # Validate against session
                if session.get("uid") != uid or session.get("username") != username:
                    raise ValueError("State mismatch")

            except (json.JSONDecodeError, ValueError) as e:
                print(f"❌ Invalid state parameter: {str(e)}")
                return redirect(
                    f"{WEB_URL}/auth/error?error=invalid_state&description=Security validation failed"
                )

            # Get authorization code
            code = request.args.get("code")
            if not code:
                print("❌ Missing authorization code")
                return redirect(
                    f"{WEB_URL}/auth/error?error=no_code&description=Authorization code not received"
                )

            print(f"✅ Received auth code for user {uid}, exchanging for tokens...")
            code_received_time = datetime.utcnow()
            print(
                f"🕐 Time from callback start to code processing: {(code_received_time - callback_start_time).total_seconds():.2f}s"
            )

            # Exchange code for tokens with immediate processing
            tokens = self._exchange_code_for_tokens(code)
            if not tokens:
                print("❌ Token exchange failed")
                # Clear session on failed exchange
                session.pop("username", None)
                session.pop("uid", None)
                session.pop("oauth_start_time", None)
                return redirect(
                    f"{WEB_URL}/auth/error?error=token_exchange_failed&description=Failed to exchange authorization code for tokens. The code may have expired. Please try again."
                )

            token_exchange_time = datetime.utcnow()
            print(
                f"✅ Token exchange successful in {(token_exchange_time - code_received_time).total_seconds():.2f}s"
            )

            # Get user information
            user_info = self._get_user_info(tokens["access_token"])
            if not user_info:
                print("❌ Failed to get user info")
                return redirect(
                    f"{WEB_URL}/auth/error?error=user_info_failed&description=Failed to retrieve user information"
                )

            # Get user photo (optional, don't fail if this doesn't work)
            picture_url = None
            try:
                picture_url = self._get_user_photo(tokens["access_token"])
            except Exception as e:
                print(f"⚠️  Failed to get user photo: {str(e)}")

            # Calculate token expiration
            expires_in = tokens.get("expires_in", 3600)
            expires_at = datetime.utcnow() + timedelta(
                seconds=expires_in - 300
            )  # 5 min buffer

            # Prepare user object
            account_id = str(user_info.get("id", ""))
            email = str(user_info.get("mail") or user_info.get("userPrincipalName", ""))
            display_name = str(user_info.get("displayName", ""))

            user_object = {
                "id": account_id,
                "email": email,
                "name": display_name,
                "picture": picture_url,
                "provider": "outlook",
            }

            # Save account to database
            success = self._save_account(
                uid=uid,
                email=email,
                tokens=tokens,
                expires_at=expires_at,
                user_object=user_object,
            )

            if not success:
                print("❌ Failed to save account to database")
                return redirect(
                    f"{WEB_URL}/auth/error?error=database_error&description=Failed to save account information"
                )

            # Clear session data
            session.pop("username", None)
            session.pop("uid", None)
            session.pop("oauth_start_time", None)

            # Create JWT token
            jwt_token = create_access_token(
                identity=account_id,
                additional_claims={
                    "email": email,
                    "name": display_name,
                    "picture": picture_url,
                    "provider": "outlook",
                },
            )

            completion_time = datetime.utcnow()
            total_duration = (completion_time - callback_start_time).total_seconds()
            print(
                f"✅ OAuth flow completed successfully for {email} in {total_duration:.2f}s"
            )
            return redirect(f"{WEB_URL}/{username}/oauth/callback?token={jwt_token}")

        except Exception as e:
            print(f"❌ Microsoft auth callback error: {str(e)}")
            import traceback

            traceback.print_exc()

            # Clear session on any error
            session.pop("username", None)
            session.pop("uid", None)
            session.pop("oauth_start_time", None)

            return redirect(
                f"{WEB_URL}/auth/error?error=callback_exception&description=An unexpected error occurred during authentication"
            )

    def _exchange_code_for_tokens(self, code):
        """Exchange authorization code for access/refresh tokens with improved error handling"""
        exchange_start = datetime.utcnow()

        try:
            token_url = f"{MS_AUTHORITY}/oauth2/v2.0/token"
            token_data = {
                "client_id": MS_CLIENT_ID,
                "client_secret": MS_CLIENT_SECRET,
                "code": code,
                "redirect_uri": MS_REDIRECT_URI,
                "grant_type": "authorization_code",
                "scope": " ".join(MS_SCOPES),
            }

            headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
                "User-Agent": "Microsoft-OAuth-Integration/1.0",
            }

            print(f"🔄 Exchanging code for tokens at {exchange_start}...")

            # Make request with shorter timeout to fail fast
            response = requests.post(
                token_url,
                data=token_data,
                headers=headers,
                timeout=15,  # Reduced from 30 to 15 seconds
            )

            exchange_end = datetime.utcnow()
            exchange_duration = (exchange_end - exchange_start).total_seconds()

            print(
                f"📊 Token exchange response: {response.status_code} (took {exchange_duration:.2f}s)"
            )

            if response.status_code == 200:
                token_response = response.json()
                print(
                    f"✅ Received tokens: access_token length={len(token_response.get('access_token', ''))}, has_refresh_token={bool(token_response.get('refresh_token'))}"
                )
                return token_response
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {
                        "error": "unknown",
                        "error_description": response.text,
                    }

                error_code = error_data.get("error", "unknown")
                error_desc = error_data.get(
                    "error_description", "No description available"
                )

                print(f"❌ Token exchange failed: {response.status_code}")
                print(f"❌ Error: {error_code} - {error_desc}")

                # Handle specific error cases
                if error_code == "invalid_grant":
                    if "expired" in error_desc.lower() or "AADSTS70000" in error_desc:
                        print(
                            "🔄 Authorization code has expired - this is common if there was a delay in processing"
                        )
                    elif "AADSTS70008" in error_desc:
                        print("🔄 Authorization code has already been used")
                    else:
                        print(f"🔄 Invalid grant error: {error_desc}")

                return None

        except requests.Timeout as e:
            print(f"❌ Token exchange request timed out after 15s: {str(e)}")
            return None
        except requests.RequestException as e:
            print(f"❌ Token exchange request failed: {str(e)}")
            return None
        except Exception as e:
            print(f"❌ Unexpected error in token exchange: {str(e)}")
            return None

    def _get_user_info(self, access_token):
        """Get user information from Microsoft Graph"""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "Microsoft-OAuth-Integration/1.0",
            }

            print("🔄 Fetching user info from Microsoft Graph...")
            response = requests.get(
                "https://graph.microsoft.com/v1.0/me", headers=headers, timeout=15
            )

            if response.status_code == 200:
                user_info = response.json()
                print(
                    f"✅ Retrieved user info for: {user_info.get('displayName', 'Unknown')} ({user_info.get('mail', user_info.get('userPrincipalName', 'No email'))})"
                )
                return user_info
            else:
                print(f"❌ User info request failed: {response.status_code}")
                print(f"❌ Response: {response.text}")
                return None

        except requests.RequestException as e:
            print(f"❌ User info request failed: {str(e)}")
            return None

    def _get_user_photo(self, access_token):
        """Get user profile photo (optional)"""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "User-Agent": "Microsoft-OAuth-Integration/1.0",
            }

            response = requests.get(
                "https://graph.microsoft.com/v1.0/me/photo/$value",
                headers=headers,
                timeout=10,  # Short timeout for optional feature
            )

            if response.status_code == 200 and response.content:
                import base64

                picture_data = base64.b64encode(response.content).decode("utf-8")
                print("✅ Retrieved user profile photo")
                return f"data:image/jpeg;base64,{picture_data}"

            print(f"⚠️  No profile photo available (status: {response.status_code})")
            return None

        except Exception as e:
            print(f"⚠️  Photo request failed: {str(e)}")
            return None

    def _save_account(self, uid, email, tokens, expires_at, user_object):
        """Save or update connected account in database"""
        try:
            uid = str(uid)
            email = str(email)
            access_token = str(tokens.get("access_token", ""))
            refresh_token = str(tokens.get("refresh_token", ""))
            expires_at_iso = expires_at.isoformat()
            user_object_json = json.dumps(user_object)
            current_time = datetime.utcnow().isoformat()

            if not access_token:
                print("❌ No access token to save")
                return False

            print(f"💾 Saving account for {email} (user_id: {uid})")

            # Check if account already exists
            existing_account = DBHelper.find_one(
                table_name="connected_accounts",
                filters={
                    "user_id": uid,
                    "provider": "outlook",
                    "email": email,
                },
                select_fields=["id"],
            )

            if not existing_account:
                # Insert new account
                result = DBHelper.insert(
                    table_name="connected_accounts",
                    return_column="id",
                    user_id=uid,
                    email=email,
                    provider="outlook",
                    access_token=access_token,
                    refresh_token=refresh_token,
                    is_active=1,
                    scopes=" ".join(MS_SCOPES),
                    expires_at=expires_at_iso,
                    user_object=user_object_json,
                    connected_at=current_time,
                    updated_at=current_time,
                )
                print(f"✅ Inserted new account with ID: {result}")
            else:
                # Update existing account
                result = DBHelper.update_one(
                    table_name="connected_accounts",
                    filters={"id": existing_account["id"]},
                    updates={
                        "access_token": access_token,
                        "refresh_token": refresh_token,
                        "expires_at": expires_at_iso,
                        "user_object": user_object_json,
                        "updated_at": current_time,
                        "is_active": 1,
                    },
                )
                print(f"✅ Updated existing account: {existing_account['id']}")

            return True

        except Exception as e:
            print(f"❌ Database error in _save_account: {str(e)}")
            import traceback

            traceback.print_exc()
            return False


class GetCurrentUser(Resource):
    @jwt_required()
    def get(self):
        """Get current authenticated user information"""
        try:
            current_user = get_jwt_identity()
            if not current_user:
                return {"user": None}, 200

            # Get user account from database
            account = DBHelper.find_one(
                table_name="connected_accounts",
                filters={
                    "id": current_user,
                    "provider": "outlook",
                    "is_active": 1,
                },
                select_fields=["id", "email", "user_object", "provider"],
            )

            if not account:
                return {"user": None}, 200

            # Parse user object
            try:
                user_data = json.loads(account.get("user_object", "{}"))
            except json.JSONDecodeError:
                user_data = {
                    "id": account["id"],
                    "email": account["email"],
                    "name": account["email"],
                    "provider": account["provider"],
                }

            return {"user": user_data}, 200

        except Exception as e:
            print(f"❌ Error getting current user: {str(e)}")
            return {"error": "Failed to get user information"}, 500


class GetConnectedAccounts(Resource):
    def get(self):
        """Get user's connected accounts"""
        try:
            user_id = request.args.get("userId")
            if not user_id:
                return {"accounts": []}, 200

            # Get all active accounts for user
            accounts = DBHelper.find(
                table_name="connected_accounts",
                filters={
                    "user_id": user_id,
                    "provider": "outlook",
                    "is_active": 1,
                },
                select_fields=[
                    "id",
                    "email",
                    "provider",
                    "user_object",
                    "connected_at",
                ],
            )

            account_list = []
            for account in accounts:
                try:
                    user_object = json.loads(account.get("user_object", "{}"))
                except json.JSONDecodeError:
                    user_object = {
                        "id": account["id"],
                        "email": account["email"],
                        "name": account["email"],
                        "provider": account["provider"],
                    }

                account_data = {
                    "id": account["id"],
                    "email": account["email"],
                    "name": user_object.get("name", account["email"]),
                    "provider": account["provider"],
                    "picture": user_object.get("picture"),
                    "connected_at": account["connected_at"],
                }
                account_list.append(account_data)

            return {"accounts": account_list}, 200

        except Exception as e:
            print(f"❌ Error getting connected accounts: {str(e)}")
            return {"error": "Failed to get connected accounts"}, 500


class RemoveAccount(Resource):
    def delete(self, account_id):
        """Remove/disconnect a connected account"""
        try:
            user_id = request.args.get("userId")
            if not user_id:
                return {"error": "Missing userId parameter"}, 400

            # Verify account belongs to user
            account = DBHelper.find_one(
                table_name="connected_accounts",
                filters={
                    "id": account_id,
                    "user_id": user_id,
                    "provider": "outlook",
                },
                select_fields=["id"],
            )

            if not account:
                return {"error": "Account not found"}, 404

            # Deactivate account instead of deleting (for audit purposes)
            result = DBHelper.update_one(
                table_name="connected_accounts",
                filters={"id": account_id},
                updates={
                    "is_active": 0,
                    "updated_at": datetime.utcnow().isoformat(),
                },
            )

            if result:
                return {"success": True, "message": "Account removed successfully"}, 200
            else:
                return {"error": "Failed to remove account"}, 500

        except Exception as e:
            print(f"❌ Error removing account: {str(e)}")
            return {"error": "Failed to remove account"}, 500


def get_valid_token(account_id):
    """Helper function to check and refresh token if needed"""
    try:
        # Get account from database
        account = DBHelper.find_one(
            table_name="connected_accounts",
            filters={
                "id": account_id,
                "provider": "outlook",
                "is_active": 1,
            },
            select_fields=["access_token", "refresh_token", "expires_at"],
        )

        if not account:
            print(f"❌ Account {account_id} not found")
            return None

        access_token = account.get("access_token")
        refresh_token = account.get("refresh_token")
        expires_at_str = account.get("expires_at")

        if not access_token:
            print(f"❌ No access token for account {account_id}")
            return None

        # Check if token is expired
        if expires_at_str:
            try:
                expires_at = datetime.fromisoformat(
                    expires_at_str.replace("Z", "+00:00")
                )
                if datetime.utcnow() > expires_at:
                    print(f"🔄 Token expired for account {account_id}, refreshing...")

                    # Refresh token
                    new_tokens = refresh_microsoft_token(refresh_token)
                    if new_tokens:
                        # Update database with new tokens
                        expires_in = new_tokens.get("expires_in", 3600)
                        new_expires_at = datetime.utcnow() + timedelta(
                            seconds=expires_in - 300
                        )

                        DBHelper.update_one(
                            table_name="connected_accounts",
                            filters={"id": account_id},
                            updates={
                                "access_token": new_tokens.get("access_token"),
                                "refresh_token": new_tokens.get(
                                    "refresh_token", refresh_token
                                ),
                                "expires_at": new_expires_at.isoformat(),
                                "updated_at": datetime.utcnow().isoformat(),
                            },
                        )

                        print(f"✅ Token refreshed for account {account_id}")
                        return new_tokens.get("access_token")
                    else:
                        print(f"❌ Failed to refresh token for account {account_id}")
                        return None
            except Exception as e:
                print(f"⚠️ Error parsing expiry date: {str(e)}")

        return access_token

    except Exception as e:
        print(f"❌ Error getting valid token: {str(e)}")
        return None


class GetAccountEmails(Resource):
    def get(self, account_id):
        """Get emails from Microsoft Graph API"""
        try:
            token = get_valid_token(account_id)
            if not token:
                return {"error": "Invalid or expired token"}, 401

            headers = {
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
                "User-Agent": "Microsoft-OAuth-Integration/1.0",
            }

            # Get query parameters
            top = request.args.get("top", 50)
            skip = request.args.get("skip", 0)

            params = {
                "$top": int(top),
                "$skip": int(skip),
                "$orderby": "receivedDateTime desc",
                "$select": "id,subject,from,receivedDateTime,isRead,importance,hasAttachments,bodyPreview",
            }

            response = requests.get(
                "https://graph.microsoft.com/v1.0/me/messages",
                headers=headers,
                params=params,
                timeout=30,
            )

            if response.status_code == 200:
                data = response.json()
                print(
                    f"✅ Retrieved {len(data.get('value', []))} emails for account {account_id}"
                )
                return {"emails": data.get("value", [])}, 200
            else:
                print(f"❌ Email fetch failed: {response.status_code}")
                return {"error": "Failed to fetch emails"}, response.status_code

        except Exception as e:
            print(f"❌ Error fetching emails: {str(e)}")
            return {"error": "Failed to fetch emails"}, 500


class GetAccountEvents(Resource):
    def get(self, account_id):
        """Get calendar events from Microsoft Graph API"""
        try:
            token = get_valid_token(account_id)
            if not token:
                return {"error": "Invalid or expired token"}, 401

            headers = {
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
                "User-Agent": "Microsoft-OAuth-Integration/1.0",
            }

            # Get date range from query parameters
            days = request.args.get("days", 7)
            start_time = datetime.utcnow().isoformat() + "Z"
            end_time = (datetime.utcnow() + timedelta(days=int(days))).isoformat() + "Z"

            params = {
                "$select": "id,subject,start,end,location,isAllDay,organizer",
                "$orderby": "start/dateTime",
                "$filter": f"start/dateTime ge '{start_time}' and end/dateTime le '{end_time}'",
            }

            response = requests.get(
                "https://graph.microsoft.com/v1.0/me/calendar/events",
                headers=headers,
                params=params,
                timeout=30,
            )

            if response.status_code == 200:
                data = response.json()
                print(
                    f"✅ Retrieved {len(data.get('value', []))} events for account {account_id}"
                )
                return {"events": data.get("value", [])}, 200
            else:
                print(f"❌ Events fetch failed: {response.status_code}")
                return {"error": "Failed to fetch events"}, response.status_code

        except Exception as e:
            print(f"❌ Error fetching events: {str(e)}")
            return {"error": "Failed to fetch events"}, 500


class GetAccountFiles(Resource):
    def get(self, account_id):
        """Get files from Microsoft OneDrive via Graph API"""
        try:
            token = get_valid_token(account_id)
            if not token:
                return {"error": "Invalid or expired token"}, 401

            headers = {
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
                "User-Agent": "Microsoft-OAuth-Integration/1.0",
            }

            # Get path parameter for folder navigation
            path = request.args.get("path", "").strip()
            top = request.args.get("top", 100)

            # Build endpoint based on path
            if path:
                # Navigate to specific folder
                encoded_path = urllib.parse.quote(path)
                endpoint = f"https://graph.microsoft.com/v1.0/me/drive/root:/{encoded_path}:/children"
            else:
                # Get root folder contents
                endpoint = "https://graph.microsoft.com/v1.0/me/drive/root/children"

            params = {
                "$top": int(top),
                "$select": "id,name,size,lastModifiedDateTime,folder,file,webUrl,parentReference,createdDateTime",
                "$orderby": "folder desc,name asc",  # Folders first, then files alphabetically
            }

            print(f"🔄 Fetching files from path: '{path}' for account {account_id}")
            response = requests.get(
                endpoint, headers=headers, params=params, timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                files = data.get("value", [])

                # Enhance file data
                enhanced_files = []
                for file_item in files:
                    enhanced_file = {
                        "id": file_item.get("id"),
                        "name": file_item.get("name"),
                        "size": file_item.get("size", 0),
                        "lastModifiedDateTime": file_item.get("lastModifiedDateTime"),
                        "createdDateTime": file_item.get("createdDateTime"),
                        "webUrl": file_item.get("webUrl"),
                        "isFolder": bool(file_item.get("folder")),
                        "mimeType": (
                            file_item.get("file", {}).get("mimeType")
                            if file_item.get("file")
                            else None
                        ),
                        "path": path,
                    }

                    # Add file extension for non-folders
                    if not enhanced_file["isFolder"]:
                        name = enhanced_file["name"]
                        if "." in name:
                            enhanced_file["extension"] = name.rsplit(".", 1)[-1].lower()
                        else:
                            enhanced_file["extension"] = ""

                    enhanced_files.append(enhanced_file)

                print(
                    f"✅ Retrieved {len(enhanced_files)} files/folders from path '{path}' for account {account_id}"
                )

                return {
                    "files": enhanced_files,
                    "path": path,
                    "count": len(enhanced_files),
                }, 200

            elif response.status_code == 404:
                print(f"❌ Path not found: '{path}' for account {account_id}")
                return {"error": f"Path '{path}' not found"}, 404
            else:
                print(f"❌ Files fetch failed: {response.status_code}")
                try:
                    error_data = response.json()
                    error_message = error_data.get("error", {}).get(
                        "message", "Unknown error"
                    )
                except:
                    error_message = f"HTTP {response.status_code}"

                return {
                    "error": f"Failed to fetch files: {error_message}"
                }, response.status_code

        except Exception as e:
            print(f"❌ Error fetching files: {str(e)}")
            import traceback

            traceback.print_exc()
            return {"error": "Failed to fetch files"}, 500


class GetFileContent(Resource):
    def get(self, account_id, file_id):
        """Get file content/download URL from Microsoft Graph API"""
        try:
            token = get_valid_token(account_id)
            if not token:
                return {"error": "Invalid or expired token"}, 401

            headers = {
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
                "User-Agent": "Microsoft-OAuth-Integration/1.0",
            }

            # Get file metadata first
            metadata_response = requests.get(
                f"https://graph.microsoft.com/v1.0/me/drive/items/{file_id}",
                headers=headers,
                timeout=15,
            )

            if metadata_response.status_code != 200:
                return {"error": "File not found"}, 404

            file_metadata = metadata_response.json()

            # Check if it's a folder
            if file_metadata.get("folder"):
                return {"error": "Cannot download folder content"}, 400

            # Get download URL
            download_response = requests.get(
                f"https://graph.microsoft.com/v1.0/me/drive/items/{file_id}/content",
                headers=headers,
                timeout=15,
                allow_redirects=False,  # Don't follow redirect, just get the URL
            )

            if download_response.status_code == 302:
                download_url = download_response.headers.get("Location")

                return {
                    "file": {
                        "id": file_metadata.get("id"),
                        "name": file_metadata.get("name"),
                        "size": file_metadata.get("size"),
                        "mimeType": file_metadata.get("file", {}).get("mimeType"),
                        "downloadUrl": download_url,
                        "webUrl": file_metadata.get("webUrl"),
                    }
                }, 200
            else:
                return {"error": "Failed to get download URL"}, 500

        except Exception as e:
            print(f"❌ Error getting file content: {str(e)}")
            return {"error": "Failed to get file content"}, 500


def refresh_microsoft_token(refresh_token):
    """Refresh Microsoft access token using refresh token"""
    try:
        if not refresh_token:
            print("❌ No refresh token provided")
            return None

        token_url = f"{MS_AUTHORITY}/oauth2/v2.0/token"
        token_data = {
            "client_id": MS_CLIENT_ID,
            "client_secret": MS_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
            "scope": " ".join(MS_SCOPES),
        }

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
            "User-Agent": "Microsoft-OAuth-Integration/1.0",
        }

        print("🔄 Refreshing Microsoft token...")
        response = requests.post(
            token_url, data=token_data, headers=headers, timeout=15
        )

        if response.status_code == 200:
            print("✅ Token refreshed successfully")
            return response.json()
        else:
            try:
                error_data = response.json()
            except:
                error_data = {"error": "unknown", "error_description": response.text}

            error_code = error_data.get("error", "unknown")
            error_desc = error_data.get("error_description", response.text)

            print(f"❌ Token refresh failed: {response.status_code}")
            print(f"❌ Error: {error_code} - {error_desc}")
            return None

    except requests.RequestException as e:
        print(f"❌ Token refresh request failed: {str(e)}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error in token refresh: {str(e)}")
        return None


class LogoutUser(Resource):
    def post(self):
        """Log out user and clear session"""
        try:
            session.clear()
            return {"success": True, "message": "Logged out successfully"}, 200
        except Exception as e:
            print(f"❌ Error during logout: {str(e)}")
            return {"error": "Failed to logout"}, 500
