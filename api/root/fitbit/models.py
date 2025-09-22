# fitbit/models.py

import json
import traceback
from datetime import datetime, timedelta
from flask import make_response, redirect, request, session
from flask_jwt_extended import create_access_token
from flask_restful import Resource
from urllib.parse import quote
import requests

from root.common import Status
from root.utilis import uniqueId
from root.db.dbHelper import DBHelper
from root.config import (
    API_URL, WEB_URL, 
    FITBIT_CLIENT_ID, FITBIT_CLIENT_SECRET, 
    FITBIT_REDIRECT_URI, FITBIT_SCOPES,
    FITBIT_TOKEN_URI, FITBIT_API_BASE
)
from root.auth.auth import auth_required


class AddFitbitAccount(Resource):
    def get(self):
        username = request.args.get("username")
        uid = request.args.get("userId")
        session["username"] = username
        session["user_id"] = uid
        stateData = json.dumps({"user_id": uid, "username": username})
        encoded_state = quote(stateData)

        auth_url = (
            "https://www.fitbit.com/oauth2/authorize"
            f"?response_type=code"
            f"&client_id={FITBIT_CLIENT_ID}"
            f"&redirect_uri={FITBIT_REDIRECT_URI}"
            f"&scope={FITBIT_SCOPES.replace(' ', '%20')}"
            f"&state={encoded_state}"
        )

        return make_response(redirect(auth_url))


class FitbitCallback(Resource):
    def get(self):
        code = request.args.get("code")
        state = request.args.get("state")

        if not code or not state:
            return {"error": "Missing code or state"}, 400

        if state:
            stateData = json.loads(state)
            user_id = stateData.get("user_id")
            if not user_id:
                return {"error": "Invalid state"}, 400
            username = stateData.get("username")

        # Step 1: Exchange code for tokens with PROPER AUTHENTICATION
        tokenData = {
            "code": code,
            "redirect_uri": FITBIT_REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        print(f"DEBUG: Token exchange request data: {tokenData}")
        print(f"DEBUG: Using Basic Auth with client_id: {FITBIT_CLIENT_ID}")

        # FIX: Use HTTP Basic Authentication instead of sending credentials in body
        tokenResponse = requests.post(
            FITBIT_TOKEN_URI, 
            data=tokenData,
            auth=(FITBIT_CLIENT_ID, FITBIT_CLIENT_SECRET)  # This creates proper Basic Auth header
        )
        
        print(f"DEBUG: Token response status: {tokenResponse.status_code}")
        print(f"DEBUG: Token response text: {tokenResponse.text}")
        
        if tokenResponse.status_code != 200:
            return {
                "error": f"Token exchange failed: {tokenResponse.status_code} - {tokenResponse.text}"
            }, 400

        tokenJson = tokenResponse.json()
        access_token = tokenJson.get("access_token")
        refresh_token = tokenJson.get("refresh_token")
        expires_in = tokenJson.get("expires_in", 28800)  # Fitbit default 8 hours

        if not access_token or not refresh_token:
            return {"error": "Invalid token data"}, 400

        # Step 2: Get user info from Fitbit
        userInfoResponse = requests.get(
            f"{FITBIT_API_BASE}/user/-/profile.json",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userInfoResponse.status_code != 200:
            return {"error": "Failed to fetch user info"}, 400

        userInfo = userInfoResponse.json().get("user", {})
        fitbit_user_id = userInfo.get("encodedId")
        if not fitbit_user_id:
            return {"error": "Fitbit user ID not found"}, 400

        # Step 3: Create user object
        userId = session.get("user_id") or user_id
        user = {
            "id": userId,
            "fitbit_user_id": fitbit_user_id,
            "display_name": userInfo.get("displayName", "Fitbit User"),
            "avatar": userInfo.get("avatar", ""),
            "member_since": userInfo.get("memberSince"),
        }

        print(f"DEBUG: About to save connection for user_id: {user_id}")
        print(f"DEBUG: Fitbit user info: {user}")

        # Check if account already exists
        existingAccount = DBHelper.find_one(
            "connected_accounts",
            filters={
                "user_id": user_id,
                "provider": "fitbit",
            },
            select_fields=["id"],
        )

        print(f"DEBUG: Existing account found: {existingAccount}")

        try:
            if existingAccount:
                # Update existing account
                print(f"DEBUG: Updating existing account with id: {existingAccount['id']}")
                result = DBHelper.update_one(
                    table_name="connected_accounts",
                    filters={"id": existingAccount["id"]},
                    updates={
                        "access_token": access_token,
                        "refresh_token": refresh_token,
                        "is_active": Status.ACTIVE.value,
                        "expires_at": (
                            datetime.utcnow() + timedelta(seconds=expires_in)
                        ).isoformat(),
                        "user_object": json.dumps(user),
                        "scopes": FITBIT_SCOPES,
                        "updated_at": datetime.utcnow().isoformat(),
                    },
                )
                print(f"DEBUG: Update result: {result}")
            else:
                # Insert new account
                print(f"DEBUG: Inserting new account for user_id: {user_id}")
                result = DBHelper.insert(
                    "connected_accounts",
                    user_id=user_id,
                    email=fitbit_user_id,  # Use Fitbit ID as identifier
                    access_token=access_token,
                    provider="fitbit",
                    refresh_token=refresh_token,
                    is_active=Status.ACTIVE.value,
                    expires_at=(
                        datetime.utcnow() + timedelta(seconds=expires_in)
                    ).isoformat(),
                    user_object=json.dumps(user),
                    scopes=FITBIT_SCOPES,
                    connected_at=datetime.utcnow().isoformat(),
                    updated_at=datetime.utcnow().isoformat(),
                )
                print(f"DEBUG: Insert result: {result}")

            # Verify the save worked
            verification = DBHelper.find_one(
                "connected_accounts",
                filters={
                    "user_id": user_id,
                    "provider": "fitbit",
                    "is_active": Status.ACTIVE.value
                },
                select_fields=["id", "user_id", "provider", "is_active"],
            )
            print(f"DEBUG: Verification query result: {verification}")

        except Exception as e:
            print(f"DEBUG: Database save error: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"error": f"Database save failed: {str(e)}"}, 500

        # Step 4: AUTO-SYNC DATA AND GOALS IMMEDIATELY AFTER SUCCESSFUL CONNECTION
        print(f"DEBUG: Starting automatic data and goals sync for user_id: {user_id}")
        sync_results = {}
        today = datetime.now().strftime("%Y-%m-%d")
        
        try:
            # Sync daily activity data
            print("DEBUG: Fetching activity data...")
            activity_data = fetch_fitbit_activity_data(access_token, today)
            if activity_data:
                save_fitbit_daily_data(user_id, today, activity_data)
                sync_results["activity"] = "success"
                print("DEBUG: Activity data synced successfully")
            else:
                sync_results["activity"] = "no_data"
                print("DEBUG: No activity data available")

            # Sync sleep data
            print("DEBUG: Fetching sleep data...")
            sleep_data = fetch_fitbit_sleep_data(access_token, today)
            if sleep_data:
                save_fitbit_sleep_data(user_id, today, sleep_data)
                sync_results["sleep"] = "success"
                print("DEBUG: Sleep data synced successfully")
            else:
                sync_results["sleep"] = "no_data"
                print("DEBUG: No sleep data available")

            # Sync weight/body data
            print("DEBUG: Fetching body data...")
            body_data = fetch_fitbit_body_data(access_token, today)
            if body_data:
                save_fitbit_body_data(user_id, today, body_data)
                sync_results["body"] = "success"
                print("DEBUG: Body data synced successfully")
            else:
                sync_results["body"] = "no_data"
                print("DEBUG: No body data available")

            # NEW: Sync goals data
            print("DEBUG: Fetching goals data...")
            goals_data = fetch_fitbit_goals_data(access_token)
            if goals_data:
                save_fitbit_goals_data(user_id, goals_data)
                sync_results["goals"] = "success"
                print("DEBUG: Goals data synced successfully")
            else:
                sync_results["goals"] = "no_data"
                print("DEBUG: No goals data available")

            # Log successful sync
            DBHelper.insert(
                "fitbit_sync_logs",
                user_id=user_id,
                sync_date=datetime.utcnow().isoformat(),
                sync_type="auto_after_oauth",
                data_types=json.dumps(list(sync_results.keys())),
                records_synced=len([v for v in sync_results.values() if v == "success"]),
                status="success",
            )
            
            print(f"DEBUG: Auto-sync completed. Results: {sync_results}")

        except Exception as sync_error:
            print(f"DEBUG: Auto-sync failed but OAuth successful: {str(sync_error)}")
            import traceback
            traceback.print_exc()
            
            # Log failed sync but don't fail the OAuth
            try:
                DBHelper.insert(
                    "fitbit_sync_logs",
                    user_id=user_id,
                    sync_date=datetime.utcnow().isoformat(),
                    sync_type="auto_after_oauth",
                    data_types="[]",
                    records_synced=0,
                    status="failed",
                    error_message=str(sync_error)[:500],
                )
            except Exception as log_error:
                print(f"Failed to log sync error: {log_error}")

        # Step 5: Create JWT token for frontend authentication
        jwtToken = create_access_token(identity=user_id)

        # Step 6: Return enhanced popup HTML with better communication
        popup_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Fitbit Connection Successful</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    text-align: center;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }}
                .container {{
                    background: rgba(255, 255, 255, 0.1);
                    padding: 2rem;
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                    max-width: 400px;
                }}
                .success-icon {{
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }}
                .loading {{
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255,255,255,.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: spin 1s ease-in-out infinite;
                    margin: 10px;
                }}
                @keyframes spin {{
                    to {{ transform: rotate(360deg); }}
                }}
                .status {{
                    margin-top: 1rem;
                    font-size: 0.9rem;
                    opacity: 0.8;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-icon">✅</div>
                <h2>Fitbit Connected Successfully!</h2>
                <p>Syncing your health data and goals...</p>
                <div class="loading"></div>
                <div class="status" id="status">
                    Communicating with main window...
                </div>
            </div>
            
            <script>
                console.log('DEBUG: Popup HTML loaded, starting communication');
                
                let messagesSent = 0;
                const maxRetries = 10;
                const statusEl = document.getElementById('status');
                
                function updateStatus(message) {{
                    if (statusEl) {{
                        statusEl.textContent = message;
                    }}
                    console.log('DEBUG: Status:', message);
                }}
                
                function communicateWithParent() {{
                    try {{
                        updateStatus('Checking parent window...');
                        
                        // Method 1: Try window.opener if available
                        if (window.opener && !window.opener.closed) {{
                            updateStatus('Sending message via window.opener...');
                            console.log('DEBUG: Parent window available, sending message');
                            
                            const message = {{
                                type: 'FITBIT_OAUTH_SUCCESS',
                                token: '{jwtToken}',
                                user: {json.dumps(user)},
                                sync_results: {json.dumps(sync_results)},
                                timestamp: Date.now()
                            }};
                            
                            // Try multiple origins
                            const targetOrigins = ['{WEB_URL}', 'http://localhost:3000', '*'];
                            
                            for (const origin of targetOrigins) {{
                                try {{
                                    window.opener.postMessage(message, origin);
                                    console.log('DEBUG: Message sent to origin:', origin);
                                }} catch (originError) {{
                                    console.log('DEBUG: Failed to send to origin:', origin, originError);
                                }}
                            }}
                            
                            // Wait a moment then close
                            updateStatus('Message sent, closing popup...');
                            setTimeout(() => {{
                                window.close();
                            }}, 1000);
                            
                        }} else {{
                            // Method 2: Use localStorage as fallback
                            updateStatus('Using localStorage communication...');
                            console.log('DEBUG: Parent window not available, using localStorage');
                            
                            const oauthResult = {{
                                type: 'FITBIT_OAUTH_SUCCESS',
                                token: '{jwtToken}',
                                user: {json.dumps(user)},
                                sync_results: {json.dumps(sync_results)},
                                timestamp: Date.now(),
                                userId: '{user_id}'
                            }};
                            
                            // Store result in localStorage
                            localStorage.setItem('fitbit_oauth_result', JSON.stringify(oauthResult));
                            
                            updateStatus('Success! You can close this window.');
                            
                            // Try to close popup after delay
                            setTimeout(() => {{
                                window.close();
                            }}, 2000);
                        }}
                        
                    }} catch (error) {{
                        updateStatus('Communication error, please close this window');
                        console.error('DEBUG: Communication error:', error);
                        
                        // Fallback: store in localStorage anyway
                        try {{
                            const oauthResult = {{
                                type: 'FITBIT_OAUTH_SUCCESS',
                                token: '{jwtToken}',
                                user: {json.dumps(user)},
                                sync_results: {json.dumps(sync_results)},
                                timestamp: Date.now(),
                                userId: '{user_id}'
                            }};
                            localStorage.setItem('fitbit_oauth_result', JSON.stringify(oauthResult));
                            updateStatus('Success saved! You can close this window.');
                        }} catch (storageError) {{
                            console.error('DEBUG: localStorage fallback failed:', storageError);
                        }}
                    }}
                }}
                
                // Start communication immediately
                updateStatus('Connecting...');
                communicateWithParent();
                
            </script>
        </body>
        </html>
        """
        
        # CRITICAL FIX: Return proper Flask Response with HTML headers
        from flask import Response
        return Response(
            popup_html,
            mimetype='text/html',
            headers={
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        )

class SyncFitbitData(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            # Get user's Fitbit credentials
            fitbit_cred = DBHelper.find_one(
                "connected_accounts",
                filters={"user_id": uid, "provider": "fitbit", "is_active": Status.ACTIVE.value},
                select_fields=["access_token", "refresh_token", "expires_at"],
            )

            if not fitbit_cred:
                return {
                    "status": 0,
                    "message": "No connected Fitbit account found.",
                    "payload": {},
                }

            access_token = fitbit_cred["access_token"]
            
            # FIX: Handle expires_at properly - it might be datetime object or string
            expires_at = fitbit_cred["expires_at"]
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            elif expires_at is None:
                # If no expiration date, assume expired to force refresh
                expires_at = datetime.utcnow() - timedelta(hours=1)
            # If it's already a datetime object, use it as-is
            
            print(f"DEBUG: Token expires at: {expires_at}")
            print(f"DEBUG: Current time: {datetime.utcnow()}")
            print(f"DEBUG: Token expired: {datetime.utcnow() >= expires_at}")
            
            # Check if token is expired and refresh if needed
            if datetime.utcnow() >= expires_at:
                print("DEBUG: Token expired, refreshing...")
                access_token = refresh_fitbit_token(uid, fitbit_cred["refresh_token"])
                if not access_token:
                    return {
                        "status": 0,
                        "message": "Failed to refresh Fitbit token.",
                        "payload": {},
                    }

            # Sync different data types
            sync_results = {}
            today = datetime.now().strftime("%Y-%m-%d")
            
            print(f"DEBUG: Starting sync for date: {today}")
            
            # Sync daily activity data
            activity_data = fetch_fitbit_activity_data(access_token, today)
            if activity_data:
                save_fitbit_daily_data(uid, today, activity_data)
                sync_results["activity"] = "success"
                print("DEBUG: Activity data synced successfully")
            else:
                print("DEBUG: No activity data fetched")

            # Sync sleep data
            sleep_data = fetch_fitbit_sleep_data(access_token, today)
            if sleep_data:
                save_fitbit_sleep_data(uid, today, sleep_data)
                sync_results["sleep"] = "success"
                print("DEBUG: Sleep data synced successfully")
            else:
                print("DEBUG: No sleep data fetched")

            # Sync weight/body data
            body_data = fetch_fitbit_body_data(access_token, today)
            if body_data:
                save_fitbit_body_data(uid, today, body_data)
                sync_results["body"] = "success"
                print("DEBUG: Body data synced successfully")
            else:
                print("DEBUG: No body data fetched")

            # NEW: Sync goals data
            goals_data = fetch_fitbit_goals_data(access_token)
            if goals_data:
                save_fitbit_goals_data(uid, goals_data)
                sync_results["goals"] = "success"
                print("DEBUG: Goals data synced successfully")
            else:
                print("DEBUG: No goals data fetched")

            # Log successful sync
            DBHelper.insert(
                "fitbit_sync_logs",
                user_id=uid,
                sync_date=datetime.utcnow().isoformat(),
                sync_type="manual",
                data_types=json.dumps(list(sync_results.keys())),
                records_synced=len(sync_results),
                status="success",
            )

            return {
                "status": 1,
                "message": "Fitbit data and goals synced successfully.",
                "payload": {"sync_results": sync_results},
            }

        except Exception as e:
            print(f"Fitbit sync error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Log failed sync
            try:
                DBHelper.insert(
                    "fitbit_sync_logs",
                    user_id=uid,
                    sync_date=datetime.utcnow().isoformat(),
                    sync_type="manual",
                    data_types="[]",
                    records_synced=0,
                    status="failed",
                    error_message=str(e)[:500],
                )
            except Exception as log_error:
                print(f"Failed to log sync error: {log_error}")
                
            return {
                "status": 0,
                "message": "Failed to sync Fitbit data.",
                "payload": {"error": str(e)},
            }

class GetFitbitDashboard(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            # Comprehensive serialization function that handles the entire response
            def serialize_response(obj):
                from decimal import Decimal
                import datetime
                
                if isinstance(obj, dict):
                    return {key: serialize_response(value) for key, value in obj.items()}
                elif isinstance(obj, list):
                    return [serialize_response(item) for item in obj]
                elif isinstance(obj, datetime.datetime):
                    return obj.isoformat()
                elif isinstance(obj, datetime.date):
                    return obj.strftime('%Y-%m-%d')
                elif isinstance(obj, Decimal):
                    return float(obj)
                elif hasattr(obj, '__dict__'):
                    # Handle any complex objects by converting to dict first
                    return serialize_response(obj.__dict__)
                else:
                    return obj

            # Get recent Fitbit data (last 30 days)
            recent_data = DBHelper.find(
                "fitbit_daily_data",
                filters={"user_id": uid},
                limit=30,
            )

            # Get recent sleep data
            recent_sleep = DBHelper.find(
                "fitbit_sleep_data",
                filters={"user_id": uid},
                limit=30,
            )

            # Get recent activities
            recent_activities = DBHelper.find(
                "fitbit_activities",
                filters={"user_id": uid},
                limit=10,
            )

            # NEW: Get user's goals data
            user_goals = DBHelper.find_one(
                "fitbit_user_goals",
                filters={"user_id": uid, "is_active": 1},
            )

            # Check if Fitbit is connected
            fitbit_connected = DBHelper.find_one(
                "connected_accounts",
                filters={"user_id": uid, "provider": "fitbit", "is_active": Status.ACTIVE.value},
                select_fields=["user_object", "connected_at"],
            )

            user_info = {}
            if fitbit_connected:
                try:
                    user_info = json.loads(fitbit_connected["user_object"])
                    user_info["connected_at"] = fitbit_connected.get("connected_at")
                except Exception as parse_error:
                    print(f"Error parsing user_object: {parse_error}")
                    user_info = {}

            # Get latest sync info
            latest_sync = DBHelper.find_one(
                "fitbit_sync_logs",
                filters={"user_id": uid},
                select_fields=["sync_date", "status", "records_synced"],
            )

            # Calculate some basic stats
            stats = {}
            if recent_data and len(recent_data) > 0:
                try:
                    total_steps = sum(int(d.get("steps", 0) or 0) for d in recent_data)
                    avg_steps = total_steps // len(recent_data) if len(recent_data) > 0 else 0
                    total_calories = sum(int(d.get("calories_burned", 0) or 0) for d in recent_data)
                    avg_calories = total_calories // len(recent_data) if len(recent_data) > 0 else 0
                    
                    stats = {
                        "total_days": len(recent_data),
                        "avg_daily_steps": avg_steps,
                        "avg_daily_calories": avg_calories,
                        "total_steps_30_days": total_steps,
                        "total_calories_30_days": total_calories,
                    }
                except Exception as stats_error:
                    print(f"Error calculating stats: {stats_error}")
                    stats = {"error": "Could not calculate stats"}

            # NEW: Calculate goal progress if we have both current data and goals
            goal_progress = {}
            if recent_data and user_goals:
                try:
                    latest_data = recent_data[0] if recent_data else {}
                    current_steps = int(latest_data.get("steps", 0) or 0)
                    current_weight = float(latest_data.get("weight", 0) or 0)
                    
                    if user_goals.get("daily_steps_goal"):
                        steps_goal = int(user_goals["daily_steps_goal"])
                        goal_progress["steps"] = {
                            "current": current_steps,
                            "target": steps_goal,
                            "progress": min(100, (current_steps / steps_goal * 100)) if steps_goal > 0 else 0
                        }
                    
                    if user_goals.get("weight_goal"):
                        weight_goal = float(user_goals["weight_goal"])
                        starting_weight = float(user_goals.get("starting_weight", current_weight))
                        if starting_weight != weight_goal:
                            progress = abs(starting_weight - current_weight) / abs(starting_weight - weight_goal) * 100
                            goal_progress["weight"] = {
                                "current": current_weight,
                                "target": weight_goal,
                                "starting": starting_weight,
                                "progress": min(100, progress)
                            }
                    
                except Exception as progress_error:
                    print(f"Error calculating goal progress: {progress_error}")

            # Build complete response payload
            response_payload = {
                "daily_data": recent_data or [],
                "sleep_data": recent_sleep or [],
                "activities": recent_activities or [],
                "user_goals": user_goals or {},
                "goal_progress": goal_progress,
                "fitbit_connected": bool(fitbit_connected),
                "user_info": user_info,
                "latest_sync": latest_sync,
                "stats": stats,
            }

            # Apply comprehensive serialization to the entire response
            serialized_payload = serialize_response(response_payload)

            return {
                "status": 1,
                "message": "Fitbit dashboard data retrieved.",
                "payload": serialized_payload,
            }

        except Exception as e:
            print(f"Dashboard error: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to get dashboard data: {str(e)}",
                "payload": {"error_details": str(e)},
            }

# NEW ENDPOINTS FOR GOALS MANAGEMENT

class GetFitbitGoals(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            # Comprehensive serialization function that handles Decimal objects
            def serialize_goals_response(obj):
                from decimal import Decimal
                import datetime
                
                if isinstance(obj, dict):
                    return {key: serialize_goals_response(value) for key, value in obj.items()}
                elif isinstance(obj, list):
                    return [serialize_goals_response(item) for item in obj]
                elif isinstance(obj, datetime.datetime):
                    return obj.isoformat()
                elif isinstance(obj, datetime.date):
                    return obj.strftime('%Y-%m-%d')
                elif isinstance(obj, Decimal):
                    return float(obj)  # Convert Decimal to float for JSON serialization
                elif hasattr(obj, '__dict__'):
                    return serialize_goals_response(obj.__dict__)
                else:
                    return obj

            # Get cached goals from database
            cached_goals = DBHelper.find_one(
                "fitbit_user_goals",
                filters={"user_id": uid, "is_active": 1},
            )

            # Get Fitbit connection for real-time fetch if needed
            fitbit_cred = DBHelper.find_one(
                "connected_accounts",
                filters={"user_id": uid, "provider": "fitbit", "is_active": Status.ACTIVE.value},
                select_fields=["access_token", "refresh_token", "expires_at"],
            )

            force_refresh = request.args.get("refresh", "false").lower() == "true"

            # If we have cached goals and not forcing refresh, return cached data
            if cached_goals and not force_refresh:
                # Apply serialization to cached goals
                serialized_goals = serialize_goals_response(cached_goals)
                
                return {
                    "status": 1,
                    "message": "Fitbit goals retrieved from cache.",
                    "payload": {
                        "goals": serialized_goals,
                        "source": "cached",
                        "last_updated": serialized_goals.get("updated_at")
                    },
                }

            # Otherwise, fetch fresh goals from Fitbit API
            if not fitbit_cred:
                return {
                    "status": 0,
                    "message": "No connected Fitbit account found.",
                    "payload": {},
                }

            access_token = fitbit_cred["access_token"]
            
            # Check token expiration and refresh if needed
            expires_at = fitbit_cred["expires_at"]
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            elif expires_at is None:
                expires_at = datetime.utcnow() - timedelta(hours=1)
                
            if datetime.utcnow() >= expires_at:
                access_token = refresh_fitbit_token(uid, fitbit_cred["refresh_token"])
                if not access_token:
                    return {
                        "status": 0,
                        "message": "Failed to refresh Fitbit token.",
                        "payload": {},
                    }

            # Fetch fresh goals from Fitbit
            goals_data = fetch_fitbit_goals_data(access_token)
            if goals_data:
                save_fitbit_goals_data(uid, goals_data)
                
                # Apply serialization to fresh goals data
                serialized_goals = serialize_goals_response(goals_data)
                
                return {
                    "status": 1,
                    "message": "Fitbit goals retrieved and updated.",
                    "payload": {
                        "goals": serialized_goals,
                        "source": "live",
                        "last_updated": datetime.utcnow().isoformat()
                    },
                }
            else:
                return {
                    "status": 0,
                    "message": "Failed to fetch goals from Fitbit.",
                    "payload": {},
                }

        except Exception as e:
            print(f"Goals fetch error: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "status": 0,
                "message": "Failed to get Fitbit goals.",
                "payload": {"error": str(e)},
            }

# fitbit/models.py - ONLY UPDATE THE SyncFitbitGoals CLASS

class SyncFitbitGoals(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            # Comprehensive serialization function that handles Decimal objects
            def serialize_goals_response(obj):
                from decimal import Decimal
                import datetime
                
                if isinstance(obj, dict):
                    return {key: serialize_goals_response(value) for key, value in obj.items()}
                elif isinstance(obj, list):
                    return [serialize_goals_response(item) for item in obj]
                elif isinstance(obj, datetime.datetime):
                    return obj.isoformat()
                elif isinstance(obj, datetime.date):
                    return obj.strftime('%Y-%m-%d')
                elif isinstance(obj, Decimal):
                    return float(obj)  # Convert Decimal to float for JSON serialization
                elif hasattr(obj, '__dict__'):
                    return serialize_goals_response(obj.__dict__)
                else:
                    return obj

            # Get user's Fitbit credentials
            fitbit_cred = DBHelper.find_one(
                "connected_accounts",
                filters={"user_id": uid, "provider": "fitbit", "is_active": Status.ACTIVE.value},
                select_fields=["access_token", "refresh_token", "expires_at"],
            )

            if not fitbit_cred:
                return {
                    "status": 0,
                    "message": "No connected Fitbit account found.",
                    "payload": {},
                }

            access_token = fitbit_cred["access_token"]
            
            # Check token expiration and refresh if needed
            expires_at = fitbit_cred["expires_at"]
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            elif expires_at is None:
                expires_at = datetime.utcnow() - timedelta(hours=1)
                
            if datetime.utcnow() >= expires_at:
                access_token = refresh_fitbit_token(uid, fitbit_cred["refresh_token"])
                if not access_token:
                    return {
                        "status": 0,
                        "message": "Failed to refresh Fitbit token.",
                        "payload": {},
                    }

            # Fetch and save goals
            goals_data = fetch_fitbit_goals_data(access_token)
            if goals_data:
                save_fitbit_goals_data(uid, goals_data)
                
                # Log successful goals sync
                DBHelper.insert(
                    "fitbit_sync_logs",
                    user_id=uid,
                    sync_date=datetime.utcnow().isoformat(),
                    sync_type="goals_manual",
                    data_types='["goals"]',
                    records_synced=1,
                    status="success",
                )

                # Apply serialization to goals data before returning
                serialized_goals = serialize_goals_response(goals_data)

                return {
                    "status": 1,
                    "message": "Fitbit goals synced successfully.",
                    "payload": {"goals": serialized_goals},
                }
            else:
                return {
                    "status": 0,
                    "message": "No goals data found in Fitbit account.",
                    "payload": {},
                }

        except Exception as e:
            print(f"Goals sync error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Log failed sync
            try:
                DBHelper.insert(
                    "fitbit_sync_logs",
                    user_id=uid,
                    sync_date=datetime.utcnow().isoformat(),
                    sync_type="goals_manual",
                    data_types='["goals"]',
                    records_synced=0,
                    status="failed",
                    error_message=str(e)[:500],
                )
            except Exception as log_error:
                print(f"Failed to log sync error: {log_error}")
                
            return {
                "status": 0,
                "message": "Failed to sync Fitbit goals.",
                "payload": {"error": str(e)},
            }
            
# EXISTING ENDPOINTS (PRESERVED)

class GetFitbitConnectionStatus(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            print(f"DEBUG: Checking connection status for user_id: {uid}")
            print(f"DEBUG: Status.ACTIVE.value = {Status.ACTIVE.value}")
            
            # First, check if ANY record exists for this user and provider
            any_record = DBHelper.find_one(
                "connected_accounts",
                filters={
                    "user_id": uid, 
                    "provider": "fitbit"
                },
                select_fields=["id", "user_id", "provider", "is_active", "access_token"],
            )
            print(f"DEBUG: Any record found: {any_record}")
            
            # Now check for active record
            fitbit_account = DBHelper.find_one(
                "connected_accounts",
                filters={
                    "user_id": uid, 
                    "provider": "fitbit", 
                    "is_active": Status.ACTIVE.value
                },
                select_fields=["user_object", "connected_at", "expires_at", "id", "user_id", "provider", "is_active"],
            )
            print(f"DEBUG: Active record found: {fitbit_account}")

            if fitbit_account:
                user_info = {}
                try:
                    user_object_str = fitbit_account.get("user_object", "{}")
                    print(f"DEBUG: Raw user_object: {user_object_str}")
                    user_info = json.loads(user_object_str)
                    print(f"DEBUG: Parsed user_info: {user_info}")
                except Exception as e:
                    print(f"DEBUG: Error parsing user_object: {e}")
                    user_info = {}

                # Handle datetime serialization
                connected_at = fitbit_account.get("connected_at")
                expires_at = fitbit_account.get("expires_at")
                
                if connected_at and hasattr(connected_at, 'isoformat'):
                    connected_at = connected_at.isoformat()
                elif connected_at:
                    connected_at = str(connected_at)
                    
                if expires_at and hasattr(expires_at, 'isoformat'):
                    expires_at = expires_at.isoformat()
                elif expires_at:
                    expires_at = str(expires_at)

                print("DEBUG: Returning connected=True")
                return {
                    "status": 1,
                    "message": "Fitbit connection status retrieved.",
                    "payload": {
                        "connected": True,
                        "user_info": user_info,
                        "connected_at": connected_at,
                        "expires_at": expires_at,
                    },
                }
            else:
                print("DEBUG: No active record found, returning connected=False")
                return {
                    "status": 1,
                    "message": "Fitbit not connected.",
                    "payload": {
                        "connected": False,
                        "user_info": {},
                    },
                }

        except Exception as e:
            print(f"Connection status error: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "status": 0,
                "message": "Failed to get connection status.",
                "payload": {},
            }
            
class DisconnectFitbit(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            # Deactivate the Fitbit connection
            result = DBHelper.update_one(
                "connected_accounts",
                filters={"user_id": uid, "provider": "fitbit"},
                updates={"is_active": Status.REMOVED.value},
            )

            if result:
                return {
                    "status": 1,
                    "message": "Fitbit account disconnected successfully.",
                    "payload": {},
                }
            else:
                return {
                    "status": 0,
                    "message": "No Fitbit account found to disconnect.",
                    "payload": {},
                }

        except Exception as e:
            print(f"Disconnect error: {str(e)}")
            return {
                "status": 0,
                "message": "Failed to disconnect Fitbit account.",
                "payload": {},
            }


class GetFitbitDailyData(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            start_date = request.args.get("startDate")
            end_date = request.args.get("endDate")
            limit = request.args.get("limit", 30, type=int)

            filters = {"user_id": uid}
            if start_date:
                filters["date__gte"] = start_date
            if end_date:
                filters["date__lte"] = end_date

            daily_data = DBHelper.find(
                "fitbit_daily_data",
                filters=filters,
                select_fields=["*"],
                limit=limit,
                order_by="date DESC",
            )

            return {
                "status": 1,
                "message": "Fitbit daily data retrieved.",
                "payload": {"daily_data": daily_data},
            }

        except Exception as e:
            print(f"Daily data error: {str(e)}")
            return {
                "status": 0,
                "message": "Failed to get daily data.",
                "payload": {},
            }


class GetFitbitSleepData(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            start_date = request.args.get("startDate")
            end_date = request.args.get("endDate")
            limit = request.args.get("limit", 30, type=int)

            filters = {"user_id": uid}
            if start_date:
                filters["date__gte"] = start_date
            if end_date:
                filters["date__lte"] = end_date

            sleep_data = DBHelper.find(
                "fitbit_sleep_data",
                filters=filters,
                select_fields=["*"],
                limit=limit,
                order_by="date DESC",
            )

            return {
                "status": 1,
                "message": "Fitbit sleep data retrieved.",
                "payload": {"sleep_data": sleep_data},
            }

        except Exception as e:
            print(f"Sleep data error: {str(e)}")
            return {
                "status": 0,
                "message": "Failed to get sleep data.",
                "payload": {},
            }


class GetFitbitActivities(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            start_date = request.args.get("startDate")
            end_date = request.args.get("endDate")
            limit = request.args.get("limit", 20, type=int)

            filters = {"user_id": uid}
            if start_date:
                filters["activity_date__gte"] = start_date
            if end_date:
                filters["activity_date__lte"] = end_date

            activities = DBHelper.find(
                "fitbit_activities",
                filters=filters,
                select_fields=["*"],
                limit=limit,
                order_by="activity_date DESC",
            )

            return {
                "status": 1,
                "message": "Fitbit activities retrieved.",
                "payload": {"activities": activities},
            }

        except Exception as e:
            print(f"Activities error: {str(e)}")
            return {
                "status": 0,
                "message": "Failed to get activities.",
                "payload": {},
            }


class GetFitbitSyncLogs(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            limit = request.args.get("limit", 50, type=int)

            sync_logs = DBHelper.find(
                "fitbit_sync_logs",
                filters={"user_id": uid},
                select_fields=["*"],
                limit=limit,
                order_by="sync_date DESC",
            )

            return {
                "status": 1,
                "message": "Fitbit sync logs retrieved.",
                "payload": {"sync_logs": sync_logs},
            }

        except Exception as e:
            print(f"Sync logs error: {str(e)}")
            return {
                "status": 0,
                "message": "Failed to get sync logs.",
                "payload": {},
            }


class FitbitWebhook(Resource):
    def post(self):
        try:
            # Fitbit webhook verification
            verification_code = request.args.get("verify")
            if verification_code:
                return verification_code, 200

            # Process webhook data
            webhook_data = request.get_json()
            if not webhook_data:
                return {"status": "no data"}, 400

            # Log webhook for debugging
            print(f"Fitbit webhook received: {webhook_data}")

            # Process each user's data updates
            for update in webhook_data:
                owner_id = update.get("ownerId")
                if not owner_id:
                    continue

                # Find user by Fitbit ID
                user_account = DBHelper.find_one(
                    "connected_accounts",
                    filters={"email": owner_id, "provider": "fitbit"},
                    select_fields=["user_id"],
                )

                if user_account:
                    # Trigger sync for this user
                    trigger_user_sync(user_account["user_id"], update)

            return {"status": "processed"}, 200

        except Exception as e:
            print(f"Webhook error: {str(e)}")
            return {"status": "error"}, 500

    def get(self):
        # Fitbit subscriber verification
        verification_code = request.args.get("verify")
        if verification_code:
            return verification_code, 200
        return {"status": "verification required"}, 400


# Helper functions (EXISTING + NEW GOALS FUNCTIONS)

def refresh_fitbit_token(user_id, refresh_token):
    """Refresh Fitbit access token"""
    try:
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }
        
        response = requests.post(
            FITBIT_TOKEN_URI,
            data=data,
            auth=(FITBIT_CLIENT_ID, FITBIT_CLIENT_SECRET),  # Use proper Basic Auth
        )
        
        if response.status_code == 200:
            token_data = response.json()
            new_access_token = token_data["access_token"]
            new_refresh_token = token_data.get("refresh_token", refresh_token)
            expires_in = token_data.get("expires_in", 28800)
            
            # Calculate new expiration time
            new_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
            
            # Update in database
            DBHelper.update_one(
                "connected_accounts",
                filters={"user_id": user_id, "provider": "fitbit"},
                updates={
                    "access_token": new_access_token,
                    "refresh_token": new_refresh_token,
                    "expires_at": new_expires_at.isoformat(),  # Store as string
                    "updated_at": datetime.utcnow().isoformat(),
                },
            )
            
            print(f"DEBUG: Token refreshed successfully for user {user_id}")
            return new_access_token
        else:
            print(f"Token refresh failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Token refresh error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def fetch_fitbit_activity_data(access_token, date):
    """Fetch daily activity data from Fitbit"""
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Get daily summary
        response = requests.get(
            f"{FITBIT_API_BASE}/user/-/activities/date/{date}.json",
            headers=headers,
        )
        
        if response.status_code == 200:
            data = response.json()
            summary = data.get("summary", {})
            
            return {
                "steps": summary.get("steps", 0),
                "calories_burned": summary.get("caloriesOut", 0),
                "distance": summary.get("distances", [{}])[0].get("distance", 0) if summary.get("distances") else 0,
                "floors": summary.get("floors", 0),
                "active_minutes": summary.get("veryActiveMinutes", 0) + summary.get("fairlyActiveMinutes", 0),
                "sedentary_minutes": summary.get("sedentaryMinutes", 0),
                "resting_heart_rate": summary.get("restingHeartRate", 0),
            }
        else:
            print(f"Failed to fetch activity data: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error fetching activity data: {str(e)}")
        return None


def fetch_fitbit_sleep_data(access_token, date):
    """Fetch sleep data from Fitbit"""
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = requests.get(
            f"{FITBIT_API_BASE}/user/-/sleep/date/{date}.json",
            headers=headers,
        )
        
        if response.status_code == 200:
            data = response.json()
            sleep_logs = data.get("sleep", [])
            
            if sleep_logs:
                main_sleep = sleep_logs[0]  # Primary sleep session
                levels = main_sleep.get("levels", {})
                
                return {
                    "duration": main_sleep.get("duration", 0) // 60000,  # Convert to minutes
                    "efficiency": main_sleep.get("efficiency", 0),
                    "minutes_asleep": main_sleep.get("minutesAsleep", 0),
                    "minutes_awake": main_sleep.get("minutesAwake", 0),
                    "minutes_to_fall_asleep": main_sleep.get("minutesToFallAsleep", 0),
                    "time_in_bed": main_sleep.get("timeInBed", 0),
                    "deep_sleep_minutes": levels.get("summary", {}).get("deep", {}).get("minutes", 0),
                    "light_sleep_minutes": levels.get("summary", {}).get("light", {}).get("minutes", 0),
                    "rem_sleep_minutes": levels.get("summary", {}).get("rem", {}).get("minutes", 0),
                    "wake_count": levels.get("summary", {}).get("wake", {}).get("count", 0),
                }
        else:
            print(f"Failed to fetch sleep data: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error fetching sleep data: {str(e)}")
        return None


def fetch_fitbit_body_data(access_token, date):
    """Fetch body composition data from Fitbit - Updated to fetch recent data, not just today"""
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Calculate date range - get last 30 days of data
        from datetime import datetime, timedelta
        today = datetime.now()
        start_date = (today - timedelta(days=30)).strftime("%Y-%m-%d")
        end_date = today.strftime("%Y-%m-%d")
        
        print(f"DEBUG: Fetching body data from {start_date} to {end_date}")
        
        body_data = {}
        
        # Get weight data for the last 30 days
        weight_response = requests.get(
            f"{FITBIT_API_BASE}/user/-/body/log/weight/date/{start_date}/{end_date}.json",
            headers=headers,
        )
        
        print(f"DEBUG: Weight API response status: {weight_response.status_code}")
        
        if weight_response.status_code == 200:
            weight_data = weight_response.json()
            weight_logs = weight_data.get("weight", [])
            print(f"DEBUG: Found {len(weight_logs)} weight entries")
            
            if weight_logs:
                # Get the most recent weight entry
                latest_weight = weight_logs[-1]  # Fitbit returns in chronological order
                body_data["weight"] = latest_weight.get("weight", 0)
                body_data["bmi"] = latest_weight.get("bmi", 0)
                body_data["weight_date"] = latest_weight.get("date", date)
                print(f"DEBUG: Latest weight: {body_data['weight']} lbs, BMI: {body_data['bmi']}, Date: {body_data['weight_date']}")
        else:
            print(f"DEBUG: Weight API failed: {weight_response.status_code} - {weight_response.text}")
        
        # Get body fat data for the last 30 days
        fat_response = requests.get(
            f"{FITBIT_API_BASE}/user/-/body/log/fat/date/{start_date}/{end_date}.json",
            headers=headers,
        )
        
        print(f"DEBUG: Body fat API response status: {fat_response.status_code}")
        
        if fat_response.status_code == 200:
            fat_data = fat_response.json()
            fat_logs = fat_data.get("fat", [])
            print(f"DEBUG: Found {len(fat_logs)} body fat entries")
            
            if fat_logs:
                # Get the most recent body fat entry
                latest_fat = fat_logs[-1]
                body_data["body_fat_percentage"] = latest_fat.get("fat", 0)
                body_data["fat_date"] = latest_fat.get("date", date)
                print(f"DEBUG: Latest body fat: {body_data['body_fat_percentage']}%, Date: {body_data['fat_date']}")
        else:
            print(f"DEBUG: Body fat API failed: {fat_response.status_code} - {fat_response.text}")
        
        print(f"DEBUG: Final body data: {body_data}")
        return body_data if body_data else None
        
    except Exception as e:
        print(f"Error fetching body data: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

# NEW: Fitbit Goals API Functions

def fetch_fitbit_goals_data(access_token):
    """Fetch all goals data from Fitbit (daily activity goals, body goals, weekly goals)"""
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        goals_data = {}
        
        print("DEBUG: Fetching Fitbit goals data...")
        
        # 1. Fetch Daily Activity Goals (steps, calories, distance, active minutes)
        print("DEBUG: Fetching daily activity goals...")
        daily_goals_response = requests.get(
            f"{FITBIT_API_BASE}/user/-/activities/goals/daily.json",
            headers=headers,
        )
        
        if daily_goals_response.status_code == 200:
            daily_goals = daily_goals_response.json().get("goals", {})
            goals_data.update({
                "daily_steps_goal": daily_goals.get("steps", 0),
                "daily_calories_goal": daily_goals.get("caloriesOut", 0),
                "daily_distance_goal": daily_goals.get("distance", 0),
                "daily_active_minutes_goal": daily_goals.get("activeMinutes", 0),
                "daily_floors_goal": daily_goals.get("floors", 0),
            })
            print(f"DEBUG: Daily goals fetched: {daily_goals}")
        else:
            print(f"DEBUG: Daily goals API failed: {daily_goals_response.status_code} - {daily_goals_response.text}")
        
        # 2. Fetch Weekly Activity Goals  
        print("DEBUG: Fetching weekly activity goals...")
        weekly_goals_response = requests.get(
            f"{FITBIT_API_BASE}/user/-/activities/goals/weekly.json",
            headers=headers,
        )
        
        if weekly_goals_response.status_code == 200:
            weekly_goals = weekly_goals_response.json().get("goals", {})
            goals_data.update({
                "weekly_distance_goal": weekly_goals.get("distance", 0),
                "weekly_floors_goal": weekly_goals.get("floors", 0),
            })
            print(f"DEBUG: Weekly goals fetched: {weekly_goals}")
        else:
            print(f"DEBUG: Weekly goals API failed: {weekly_goals_response.status_code} - {weekly_goals_response.text}")
        
        # 3. Fetch Body Goals (weight goal)
        print("DEBUG: Fetching body/weight goals...")
        weight_goal_response = requests.get(
            f"{FITBIT_API_BASE}/user/-/body/log/weight/goal.json",
            headers=headers,
        )
        
        if weight_goal_response.status_code == 200:
            weight_goal_data = weight_goal_response.json().get("goal", {})
            goals_data.update({
                "weight_goal": weight_goal_data.get("weight", 0),
                "weight_goal_date": weight_goal_data.get("startDate", ""),
                "starting_weight": weight_goal_data.get("startWeight", 0),
            })
            print(f"DEBUG: Weight goal fetched: {weight_goal_data}")
        else:
            print(f"DEBUG: Weight goal API failed: {weight_goal_response.status_code} - {weight_goal_response.text}")
        
        # 4. Fetch Body Fat Goal (if available)
        print("DEBUG: Fetching body fat goal...")
        fat_goal_response = requests.get(
            f"{FITBIT_API_BASE}/user/-/body/log/fat/goal.json",
            headers=headers,
        )
        
        if fat_goal_response.status_code == 200:
            fat_goal_data = fat_goal_response.json().get("goal", {})
            goals_data.update({
                "body_fat_goal": fat_goal_data.get("fat", 0),
            })
            print(f"DEBUG: Body fat goal fetched: {fat_goal_data}")
        else:
            print(f"DEBUG: Body fat goal API failed: {fat_goal_response.status_code} - {fat_goal_response.text}")
        
        print(f"DEBUG: All goals data compiled: {goals_data}")
        return goals_data if goals_data else None
        
    except Exception as e:
        print(f"Error fetching goals data: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def save_fitbit_goals_data(user_id, goals_data):
    """Save or update user's Fitbit goals in database"""
    try:
        # Check if goals record already exists
        existing_goals = DBHelper.find_one(
            "fitbit_user_goals",
            filters={"user_id": user_id},
        )
        
        data_to_save = {
            "user_id": user_id,
            "daily_steps_goal": goals_data.get("daily_steps_goal", 0),
            "daily_calories_goal": goals_data.get("daily_calories_goal", 0),
            "daily_distance_goal": goals_data.get("daily_distance_goal", 0),
            "daily_active_minutes_goal": goals_data.get("daily_active_minutes_goal", 0),
            "daily_floors_goal": goals_data.get("daily_floors_goal", 0),
            "weekly_distance_goal": goals_data.get("weekly_distance_goal", 0),
            "weekly_floors_goal": goals_data.get("weekly_floors_goal", 0),
            "weight_goal": goals_data.get("weight_goal", 0),
            "weight_goal_date": goals_data.get("weight_goal_date", ""),
            "starting_weight": goals_data.get("starting_weight", 0),
            "body_fat_goal": goals_data.get("body_fat_goal", 0),
            "updated_at": datetime.utcnow().isoformat(),
            "is_active": 1,
        }
        
        if existing_goals:
            # Update existing record
            DBHelper.update_one(
                "fitbit_user_goals",
                filters={"user_id": user_id},
                updates=data_to_save,
            )
            print(f"DEBUG: Updated existing goals for user {user_id}")
        else:
            # Insert new record
            data_to_save["id"] = uniqueId(digit=8)
            data_to_save["created_at"] = datetime.utcnow().isoformat()
            DBHelper.insert("fitbit_user_goals", **data_to_save)
            print(f"DEBUG: Inserted new goals for user {user_id}")
            
    except Exception as e:
        print(f"Error saving goals data: {str(e)}")
        import traceback
        traceback.print_exc()

def save_fitbit_daily_data(user_id, date, activity_data):
    """Save daily activity data to database"""
    try:
        # Check if data already exists
        existing = DBHelper.find_one(
            "fitbit_daily_data",
            filters={"user_id": user_id, "date": date},
        )
        
        data_to_save = {
            "user_id": user_id,
            "date": date,
            "steps": activity_data.get("steps", 0),
            "calories_burned": activity_data.get("calories_burned", 0),
            "distance": activity_data.get("distance", 0),
            "floors_climbed": activity_data.get("floors", 0),
            "active_minutes": activity_data.get("active_minutes", 0),
            "sedentary_minutes": activity_data.get("sedentary_minutes", 0),
            "resting_heart_rate": activity_data.get("resting_heart_rate", 0),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        if existing:
            DBHelper.update_one(
                "fitbit_daily_data",
                filters={"user_id": user_id, "date": date},
                updates=data_to_save,
            )
        else:
            data_to_save["id"] = uniqueId(digit=8)
            data_to_save["created_at"] = datetime.utcnow().isoformat()
            DBHelper.insert("fitbit_daily_data", **data_to_save)
            
    except Exception as e:
        print(f"Error saving daily data: {str(e)}")


def save_fitbit_sleep_data(user_id, date, sleep_data):
    """Save sleep data to database"""
    try:
        # Check if data already exists
        existing = DBHelper.find_one(
            "fitbit_sleep_data",
            filters={"user_id": user_id, "date": date},
        )
        
        data_to_save = {
            "user_id": user_id,
            "date": date,
            "duration_minutes": sleep_data.get("duration", 0),
            "efficiency": sleep_data.get("efficiency", 0),
            "minutes_asleep": sleep_data.get("minutes_asleep", 0),
            "minutes_awake": sleep_data.get("minutes_awake", 0),
            "minutes_to_fall_asleep": sleep_data.get("minutes_to_fall_asleep", 0),
            "time_in_bed": sleep_data.get("time_in_bed", 0),
            "deep_sleep_minutes": sleep_data.get("deep_sleep_minutes", 0),
            "light_sleep_minutes": sleep_data.get("light_sleep_minutes", 0),
            "rem_sleep_minutes": sleep_data.get("rem_sleep_minutes", 0),
            "wake_count": sleep_data.get("wake_count", 0),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        if existing:
            DBHelper.update_one(
                "fitbit_sleep_data",
                filters={"user_id": user_id, "date": date},
                updates=data_to_save,
            )
        else:
            data_to_save["id"] = uniqueId(digit=8)
            data_to_save["created_at"] = datetime.utcnow().isoformat()
            DBHelper.insert("fitbit_sleep_data", **data_to_save)
            
    except Exception as e:
        print(f"Error saving sleep data: {str(e)}")


def save_fitbit_body_data(user_id, date, body_data):
    """Save body composition data to existing daily data"""
    try:
        # Update existing daily data record with body measurements
        DBHelper.update_one(
            "fitbit_daily_data",
            filters={"user_id": user_id, "date": date},
            updates={
                "weight": body_data.get("weight", 0),
                "bmi": body_data.get("bmi", 0),
                "body_fat_percentage": body_data.get("body_fat_percentage", 0),
                "updated_at": datetime.utcnow().isoformat(),
            },
        )
        
    except Exception as e:
        print(f"Error saving body data: {str(e)}")


def trigger_user_sync(user_id, webhook_update):
    """Trigger sync for user when webhook received"""
    try:
        # Log the webhook trigger
        DBHelper.insert(
            "fitbit_sync_logs",
            user_id=user_id,
            sync_date=datetime.utcnow().isoformat(),
            sync_type="webhook",
            data_types=json.dumps(webhook_update.get("collectionType", [])),
            status="triggered",
            records_synced=0,
        )
        
        # Here you could trigger an async job to sync this user's data
        # For now, just log it
        print(f"Webhook sync triggered for user {user_id}")
        
    except Exception as e:
        print(f"Error triggering sync: {str(e)}")