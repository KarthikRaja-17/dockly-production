import io
import json
import random
import re
from threading import Thread
import traceback
import uuid
import bcrypt
from flask import request

# from root.encryption import encrypt_data_simple
from root.utilis import (
    format_timestamp,
    get_device_info,
    get_or_create_subfolder,
    handle_user_session,
    uniqueId,
)
from werkzeug.utils import secure_filename
from googleapiclient.http import MediaIoBaseUpload
from root.files.models import DriveBaseResource
from root.helpers.logs import AuditLogger
from flask_restful import Resource
from datetime import datetime, timedelta, timezone
import pytz
import requests
from root.common import (
    DocklyUsers,
    EmailVerification,
    Hubs,
    HubsEnum,
    MFAStatus,
    Status,
    TrialPeriod,
)
from root.auth.auth import auth_required, getAccessTokens
from root.utilis import (
    get_device_info,
    get_or_create_subfolder,
    handle_user_session,
    uniqueId,
)
from root.config import (
    EMAIL_PASSWORD,
    EMAIL_SENDER,
    SMTP_PORT,
    SMTP_SERVER,
)
from root.db.dbHelper import DBHelper
import smtplib
from email.message import EmailMessage


def generate_otp():
    return random.randint(1000, 9999)


def send_otp_email(email, otp):
    print(f"otp: {otp}")
    print(f"email: {email}")
    try:
        msg = EmailMessage()
        msg["Subject"] = "Your OTP Code for Dockly"
        msg["From"] = EMAIL_SENDER
        msg["To"] = email
        msg.set_content(f"Your OTP is: {otp}\nValid for 10 minutes.")

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)

        return {"otp": otp, "email": email}
    except Exception as e:
        # Optional: Add error logging
        return {"otp": None, "email": email, "error": str(e)}


def format_phone_number(mobile):
    # Remove '+' and any non-numeric characters
    return mobile.replace("+", "").strip()


def send_otp_sms(mobile, otp):

    url = "http://localhost:9090/intl"  # TextBelt running locally
    project_name = "Dockly"

    data = {
        "number": str(mobile),  # Ensure it's a string
        "message": f"{project_name} OTP: {otp}. Use this code to verify your login.",
        "key": "textbelt",  # Default key when running locally
    }

    response = requests.post(url, data=data)

    try:
        return response.json()
    except requests.exceptions.JSONDecodeError:
        return {
            "error": "Invalid response from SMS API",
            "response_text": response.text,
        }


# def maskMobile(value, ifEmpty=False):
#     pattern = ("\s*(?:\+?(\d{1,3}))?[-. (]*(\d{2})[-. )]*(\d{5})[-. ]*(\d{3})(?: *x(\d+))?\s*")
#     result = re.findall(pattern, value)

#     if len(result) > 0:
#         result = result[0]

#     if not (len(result) > 3):
#         return ifEmpty

#     return f"{result[1]}*****{result[3]}"


def getUtcCurrentTime():
    return datetime.now(tz=pytz.UTC)


def store_user_session(user_id: str, session_token: str, is_active=Status.ACTIVE.value):
    ip_address = request.remote_addr
    user_agent = request.headers.get("User-Agent")
    device_info = get_device_info()

    # ⿡ Check if session already exists
    existing_session = DBHelper.find_one(
        "user_sessions", filters={"user_id": user_id}, select_fields=["user_id"]
    )

    if existing_session:
        # 🔁 Update session
        DBHelper.update(
            table_name="user_sessions",
            filters={"user_id": user_id},
            update_fields={
                "session_token": session_token,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "device_info": device_info,
                "is_active": is_active,
                "last_active": datetime.utcnow(),
                "logged_out": None,
            },
        )
    else:
        # 🆕 Insert session
        DBHelper.insert(
            "user_sessions",
            user_id=user_id,
            session_token=session_token,
            ip_address=ip_address,
            user_agent=user_agent,
            device_info=device_info,
            is_active=is_active,
            created_at=datetime.utcnow(),
            last_active=datetime.utcnow(),
            logged_out=None,
        )

    # ⿢ Always insert into session_logs
    DBHelper.insert(
        "session_logs",
        user_id=user_id,
        ip_address=ip_address,
        device_info=device_info,
        action="login",
        timestamp=datetime.utcnow(),
    )


class RegisterUser(Resource):
    def post(self):
        data = request.get_json()
        name = data.get("userName")
        inputEmail = data.get("email", "")
        isBookmark = data.get("isBookmark", False)
        userId = ""

        existingUser = DBHelper.find_one(
            "users",
            filters={"user_name": name, "is_active": Status.ACTIVE.value},
            select_fields=["email", "uid"],
        )

        if existingUser:
            userId = existingUser.get("uid")
            dbEmail = existingUser.get("email")
            print(f"dbEmail: {dbEmail}")

            if dbEmail and dbEmail.endswith("@guest.dockly.me"):
                return {
                    "status": 1,
                    "message": "session created",
                    "payload": {
                        "userId": userId,
                        "redirectUrl": "/sign-up",
                    },
                }

            if inputEmail and inputEmail == dbEmail:
                token = getAccessTokens({"uid": userId})
                store_user_session(user_id=userId, session_token=token["accessToken"])

                # ✅ Log successful login
                AuditLogger.log(
                    user_id=userId,
                    action="LOGIN",
                    resource_type="users",
                    resource_id=userId,
                    success=True,
                    metadata={"via": "RegisterUser", "email": dbEmail},
                )

                return {
                    "status": 1,
                    "message": "Welcome back",
                    "payload": {
                        "userId": userId,
                        "token": token["accessToken"],
                        "redirectUrl": "/dashboard",
                        "name": name,
                    },
                }

            if not inputEmail and dbEmail:
                otp = generate_otp()
                Thread(target=send_otp_email, args=(dbEmail, otp)).start()

                # ✅ Log OTP sent attempt
                otpLogId = AuditLogger.log(
                    user_id=userId,
                    action="SEND_OTP",
                    resource_type="users",
                    resource_id=userId,
                    success=True,
                    metadata={"email": dbEmail, "otp": otp},
                )

                return {
                    "status": 1,
                    "message": f"OTP sent to {dbEmail} for email verification",
                    "payload": {
                        "redirectUrl": "/verify-email",
                        "email": dbEmail,
                        "userId": userId,
                        "name": name,
                        "otpId": otpLogId,
                        "otpStatus": {"otp": otp, "email": dbEmail},
                    },
                }

            # ❌ Log failed attempt
            AuditLogger.log(
                user_id=None,
                action="REGISTER_ATTEMPT",
                resource_type="users",
                resource_id=None,
                success=False,
                error_message="User name already exists",
                metadata={"user_name": name},
            )

            return {
                "status": 0,
                "message": "User name already exists and is unavailable",
                "payload": {},
            }

        if isBookmark:
            # ❌ Log bookmark rejection
            AuditLogger.log(
                user_id=None,
                action="REGISTER_ATTEMPT",
                resource_type="users",
                resource_id=None,
                success=False,
                error_message="Tried registering from bookmark",
                metadata={"user_name": name},
            )
            return {
                "status": 0,
                "message": "No user name found. Please register.",
                "payload": {},
            }

        # ✅ Create new user
        # uid = uniqueId(digit=5, isNum=True, prefix="USER")
        uid = f"USER{uuid.uuid4().hex[:8].upper()}"
        fakeEmail = f"{uid}@guest.dockly.me"
        userId = DBHelper.insert(
            "users",
            return_column="uid",
            uid=uid,
            email=fakeEmail,
            password_hash="",
            user_name=name,
            phone="",
            is_active=Status.ACTIVE.value,
            email_verified=EmailVerification.NOT_VERIFIED.value,
            role=DocklyUsers.Guests.value,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            last_login=None,
            mfa_enabled=MFAStatus.DISABLED.value,
            mfa_secret="",
        )

        # ✅ Log user creation
        AuditLogger.log(
            user_id=userId,
            action="CREATE",
            resource_type="users",
            resource_id=userId,
            success=True,
            metadata={"name": name},
        )

        return {
            "status": 1,
            "message": "User registered and session created",
            "payload": {
                "userId": userId,
                "redirectUrl": "/sign-up",
            },
        }

class SaveUserEmail(Resource):
    def post(self):
        inputData = request.get_json(silent=True)
        userId = inputData.get("userId")
        email = inputData.get("email")

        # ✅ Case 1: Existing user is updating their email
        if userId:
            existingUser = DBHelper.find_one(
                "users",
                filters={"email": email},
                select_fields=["uid", "user_name"],
            )

            if existingUser:
                # ❌ Audit log: email already exists
                AuditLogger.log(
                    user_id=userId,
                    action="UPDATE_EMAIL",
                    resource_type="users",
                    resource_id=userId,
                    success=False,
                    error_message="Email already exists",
                    metadata={"attempted_email": email},
                )
                return {
                    "status": 0,
                    "message": "Email already exists",
                    "payload": {},
                }

            uid = DBHelper.update_one(
                table_name="users",
                filters={"uid": userId},
                updates={"email": email},
                return_fields=["uid"],
            )

            # ✅ Audit log: email updated successfully
            AuditLogger.log(
                user_id=userId,
                action="UPDATE_EMAIL",
                resource_type="users",
                resource_id=userId,
                success=True,
                metadata={"new_email": email},
            )

            otp = generate_otp()
            otpResponse = send_otp_email(email, otp)

            # ✅ Audit log: OTP sent
            otpLogId = AuditLogger.log(
                user_id=userId,
                action="SEND_OTP",
                resource_type="users",
                resource_id=userId,
                success=True,
                metadata={"email": email, "otp": otp},
            )

            username = inputData.get("username", "")
            return {
                "status": 1,
                "message": "OTP sent successfully",
                "payload": {
                    "email": email,
                    "otpStatus": otpResponse,
                    "otpId": otpLogId,
                    "uid": uid,
                    "username": username,
                },
            }

        # ✅ Case 2: New user registering with email
        else:
            existingUser = DBHelper.find_one(
                "users",
                filters={"email": email, "is_active": Status.ACTIVE.value},
                select_fields=["uid", "user_name"],
            )

            otp = generate_otp()
            otpResponse = send_otp_email(email, otp)

            if existingUser:
                uid = existingUser.get("uid")

                # ✅ Audit log: OTP sent for existing user
                otpLogId = AuditLogger.log(
                    user_id=uid,
                    action="SEND_OTP",
                    resource_type="users",
                    resource_id=uid,
                    success=True,
                    metadata={"email": email, "otp": otp},
                )

                return {
                    "status": 1,
                    "message": "OTP sent successfully",
                    "payload": {
                        "email": email,
                        "otpStatus": otpResponse,
                        "otpId": otpLogId,
                        "uid": uid,
                        "username": existingUser.get("user_name"),
                    },
                }

            # 🚀 Create new user if not exists
            usernamePrefix = email.split("@")[0]
            uid = uniqueId(digit=5, isNum=True, prefix="USER")
            username = f"{usernamePrefix}{uid}"

            userId = DBHelper.insert(
                "users",
                return_column="uid",
                uid=uid,
                email=email,
                password_hash="",
                user_name=username,
                phone="",
                email_verified=EmailVerification.NOT_VERIFIED.value,
                is_active=Status.ACTIVE.value,
                role=DocklyUsers.PaidMember.value,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                mfa_enabled=MFAStatus.DISABLED.value,
                mfa_secret="",
            )

            # ✅ Audit log: new user created
            AuditLogger.log(
                user_id=userId,
                action="CREATE",
                resource_type="users",
                resource_id=userId,
                success=True,
                metadata={"user_name": username, "email": email},
            )

            # ✅ Audit log: OTP sent
            otpLogId = AuditLogger.log(
                user_id=userId,
                action="SEND_OTP",
                resource_type="users",
                resource_id=userId,
                success=True,
                metadata={"email": email, "otp": otp},
            )

            return {
                "status": 1,
                "message": "User registered and OTP sent Successfully",
                "payload": {
                    "email": email,
                    "userId": uid,
                    "username": username,
                    "otpId": otpLogId,
                },
            }


def is_otp_valid(otpId, otp):
    otpData = DBHelper.find_one(
        "audit_logs",
        filters={"id": otpId},
        select_fields=["metadata"],
    )
    metadata = otpData.get("metadata")
    stored_otp = metadata.get("otp") if metadata else None

    if int(stored_otp) != int(otp):
        return {
            "status": 0,
            "class": "error",
            "message": "Oops! That OTP doesn't match. Double-check and try again!",
            "payload": {},
        }

    return {
        "status": 1,
        "class": "success",
        "message": "OTP verified!",
        "payload": {},
    }



def ensure_user_permissions(user_id):
    """
    Ensure the user has permissions assigned for all hubs and boards.
    If permissions already exist, do nothing.
    Otherwise, create default permissions (can_read=True, can_write=False).

    Args:
        user_id (str): UUID of the user
    """
    # Check if any permissions already exist for the user
    existing_perm = DBHelper.find_one(
        table_name="user_permissions", filters={"user_id": user_id}
    )
    if existing_perm:
        return  # Already has permissions, no further action needed

    # Fetch all hubs and boards
    hubs = DBHelper.find_all(table_name="hubs", select_fields=["id"])
    boards = DBHelper.find_all(table_name="boards", select_fields=["id"])

    now = datetime.utcnow()

    # Helper to insert a permission record
    def insert_permission(target_type, target_id):
        DBHelper.insert(
            table_name="user_permissions",
            id=str(uuid.uuid4()),
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
            can_read=True,
            can_write=False,
            assigned_at=now,
            updated_at=now,
        )

    # Insert permissions for hubs
    for hub in hubs:
        insert_permission(target_type="hubs", target_id=hub["id"])

    # Insert permissions for boards
    for board in boards:
        insert_permission(target_type="boards", target_id=board["id"])


class OtpVerification(Resource):
    def post(self):
        inputData = request.get_json(silent=True)
        userId = inputData["userId"]
        email = inputData["email"]
        otp = inputData.get("otp")
        duser = inputData.get("duser")

        if not userId:
            userId = DBHelper.find_one(
                "users", filters={"email": email}, select_fields=["uid"]
            ).get("uid")

        # ✅ Validate OTP
        response = is_otp_valid(inputData["otpId"], otp)
        if not response.get("status"):
            AuditLogger.log(
                user_id=userId,
                action="VERIFY_OTP",
                resource_type="users",
                resource_id=userId,
                success=False,
                error_message="Invalid OTP",
                metadata={"otp": otp},
            )
            return response

        # ✅ Mark email as verified
        uid = DBHelper.update_one(
            table_name="users",
            filters={"uid": userId, "email": email},
            updates={
                "email_verified": EmailVerification.VERIFIED.value,
                "updated_at": datetime.utcnow(),
            },
            return_fields=["uid", "email", "role"],
            operator="OR",
        )

        AuditLogger.log(
            user_id=userId,
            action="VERIFY_EMAIL",
            resource_type="users",
            resource_id=userId,
            success=True,
            metadata={"email": uid.get("email")},
        )

        # 🔁 Link family invite notifications
        new_user_email = uid.get("email", "").strip().lower()
        new_user_uid = uid.get("uid")

        pending_invites = DBHelper.find_all(
            table_name="notifications",
            filters={"status": "pending", "task_type": "family_invite"},
            select_fields=["id", "metadata"],
        )

        for invite in pending_invites:
            metadata = invite.get("metadata", {})
            input_data = metadata.get("input_data", {})
            invited_email = input_data.get("email", "").strip().lower()

            if invited_email == new_user_email:
                DBHelper.update(
                    table_name="notifications",
                    filters={"id": invite["id"]},
                    update_fields={
                        "receiver_id": new_user_uid,
                        "task_type": "family_request",  # ✅ Required for action buttons
                        "action_required": True,
                    },
                )

                AuditLogger.log(
                    user_id=new_user_uid,
                    action="LINK_INVITE",
                    resource_type="notifications",
                    resource_id=invite["id"],
                    success=True,
                    metadata={"linked_email": new_user_email},
                )

        # ✅ Generate access token
        userInfo = {"uid": uid.get("uid")}
        token = getAccessTokens(userInfo)
        store_user_session(user_id=userId, session_token=token["accessToken"])

        AuditLogger.log(
            user_id=userId,
            action="CREATE_SESSION",
            resource_type="sessions",
            resource_id=userId,
            success=True,
            metadata={"token": token["accessToken"]},
        )

        # Attach token to response
        response["payload"]["token"] = token["accessToken"]
        response["payload"]["userId"] = userId
        response["payload"]["email"] = uid.get("email")

        checkPlan = DBHelper.find_one(
            table_name="user_subscriptions",
            filters={"user_id": userId},
            select_fields=["id", "plan_id", "expires_at"],
        )

        if checkPlan:
            setPlan = checkPlan.get("plan_id")

        if not checkPlan:
            setPlan = DBHelper.insert(
                table_name="user_subscriptions",
                user_id=userId,
                plan_id="free_trial",
                subscription_status=Status.ACTIVE.value,
                started_at=datetime.utcnow(),
                expires_at=datetime.utcnow() + timedelta(days=TrialPeriod.DAYS.value),
                auto_renew=False,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                return_column="plan_id",
            )
            AuditLogger.log(
                user_id=userId,
                action="PLAN_SUBSCRIPTION",
                resource_type="user_subscriptions",
                resource_id=userId,
                success=True,
                metadata={"plan_id": "free_trial"},
            )

        response["payload"]["subscription"] = setPlan
        response["payload"]["role"] = uid.get("role")
        force_logout = DBHelper.update_one(
            "user_sessions", {"user_id": userId}, {"force_logout": False}
        )
        ensure_user_permissions(userId)

        return response


class GetUserMenus(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        boards = []
        hubs = []

        # Get all user permissions
        all_menus = DBHelper.find_all(
            table_name="user_permissions",
            filters={"user_id": uid},
            select_fields=["id", "target_type", "target_id"],
        )

        for perm in all_menus:
            target_type = perm.get("target_type")  # "boards" or "hubs"
            target_id = perm.get("target_id")

            target_data = DBHelper.find_one(
                table_name=target_type,
                filters={"id": target_id},
            )

            if not target_data:
                continue

            # Attach only necessary fields
            menu_item = {
                "id": target_data.get("id"),
                "title": target_data.get("title"),
                "is_active": target_data.get("is_active"),
                "display_order": target_data.get("display_order"),
                # Frontend will map this string to actual icon component
                "icon": self.get_icon_for_menu(target_type, target_data),
            }

            if target_type == "boards":
                menu_item["board_name"] = target_data.get("board_name")
                boards.append(menu_item)
            elif target_type == "hubs":
                menu_item["hub_name"] = target_data.get("hub_name")
                hubs.append(menu_item)

        return {
            "status": 1,
            "message": "Menus fetched",
            "payload": {"boards": boards, "hubs": hubs},
        }

    def get_icon_for_menu(self, target_type, target_data):
        # You can make this a mapping dictionary instead of hardcoding
        if target_type == "boards":
            mapping = {
                "family": "TeamOutlined",
                "finance": "DollarOutlined",
                "home": "HomeOutlined",
                "health": "HeartOutlined",
            }
            return mapping.get(target_data.get("board_name"), "AppstoreOutlined")

        if target_type == "hubs":
            mapping = {
                "notes": "FileTextOutlined",
                "bookmarks": "IdcardOutlined",
                "vault": "LockOutlined",
                "files": "FolderOpenOutlined",
            }
            return mapping.get(target_data.get("hub_name"), "AppstoreOutlined")

        return "AppstoreOutlined"


class MobileVerification(Resource):
    def post(self):
        inputData = request.get_json(silent=True)
        uid = inputData.get("uid")
        otp = inputData.get("otp")
        stored_otp = inputData.get("storedOtp")

        try:
            response = is_otp_valid(stored_otp, otp)
            success = response.get("status", 0) == 1

            # Create access token
            userInfo = {"uid": uid}
            token = getAccessTokens(userInfo)
            response["payload"]["token"] = token["accessToken"]

            # Audit log
            AuditLogger.log(
                user_id=uid,
                action="mobile verification",
                resource_type="user",
                resource_id=uid,
                success=success,
                error_message=None if success else "OTP validation failed",
                metadata={"inputOtp": otp, "storedOtp": stored_otp},
            )

            return response

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="mobile verification",
                resource_type="user",
                resource_id=uid,
                success=False,
                error_message=str(e),
                metadata={"inputOtp": otp, "storedOtp": stored_otp},
            )
            return {
                "status": 0,
                "message": f"Error verifying mobile: {str(e)}",
                "payload": {},
            }


class SignInVerification(Resource):
    def post(self):
        inputData = request.get_json(silent=True)
        uid = inputData.get("uid")
        otp = inputData.get("otp")
        stored_otp = inputData.get("storedOtp")

        try:
            response = is_otp_valid(stored_otp, otp)
            success = response.get("status", 0) == 1

            # Create access token and session
            userInfo = {"uid": uid}
            token = getAccessTokens(userInfo)
            handle_user_session(uid)
            response["payload"]["token"] = token["accessToken"]

            # Audit log
            AuditLogger.log(
                user_id=uid,
                action="sign in verification",
                resource_type="user",
                resource_id=uid,
                success=success,
                error_message=None if success else "OTP validation failed",
                metadata={"inputOtp": otp, "storedOtp": stored_otp},
            )

            return response

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="sign in verification",
                resource_type="user",
                resource_id=uid,
                success=False,
                error_message=str(e),
                metadata={"inputOtp": otp, "storedOtp": stored_otp},
            )
            return {
                "status": 0,
                "message": f"Error verifying sign-in: {str(e)}",
                "payload": {},
            }


class LoginUser(Resource):
    def post(self):
        inputData = request.get_json(silent=True)
        login_type = inputData.get("type")
        otp = generate_otp()
        user_id = None
        action = None
        success = False
        error_message = None

        try:
            if login_type == "email":
                email = inputData.get("email")
                user = DBHelper.find_one(
                    table_name="users", filters={"email": email}, select_fields=["uid"]
                )

                if not user:
                    error_message = "User not found with this email"
                    action = "Email Login Attempt"
                    AuditLogger.log(
                        user_id="unknown",
                        action=action,
                        resource_type="user",
                        resource_id="N/A",
                        success=False,
                        error_message=error_message,
                        metadata={"email": email},
                    )
                    return {"status": 0, "message": error_message}

                user_id = user.get("uid")
                otpResponse = send_otp_email(email, otp)
                action = "Email Login OTP Sent"
                success = True

            elif login_type == "mobile":
                mobileNumber = inputData.get("mobile")
                user = DBHelper.find_one(
                    table_name="users",
                    filters={"mobile": mobileNumber},
                    select_fields=["uid"],
                )

                if not user:
                    error_message = "User not found with this mobile number"
                    action = "Mobile Login Attempt"
                    AuditLogger.log(
                        user_id="unknown",
                        action=action,
                        resource_type="user",
                        resource_id="N/A",
                        success=False,
                        error_message=error_message,
                        metadata={"mobile": mobileNumber},
                    )
                    return {"status": 0, "message": error_message}

                user_id = user.get("uid")
                otpResponse = {"otp": otp, "mobileNumber": mobileNumber}
                action = "Mobile Login OTP Sent"
                success = True

            else:
                error_message = "Invalid login type"
                action = "Login Attempt"
                AuditLogger.log(
                    user_id="unknown",
                    action=action,
                    resource_type="user",
                    resource_id="N/A",
                    success=False,
                    error_message=error_message,
                    metadata={"inputData": inputData},
                )
                return {"status": 0, "message": error_message}

            # Log success
            AuditLogger.log(
                user_id=user_id,
                action=action,
                resource_type="user",
                resource_id=user_id,
                success=success,
                metadata={"otp": otp, "loginType": login_type},
            )

            return {
                "status": 1,
                "payload": {"otpStatus": {**otpResponse, "userId": user_id}},
            }

        except Exception as e:
            error_message = str(e)
            action = "Login Attempt Error"
            AuditLogger.log(
                user_id=user_id or "unknown",
                action=action,
                resource_type="user",
                resource_id=user_id or "N/A",
                success=False,
                error_message=error_message,
                metadata={"inputData": inputData},
            )
            return {"status": 0, "message": "Login failed", "error": error_message}


class GetStarted(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        if not uid:
            return {"status": 0, "message": "User ID is required", "payload": {}}

        # Check if user has Google token and bank board set up
        google_account = DBHelper.find_one(
            "google_tokens", filters={"uid": uid}, select_fields=["uid"]
        )
        bank_details = DBHelper.find_one(
            "bankDetails", filters={"uid": uid}, select_fields=["uid"]
        )

        is_redirect = not (google_account or bank_details)

        return {
            "status": 1,
            "message": "Fetched Get Started steps",
            "payload": {
                "username": user.get("username", ""),
                "uid": uid,
                "isRedirect": is_redirect,
            },
        }


class GetRecentActivities(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        if not uid:
            return {"status": 0, "message": "User ID is required", "payload": {}}

        # Use DBHelper to fetch recent activities
        rows = DBHelper.find_all(
            table_name="audit_logs",
            filters={"user_id": uid},
            select_fields=[
                "id",
                "user_id",
                "action",
                "resource_type",
                "resource_id",
                "ip_address",
                "user_agent",
                "created_at",
            ],
            order_by="created_at DESC",
        )

        # Convert into frontend-friendly format
        activities = []
        for row in rows:
            activities.append(
                {
                    "id": str(row["id"]),
                    "user_id": row["user_id"],
                    "action": row["action"],
                    "resource_type": row["resource_type"],
                    "resource_id": row["resource_id"],
                    "ip_address": row["ip_address"],
                    "user_agent": row["user_agent"],
                    "timestamp": format_timestamp(row["created_at"]),
                }
            )

        return {
            "status": 1,
            "message": "Fetched recent activities",
            "payload": {
                "username": user.get("username", ""),
                "uid": uid,
                "activities": activities,
            },
        }


def parse_dob(dob_str):
    """
    Safely parse a date of birth string in ISO format.
    Handles None, empty strings, or invalid formats gracefully.
    """
    if not dob_str:
        return None
    try:
        return datetime.fromisoformat(dob_str.replace("Z", "+00:00")).date()
    except Exception:
        return None


class AddDetails(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        action = None
        success = False
        error_message = None

        try:
            existingUser = DBHelper.find_one(
                "personal_information",
                filters={"user_id": uid},
                select_fields=["user_id"],
            )

            personal = inputData.get("personal", {})
            address = inputData.get("address", {})

            # --- Update case ---
            if existingUser:
                updates = {}

                # Personal updates
                if "first_name" in personal:
                    updates["first_name"] = personal["first_name"]
                if "last_name" in personal:
                    updates["last_name"] = personal["last_name"]
                if "dob" in personal and personal["dob"]:
                    updates["date_of_birth"] = parse_dob(personal["dob"])
                if "phone" in personal:
                    updates["phone_number"] = personal["phone"]
                if "gender" in personal:
                    updates["gender"] = personal["gender"]
                if "additional_email" in personal:
                    updates["additional_emails"] = personal["additional_email"]

                # Address updates
                if "country" in address:
                    updates["country"] = address["country"]
                if "city" in address:
                    updates["city"] = address["city"]
                if "postal_code" in address:
                    updates["postal_code"] = address["postal_code"]

                if updates:
                    DBHelper.update_one(
                        table_name="personal_information",
                        filters={"user_id": uid},
                        updates=updates,
                        return_fields=["user_id"],
                    )
                    action = "Update User Details"
                    success = True
                    AuditLogger.log(
                        user_id=uid,
                        action=action,
                        resource_type="personal_information",
                        resource_id=uid,
                        success=success,
                        metadata={"updates": updates},
                    )

                return {
                    "status": 1,
                    "message": "User details updated successfully",
                    "payload": {"user_id": uid, "username": user.get("username", "")},
                }

            # --- Insert case ---
            else:
                if not personal and not address:
                    error_message = "No details provided to insert"
                    action = "Insert User Details Attempt"
                    AuditLogger.log(
                        user_id=uid,
                        action=action,
                        resource_type="personal_information",
                        resource_id="N/A",
                        success=False,
                        error_message=error_message,
                        metadata={"inputData": inputData},
                    )
                    return {"status": 0, "message": error_message, "payload": {}}

                userEmailDetails = DBHelper.find_one(
                    "users", filters={"uid": uid}, select_fields=["email"]
                )
                primary_email = userEmailDetails.get("email", "")

                name = DBHelper.insert(
                    "personal_information",
                    return_column="first_name",
                    user_id=uid,
                    family_member_user_id=uid,
                    first_name=personal.get("first_name", ""),
                    last_name=personal.get("last_name", ""),
                    gender=personal.get("gender", None),
                    date_of_birth=parse_dob(personal.get("dob")),
                    phone_number=personal.get("phone", ""),
                    primary_email=primary_email,
                    additional_emails=personal.get("additional_email", None),
                    country=address.get("country", ""),
                    city=address.get("city", ""),
                    postal_code=address.get("postal_code", ""),
                    added_by=uid,
                    edited_by=uid,
                    added_time=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )

                action = "Insert User Details"
                success = True
                AuditLogger.log(
                    user_id=uid,
                    action=action,
                    resource_type="personal_information",
                    resource_id=uid,
                    success=success,
                    metadata={"inserted_name": name, "inputData": inputData},
                )

                return {
                    "status": 1,
                    "message": f"{name}'s Details added successfully",
                    "payload": {"name": name, "username": user.get("username", "")},
                }

        except Exception as e:
            error_message = str(e)
            action = "Add Details Error"
            AuditLogger.log(
                user_id=uid,
                action=action,
                resource_type="personal_information",
                resource_id=uid,
                success=False,
                error_message=error_message,
                metadata={"inputData": inputData},
            )
            return {
                "status": 0,
                "message": "Failed to add/update user details",
                "error": error_message,
            }


class GetUserDetails(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        userDetails = DBHelper.find_one(
            "personal_information",
            filters={"user_id": uid},
            select_fields=[
                "first_name",
                "last_name",
                "date_of_birth",
                "phone_number",
                "country",
                "gender",
                "city",
                "postal_code",
                "primary_email",
                "additional_emails",
            ],
        )

        if not userDetails:
            return {
                "status": 0,
                "message": "User details not found",
                "payload": {},
            }

        if userDetails.get("date_of_birth"):
            userDetails["date_of_birth"] = userDetails["date_of_birth"].isoformat()

        return {
            "status": 1,
            "message": "User details fetched successfully",
            "payload": userDetails,
        }


class EmailSender:
    def __init__(self):
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.smtp_user = EMAIL_SENDER
        self.smtp_password = EMAIL_PASSWORD

    def send_email(self, to_email, subject, body):
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = self.smtp_user
        msg["To"] = to_email
        msg.set_content(body)

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            return True, "Email sent successfully"
        except Exception as e:
            return False, str(e)

    def send_feedback_email(self, sender_email, rating, feedback_type, experience):
        msg = EmailMessage()
        msg["Subject"] = f"New Feedback - {feedback_type or 'General'}"
        msg["From"] = self.smtp_user
        msg["To"] = "vinisellu1102@gmail.com"
        msg["Reply-To"] = sender_email
        msg.set_content(
            f"""
Hi Dockly Team,

You have received new feedback from {sender_email}:

Rating: {rating if rating else 'N/A'}
Type: {feedback_type if feedback_type else 'N/A'}
Experience:
{experience if experience else 'N/A'}

Regards,
Dockly Feedback System
""".strip()
        )

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            return True, "Feedback email sent successfully"
        except Exception as e:
            return False, str(e)


class SendFeedback(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(force=True)
        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="SEND_FEEDBACK_INVALID_JSON",
                resource_type="feedback",
                resource_id="N/A",
                success=False,
                error_message=str(e),
            )
            return {"status": 0, "message": f"Invalid JSON: {str(e)}"}, 400

        rating = data.get("rating")
        feedback_type = data.get("type")
        experience = data.get("experience")

        if not (rating or feedback_type or experience):
            AuditLogger.log(
                user_id=uid,
                action="SEND_FEEDBACK_VALIDATION_FAILED",
                resource_type="feedback",
                resource_id="N/A",
                success=False,
                error_message="At least one of rating, type, or experience is required",
                metadata={"inputData": data},
            )
            return {
                "status": 0,
                "message": "At least one of rating, type, or experience is required.",
            }, 422

        user_email = user.get("email") if user else "unknown@dockly.me"

        email_sender = EmailSender()
        success, msg = email_sender.send_feedback_email(
            sender_email=user_email,
            rating=rating,
            feedback_type=feedback_type,
            experience=experience,
        )

        AuditLogger.log(
            user_id=uid,
            action="SEND_FEEDBACK",
            resource_type="feedback",
            resource_id="N/A",
            success=success,
            error_message=None if success else msg,
            metadata={
                "rating": rating,
                "type": feedback_type,
                "experience": experience,
            },
        )

        if not success:
            return {
                "status": 0,
                "message": f"Failed to send feedback: {msg}",
            }, 500

        return {"status": 1, "message": "Feedback sent successfully"}, 200



class SendAdditionalEmailOtp(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            inputData = request.get_json(silent=True) or {}
            additional_email = inputData.get("email")
            if not additional_email:
                return {"status": 0, "message": "Email is required", "payload": {}}

            # Check if email exists as an additional email for another user
            existing_additional = DBHelper.find_one(
                "personal_information",
                filters={"additional_emails": additional_email},
                select_fields=["user_id"],
            )
            if existing_additional and existing_additional.get("user_id") != uid:
                return {
                    "status": 0,
                    "message": "This email is already registered as an additional email",
                    "payload": {},
                }

            # Generate OTP and set expiration time (10 minutes from now)
            otp = generate_otp()
            expiration_time = datetime.now(tz=pytz.UTC) + timedelta(minutes=10)

            # Send OTP in a separate thread
            Thread(target=send_otp_email, args=(additional_email, otp)).start()

            # ✅ Log OTP with expiration in audit logs
            otpLogId = AuditLogger.log(
                user_id=uid,
                action="SEND_ADDITIONAL_EMAIL_OTP",
                resource_type="users",
                resource_id=uid,
                success=True,
                metadata={
                    "email": additional_email,
                    "otp": otp,
                    "expires_at": expiration_time.isoformat(),
                },
            )

            return {
                "status": 1,
                "message": f"OTP sent to {additional_email}",
                "payload": {
                    "email": additional_email,
                    "otpId": otpLogId,
                    "expires_at": expiration_time.isoformat(),
                },
            }

        except Exception as e:
            # ✅ Log failure
            AuditLogger.log(
                user_id=uid,
                action="SEND_ADDITIONAL_EMAIL_OTP",
                resource_type="users",
                resource_id=uid,
                success=False,
                error_message="Failed to send OTP",
                metadata={"error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to send OTP: {str(e)}",
                "payload": {},
            }, 500


class VerifyAdditionalEmailOtp(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            inputData = request.get_json(silent=True) or {}
            email = inputData.get("email")
            otp = inputData.get("otp")
            otpId = inputData.get("otpId")

            if not all([email, otp, otpId]):
                return {
                    "status": 0,
                    "message": "Email, OTP, and OTP ID are required",
                    "payload": {},
                }

            # Validate OTP and check expiration
            response = is_otp_valid(otpId, otp)
            if not response.get("status"):
                AuditLogger.log(
                    user_id=uid,
                    action="VERIFY_ADDITIONAL_EMAIL_OTP",
                    resource_type="users",
                    resource_id=uid,
                    success=False,
                    error_message=response.get("message", "Invalid OTP"),
                    metadata={"email": email, "otp": otp},
                )
                return response

            # ✅ Log successful verification
            AuditLogger.log(
                user_id=uid,
                action="VERIFY_ADDITIONAL_EMAIL_OTP",
                resource_type="users",
                resource_id=uid,
                success=True,
                metadata={"email": email},
            )

            return {
                "status": 1,
                "message": "Additional email verified successfully",
                "payload": {"email": email, "verified": True},
            }

        except Exception as e:
            # ✅ Log unexpected errors
            AuditLogger.log(
                user_id=uid,
                action="VERIFY_ADDITIONAL_EMAIL_OTP",
                resource_type="users",
                resource_id=uid,
                success=False,
                error_message="OTP verification failed",
                metadata={"error": str(e)},
            )
            return {
                "status": 0,
                "message": f"OTP verification failed: {str(e)}",
                "payload": {},
            }, 500

class UploadProfilePicture(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            target_uid = request.args.get("userId") or uid 
            if "file" not in request.files:
                AuditLogger.log(
                    user_id=uid,
                    action="UPLOAD_PROFILE_PICTURE_FAILED",
                    resource_type="users",
                    resource_id=target_uid,
                    success=False,
                    error_message="No file provided",
                )
                return {"status": 0, "message": "No file provided"}, 400

            file = request.files["file"]

            service = self.get_drive_service(target_uid)
            if not service:
                AuditLogger.log(
                    user_id=uid,
                    action="UPLOAD_PROFILE_PICTURE_FAILED",
                    resource_type="users",
                    resource_id=target_uid,
                    success=False,
                    error_message="Google Drive not connected",
                )
                return {"status": 0, "message": "Google Drive not connected"}, 401

            # ✅ Ensure folder structure: Dockly/Profile Pictures
            root_id = get_or_create_subfolder(service, "DOCKLY", "root")
            profile_id = get_or_create_subfolder(service, "Profile Pictures", root_id)

            # ✅ Store file (replace if exists with same name)
            file_metadata = {
                "name": secure_filename(file.filename),
                "parents": [profile_id],
            }
            media = MediaIoBaseUpload(
                io.BytesIO(file.read()),
                mimetype=file.content_type or "application/octet-stream",
                resumable=True,
            )

            uploaded_file = (
                service.files()
                .create(
                    body=file_metadata,
                    media_body=media,
                    fields="id, name, mimeType, size, modifiedTime, webViewLink",
                )
                .execute()
            )

            # Make file publicly accessible
            service.permissions().create(
                fileId=uploaded_file["id"],
                body={"role": "reader", "type": "anyone"},
            ).execute()

            # ✅ Add public URL for direct image usage
            uploaded_file["publicUrl"] = f"https://drive.google.com/uc?id={uploaded_file['id']}"

            # ✅ Log successful upload
            AuditLogger.log(
                user_id=uid,
                action="UPLOAD_PROFILE_PICTURE",
                resource_type="users",
                resource_id=target_uid,
                success=True,
                metadata={"file_name": uploaded_file["name"], "file_id": uploaded_file["id"]},
            )

            return {
                "status": 1,
                "message": "Profile picture uploaded successfully",
                "payload": {"file": uploaded_file},
            }

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="UPLOAD_PROFILE_PICTURE_FAILED",
                resource_type="users",
                resource_id=target_uid,
                success=False,
                error_message=str(e),
            )
            return {"status": 0, "message": f"Upload failed: {str(e)}"}, 500

class GetProfilePictures(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            target_uid = request.args.get("userId") or uid

            service = self.get_drive_service(target_uid)
            if not service:
                return {"status": 0, "message": "Google Drive not connected"}, 401

            # ✅ Navigate to Dockly/Profile Pictures
            root_id = get_or_create_subfolder(service, "DOCKLY", "root")
            profile_id = get_or_create_subfolder(service, "Profile Pictures", root_id)

            # ✅ Fetch files ordered by modifiedTime (latest first)
            query = f"'{profile_id}' in parents and trashed = false"
            results = (
                service.files()
                .list(
                    q=query,
                    orderBy="modifiedTime desc",
                    pageSize=1,  # only latest file
                    fields="files(id, name, mimeType, size, modifiedTime, webViewLink)",
                    spaces="drive",
                )
                .execute()
            )

            files = results.get("files", [])
            if not files:
                return {"status": 1, "message": "No profile picture found", "payload": {"file": None}}

            latest_file = files[0]
            latest_file["publicUrl"] = f"https://drive.google.com/uc?id={latest_file['id']}"

            return {
                "status": 1,
                "message": "Latest profile picture fetched successfully",
                "payload": {"file": latest_file},
            }

        except Exception as e:
            traceback.print_exc()
            return {"status": 0, "message": f"Failed to fetch files: {str(e)}"}, 500



class GetProfilePictures(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            target_uid = request.args.get("userId") or uid

            service = self.get_drive_service(target_uid)
            if not service:
                return {"status": 0, "message": "Google Drive not connected"}, 401

            # ✅ Navigate to Dockly/Profile Pictures
            root_id = get_or_create_subfolder(service, "DOCKLY", "root")
            profile_id = get_or_create_subfolder(service, "Profile Pictures", root_id)

            query = f"'{profile_id}' in parents and trashed = false"
            results = (
                service.files()
                .list(
                    q=query,
                    fields="files(id, name, mimeType, size, modifiedTime, webViewLink)",
                    spaces="drive",
                )
                .execute()
            )

            return {
                "status": 1,
                "message": "Profile pictures fetched successfully",
                "payload": {"files": results.get("files", [])},
            }

        except Exception as e:
            traceback.print_exc()
            return {"status": 0, "message": f"Failed to fetch files: {str(e)}"}, 500


class UpdateUsername(Resource):
    @auth_required()
    def post(self, uid, user):
        try:
            data = request.get_json()
            new_username = data.get("user_name")

            if not new_username:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_USERNAME_FAILED",
                    resource_type="users",
                    resource_id=uid,
                    success=False,
                    error_message="Username is required",
                )
                return {"status": 0, "message": "Username is required", "payload": {}}

            # Validate username format (alphanumeric, underscores, 3-20 chars)
            if not re.match(r"^[a-zA-Z0-9_]{3,20}$", new_username):
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_USERNAME_FAILED",
                    resource_type="users",
                    resource_id=uid,
                    success=False,
                    error_message="Invalid username format",
                    metadata={"attempted_username": new_username},
                )
                return {
                    "status": 0,
                    "message": "Invalid username format. Use 3-20 alphanumeric characters or underscores.",
                    "payload": {},
                }

            # Check if username is already taken
            existing_user = DBHelper.find_one(
                "users",
                filters={"user_name": new_username},
                select_fields=["uid"],
            )

            if existing_user and existing_user.get("uid") != uid:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_USERNAME_FAILED",
                    resource_type="users",
                    resource_id=uid,
                    success=False,
                    error_message="Username already taken",
                    metadata={"attempted_username": new_username},
                )
                return {
                    "status": 0,
                    "message": "Username is already taken",
                    "payload": {},
                }

            # Update username in users table
            DBHelper.update_one(
                table_name="users",
                filters={"uid": uid},
                updates={"user_name": new_username, "updated_at": datetime.utcnow()},
            )

            # Log the successful update
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_USERNAME",
                resource_type="users",
                resource_id=uid,
                success=True,
                metadata={"new_username": new_username},
            )

            return {
                "status": 1,
                "message": "Username updated successfully",
                "payload": {"user_name": new_username},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_USERNAME_FAILED",
                resource_type="users",
                resource_id=uid,
                success=False,
                error_message=str(e),
            )
            return {
                "status": 0,
                "message": f"Failed to update username: {str(e)}",
                "payload": {},
            }
