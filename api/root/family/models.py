# models.py
import base64
from datetime import date, datetime, time, timedelta
from email.message import EmailMessage
import json
import re
import smtplib
import traceback
from root.helpers.logs import AuditLogger
import requests

# from root.planner.models import create_calendar_event, update_calendar_event
from root.files.models import DriveBaseResource
from root.common import DocklyUsers, HubsEnum, Permissions, Status
from root.utilis import (
    assign_family_member_color,
    create_calendar_event,
    delete_calendar_event,
    ensure_drive_folder_structure,
    uniqueId,
    update_calendar_event,
)
from root.users.models import generate_otp, send_otp_email
from root.config import CLIENT_ID, CLIENT_SECRET, EMAIL_PASSWORD, EMAIL_SENDER, SCOPE, SMTP_PORT, SMTP_SERVER, WEB_URL
from root.email import generate_invitation_email
from flask import Request, request, jsonify, send_file
from root.auth.auth import auth_required
from flask_restful import Resource
from flask import request, jsonify
from root.db.dbHelper import DBHelper
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

class InviteFamily(Resource):
    def post(self):
        try:
            data = request.get_json(silent=True) or {}
            if not data:
                AuditLogger.log(
                    user_id="unknown",
                    action="invite_family",
                    resource_type="family_member",
                    resource_id=None,
                    success=False,
                    error_message="No input data provided",
                    metadata={"input": {}, "error": "Missing request body"},
                )
                return {"status": 0, "message": "No input data provided", "payload": {}}, 400

            # Validate required fields
            required_fields = [
                "name",
                "relationship",
                "method",
                "permissions",
                "sharedItems",
                "userId",
            ]
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                AuditLogger.log(
                    user_id=data.get("userId", "unknown"),
                    action="invite_family",
                    resource_type="family_member",
                    resource_id=None,
                    success=False,
                    error_message=f"Missing required fields: {', '.join(missing_fields)}",
                    metadata={"input": data, "error": "Missing fields"},
                )
                return {
                    "status": 0,
                    "message": f"Missing required fields: {', '.join(missing_fields)}",
                    "payload": {},
                }, 400

            # Defaults for optional
            data.setdefault("email", "")
            data.setdefault("phone", "")
            data.setdefault("accessCode", "")

            # Validate user
            user = DBHelper.find_one("users", filters={"uid": data["userId"]})
            if not user:
                AuditLogger.log(
                    user_id=data["userId"],
                    action="invite_family",
                    resource_type="family_member",
                    resource_id=None,
                    success=False,
                    error_message=f"User with ID {data['userId']} not found",
                    metadata={"input": data, "error": "User not found"},
                )
                return {
                    "status": 0,
                    "message": f"User with ID {data['userId']} not found",
                    "payload": {},
                }, 400

            # Insert member
            try:
                member_id = DBHelper.insert(
                    table_name="family_members",
                    name=data["name"],
                    relationship=data["relationship"],
                    email=data["email"],
                    phone=data["phone"],
                    access_code=data["accessCode"],
                    method=data["method"],
                    permissions=data["permissions"],
                    shared_items=data["sharedItems"],
                    user_id=data["userId"],
                )
            except Exception as e:
                AuditLogger.log(
                    user_id=data.get("userId", "unknown"),
                    action="invite_family",
                    resource_type="family_member",
                    resource_id=None,
                    success=False,
                    error_message="Failed to save family member",
                    metadata={"input": data, "error": str(e)},
                )
                return {
                    "status": 0,
                    "message": f"Failed to save family member: {str(e)}",
                    "payload": {},
                }, 500

            # ✅ Success
            AuditLogger.log(
                user_id=data["userId"],
                action="invite_family",
                resource_type="family_member",
                resource_id=str(member_id),
                success=True,
                metadata={"name": data["name"], "relationship": data["relationship"]},
            )

            return {
                "status": 1,
                "message": "Family member invited successfully",
                "payload": {"memberId": member_id},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=data.get("userId", "unknown") if "data" in locals() else "unknown",
                action="invite_family",
                resource_type="family_member",
                resource_id=None,
                success=False,
                error_message="Failed to invite family member",
                metadata={"input": data if "data" in locals() else {}, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to invite family member: {str(e)}",
                "payload": {},
            }, 500

def sendInviteEmail(inputData, user, rusername, encodedToken, inviteLink):
    if not inviteLink:
        inviteLink = f"{WEB_URL}/{rusername}/verify-email?token={encodedToken}"
    u = user["user_name"]
    email_html = generate_invitation_email(
        inputData,
        username=u,
        invite_link=inviteLink,
    )

    msg = send_invitation_email(inputData["email"], inputData["name"], email_html)
    return msg


class AddFamilyMembers(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            inputData = request.get_json(silent=True)

            if not inputData:
                return {
                    "status": 0,
                    "message": "No input data received",
                    "payload": {},
                }, 400

            # ✅ Only PaidMembers can send family invites
            if user["role"] == DocklyUsers.Guests.value:
                AuditLogger.log(
                    user_id=uid,
                    action="add_family_member",
                    resource_type="family_member",
                    resource_id=None,
                    success=False,
                    error_message="Only paid members can add family members",
                    metadata={"input": inputData},
                )
                return {
                    "status": 0,
                    "message": "Only paid members can add family members.",
                    "payload": {},
                }, 403

            if inputData["email"] == user["email"]:
                return {
                    "status": 0,
                    "message": "You cannot add yourself as a family member.",
                    "payload": {},
                }, 400

            # Check for existing family member in family_members table
            family_member_exists = DBHelper.find_one(
                "family_members",
                filters={"email": inputData["email"], "user_id": uid},
                select_fields=["id"],
            )

            if family_member_exists:
                return {
                    "status": 0,
                    "message": "Family member with this email already exists in your family hub.",
                    "payload": {},
                }, 400

            # Prepare shared item IDs
            sharedKeys = list(inputData["sharedItems"].keys())
            sharedItems = [
                DBHelper.find_one("boards", filters={"board_name": key}, select_fields=["id"])
                for key in sharedKeys
            ]
            sharedItemsIds = [item["id"] for item in sharedItems if item]

            otp = generate_otp()
            rname = inputData["name"]

            # Check if the invited email already belongs to a Dockly user
            existingUser = DBHelper.find_one(
                "users",
                filters={"email": inputData["email"]},
                select_fields=["uid", "user_name", "role"],
            )

            # ========== EXISTING USER FLOW ==========
            if existingUser:
                rusername = existingUser["user_name"]
                encodedToken = "<encoded_token>"
                inviteLink = f"{WEB_URL}/{rusername}/dashboard"

                sendInviteEmail(inputData, user, rusername, encodedToken, inviteLink=inviteLink)

                notification = {
                    "sender_id": user["uid"],
                    "receiver_id": existingUser["uid"],
                    "message": f"You have been invited to join {user['user_name']}'s Family Hub '{rusername}'",
                    "task_type": "family_request",
                    "action_required": True,
                    "status": "pending",
                    "hub": HubsEnum.Family.value,
                    "metadata": {
                        "input_data": inputData,
                        "shared_items_ids": sharedItemsIds,
                        "sender_user": user,
                    },
                }

                DBHelper.insert("notifications", return_column="id", **notification)

                AuditLogger.log(
                    user_id=uid,
                    action="add_family_member",
                    resource_type="family_member",
                    resource_id=existingUser["uid"],
                    success=True,
                    metadata={"input": inputData, "shared_items_ids": sharedItemsIds},
                )

                return {
                    "status": 1,
                    "message": "Family member invitation sent successfully",
                    "payload": {},
                }, 200

            # ========== INVITE-ONLY FLOW ==========
            payload = json.dumps(
                {
                    "otp": otp,
                    "email": inputData["email"],
                    "fuser": user["uid"],
                    "role": 5,
                }
            )
            encodedToken = base64.urlsafe_b64encode(payload.encode()).decode()
            inviteLink = f"{WEB_URL}/signup?invite_token={encodedToken}"

            DBHelper.insert(
                "notifications",
                return_column="id",
                sender_id=user["uid"],
                message=f"You've been invited to join {user['user_name']}'s Family Hub",
                task_type="family_invite",
                status="pending",
                hub=HubsEnum.Family.value,
                metadata={
                    "input_data": inputData,
                    "shared_items_ids": sharedItemsIds,
                    "sender_user": user,
                },
            )

            sendInviteEmail(inputData, user, user["user_name"], encodedToken, inviteLink=inviteLink)
            send_otp_email(inputData["email"], otp)

            AuditLogger.log(
                user_id=uid,
                action="add_family_member",
                resource_type="family_member",
                resource_id=None,
                success=True,
                metadata={"input": inputData, "shared_items_ids": sharedItemsIds},
            )

            return {
                "status": 1,
                "message": "Family member invitation sent successfully",
                "payload": {},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="add_family_member",
                resource_type="family_member",
                resource_id=None,
                success=False,
                error_message="Failed to add family member",
                metadata={"input": inputData if "inputData" in locals() else {}, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to add family member: {str(e)}",
                "payload": {},
            }, 500
    
class GetUserFamilyGroups(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            # Get all family_group_ids where this user is a member
            user_groups = DBHelper.find_all(
                table_name="family_members",
                select_fields=[
                    "family_group_id", "user_id", "fm_user_id",
                    "method", "invited_by"
                ],
                filters={"fm_user_id": uid},
            )

            if not user_groups:
                if user["role"] != DocklyUsers.Guests.value:
                    gid = uniqueId(digit=5, isNum=True, prefix="G")

                    # Insert self into family_members table as owner
                    DBHelper.insert(
                        "family_members",
                        return_column="id",
                        name=user["user_name"],
                        relationship="paid_user",
                        user_id=uid,
                        fm_user_id=uid,   # Self-reference
                        email=user["email"],
                        access_code="",
                        family_group_id=gid,
                        method="Direct",
                        shared_items="",
                        permissions="",
                        invited_by=uid,   # owner = self
                        color="#FFD1DC",
                        created_at=datetime.utcnow()
                    )

                    AuditLogger.log(
                        user_id=uid,
                        action="GET_USER_FAMILY_GROUPS_SUCCESS",
                        resource_type="family_groups",
                        resource_id=gid,
                        success=True,
                        metadata={"auto_created": True},
                    )

                    return {
                        "status": 1,
                        "message": "New family group created for paid member",
                        "payload": {
                            "groups": [
                                {
                                    "id": gid,
                                    "name": f"{user['user_name']}'s Family",
                                    "ownerName": user["user_name"],
                                    "memberCount": 1,
                                    "members": [
                                        {
                                            "id": uid,
                                            "name": user["user_name"],
                                            "role": "me",
                                            "type": "family",
                                            "color": "#0033FF",
                                            "initials": "".join(
                                                [p[0].upper() for p in user["user_name"].split() if p]
                                            )[:2],
                                            "status": "accepted",
                                            "isPet": False,
                                        }
                                    ],
                                }
                            ]
                        },
                    }

                else:  # Guest fallback
                    current_user_name = user["user_name"]
                    initials = "".join([p[0].upper() for p in current_user_name.split() if p])[:2]

                    AuditLogger.log(
                        user_id=uid,
                        action="GET_USER_FAMILY_GROUPS_SUCCESS",
                        resource_type="family_groups",
                        resource_id=None,
                        success=True,
                        metadata={"guest": True},
                    )

                    return {
                        "status": 1,
                        "message": "No family groups found, showing user as their own family",
                        "payload": {
                            "groups": [
                                {
                                    "id": None,
                                    "name": f"{current_user_name}'s Family",
                                    "ownerName": current_user_name,
                                    "memberCount": 1,
                                    "members": [
                                        {
                                            "id": uid,
                                            "name": current_user_name,
                                            "role": "me",
                                            "type": "family",
                                            "color": "#0033FF",
                                            "initials": initials,
                                            "status": "accepted",
                                            "isPet": False,
                                        }
                                    ],
                                }
                            ]
                        },
                    }

            # Case: user has groups
            group_ids = list(set([g["family_group_id"] for g in user_groups if g["family_group_id"]]))
            family_groups = []

            for group_id in group_ids:
                group_members = DBHelper.find_all(
                    table_name="family_members",
                    select_fields=[
                        "name", "relationship", "fm_user_id", "user_id",
                        "method", "email", "invited_by"
                    ],
                    filters={"family_group_id": group_id},
                )

                # Find the owner by checking invited_by
                owner_id = None
                for m in group_members:
                    if m.get("invited_by"):
                        owner_id = m["invited_by"]
                        break

                owner_name = None
                if owner_id:
                    owner_member = next((m for m in group_members if m["fm_user_id"] == owner_id), None)
                    if owner_member:
                        owner_name = owner_member.get("name")

                if not owner_name:
                    owner_name = user["user_name"]

                # Count unique members
                unique_members = list(set([m["fm_user_id"] for m in group_members if m["fm_user_id"]]))
                member_count = len(unique_members)

                family_groups.append({
                    "id": group_id,
                    "name": f"{owner_name}'s Family",
                    "ownerName": owner_name,
                    "memberCount": member_count,
                })

            AuditLogger.log(
                user_id=uid,
                action="GET_USER_FAMILY_GROUPS_SUCCESS",
                resource_type="family_groups",
                resource_id=None,
                success=True,
                metadata={"groups_count": len(family_groups)},
            )

            return {
                "status": 1,
                "message": "Family groups fetched successfully",
                "payload": {"groups": family_groups},
            }

        except Exception as e:
            # ✅ Error log
            AuditLogger.log(
                user_id=uid,
                action="GET_USER_FAMILY_GROUPS_FAILED",
                resource_type="family_groups",
                resource_id=None,
                success=False,
                error_message="Failed to fetch family groups",
                metadata={"trace": traceback.format_exc(),"error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to fetch family groups: {str(e)}"
            }, 500


class GetFamilyMembers(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            role = request.args.get("role")
            fuser = request.args.get("fuser")
            family_group_id = request.args.get("family_group_id")  # New parameter for specific group
            familyMembers = []

            def clean_relationship(rel):
                return (
                    rel.replace("❤", "")
                    .replace("👶", "")
                    .replace("👴", "")
                    .replace("🛡", "")
                    .strip()
                )

            # Step 0: Preload notifications metadata for enrichment
            notifications = DBHelper.find_all(
                table_name="notifications",
                filters={"sender_id": uid},  # include all (pending or accepted)
                select_fields=["metadata", "status"],
            )

            email_to_metadata = {}
            pending_invites = []

            for notif in notifications:
                meta = notif.get("metadata", {})
                input_data = meta.get("input_data", {})
                email = input_data.get("email", "")

                if email:
                    email_to_metadata[email.lower().strip()] = {
                        "sharedItems": input_data.get("sharedItems", {}),
                        "permissions": input_data.get("permissions", {}),
                    }

                if notif.get("status") == "pending" and input_data:
                    pending_invites.append(
                        {
                            "name": input_data.get("name", "Unknown"),
                            "relationship": clean_relationship(
                                input_data.get("relationship", "Unknown")
                            ),
                            "status": "pending",
                            "email": input_data.get("email", ""),
                            "id": input_data.get("id", ""),
                            "color": "#7A7A7A",
                        }
                    )

            # Step 1: Get family group id of the user
            if family_group_id:
                # Use the provided specific group ID
                group_id = family_group_id

                # Verify that the user actually belongs to this group
                user_in_group = DBHelper.find_one(
                    table_name="family_members",
                    select_fields=["id"],
                    filters={"fm_user_id": uid, "family_group_id": group_id},
                )

                if not user_in_group:
                    return {
                        "status": 0,
                        "message": "User does not belong to the specified family group",
                        "payload": {"members": []},
                    }
            else:
                # Get user's primary/first family group
                gid = DBHelper.find_one(
                    table_name="family_members",
                    select_fields=["family_group_id"],
                    filters={"fm_user_id": uid},  # Changed from user_id to fm_user_id
                )
                group_id = gid.get("family_group_id") if gid else None

            if not group_id:
                return {
                    "status": 1,
                    "message": "No family group found",
                    "payload": {
                        "members": [
                            {
                                "name": user["user_name"],
                                "relationship": "me",
                                "email": user["email"],
                                "id": "",
                                "user_id": uid,
                                "sharedItems": {},
                                "permissions": {},
                                "color": "#0033FF",
                            }
                        ]
                        + pending_invites
                    },
                }

            # Step 2: Get all members in that specific group
            group_members = DBHelper.find_all(
                table_name="family_members",
                select_fields=[
                    "name",
                    "relationship",
                    "fm_user_id",
                    "email",
                    "id",
                    "user_id",
                    "color",
                ],
                filters={"family_group_id": group_id},
            )

            # Step 2b: Keep only unique fm_user_id
            seen_fm_ids = set()
            unique_group_members = []
            for m in group_members:
                fm_user_id = m.get("fm_user_id")
                if fm_user_id and fm_user_id not in seen_fm_ids:
                    seen_fm_ids.add(fm_user_id)
                    unique_group_members.append(m)
            group_members = unique_group_members

            # Step 3: Build the member list
            for member in group_members:
                fm_user_id = member.get("fm_user_id")
                relationship = (
                    "me"
                    if fm_user_id == uid
                    else clean_relationship(member.get("relationship", "Unknown"))
                )

                raw_email = member.get("email")
                email = raw_email.lower().strip() if raw_email else ""
                metadata = email_to_metadata.get(email, {})
                sharedItems = metadata.get("sharedItems", {})
                permissions = metadata.get("permissions", {})
                color = "#0033FF" if relationship == "me" else member.get("color")

                familyMembers.append(
                    {
                        "name": member.get("name", "Unknown"),
                        "relationship": relationship,
                        "email": email,
                        "id": member.get("id", ""),
                        "user_id": fm_user_id or member.get("user_id"),
                        "sharedItems": sharedItems,
                        "permissions": permissions,
                        "color": color,
                    }
                )

            # Step 4: If guest, add the owner
            if role is not None and fuser:
                try:
                    if int(role) == DocklyUsers.Guests.value:
                        fuserMember = DBHelper.find_one(
                            table_name="users",
                            filters={"uid": fuser},
                            select_fields=["user_name", "email", "id"],
                        )
                        if fuserMember:
                            familyMembers.append(
                                {
                                    "name": fuserMember.get("user_name", "User"),
                                    "relationship": "Owner",
                                    "email": fuserMember.get("email", ""),
                                    "id": fuserMember.get("id", ""),
                                    "user_id": fuser,
                                    "sharedItems": {},
                                    "permissions": {},
                                    "color": "#7A7A7A",
                                }
                            )
                except ValueError:
                    pass

            # Step 5: Add pending invites (only for the current user's invites)
            if not family_group_id or family_group_id == group_id:
                familyMembers.extend(pending_invites)

            # Step 6: Remove duplicate emails (extra safety)
            unique_members = []
            seen_emails = set()
            for member in familyMembers:
                email = (member.get("email") or "").lower().strip()
                user_id = member.get("user_id", "")

                # Use user_id as primary identifier, email as secondary
                identifier = user_id if user_id else email

                if identifier and identifier not in seen_emails:
                    seen_emails.add(identifier)
                    unique_members.append(member)

            return {
                "status": 1,
                "message": "Family members fetched successfully",
                "payload": {"members": unique_members},
            }

        except Exception as e:
            # ✅ Store error in audit log
            AuditLogger.log(
                user_id=uid,
                action="get_family_members",
                resource_type="family",
                resource_id=None,
                success=False,
                error_message="Failed to fetch family members",
                metadata={"error": str(e)},
            )

            return {
                "status": 0,
                "message": f"Failed to fetch family members: {str(e)}",
                "payload": {"members": []},
            }, 500


def send_pet_email(
    email, pet_name, species, breed, contact, added_by="Family Hub Team"
):
    try:
        msg = EmailMessage()
        msg["Subject"] = f"Pet Addition Notification for {pet_name}"
        msg["From"] = EMAIL_SENDER
        msg["To"] = email

        message_body = f"""
Dear Guardian,

{pet_name} ({species}, {breed}) has been added to our Family Hub.
Contact: {contact}
Email: {email}

Best regards,
{added_by}
        """.strip()

        msg.set_content(message_body)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)

        return {"status": 1, "email": email}
    except Exception as e:
        return {"status": 0, "email": email, "error": str(e)}


class AddPet(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)

        if not inputData:
            AuditLogger.log(
                user_id=uid,
                action="ADD_PET_FAILED",
                resource_type="pet",
                resource_id=None,
                success=False,
                error_message="Invalid or empty input",
                metadata={"raw_request": str(request.data)},
            )
            return {"status": 0, "message": "Invalid input", "payload": {}}, 400

        try:
            required_fields = ["name", "species", "breed"]
            missing_fields = [field for field in required_fields if field not in inputData]
            if missing_fields:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_PET_FAILED",
                    resource_type="pet",
                    resource_id=None,
                    success=False,
                    error_message=f"Missing required fields: {', '.join(missing_fields)}",
                    metadata={"input": inputData},
                )
                return {
                    "status": 0,
                    "message": f"Missing required fields: {', '.join(missing_fields)}",
                    "payload": {},
                }, 400

            # Resolve family group
            family_group_id = inputData.get("family_group_id")
            if not family_group_id:
                gid = DBHelper.find_one(
                    "family_members",
                    filters={"user_id": uid},
                    select_fields=["family_group_id"],
                )
                family_group_id = gid.get("family_group_id") if gid else None

            if not family_group_id:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_PET_FAILED",
                    resource_type="pet",
                    resource_id=None,
                    success=False,
                    error_message="No family_group_id found (only paid members can add pets)",
                    metadata={"input": inputData},
                )
                return {"status": 0, "message": "Only paid members can add Pets", "payload": {}}, 400

            # Insert pet
            pet_id = DBHelper.insert(
                "pets",
                return_column="user_id",
                user_id=uid,
                name=inputData.get("name", ""),
                species=inputData.get("species", ""),
                breed=inputData.get("breed", ""),
                guardian_email=inputData.get("guardian_email", ""),
                guardian_contact=inputData.get("guardian_contact", ""),
                family_group_id=family_group_id,
            )

            # ✅ Log pet addition success
            AuditLogger.log(
                user_id=uid,
                action="ADD_PET_SUCCESS",
                resource_type="pet",
                resource_id=str(pet_id),
                success=True,
                metadata={
                    "name": inputData.get("name", ""),
                    "species": inputData.get("species", ""),
                    "breed": inputData.get("breed", ""),
                    "guardian_email": inputData.get("guardian_email", ""),
                },
            )

            # Send email if guardian email exists
            guardian_email = inputData.get("guardian_email")
            if guardian_email:
                email_result = send_pet_email(
                    email=guardian_email,
                    pet_name=inputData.get("name", ""),
                    species=inputData.get("species", ""),
                    breed=inputData.get("breed", ""),
                    contact=inputData.get("guardian_contact", ""),
                    added_by=user.get("name") if user else "Family Hub Team",
                )

                if email_result.get("status") != 1:
                    AuditLogger.log(
                        user_id=uid,
                        action="SEND_PET_EMAIL_FAILED",
                        resource_type="pet",
                        resource_id=str(pet_id),
                        success=False,
                        error_message="Failed to send guardian email",
                        metadata={"input": inputData, "error": email_result.get("message")},
                    )
                    return {
                        "status": 1,
                        "message": "Pet added successfully (email failed)",
                        "payload": {"userId": pet_id},
                    }

            return {
                "status": 1,
                "message": "Pet added successfully",
                "payload": {"userId": pet_id},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_PET_FAILED",
                resource_type="pet",
                resource_id=None,
                success=False,
                error_message="Failed to add pet",
                metadata={"input": inputData if inputData else {}, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to add pet: {str(e)}", "payload": {}}, 500

class AddContacts(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)

        if not inputData:
            AuditLogger.log(
                user_id=uid,
                action="ADD_CONTACT_FAILED",
                resource_type="contacts",
                resource_id=None,
                success=False,
                error_message="Invalid or empty input",
                metadata={"raw_request": str(request.data)},
            )
            return {"status": 0, "message": "Invalid input", "payload": {}}, 400

        try:
            contact = inputData.get("contacts", {})
            if not contact:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_CONTACT_FAILED",
                    resource_type="contacts",
                    resource_id=None,
                    success=False,
                    error_message="No contact data provided",
                    metadata={"input": inputData},
                )
                return {"status": 0, "message": "No contact data provided", "payload": {}}, 400

            # Validate required fields
            required_fields = ["name", "role", "phone", "addedBy"]
            missing_fields = [field for field in required_fields if field not in contact]
            if missing_fields:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_CONTACT_FAILED",
                    resource_type="contacts",
                    resource_id=None,
                    success=False,
                    error_message=f"Missing required fields: {', '.join(missing_fields)}",
                    metadata={"input": inputData},
                )
                return {
                    "status": 0,
                    "message": f"Missing required fields: {', '.join(missing_fields)}",
                    "payload": {},
                }, 400

            current_time = datetime.now().isoformat()

            # Insert contact into DB
            userId = DBHelper.insert(
                "contacts",
                return_column="user_id",
                user_id=uid,
                name=contact.get("name", ""),
                role=contact.get("role", ""),
                phone=contact.get("phone", ""),
                added_by=contact.get("addedBy", ""),
                added_time=current_time,
            )

            # ✅ Audit Logging success
            AuditLogger.log(
                user_id=uid,
                action="ADD_CONTACT_SUCCESS",
                resource_type="contacts",
                resource_id=str(userId),
                success=True,
                metadata={
                    "added_by": user.get("user_name", "Unknown"),
                    "contact": contact,
                },
            )

            return {
                "status": 1,
                "message": "Contact added successfully",
                "payload": {"userId": userId},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_CONTACT_FAILED",
                resource_type="contacts",
                resource_id=None,
                success=False,
                error_message="Failed to add contact",
                metadata={"input": inputData, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to add contact: {str(e)}",
                "payload": {},
            }, 500


class AddGuardianEmergencyInfo(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        current_time = datetime.now().isoformat()

        if not inputData:
            AuditLogger.log(
                user_id=uid,
                action="ADD_GUARDIAN_INFO_FAILED",
                resource_type="guardian_emergency_info",
                resource_id=None,
                success=False,
                error_message="Invalid or empty input",
                metadata={"raw_request": str(request.data)},
            )
            return {"status": 0, "message": "Invalid input", "payload": {}}, 400

        try:
            # Insert guardian emergency info into DB
            userId = DBHelper.insert(
                "guardian_emergency_info",
                return_column="user_id",
                user_id=uid,
                name=inputData.get("name", ""),
                relation=inputData.get("relationship", "Grandmother"),
                phone=inputData.get("phone", ""),
                details=inputData.get("details", ""),
                added_by=inputData.get("addedBy", ""),
                added_time=current_time,
            )

            # ✅ Audit Logging success
            AuditLogger.log(
                user_id=uid,
                action="ADD_GUARDIAN_INFO_SUCCESS",
                resource_type="guardian_emergency_info",
                resource_id=str(userId),
                success=True,
                metadata={
                    "added_by": user.get("user_name", "Unknown"),
                    "guardian_info": inputData,
                },
            )

            return {
                "status": 1,
                "message": "Guardian emergency info added successfully",
                "payload": {"userId": userId},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_GUARDIAN_INFO_FAILED",
                resource_type="guardian_emergency_info",
                resource_id=None,
                success=False,
                error_message="Failed to add guardian emergency info",
                metadata={"input": inputData, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to add guardian emergency info: {str(e)}",
                "payload": {},
            }, 500




class GetPets(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        fuser = request.args.get("fuser")  # from query param
        if not fuser:
            # Fallback to current user's family_group_id
            gid = DBHelper.find_one(
                table_name="family_members",
                select_fields=["family_group_id"],
                filters={"user_id": uid},
            )
            fuser = gid.get("family_group_id") if gid else None

        if not fuser:
            return {"status": 0, "message": "Missing family_group_id (fuser)"}, 400

        pets = DBHelper.find_all(
            table_name="pets",
            select_fields=[
                "name",
                "species",
                "breed",
                "guardian_email",
                "guardian_contact",
            ],
            filters={"family_group_id": fuser},
        )

        pet_list = []
        for pet in pets:
            pet_list.append(
                {
                    "name": pet["name"],
                    "species": pet["species"],
                    "breed": pet["breed"] or "N/A",
                    "guardian_email": pet["guardian_email"] or "N/A",
                    "guardian_contact": pet["guardian_contact"] or "N/A",
                }
            )

        return {
            "status": 1,
            "message": "Pets fetched successfully",
            "payload": {"pets": pet_list},
        }


class GetContacts(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            contacts = DBHelper.find_all(
                table_name="contacts",
                select_fields=[
                    "id",
                    "name",
                    "role",
                    "phone",
                    "added_by",
                    "added_time",
                ],
                filters={"user_id": uid},
            )

            def serialize_datetime(dt):
                return dt.isoformat() if isinstance(dt, datetime) else None

            grouped_by_role = {}
            for contact in contacts:
                role = contact["role"].lower()
                section_key = (
                    "emergency"
                    if "emergency" in role
                    else (
                        "school"
                        if "school" in role
                        else (
                            "professional"
                            if any(
                                r in role for r in ["doctor", "dentist", "pediatrician"]
                            )
                            else "other"
                        )
                    )
                )
                if section_key not in grouped_by_role:
                    grouped_by_role[section_key] = []
                grouped_by_role[section_key].append(
                    {
                        "id": contact["id"],
                        "name": contact["name"],
                        "role": contact["role"],
                        "phone": contact["phone"] or "N/A",
                        "added_by": contact["added_by"],
                        "added_time": serialize_datetime(contact["added_time"]),
                    }
                )

            contact_sections = [
                {
                    "title": (
                        "Emergency Services"
                        if key == "emergency"
                        else (
                            "Schools"
                            if key == "school"
                            else (
                                "Professional Services"
                                if key == "professional"
                                else "Other Contacts"
                            )
                        )
                    ),
                    "type": key,
                    "items": items,
                }
                for key, items in grouped_by_role.items()
            ]
            return {
                "status": 1,
                "message": "Emergency contacts fetched successfully",
                "payload": {"contacts": contact_sections},
            }, 200
        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch contacts: {str(e)}"}, 500


def get_connected_family_member_ids(uid: str) -> list:
    """
    Returns a unique list of all family member IDs connected to the given user:
    - Members this user has added (sent invites)
    - Members who added this user (received invites)
    - Includes the current user (uid) as well
    """

    sent_invites = DBHelper.find_all(
        table_name="family_members",
        select_fields=["fm_user_id"],
        filters={"user_id": uid},
    )

    received_invites = DBHelper.find_all(
        table_name="family_members",
        select_fields=["user_id"],
        filters={"fm_user_id": uid},
    )

    # Extract ids
    sent_ids = [m["fm_user_id"] for m in sent_invites if m.get("fm_user_id")]
    received_ids = [m["user_id"] for m in received_invites if m.get("user_id")]

    # Combine and deduplicate, including current user
    all_ids = list(set(sent_ids + received_ids + [uid]))
    return all_ids


class GetGuardianEmergencyInfo(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            family_member_ids = get_connected_family_member_ids(uid)
            # 3. Fetch emergency info for all family members
            emergency_info = DBHelper.find_in(
                table_name="guardian_emergency_info",
                select_fields=["name", "relation", "phone", "details", "user_id"],
                field="user_id",
                values=family_member_ids,
            )

            # 4. Format the response
            info_list = []
            for info in emergency_info:
                info_list.append(
                    {
                        "name": info["name"],
                        "relationship": info["relation"],
                        "phone": info["phone"] or "N/A",
                        "details": info["details"] or "N/A",
                        "user_id": info[
                            "user_id"
                        ],  # Optional: to know whose info this is
                    }
                )

            return {
                "status": 1,
                "message": "Guardian emergency info fetched successfully",
                "payload": {"emergencyInfo": info_list},
            }, 200

        except Exception as e:
            return {
                "status": 0,
                "message": f"Failed to fetch emergency info: {str(e)}",
            }, 500



class AddSharedTasks(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        current_time = datetime.now().isoformat()

        if not inputData:
            AuditLogger.log(
                user_id=uid,
                action="ADD_SHARED_TASK_FAILED",
                resource_type="sharedtasks",
                resource_id=None,
                success=False,
                error_message="Invalid or empty input",
                metadata={"raw_request": str(request.data)},
            )
            return {"status": 0, "message": "Invalid input", "payload": {}}, 400

        try:
            task = inputData.get("sharedtasks", {})
            if not task:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_SHARED_TASK_FAILED",
                    resource_type="sharedtasks",
                    resource_id=None,
                    success=False,
                    error_message="No task data provided",
                    metadata={"input": inputData},
                )
                return {"status": 0, "message": "No task data provided", "payload": {}}, 400

            # Validate required fields
            required_fields = ["title", "assignedTo", "dueDate", "addedBy"]
            missing_fields = [field for field in required_fields if field not in task]
            if missing_fields:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_SHARED_TASK_FAILED",
                    resource_type="sharedtasks",
                    resource_id=None,
                    success=False,
                    error_message=f"Missing required fields: {', '.join(missing_fields)}",
                    metadata={"input": task},
                )
                return {
                    "status": 0,
                    "message": f"Missing required fields: {', '.join(missing_fields)}",
                    "payload": {},
                }, 400

            # Insert shared task into DB
            userId = DBHelper.insert(
                "sharedtasks",
                return_column="user_id",
                user_id=uid,
                task=task.get("title", ""),
                assigned_to=task.get("assignedTo", ""),
                due_date=task.get("dueDate", ""),
                completed=task.get("completed", False),
                added_by=task.get("addedBy", ""),
                added_time=current_time,
                edited_by=task.get("editedBy", task.get("addedBy", "")),
                updated_at=current_time,
            )

            # ✅ Audit Logging success with all fields
            AuditLogger.log(
                user_id=uid,
                action="ADD_SHARED_TASK_SUCCESS",
                resource_type="sharedtasks",
                resource_id=str(userId),
                success=True,
                metadata={
                    "added_by": user.get("user_name", "Unknown"),
                    "task": task.get("title"),
                    "assigned_to": task.get("assignedTo"),
                    "due_date": task.get("dueDate"),
                    "completed": task.get("completed", False),
                    "edited_by": task.get("editedBy", task.get("addedBy", "")),
                    "added_time": current_time,
                    "updated_at": current_time,
                },
            )

            return {
                "status": 1,
                "message": "Task added successfully",
                "payload": {"userId": userId},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_SHARED_TASK_FAILED",
                resource_type="sharedtasks",
                resource_id=None,
                success=False,
                error_message="Failed to add shared task",
                metadata={"input": inputData, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to add shared task: {str(e)}",
                "payload": {},
            }, 500



# models.py (Update GetGuardianEmergencyInfo)


class GetFamilyTasks(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        familyMembers = DBHelper.find_all(
            table_name="family_members",
            select_fields=["fm_user_id"],
            filters={"user_id": uid},
        )
        familyMembersIds = [member["fm_user_id"] for member in familyMembers]
        familyMembersIds.append(uid)
        familyMembersTasks = DBHelper.find_in(
            table_name="sharedtasks",
            select_fields=[
                "task",
                "assigned_to",
                "due_date",
                "completed",
                "added_by",
                "added_time",
            ],
            field="user_id",
            values=[familyMembersIds],  # or uids variable
        )
        task_list = []
        for task in familyMembersTasks:
            task_list.append(
                {
                    "task": task["task"],
                    "assigned_to": task["assigned_to"],
                    "due_date": (
                        task["due_date"].isoformat()
                        if isinstance(task["due_date"], (datetime, date))
                        else None
                    ),
                    "completed": task["completed"],
                    "added_by": task["added_by"],
                    "added_time": (
                        task["added_time"].isoformat()
                        if isinstance(task["added_time"], datetime)
                        else None
                    ),
                }
            )

        return {
            "status": 1,
            "message": "Family tasks fetched successfully",
            "payload": {"shared_tasks": task_list},
        }

class SendInvitation(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)

        try:
            form_data = data.get("formData") if data else None
            shared_items_list = data.get("sharedItemsList", "") if data else ""

            if not form_data or "email" not in form_data or "name" not in form_data:
                AuditLogger.log(
                    user_id=uid,
                    action="SEND_INVITATION_FAILED",
                    resource_type="invitations",
                    resource_id=None,
                    success=False,
                    error_message="Failed to send invitation",
                    metadata={"input": data, "error": "Missing required fields"},
                )
                return {"status": 0, "message": "Missing required fields", "payload": {}}, 400

            email = form_data["email"]
            name = form_data["name"]
            username = user.get("user_name", "Unknown")
            invite_link = f"{WEB_URL}/satheesh/verify-email"
            otp = generate_otp()

            email_html = generate_invitation_email(
                form_data,
                shared_items_list,
                username=username,
                invite_link=invite_link,
            )

            send_invitation_email(email, name, email_html)

            # ✅ Audit log success
            AuditLogger.log(
                user_id=uid,
                action="SEND_INVITATION_SUCCESS",
                resource_type="invitations",
                resource_id=None,
                success=True,
                metadata={
                    "invitee_email": email,
                    "invitee_name": name,
                    "shared_items": shared_items_list,
                    "invited_by": username,
                    "invite_link": invite_link,
                },
            )

            return {"status": 1, "message": "Invitation sent successfully", "payload": {}}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="SEND_INVITATION_FAILED",
                resource_type="invitations",
                resource_id=None,
                success=False,
                error_message="Failed to send invitation",
                metadata={"input": data, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to send invitation: {str(e)}", "payload": {}}, 500



def send_invitation_email(
    email, name, email_html, invite_subject="Invitation to Join Family Hub"
):
    msg = EmailMessage()
    msg["Subject"] = f"{invite_subject} - {name}"
    msg["From"] = EMAIL_SENDER  # e.g., 'no-reply@familyhub.com'
    msg["To"] = email

    # Add the HTML version
    msg.add_alternative(email_html, subtype="html")

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.send_message(msg)


def get_category_name(category_id):
    cat = DBHelper.find_one(
        table_name="notes_categories",
        filters={"id": category_id},
        select_fields=["name"],  # Only get the 'name' field
    )

    return cat["name"] if cat else ""


class AddNotes(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        try:
            inputData = request.get_json(force=True)

            # Extract fields
            title = inputData.get("title", "").strip()
            description = inputData.get("description", "").strip()
            category_id = inputData.get("category_id")
            hub = inputData.get("hub", "").strip().upper()

            # Validate required fields
            if not title or not description or not category_id or not hub:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_NOTE_FAILED",
                    resource_type="notes_lists",
                    resource_id=None,
                    success=False,
                    error_message="Failed to save note",
                    metadata={"input": inputData, "error": "Missing required fields"},
                )
                return {
                    "status": 0,
                    "message": "Fields title, description, category_id, and hub are required.",
                    "payload": {},
                }, 422

            now = datetime.utcnow().isoformat()

            # Insert note
            new_note_id = DBHelper.insert(
                "notes_lists",
                return_column="id",   # ✅ should return note id
                user_id=uid,
                title=title,
                description=description,
                category_id=category_id,
                hub=hub,
                created_at=now,
                updated_at=now,
            )

            # Log success
            AuditLogger.log(
                user_id=uid,
                action="ADD_NOTE_SUCCESS",
                resource_type="notes_lists",
                resource_id=new_note_id,
                success=True,
                metadata={"title": title, "category_id": category_id, "hub": hub},
            )

            return {
                "status": 1,
                "message": "Note added successfully",
                "payload": {
                    "id": new_note_id,
                    "title": title,
                    "description": description,
                    "category_id": category_id,
                    "hub": hub,
                },
            }

        except Exception as e:
            # Log failure in the exact bookmark-style pattern
            AuditLogger.log(
                user_id=uid,
                action="ADD_NOTE_FAILED",
                resource_type="notes_lists",
                resource_id=None,
                success=False,
                error_message="Failed to save note",
                metadata={"input": inputData if 'inputData' in locals() else {}, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to save note: {str(e)}", "payload": {}}, 500


from flask import request
from flask_restful import Resource
from datetime import datetime
from email.message import EmailMessage
import smtplib

# make sure you have your SMTP configs set:
# SMTP_SERVER, SMTP_PORT, EMAIL_SENDER, EMAIL_PASSWORD

class EmailSender:
    def __init__(self):
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.smtp_user = EMAIL_SENDER
        self.smtp_password = EMAIL_PASSWORD

    def send_note_email(self, recipient_email, note, sender_name="Someone"):
        msg = EmailMessage()
        msg["Subject"] = f"Shared Note: {note['title']}"
        msg["From"] = self.smtp_user
        msg["To"] = recipient_email

        hub_name = note.get("hub", "FAMILY")
        created = note.get("created_at") or ""
        if created:
            created = created.split("T")[0]

        description = note.get("description", "")

        # -----------------------
        # Plain text fallback
        # -----------------------
        plain_text = f"""
Hi there!

{sender_name} wanted to share this note with you:

Title: {note['title']}
Description: {description}
Hub: {hub_name}
Created: {created}

Best regards!
""".strip()

        # -----------------------
        # HTML version
        # -----------------------
        html_content = f"""
<html>
  <body>
    <p>Hi there!</p>
    <p>{sender_name} wanted to share this note with you:</p>
    <p><b>Title:</b> {note['title']}</p>
    <p><b>Description:</b></p>
    <div>{description}</div>
    <p><b>Hub:</b> {hub_name}</p>
    <p><b>Created:</b> {created}</p>
    <p>Best regards!</p>
  </body>
</html>
"""

        msg.set_content(plain_text)                       # Plain text
        msg.add_alternative(html_content, subtype="html") # HTML alternative

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            return True, "Email sent successfully"
        except Exception as e:
            return False, str(e)



class ShareNote(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(force=True)
            emails = data.get("email")
            note = data.get("note")
            tagged_members = data.get("tagged_members", [])

            if not emails or not note:
                AuditLogger.log(
                    user_id=uid,
                    action="SHARE_NOTE_FAILED",
                    resource_type="notes_lists",
                    resource_id=note.get("id") if note else None,
                    success=False,
                    error_message="Failed to share note",
                    metadata={"input": data, "error": "Both 'email' and 'note' are required"},
                )
                return {
                    "status": 0,
                    "message": "Both 'email' and 'note' are required.",
                    "payload": {},
                }, 422

            if isinstance(emails, str):
                emails = [emails]

            email_sender = EmailSender()
            failures = []
            notifications_created = []
            resolved_tagged_ids = []

            # Resolve tagged emails to fm_user_ids
            for email in tagged_members:
                family_member = DBHelper.find_one(
                    "family_members", filters={"email": email}, select_fields=["fm_user_id"]
                )
                if family_member:
                    resolved_tagged_ids.append(family_member["fm_user_id"])

            # Send emails
            for email in emails:
                success, message = email_sender.send_note_email(email, note, user["user_name"])
                if not success:
                    failures.append((email, message))

            # Send notifications for tagged members
            for email in tagged_members:
                family_member = DBHelper.find_one(
                    "family_members",
                    filters={"email": email},
                    select_fields=["id", "name", "email", "fm_user_id"],
                )
                if not family_member:
                    continue

                receiver_uid = family_member.get("fm_user_id") or DBHelper.find_one(
                    "users", filters={"email": family_member["email"]}, select_fields=["uid"]
                ).get("uid", None)

                if not receiver_uid:
                    continue

                notif_data = {
                    "sender_id": uid,
                    "receiver_id": receiver_uid,
                    "message": f"{user['user_name']} tagged a note '{note.get('title', 'Untitled')}' with you",
                    "task_type": "tagged",
                    "action_required": False,
                    "status": "unread",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "metadata": {
                        "note": note,
                        "sender_name": user["user_name"],
                        "tagged_member": {
                            "name": family_member["name"],
                            "email": family_member["email"],
                        },
                    },
                }
                notif_id = DBHelper.insert("notifications", return_column="id", **notif_data)
                notifications_created.append(notif_id)

            # Update note with tagged_ids
            if resolved_tagged_ids:
                note_record = DBHelper.find_one(
                    "notes_lists", filters={"id": note.get("id")}, select_fields=["tagged_ids"]
                )
                existing_ids = note_record.get("tagged_ids") or []
                combined_ids = list(set(existing_ids + resolved_tagged_ids))
                pg_array_str = "{" + ",".join(f'"{i}"' for i in combined_ids) + "}"
                DBHelper.update_one(
                    "notes_lists", filters={"id": note.get("id")}, updates={"tagged_ids": pg_array_str}
                )

            if failures:
                AuditLogger.log(
                    user_id=uid,
                    action="SHARE_NOTE_FAILED",
                    resource_type="notes_lists",
                    resource_id=note.get("id"),
                    success=False,
                    error_message="Failed to share note",
                    metadata={"input": data, "error": failures},
                )
                return {
                    "status": 0,
                    "message": f"Failed to send to {len(failures)} recipient(s)",
                    "payload": {"errors": failures},
                }, 500

            # Success log
            AuditLogger.log(
                user_id=uid,
                action="SHARE_NOTE_SUCCESS",
                resource_type="notes_lists",
                resource_id=note.get("id"),
                success=True,
                metadata={"input": data, "notifications_created": notifications_created},
            )

            return {
                "status": 1,
                "message": f"Note shared via email. {len(notifications_created)} notification(s) created.",
                "payload": {"notifications_created": notifications_created},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="SHARE_NOTE_FAILED",
                resource_type="notes_lists",
                resource_id=note.get("id") if 'note' in locals() and note else None,
                success=False,
                error_message="Failed to share note",
                metadata={"input": data if 'data' in locals() else {}, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to share note: {str(e)}", "payload": {}}, 500

class GetNotes(Resource):
    @auth_required(isOptional=True)
    def get(self, uid=None, user=None):
        try:
            # 1. Get hub filter
            hub = request.args.get("hub")
            if hub:
                hub = hub.strip().upper()
                if hub == "UNDEFINED":
                    hub = None
            else:
                hub = None

            # 2. Build filters
            filters = {"is_active": True}
            if hub:
                filters["hub"] = hub

            # 3. Fetch notes where:
            # - user_id == uid OR
            # - uid exists in tagged_ids[]
            select_fields = [
                "id",
                "title",
                "description",
                "category_id",
                "created_at",
                "updated_at",
                "hub",
                "user_id",
                "tagged_ids",
            ]
            notes_raw = DBHelper.find_with_or_and_array_match(
                table_name="notes_lists",
                select_fields=select_fields,
                uid=uid,
                array_field="tagged_ids",
                filters=filters,
            )

            # 4. Format notes and include category_name
            notes = []
            for note in notes_raw:
                notes.append(
                    {
                        "id": note["id"],
                        "title": note["title"],
                        "description": note["description"],
                        "category_id": note["category_id"],
                        "category_name": get_category_name(note["category_id"]),
                        "hub": note.get("hub", "FAMILY"),
                        "created_at": (
                            note["created_at"].isoformat()
                            if isinstance(note["created_at"], datetime)
                            else note["created_at"]
                        ),
                        "updated_at": (
                            note["updated_at"].isoformat()
                            if isinstance(note["updated_at"], datetime)
                            else note["updated_at"]
                        ),
                    }
                )

            return {
                "status": 1,
                "message": "Notes fetched successfully",
                "payload": notes,
            }

        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch notes: {str(e)}"}, 500


class UpdateNote(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        try:
            data = request.get_json(force=True)
            note_id = data.get("id")
            title = data.get("title", "").strip()
            description = data.get("description", "").strip()
            category_id = data.get("category_id")
            original_title = data.get("original_title", "").strip()
            original_description = data.get("original_description", "").strip()

            # Validate required fields
            if not note_id or not title or not description or not category_id:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_NOTE_FAILED",
                    resource_type="notes_lists",
                    resource_id=note_id,
                    success=False,
                    error_message="Failed to update note",
                    metadata={"input": data, "error": "Missing required fields: id, title, description, category_id"},
                )
                return {
                    "status": 0,
                    "message": "Missing required fields: id, title, description, category_id",
                    "payload": {},
                }, 422

            # Perform update
            if original_title and original_description:
                DBHelper.update_all(
                    table_name="notes_lists",
                    filters={
                        "title": original_title,
                        "description": original_description,
                        "user_id": uid,
                        "is_active": True,
                    },
                    updates={
                        "title": title,
                        "description": description,
                        "category_id": category_id,
                        "updated_at": datetime.now().isoformat(),
                    },
                )
                updated_note_ids = f"All notes matching title '{original_title}'"
            else:
                DBHelper.update_one(
                    table_name="notes_lists",
                    filters={"id": note_id, "user_id": uid},
                    updates={
                        "title": title,
                        "description": description,
                        "category_id": category_id,
                        "updated_at": datetime.now().isoformat(),
                    },
                )
                updated_note_ids = note_id

            # Success log
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_NOTE",
                resource_type="notes_lists",
                resource_id=note_id,
                success=True,
                metadata={"input": data, "updated_note_ids": updated_note_ids},
            )

            return {"status": 1, "message": "Note updated successfully", "payload": {"updated_note_ids": updated_note_ids}}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_NOTE_FAILED",
                resource_type="notes_lists",
                resource_id=data.get("id") if 'data' in locals() else None,
                success=False,
                error_message="Failed to update note",
                metadata={"input": data if 'data' in locals() else {}, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to update note: {str(e)}", "payload": {}}, 500


class DeleteNote(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        try:
            note_id = request.args.get("id")
            note_title = request.args.get("title")
            note_description = request.args.get("description")

            if not note_id:
                AuditLogger.log(
                    user_id=uid,
                    action="DELETE_NOTE_FAILED",
                    resource_type="notes_lists",
                    resource_id=None,
                    success=False,
                    error_message="Failed to delete note",
                    metadata={"input": {"id": note_id, "title": note_title, "description": note_description}, "error": "Note ID is required"},
                )
                return {"status": 0, "message": "Note ID is required", "payload": {}}, 422

            if note_title and note_description:
                DBHelper.update_all(
                    "notes_lists",
                    filters={
                        "title": note_title,
                        "description": note_description,
                        "user_id": uid,
                    },
                    updates={"is_active": False},
                )
                deleted_note_ids = f"All notes matching title '{note_title}'"
            else:
                DBHelper.update_one(
                    "notes_lists",
                    filters={"id": note_id, "user_id": uid},
                    updates={"is_active": False},
                )
                deleted_note_ids = note_id

            AuditLogger.log(
                user_id=uid,
                action="DELETE_NOTE",
                resource_type="notes_lists",
                resource_id=note_id,
                success=True,
                metadata={"deleted_note_ids": deleted_note_ids},
            )

            return {"status": 1, "message": "Note deleted successfully from all hubs", "payload": {"deleted_note_ids": deleted_note_ids}}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="DELETE_NOTE_FAILED",
                resource_type="notes_lists",
                resource_id=note_id if 'note_id' in locals() else None,
                success=False,
                error_message="Failed to delete note",
                metadata={"input": {"id": note_id, "title": note_title, "description": note_description} if 'note_id' in locals() else {}, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to delete note: {str(e)}", "payload": {}}, 500



class AddNoteCategory(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        try:
            data = request.get_json(force=True)
            name = data.get("name", "").strip()
            icon = data.get("icon", "📁")
            pinned = data.get("pinned", False)  # default False
            now = datetime.utcnow().isoformat()

            if not name:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_NOTE_CATEGORY_FAILED",
                    resource_type="notes_categories",
                    resource_id=None,
                    success=False,
                    error_message="Failed to add category",
                    metadata={"input": data, "error": "Category name is required"},
                )
                return {"status": 0, "message": "Category name is required", "payload": {}}, 422

            # generate custom ID
            nid = uniqueId(digit=3, isNum=True)

            DBHelper.insert(
                "notes_categories",
                id=nid,
                user_id=uid,
                name=name,
                icon=icon,
                pinned=pinned,
                created_at=now,
                updated_at=now,
            )

            # ✅ Log success
            AuditLogger.log(
                user_id=uid,
                action="ADD_NOTE_CATEGORY_SUCCESS",
                resource_type="notes_categories",
                resource_id=nid,
                success=True,
                metadata={
                    "name": name,
                    "icon": icon,
                    "pinned": pinned,
                    "created_at": now,
                },
            )

            return {
                "status": 1,
                "message": f"Category '{name}' added successfully",
                "payload": {"id": nid},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_NOTE_CATEGORY_FAILED",
                resource_type="notes_categories",
                resource_id=None,
                success=False,
                error_message="Failed to add category",
                metadata={"input": data if "data" in locals() else {}, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to add category: {str(e)}",
                "payload": {},
            }, 500

class UpdateNoteCategory(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        try:
            data = request.get_json(force=True)
            category_id = data.get("id")
            pinned = data.get("pinned")

            if category_id is None or pinned is None:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_NOTE_CATEGORY_FAILED",
                    resource_type="notes_categories",
                    resource_id=category_id,
                    success=False,
                    error_message="Failed to update category",
                    metadata={"input": data, "error": "Missing id or pinned value"},
                )
                return {"status": 0, "message": "Missing id or pinned value", "payload": {}}, 422

            DBHelper.update_one(
                table_name="notes_categories",
                filters={"id": category_id, "user_id": uid},
                updates={"pinned": pinned, "updated_at": datetime.utcnow().isoformat()},
            )

            AuditLogger.log(
                user_id=uid,
                action="UPDATE_NOTE_CATEGORY_SUCCESS",
                resource_type="notes_categories",
                resource_id=category_id,
                success=True,
                metadata={"pinned": pinned},
            )

            message = "Category pinned" if pinned else "Category unpinned"
            return {"status": 1, "message": message, "payload": {}}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_NOTE_CATEGORY_FAILED",
                resource_type="notes_categories",
                resource_id=data.get("id") if "data" in locals() else None,
                success=False,
                error_message="Failed to update category",
                metadata={"input": data if "data" in locals() else {}, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to update category: {str(e)}", "payload": {}}, 500


class GetNoteCategories(Resource):
    @auth_required(isOptional=True)
    def get(self, uid=None, user=None):
        try:
            categories = DBHelper.find_all(
                "notes_categories",
                filters={"user_id": uid, "is_active": True},
                select_fields=["id", "name", "icon", "pinned"],
            )

            notesCategories = []
            for category in categories:
                notesCategories.append(
                    {
                        "title": category["name"],
                        "icon": category["icon"],
                        "id": category["id"],
                        "pinned": category["pinned"],
                    }
                )
            # print(f"==>> notesCategories: {notesCategories}")

            return {"status": 1, "payload": notesCategories}

        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch categories: {str(e)}"}


class DeleteNoteCategory(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid=None, user=None):
        try:
            category_id = request.args.get("id")

            if not category_id:
                AuditLogger.log(
                    user_id=uid,
                    action="DELETE_CATEGORY_FAILED",
                    resource_type="notes_categories",
                    resource_id=None,
                    success=False,
                    error_message="Failed to delete category",
                    metadata={"error": "Category ID is required"},
                )
                return {"status": 0, "message": "Category ID is required", "payload": {}}, 422

            # Soft delete category
            DBHelper.update_one(
                table_name="notes_categories",
                filters={"id": category_id, "user_id": uid},
                updates={"is_active": False},
            )

            # Soft delete all notes under this category
            DBHelper.update_all(
                table_name="notes_lists",
                filters={"category_id": category_id, "user_id": uid},
                updates={"is_active": False},
            )

            AuditLogger.log(
                user_id=uid,
                action="DELETE_CATEGORY_SUCCESS",
                resource_type="notes_categories",
                resource_id=category_id,
                success=True,
                metadata={"message": "Category and all notes soft-deleted"},
            )

            return {
                "status": 1,
                "message": "Category and its notes deleted successfully",
                "payload": {},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="DELETE_CATEGORY_FAILED",
                resource_type="notes_categories",
                resource_id=category_id if category_id else None,
                success=False,
                error_message="Failed to delete category",
                metadata={"error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to delete category: {str(e)}",
                "payload": {},
            }, 500
            
class AddProject(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            input_data = request.get_json(silent=True)
            if not input_data:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_OR_UPDATE_PROJECT_FAILED",
                    resource_type="projects",
                    resource_id=None,
                    success=False,
                    error_message="No input data provided",
                    metadata={"input": input_data},
                )
                return {"status": 0, "message": "No input data provided", "payload": {}}, 422

            project_id = input_data.get("project_id")
            meta = input_data.get("meta") or {}

            # Resolve family_groups
            family_groups = input_data.get("family_groups")
            if not family_groups:
                user_group = DBHelper.find_one(
                    table_name="family_members",
                    select_fields=["family_group_id"],
                    filters={"fm_user_id": uid},
                )
                family_groups = [user_group["family_group_id"]] if user_group else []
            meta["family_groups"] = family_groups

            if project_id:
                # Update existing project
                DBHelper.update_one(
                    table_name="projects",
                    filters={"id": project_id, "user_id": uid},
                    updates={
                        "title": input_data.get("title"),
                        "description": input_data.get("description"),
                        "due_date": input_data.get("due_date"),
                        "meta": meta,
                        "progress": input_data.get("progress", 0),
                        "source": input_data.get("source", "familyhub"),
                        "updated_at": datetime.utcnow(),
                    },
                )

                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_PROJECT",
                    resource_type="projects",
                    resource_id=project_id,
                    success=True,
                    metadata={**input_data, "meta": meta},
                )

                return {"status": 1, "message": "Project updated successfully", "payload": {"id": project_id}}

            else:
                # Create new project
                generated_id = uniqueId(digit=5, isNum=True)
                DBHelper.insert(
                    table_name="projects",
                    return_column="id",
                    id=generated_id,
                    user_id=uid,
                    title=input_data.get("title"),
                    description=input_data.get("description"),
                    due_date=input_data.get("due_date"),
                    meta=meta,
                    source=input_data.get("source", "familyhub"),
                    progress=input_data.get("progress", 0),
                )

                AuditLogger.log(
                    user_id=uid,
                    action="CREATE_PROJECT",
                    resource_type="projects",
                    resource_id=generated_id,
                    success=True,
                    metadata={**input_data, "meta": meta},
                )

                return {
                    "status": 1,
                    "message": "Project added successfully",
                    "payload": {"id": generated_id},
                }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_OR_UPDATE_PROJECT_FAILED",
                resource_type="projects",
                resource_id=project_id or None,
                success=False,
                error_message="Failed to save project",
                metadata={"input": input_data if 'input_data' in locals() else {}, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to save project: {str(e)}", "payload": {}}, 500


class GetProjects(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        source = request.args.get("source", None)
        family_group_id = request.args.get("family_group_id", None)

        # ✅ Collect all family groups for this user
        if family_group_id:
            user_family_groups = [family_group_id]
        else:
            user_groups = DBHelper.find_all(
                table_name="family_members",
                select_fields=["family_group_id"],
                filters={"fm_user_id": uid},
            )
            user_family_groups = [
                g["family_group_id"] for g in user_groups if g["family_group_id"]
            ]

        # ✅ Fetch all projects (we don't filter by family_groups here, only later)
        projects = DBHelper.find_all(
            table_name="projects",
            select_fields=[
                "id",
                "title",
                "description",
                "due_date",
                "meta",
                "progress",
                "created_at",
                "updated_at",
                "source",
                "user_id",
                "tagged_ids",
                "is_active",
            ],
            filters={},  # no restriction by uid
        )

        projects = [p for p in projects if p.get("is_active", 1) == 1]

        # ✅ Preload creator names
        creator_ids = list(set([p["user_id"] for p in projects if p["user_id"]]))
        creators = {}
        if creator_ids:
            creator_data = DBHelper.find_in(
                table_name="users",
                select_fields=["uid", "user_name"],
                field="uid",
                values=creator_ids,
            )
            creators = {c["uid"]: c["user_name"] for c in creator_data}

        # ✅ Filter projects based on new access rule
        filtered_projects = []
        for p in projects:
            meta = p.get("meta") or {}
            project_family_groups = meta.get("family_groups", [])
            visibility = meta.get("visibility", "private")
            src = p.get("source")

            # Flags
            is_owner = p["user_id"] == uid
            in_family_group = any(fg in user_family_groups for fg in project_family_groups)
            if src == "familyhub":
                if is_owner or in_family_group:
                    filtered_projects.append(p)

            elif src == "planner":
                if visibility == "private":
                    if is_owner:
                        filtered_projects.append(p)
                elif visibility == "public":
                    if is_owner or in_family_group:
                        filtered_projects.append(p)


        # ✅ Format output
        formatted = [
            {
                "id": p["id"],
                "title": p["title"],
                "description": p["description"],
                "due_date": p["due_date"].isoformat() if p["due_date"] else None,
                "meta": p["meta"],
                "progress": p["progress"],
                "created_at": p["created_at"].isoformat(),
                "updated_at": p["updated_at"].isoformat(),
                "source": p["source"],
                "created_by": p["user_id"],
                "creator_name": creators.get(p["user_id"], "Unknown"),
                # "family_groups": (p.get("meta") or {}).get("family_groups", []),
            }
            for p in filtered_projects
        ]

        return {
            "status": 1,
            "message": "Projects fetched successfully",
            "payload": {"projects": formatted},
        }
    

class UpdateProject(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            input_data = request.get_json(silent=True)
            if not input_data:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_PROJECT_FAILED",
                    resource_type="projects",
                    resource_id=None,
                    success=False,
                    error_message="No input data provided",
                    metadata={"input": input_data},
                )
                return {"status": 0, "message": "No input data provided", "payload": {}}, 422

            project_id = input_data.get("id") or input_data.get("project_id")
            if not project_id:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_PROJECT_FAILED",
                    resource_type="projects",
                    resource_id=None,
                    success=False,
                    error_message="Project id is required",
                    metadata={"input": input_data},
                )
                return {"status": 0, "message": "Project id is required", "payload": {}}, 422

            # Check if project exists & belongs to user
            project = DBHelper.find_one(
                table_name="projects",
                filters={"id": project_id, "user_id": uid},
                select_fields=["id", "title", "description", "due_date", "meta", "progress", "is_active"]
            )

            if not project:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_PROJECT_FAILED",
                    resource_type="projects",
                    resource_id=project_id,
                    success=False,
                    error_message="Project not found or not owned by user",
                    metadata={"input": input_data},
                )
                return {"status": 0, "message": "Project not found or not owned by user", "payload": {}}, 404

            updates = {}
            if "title" in input_data:
                updates["title"] = input_data.get("title")
            if "description" in input_data:
                updates["description"] = input_data.get("description")
            if "due_date" in input_data:
                try:
                    updates["due_date"] = datetime.fromisoformat(input_data.get("due_date")) if input_data.get("due_date") else None
                except ValueError as e:
                    AuditLogger.log(
                        user_id=uid,
                        action="UPDATE_PROJECT_FAILED",
                        resource_type="projects",
                        resource_id=project_id,
                        success=False,
                        error_message="Invalid due_date format",
                        metadata={"input": input_data, "error": str(e)},
                    )
                    return {"status": 0, "message": "Invalid due_date format. Use ISO format", "payload": {}}, 400
            if "meta" in input_data:
                updates["meta"] = input_data.get("meta")
            if "progress" in input_data:
                updates["progress"] = input_data.get("progress")
            if "is_active" in input_data:
                updates["is_active"] = input_data.get("is_active")
            if "family_groups" in input_data:
                updates["family_groups"] = input_data.get("family_groups")

            updates["updated_at"] = datetime.utcnow()

            # Perform DB update
            DBHelper.update_one(
                table_name="projects",
                filters={"id": project_id, "user_id": uid},
                updates=updates,
            )

            # ✅ Audit log for success
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_PROJECT",
                resource_type="projects",
                resource_id=project_id,
                success=True,
                metadata={**updates},
            )

            # Fetch updated project
            updated_project = DBHelper.find_one(
                table_name="projects",
                filters={"id": project_id},
                select_fields=[
                    "id", "title", "description", "due_date", "meta", "progress",
                    "created_at", "updated_at", "source", "user_id", "is_active"
                ]
            )

            return {
                "status": 1,
                "message": "Project updated successfully",
                "payload": {
                    "project": {
                        "id": updated_project["id"],
                        "title": updated_project.get("title"),
                        "description": updated_project.get("description"),
                        "due_date": updated_project["due_date"].isoformat() if updated_project.get("due_date") else None,
                        "meta": updated_project.get("meta"),
                        "progress": updated_project.get("progress"),
                        "created_at": updated_project["created_at"].isoformat(),
                        "updated_at": updated_project["updated_at"].isoformat(),
                        "source": updated_project.get("source"),
                        "user_id": updated_project.get("user_id"),
                        "family_groups": (updated_project.get("meta") or {}).get("family_groups", []),
                        "is_active": updated_project.get("is_active", 1),
                    }
                },
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_PROJECT_FAILED",
                resource_type="projects",
                resource_id=project_id if 'project_id' in locals() else None,
                success=False,
                error_message="Failed to save project",
                metadata={"input": input_data if 'input_data' in locals() else {}, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to save project: {str(e)}", "payload": {}}, 500


class DeleteProject(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(silent=True)
            project_id = data.get("id") if data else None

            if not project_id:
                AuditLogger.log(
                    user_id=uid,
                    action="DELETE_PROJECT_FAILED",
                    resource_type="projects",
                    resource_id=None,
                    success=False,
                    error_message="Project ID is required",
                    metadata={"input": data or {}},
                )
                return {"status": 0, "message": "Project ID is required", "payload": {}}, 400

            # Ensure the project belongs to this user
            project = DBHelper.find_one(
                "projects",
                filters={"id": project_id, "user_id": uid},
                select_fields=["id", "title"]
            )

            if not project:
                AuditLogger.log(
                    user_id=uid,
                    action="DELETE_PROJECT_FAILED",
                    resource_type="projects",
                    resource_id=project_id,
                    success=False,
                    error_message="Project not found",
                    metadata={"input": data or {}},
                )
                return {"status": 0, "message": "Project not found", "payload": {}}, 404

            # Soft delete the project
            DBHelper.update_one(
                table_name="projects",
                filters={"id": project_id, "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.utcnow()},
            )

            # Soft delete all related tasks (cascade)
            DBHelper.update_all(
                table_name="tasks",
                filters={"project_id": project_id},
                updates={"is_active": 0, "updated_at": datetime.utcnow()},
            )

            # ✅ Audit log for success
            AuditLogger.log(
                user_id=uid,
                action="DELETE_PROJECT",
                resource_type="projects",
                resource_id=project_id,
                success=True,
                metadata={
                    "project_title": project.get("title"),
                    "cascade_delete_tasks": True,
                },
            )

            return {
                "status": 1,
                "message": "Project and its tasks deleted successfully",
                "payload": {"project_id": project_id},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="DELETE_PROJECT_FAILED",
                resource_type="projects",
                resource_id=project_id if 'project_id' in locals() else None,
                success=False,
                error_message="Failed to delete project",
                metadata={"input": data if 'data' in locals() else {}, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to delete project: {str(e)}",
                "payload": {},
            }, 500



class AddTask(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(silent=True)

            if not data or "project_id" not in data:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_TASK_FAILED",
                    resource_type="tasks",
                    resource_id=None,
                    success=False,
                    error_message="Missing project_id in request",
                    metadata={"input": data or {}},
                )
                return {
                    "status": 0,
                    "message": "Project ID is required",
                    "payload": {},
                }, 400

            # Fetch the project
            project = DBHelper.find_one(
                "projects", filters={"id": data.get("project_id"), "user_id": uid}
            )
            if not project:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_TASK_FAILED",
                    resource_type="tasks",
                    resource_id=None,
                    success=False,
                    error_message="Project not found",
                    metadata={"input": data},
                )
                return {
                    "status": 0,
                    "message": "Project not found",
                    "payload": {},
                }, 404

            title = data.get("title")
            due_date_str = data.get("due_date")  # Format: 'YYYY-MM-DD'

            # Parse date
            start_dt = datetime.strptime(due_date_str, "%Y-%m-%d")
            end_dt = start_dt + timedelta(days=1)  # All-day event

            # Create Google Calendar event
            calendar_event_id = create_calendar_event(
                uid, f"{project['title']} - {title}", start_dt, end_dt
            )

            # Insert task
            task_id = DBHelper.insert(
                table_name="tasks",
                return_column="id",
                user_id=uid,
                project_id=data.get("project_id"),
                title=title,
                due_date=due_date_str,
                assignee=data.get("assignee"),
                type=data.get("type"),
                completed=data.get("completed", False),
                calendar_event_id=calendar_event_id,
            )

            # ✅ Audit log for success
            AuditLogger.log(
                user_id=uid,
                action="ADD_TASK",
                resource_type="tasks",
                resource_id=task_id,
                success=True,
                metadata={
                    "project_id": data.get("project_id"),
                    "project_title": project.get("title"),
                    "task_title": title,
                    "assignee": data.get("assignee"),
                    "due_date": due_date_str,
                    "calendar_event_id": calendar_event_id,
                },
            )

            return {
                "status": 1,
                "message": "Task added successfully",
                "payload": {"task_id": task_id},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_TASK_FAILED",
                resource_type="tasks",
                resource_id=None,
                success=False,
                error_message="Failed to add task",
                metadata={"input": data if 'data' in locals() else {}, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to add task: {str(e)}",
                "payload": {},
            }, 500


class GetTasks(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        project_id = request.args.get("project_id")

        sent_invites = DBHelper.find_all(
            table_name="family_members",
            select_fields=["fm_user_id"],
            filters={"user_id": uid},
        )
        received_invites = DBHelper.find_all(
            table_name="family_members",
            select_fields=["user_id"],
            filters={"fm_user_id": uid},
        )

        familyMembersIds = [m["fm_user_id"] for m in sent_invites] + [
            m["user_id"] for m in received_invites
        ]
        familyMembersIds = list(set(familyMembersIds + [uid]))

        tasks = DBHelper.find_in(
            table_name="tasks",
            select_fields=[
                "id",
                "title",
                "due_date",
                "assignee",
                "type",
                "completed",
                "project_id", 
                "is_active"
            ],
            field="user_id",
            values=familyMembersIds,
        )

        # Filter only tasks for the requested project
        tasks = [t for t in tasks if str(t.get("project_id")) == str(project_id) and t.get("is_active", 1) == 1]

        formatted_tasks = [
            {
                "id": t["id"],
                "title": t["title"],
                "due_date": t["due_date"].isoformat() if t["due_date"] else None,
                "assignee": t["assignee"],
                "type": t["type"],
                "completed": t["completed"],
            }
            for t in tasks
        ]

        return {
            "status": 1,
            "message": "Tasks fetched",
            "payload": {"tasks": formatted_tasks},
        }


class UpdateTask(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(silent=True)
            task_id = data.get("id")

            if not task_id:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_TASK_FAILED",
                    resource_type="tasks",
                    resource_id=None,
                    success=False,
                    error_message="Task ID is required",
                    metadata={"input": data or {}},
                )
                return {"status": 0, "message": "Task ID is required", "payload": {}}, 400

            task = DBHelper.find_one("tasks", filters={"id": task_id, "user_id": uid})
            if not task:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_TASK_FAILED",
                    resource_type="tasks",
                    resource_id=task_id,
                    success=False,
                    error_message="Task not found",
                    metadata={"input": data},
                )
                return {"status": 0, "message": "Task not found", "payload": {}}, 404

            # Prepare updates
            updates = {
                "title": data.get("title"),
                "due_date": data.get("due_date"),
                "assignee": data.get("assignee"),
                "type": data.get("type"),
                "completed": data.get("completed"),
                "updated_at": datetime.utcnow(),
            }
            updates = {k: v for k, v in updates.items() if v is not None}

            calendar_event_id = task.get("calendar_event_id")
            calendar_log = ""

            # ───── Google Calendar Sync ─────
            try:
                new_title = updates.get("title", task["title"])
                new_due_date_str = updates.get("due_date", task["due_date"])
                start_dt = datetime.strptime(new_due_date_str, "%Y-%m-%d")
                end_dt = start_dt + timedelta(days=1)

                project = DBHelper.find_one(
                    "projects", filters={"id": task["project_id"], "user_id": uid}
                )
                event_title = f"{project['title']} - {new_title}"

                if calendar_event_id:
                    try:
                        update_calendar_event(uid, calendar_event_id, event_title, start_dt, end_dt)
                        calendar_log = "Existing Google Calendar event updated"
                    except Exception as e:
                        new_event_id = create_calendar_event(uid, event_title, start_dt, end_dt)
                        updates["calendar_event_id"] = new_event_id
                        calendar_log = f"Failed to update existing event. Created new event {new_event_id}"
                else:
                    new_event_id = create_calendar_event(uid, event_title, start_dt, end_dt)
                    updates["calendar_event_id"] = new_event_id
                    calendar_log = f"No existing calendar event. Created new event {new_event_id}"

            except Exception as e:
                calendar_log = f"Google Calendar sync failed: {str(e)}"

            # Update task in DB
            DBHelper.update_one(
                table_name="tasks",
                filters={"id": task_id, "user_id": uid},
                updates=updates,
            )

            # ✅ Audit log for success
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_TASK",
                resource_type="tasks",
                resource_id=task_id,
                success=True,
                metadata={
                    "updated_fields": updates,
                    "input_data": data,
                    "calendar_log": calendar_log,
                },
            )

            return {"status": 1, "message": "Task updated successfully", "payload": {"task_id": task_id}}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_TASK_FAILED",
                resource_type="tasks",
                resource_id=task_id if 'task_id' in locals() else None,
                success=False,
                error_message="Failed to update task",
                metadata={"input": data if 'data' in locals() else {}, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to update task: {str(e)}", "payload": {}}, 500

class DeleteTask(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(silent=True)
            task_id = data.get("id")

            if not task_id:
                AuditLogger.log(
                    user_id=uid,
                    action="DELETE_TASK_FAILED",
                    resource_type="tasks",
                    resource_id=None,
                    success=False,
                    error_message="Task ID is required",
                    metadata={"input": data or {}},
                )
                return {"status": 0, "message": "Task ID is required", "payload": {}}, 400

            # Fetch the task first
            task = DBHelper.find_one("tasks", filters={"id": task_id, "user_id": uid})
            if not task:
                AuditLogger.log(
                    user_id=uid,
                    action="DELETE_TASK_FAILED",
                    resource_type="tasks",
                    resource_id=task_id,
                    success=False,
                    error_message="Task not found",
                    metadata={"input": data},
                )
                return {"status": 0, "message": "Task not found", "payload": {}}, 404

            calendar_log = ""
            try:
                calendar_event_id = task.get("calendar_event_id")
                if calendar_event_id:
                    try:
                        delete_calendar_event(uid, calendar_event_id)
                        calendar_log = f"Google Calendar event {calendar_event_id} deleted"
                    except Exception as e:
                        calendar_log = f"Failed to delete Google Calendar event: {str(e)}"
            except Exception as e:
                calendar_log = f"Google Calendar processing failed: {str(e)}"

            # Soft delete task
            DBHelper.update_one(
                table_name="tasks",
                filters={"id": task_id, "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.utcnow()},
            )

            # ✅ Audit log for success
            AuditLogger.log(
                user_id=uid,
                action="DELETE_TASK",
                resource_type="tasks",
                resource_id=task_id,
                success=True,
                metadata={"calendar_log": calendar_log, "task_data": task},
            )

            return {"status": 1, "message": "Task deleted successfully", "payload": {"task_id": task_id}}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="DELETE_TASK_FAILED",
                resource_type="tasks",
                resource_id=task_id if 'task_id' in locals() else None,
                success=False,
                error_message="Failed to delete task",
                metadata={"input": data if 'data' in locals() else {}, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to delete task: {str(e)}", "payload": {}}, 500



class AddPersonalInfo(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_PERSONAL_INFO_FAILED",
                    resource_type="personal_information",
                    resource_id=None,
                    success=False,
                    error_message="Failed to save personal info",
                    metadata={"input": inputData, "error": "No input data provided"},
                )
                return {
                    "status": 0,
                    "message": "Failed to save personal info: No input data provided",
                    "payload": {},
                }, 500

            personal_info = inputData.get("personal_info", {})
            if not personal_info:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_PERSONAL_INFO_FAILED",
                    resource_type="personal_information",
                    resource_id=None,
                    success=False,
                    error_message="Failed to save personal info",
                    metadata={"input": inputData, "error": "No personal info data provided"},
                )
                return {
                    "status": 0,
                    "message": "Failed to save personal info: No personal info data provided",
                    "payload": {},
                }, 500

            required_fields = ["addedBy", "userId"]
            missing_fields = [field for field in required_fields if field not in personal_info]
            if missing_fields:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_PERSONAL_INFO_FAILED",
                    resource_type="personal_information",
                    resource_id=None,
                    success=False,
                    error_message="Failed to save personal info",
                    metadata={
                        "input": inputData,
                        "error": f"Missing required fields: {', '.join(missing_fields)}"
                    },
                )
                return {
                    "status": 0,
                    "message": f"Failed to save personal info: Missing required fields: {', '.join(missing_fields)}",
                    "payload": {},
                }, 500

            current_time = datetime.now().isoformat()
            fm_user_id = personal_info["userId"]

            personal_id = DBHelper.insert(
                table_name="personal_information",
                return_column="id",
                user_id=uid,
                family_member_user_id=fm_user_id,
                first_name=personal_info.get("firstName", ""),
                middle_name=personal_info.get("middleName", ""),
                last_name=personal_info.get("lastName", ""),
                preferred_name=personal_info.get("preferredName", ""),
                nicknames=personal_info.get("nicknames", ""),
                relationship=personal_info.get("relationship", ""),
                date_of_birth=personal_info.get("dateOfBirth") or None,
                age=personal_info.get("age", ""),
                birthplace=personal_info.get("birthplace", ""),
                gender=personal_info.get("gender", ""),
                phone_number=personal_info.get("phoneNumber", ""),
                primary_email=personal_info.get("primaryEmail", ""),
                additional_emails=personal_info.get("additionalEmails", ""),
                same_as_primary=personal_info.get("sameAsPrimary", False),
                birth_cert_number=personal_info.get("birthCertNumber", ""),
                state_id=personal_info.get("stateId", ""),
                passport=personal_info.get("passport", ""),
                license=personal_info.get("license", ""),
                birth_cert=personal_info.get("birthCert", ""),
                primary_contact=personal_info.get("primaryContact", ""),
                primary_phone=personal_info.get("primaryContactPhone", ""),
                secondary_contact=personal_info.get("secondaryContact", ""),
                secondary_phone=personal_info.get("secondaryContactPhone", ""),
                emergency_contact=personal_info.get("emergencyContact", ""),
                emergency_phone=personal_info.get("emergencyPhone", ""),
                blood_type=personal_info.get("bloodType", ""),
                height=personal_info.get("height", ""),
                weight=personal_info.get("weight", ""),
                eye_color=personal_info.get("eyeColor", ""),
                insurance=personal_info.get("insurance", ""),
                member_id=personal_info.get("memberId", ""),
                group_num=personal_info.get("groupNum", ""),
                last_checkup=personal_info.get("lastCheckup") or None,
                allergies=personal_info.get("allergies", ""),
                medications=personal_info.get("medications", ""),
                notes=personal_info.get("notes", ""),
                ssn=personal_info.get("ssn", ""),
                student_id=personal_info.get("studentId", ""),
                added_by=personal_info.get("addedBy", ""),
                added_time=current_time,
                edited_by=personal_info.get("editedBy", personal_info.get("addedBy", "")),
                updated_at=current_time,
            )

            # ✅ Audit log for success
            AuditLogger.log(
                user_id=uid,
                action="ADD_PERSONAL_INFO_SUCCESS",
                resource_type="personal_information",
                resource_id=personal_id,
                success=True,
                metadata={"personal_info": personal_info},
            )

            return {
                "status": 1,
                "message": "Personal information added successfully",
                "payload": {"id": personal_id},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_PERSONAL_INFO_FAILED",
                resource_type="personal_information",
                resource_id=None,
                success=False,
                error_message="Failed to save personal info",
                metadata={"input": inputData, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to save personal info: {str(e)}",
                "payload": {},
            }, 500


class GetPersonalInfo(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            fm_user_id = request.args.get("userId") or uid
            personal_info = DBHelper.find_one(
                table_name="personal_information",
                select_fields=[
                    "id",
                    "first_name",
                    "middle_name",
                    "last_name",
                    "preferred_name",
                    "nicknames",
                    "relationship",
                    "date_of_birth",
                    "age",
                    "birthplace",
                    "gender",
                    "phone_number",
                    "primary_email",
                    "additional_emails",
                    "same_as_primary",
                    "birth_cert_number",
                    "state_id",
                    "passport",
                    "license",
                    "birth_cert",
                    "primary_contact",
                    "primary_phone",
                    "secondary_contact",
                    "secondary_phone",
                    "emergency_contact",
                    "emergency_phone",
                    "blood_type",
                    "height",
                    "weight",
                    "eye_color",
                    "insurance",
                    "member_id",
                    "group_num",
                    "last_checkup",
                    "allergies",
                    "medications",
                    "notes",
                    "ssn",
                    "student_id",
                    "added_by",
                    "added_time",
                    "edited_by",
                    "updated_at",
                ],
                filters={"family_member_user_id": fm_user_id},
            )

            if not personal_info:
                return {
                    "status": 1,
                    "message": "No personal information found",
                    "payload": {},
                }, 200

            def serialize_datetime(dt):
                return dt.isoformat() if isinstance(dt, (datetime, date)) else ""

            response_data = {
                "id": personal_info["id"],
                "firstName": personal_info["first_name"] or "",
                "middleName": personal_info["middle_name"] or "",
                "lastName": personal_info["last_name"] or "",
                "preferredName": personal_info["preferred_name"] or "",
                "nicknames": personal_info["nicknames"] or "",
                "relationship": personal_info["relationship"] or "",
                "dateOfBirth": (
                    str(personal_info["date_of_birth"])
                    if personal_info["date_of_birth"]
                    else None
                ),
                "age": personal_info["age"] or "",
                "birthplace": personal_info["birthplace"] or "",
                "gender": personal_info["gender"] or "",
                "phoneNumber": personal_info["phone_number"] or "",
                "primaryEmail": personal_info["primary_email"] or "",
                "additionalEmails": personal_info["additional_emails"] or "",
                "sameAsPrimary": personal_info["same_as_primary"] or False,
                "birthCertNumber": personal_info["birth_cert_number"] or "",
                "stateId": personal_info["state_id"] or "",
                "passport": personal_info["passport"] or "",
                "license": personal_info["license"] or "",
                "birthCert": personal_info["birth_cert"] or "",
                "primaryContact": personal_info["primary_contact"] or "",
                "primaryContactPhone": personal_info["primary_phone"] or "",
                "secondaryContact": personal_info["secondary_contact"] or "",
                "secondaryContactPhone": personal_info["secondary_phone"] or "",
                "emergencyContact": personal_info["emergency_contact"] or "",
                "emergencyPhone": personal_info["emergency_phone"] or "",
                "bloodType": personal_info["blood_type"] or "",
                "height": personal_info["height"] or "",
                "weight": personal_info["weight"] or "",
                "eyeColor": personal_info["eye_color"] or "",
                "insurance": personal_info["insurance"] or "",
                "memberId": personal_info["member_id"] or "",
                "groupNum": personal_info["group_num"] or "",
                "lastCheckup": serialize_datetime(personal_info["last_checkup"])
                or None,
                "allergies": personal_info["allergies"] or "",
                "medications": personal_info["medications"] or "",
                "notes": personal_info["notes"] or "",
                "ssn": personal_info["ssn"] or "",
                "studentId": personal_info["student_id"] or "",
                "addedBy": personal_info["added_by"] or "",
                "addedTime": serialize_datetime(personal_info["added_time"]),
                "editedBy": personal_info["edited_by"] or "",
                "updatedAt": serialize_datetime(personal_info["updated_at"]),
            }

            return {
                "status": 1,
                "message": "Personal information fetched successfully",
                "payload": response_data,
            }, 200
        except Exception as e:
            return {
                "status": 0,
                "message": f"Failed to fetch personal info: {str(e)}",
            }, 500


class UpdatePersonalInfo(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        try:
            fm_user_id = request.args.get("userId") or uid
            inputData = request.get_json(silent=True)

            if not inputData:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_PERSONAL_INFO_FAILED",
                    resource_type="personal_information",
                    resource_id=None,
                    success=False,
                    error_message="Failed to update personal info",
                    metadata={"input": inputData, "error": "No input data provided"},
                )
                return {
                    "status": 0,
                    "message": "Failed to update personal info: No input data provided",
                    "payload": {},
                }, 500

            personal_info = inputData.get("personal_info", {})
            if not personal_info:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_PERSONAL_INFO_FAILED",
                    resource_type="personal_information",
                    resource_id=None,
                    success=False,
                    error_message="Failed to update personal info",
                    metadata={"input": inputData, "error": "No personal info data provided"},
                )
                return {
                    "status": 0,
                    "message": "Failed to update personal info: No personal info data provided",
                    "payload": {},
                }, 500

            required_fields = ["addedBy"]
            missing_fields = [field for field in required_fields if field not in personal_info]
            if missing_fields:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_PERSONAL_INFO_FAILED",
                    resource_type="personal_information",
                    resource_id=None,
                    success=False,
                    error_message="Failed to update personal info",
                    metadata={
                        "input": inputData,
                        "error": f"Missing required fields: {', '.join(missing_fields)}"
                    },
                )
                return {
                    "status": 0,
                    "message": f"Failed to update personal info: Missing required fields: {', '.join(missing_fields)}",
                    "payload": {},
                }, 500

            # Check user exists
            user_check = DBHelper.find_one(table_name="users", filters={"uid": uid})
            if not user_check:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_PERSONAL_INFO_FAILED",
                    resource_type="personal_information",
                    resource_id=None,
                    success=False,
                    error_message="Failed to update personal info",
                    metadata={"input": inputData, "error": f"User with ID {uid} not found"},
                )
                return {
                    "status": 0,
                    "message": f"Failed to update personal info: User with ID {uid} not found",
                    "payload": {},
                }, 500

            # Check record exists
            record_check = DBHelper.find_one(
                table_name="personal_information",
                filters={"family_member_user_id": fm_user_id, "user_id": uid},
            )
            if not record_check:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_PERSONAL_INFO_FAILED",
                    resource_type="personal_information",
                    resource_id=None,
                    success=False,
                    error_message="Failed to update personal info",
                    metadata={"input": inputData, "error": "Personal info record not found"},
                )
                return {
                    "status": 0,
                    "message": "Failed to update personal info: Personal info record not found",
                    "payload": {},
                }, 500

            personal_id = record_check["id"]
            current_time = datetime.now().isoformat()

            # Map input fields to DB columns
            updates = {}
            field_map = {
                "firstName": "first_name",
                "middleName": "middle_name",
                "lastName": "last_name",
                "preferredName": "preferred_name",
                "nicknames": "nicknames",
                "relationship": "relationship",
                "dateOfBirth": "date_of_birth",
                "age": "age",
                "birthplace": "birthplace",
                "gender": "gender",
                "phoneNumber": "phone_number",
                "primaryEmail": "primary_email",
                "additionalEmails": "additional_emails",
                "sameAsPrimary": "same_as_primary",
                "birthCertNumber": "birth_cert_number",
                "stateId": "state_id",
                "passport": "passport",
                "license": "license",
                "birthCert": "birth_cert",
                "primaryContact": "primary_contact",
                "primaryContactPhone": "primary_phone",
                "secondaryContact": "secondary_contact",
                "secondaryContactPhone": "secondary_phone",
                "emergencyContact": "emergency_contact",
                "emergencyPhone": "emergency_phone",
                "bloodType": "blood_type",
                "height": "height",
                "weight": "weight",
                "eyeColor": "eye_color",
                "insurance": "insurance",
                "memberId": "member_id",
                "groupNum": "group_num",
                "lastCheckup": "last_checkup",
                "allergies": "allergies",
                "medications": "medications",
                "notes": "notes",
                "ssn": "ssn",
                "studentId": "student_id",
            }

            for input_key, db_key in field_map.items():
                if input_key in personal_info:
                    updates[db_key] = personal_info[input_key]

            updates["edited_by"] = personal_info.get("editedBy", personal_info.get("addedBy", ""))
            updates["updated_at"] = current_time

            # Perform update
            DBHelper.update_one(
                table_name="personal_information",
                filters={"id": personal_id},
                updates=updates,
            )

            # ✅ Audit log success
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_PERSONAL_INFO_SUCCESS",
                resource_type="personal_information",
                resource_id=personal_id,
                success=True,
                metadata={"updated_fields": updates},
            )

            return {
                "status": 1,
                "message": "Personal information updated successfully",
                "payload": {"id": personal_id},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_PERSONAL_INFO_FAILED",
                resource_type="personal_information",
                resource_id=None,
                success=False,
                error_message="Failed to update personal info",
                metadata={"input": inputData, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to update personal info: {str(e)}",
                "payload": {},
            }, 500


class AddProvider(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            inputData = request.get_json(silent=True)

            if not inputData:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_PROVIDER_FAILED",
                    resource_type="healthcare_providers",
                    resource_id=None,
                    success=False,
                    error_message="Failed to save provider",
                    metadata={"input": inputData, "error": "No input data provided"},
                )
                return {
                    "status": 0,
                    "message": "Failed to save provider: No input data provided",
                    "payload": {},
                }, 500

            provider = inputData.get("provider", {})
            if not provider:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_PROVIDER_FAILED",
                    resource_type="healthcare_providers",
                    resource_id=None,
                    success=False,
                    error_message="Failed to save provider",
                    metadata={"input": inputData, "error": "No provider data provided"},
                )
                return {
                    "status": 0,
                    "message": "Failed to save provider: No provider data provided",
                    "payload": {},
                }, 500

            required_fields = ["providerTitle", "providerName", "addedBy", "userId"]
            missing_fields = [f for f in required_fields if f not in provider]
            if missing_fields:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_PROVIDER_FAILED",
                    resource_type="healthcare_providers",
                    resource_id=None,
                    success=False,
                    error_message="Failed to save provider",
                    metadata={
                        "input": inputData,
                        "error": f"Missing required fields: {', '.join(missing_fields)}"
                    },
                )
                return {
                    "status": 0,
                    "message": f"Failed to save provider: Missing required fields: {', '.join(missing_fields)}",
                    "payload": {},
                }, 500

            now = datetime.now().isoformat()

            provider_id = DBHelper.insert(
                table_name="healthcare_providers",
                return_column="id",
                user_id=uid,
                family_member_user_id=provider["userId"],
                provider_title=provider["providerTitle"],
                provider_name=provider["providerName"],
                provider_phone=provider.get("providerPhone", ""),
                country=provider.get("country", ""),
                zipcode=provider.get("zipcode", ""),
                added_by=provider["addedBy"],
                added_time=now,
                edited_by=provider.get("editedBy", provider["addedBy"]),
                updated_at=now,
            )

            # ✅ Audit log for success
            AuditLogger.log(
                user_id=uid,
                action="ADD_PROVIDER_SUCCESS",
                resource_type="healthcare_providers",
                resource_id=provider_id,
                success=True,
                metadata={"provider": provider},
            )

            return {
                "status": 1,
                "message": "Provider added successfully",
                "payload": {"id": provider_id},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_PROVIDER_FAILED",
                resource_type="healthcare_providers",
                resource_id=None,
                success=False,
                error_message="Failed to save provider",
                metadata={"input": inputData, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to save provider: {str(e)}",
                "payload": {},
            }, 500


class GetProviders(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            user_id = request.args.get("userId")
            if not user_id:
                return {"status": 0, "message": "User ID is required"}, 400

            providers = DBHelper.find_all(
                table_name="healthcare_providers",
                filters={"family_member_user_id": user_id},
            )

            # Convert datetime objects to ISO strings
            for provider in providers:
                for key in ["added_time", "updated_at"]:
                    if provider.get(key) and isinstance(provider[key], datetime):
                        provider[key] = provider[key].isoformat()

            return {"status": 1, "payload": providers}, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch providers: {str(e)}"}, 500


class UpdateProvider(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        try:
            inputData = request.get_json(silent=True)

            if not inputData:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_PROVIDER_FAILED",
                    resource_type="healthcare_providers",
                    resource_id=None,
                    success=False,
                    error_message="Failed to update provider",
                    metadata={"input": inputData, "error": "No input data provided"},
                )
                return {
                    "status": 0,
                    "message": "Failed to update provider: No input data provided",
                    "payload": {},
                }, 500

            provider = inputData.get("provider", {})
            if not provider:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_PROVIDER_FAILED",
                    resource_type="healthcare_providers",
                    resource_id=None,
                    success=False,
                    error_message="Failed to update provider",
                    metadata={"input": inputData, "error": "No provider data provided"},
                )
                return {
                    "status": 0,
                    "message": "Failed to update provider: No provider data provided",
                    "payload": {},
                }, 500

            required_fields = ["id", "providerTitle", "providerName", "addedBy", "userId"]
            missing_fields = [f for f in required_fields if f not in provider]
            if missing_fields:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_PROVIDER_FAILED",
                    resource_type="healthcare_providers",
                    resource_id=None,
                    success=False,
                    error_message="Failed to update provider",
                    metadata={
                        "input": inputData,
                        "error": f"Missing required fields: {', '.join(missing_fields)}"
                    },
                )
                return {
                    "status": 0,
                    "message": f"Failed to update provider: Missing required fields: {', '.join(missing_fields)}",
                    "payload": {},
                }, 500

            record = DBHelper.find_one(
                "healthcare_providers",
                {"id": provider["id"], "family_member_user_id": provider["userId"]},
            )
            if not record:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_PROVIDER_FAILED",
                    resource_type="healthcare_providers",
                    resource_id=provider.get("id"),
                    success=False,
                    error_message="Failed to update provider",
                    metadata={"input": inputData, "error": "Provider record not found"},
                )
                return {
                    "status": 0,
                    "message": "Failed to update provider: Provider record not found",
                    "payload": {},
                }, 404

            now = datetime.now().isoformat()

            DBHelper.update_one(
                table_name="healthcare_providers",
                filters={"id": provider["id"]},
                updates={
                    "provider_title": provider["providerTitle"],
                    "provider_name": provider["providerName"],
                    "provider_phone": provider.get("providerPhone", ""),
                    "country": provider.get("country", ""),
                    "zipcode": provider.get("zipcode", ""),
                    "edited_by": provider.get("editedBy", provider["addedBy"]),
                    "updated_at": now,
                },
            )

            AuditLogger.log(
                user_id=uid,
                action="UPDATE_PROVIDER_SUCCESS",
                resource_type="healthcare_providers",
                resource_id=provider["id"],
                success=True,
                metadata={"updated_fields": provider},
            )

            return {
                "status": 1,
                "message": "Provider updated successfully",
                "payload": {"id": provider["id"]},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_PROVIDER_FAILED",
                resource_type="healthcare_providers",
                resource_id=provider.get("id") if provider else None,
                success=False,
                error_message="Failed to update provider",
                metadata={"input": inputData, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to update provider: {str(e)}",
                "payload": {},
            }, 500


class GetFamilyMemberUserId(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        member_id = request.args.get("memberId")
        if not member_id:
            return {"status": 0, "message": "Missing memberId"}, 400

        member = DBHelper.find_one(
            table_name="family_members",
            filters={"id": member_id},
            select_fields=["fm_user_id"],
        )

        if not member:
            return {"status": 0, "message": "Family member not found"}, 404

        user = DBHelper.find_one(
            table_name="users",
            filters={"uid": member["fm_user_id"]},
            select_fields=["user_name"],
        )

        return {
            "status": 1,
            "payload": {
                "userId": member["fm_user_id"],
                "userName": user["user_name"] if user else None,
            },
        }


class AddAccountPassword(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            inputData = request.get_json(silent=True)

            if not inputData:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_ACCOUNT_PASSWORD_FAILED",
                    resource_type="account_passwords",
                    resource_id=None,
                    success=False,
                    error_message="Failed to add account",
                    metadata={"input": inputData, "error": "No input data provided"},
                )
                return {
                    "status": 0,
                    "message": "Failed to add account: No input data provided",
                    "payload": {},
                }, 500

            account = inputData.get("account", {})
            if not account:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_ACCOUNT_PASSWORD_FAILED",
                    resource_type="account_passwords",
                    resource_id=None,
                    success=False,
                    error_message="Failed to add account",
                    metadata={"input": inputData, "error": "No account data provided"},
                )
                return {
                    "status": 0,
                    "message": "Failed to add account: No account data provided",
                    "payload": {},
                }, 500

            required_fields = ["category", "title", "addedBy", "userId"]
            missing_fields = [f for f in required_fields if f not in account]
            if missing_fields:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_ACCOUNT_PASSWORD_FAILED",
                    resource_type="account_passwords",
                    resource_id=None,
                    success=False,
                    error_message="Failed to add account",
                    metadata={
                        "input": account,
                        "error": f"Missing required fields: {', '.join(missing_fields)}"
                    },
                )
                return {
                    "status": 0,
                    "message": f"Failed to add account: Missing required fields: {', '.join(missing_fields)}",
                    "payload": {},
                }, 500

            now = datetime.now().isoformat()

            account_id = DBHelper.insert(
                table_name="account_passwords",
                return_column="id",
                user_id=uid,
                family_member_user_id=account["userId"],
                category=account["category"],
                title=account["title"],
                username=account.get("username", ""),
                password=account.get("password", ""),
                url=account.get("url", ""),
                added_by=account["addedBy"],
                added_time=now,
                edited_by=account.get("editedBy", account["addedBy"]),
                updated_at=now,
            )

            AuditLogger.log(
                user_id=uid,
                action="ADD_ACCOUNT_PASSWORD_SUCCESS",
                resource_type="account_passwords",
                resource_id=account_id,
                success=True,
                metadata={"account": account},
            )

            return {
                "status": 1,
                "message": "Account added successfully",
                "payload": {"id": account_id},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_ACCOUNT_PASSWORD_FAILED",
                resource_type="account_passwords",
                resource_id=None,
                success=False,
                error_message="Failed to add account",
                metadata={"input": inputData, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to add account: {str(e)}",
                "payload": {},
            }, 500


class GetAccountPasswords(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            user_id = request.args.get("userId")
            if not user_id:
                return {"status": 0, "message": "Missing userId"}, 400

            results = DBHelper.find_all(
                table_name="account_passwords",
                filters={"family_member_user_id": user_id},
            )
            for r in results:
                for key in r:
                    if isinstance(r[key], datetime):
                        r[key] = r[key].isoformat()

            return {
                "status": 1,
                "message": "Accounts fetched successfully",
                "payload": results,
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch accounts: {str(e)}"}, 500


class UpdateAccountPassword(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_ACCOUNT_PASSWORD",
                    resource_type="account_passwords",
                    resource_id=None,
                    success=False,
                    error_message="No input data provided",
                    metadata={}
                )
                return {"status": 0, "message": "No input data provided"}, 400

            account = inputData.get("account", {})
            if not account or "id" not in account:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_ACCOUNT_PASSWORD",
                    resource_type="account_passwords",
                    resource_id=None,
                    success=False,
                    error_message="Missing account ID or data",
                    metadata={"input_data": account}
                )
                return {"status": 0, "message": "Missing account ID or data"}, 400

            update_fields = {
                "category": account.get("category"),
                "title": account.get("title"),
                "username": account.get("username"),
                "password": account.get("password"),
                "url": account.get("url"),
                "edited_by": account.get("editedBy", uid),
                "updated_at": datetime.now().isoformat(),
            }

            # Remove None values
            update_fields = {k: v for k, v in update_fields.items() if v is not None}

            DBHelper.update_one(
                table_name="account_passwords",
                filters={"id": account["id"]},
                updates=update_fields,
            )

            AuditLogger.log(
                user_id=uid,
                action="UPDATE_ACCOUNT_PASSWORD",
                resource_type="account_passwords",
                resource_id=account["id"],
                success=True,
                metadata={"updated_fields": update_fields}
            )

            return {"status": 1, "message": "Account updated successfully"}, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_ACCOUNT_PASSWORD",
                resource_type="account_passwords",
                resource_id=account.get("id") if account else None,
                success=False,
                error_message="Failed to update account",
                metadata={"input_data": inputData,"error": str(e)}
            )
            return {"status": 0, "message": f"Failed to update account: {str(e)}"}, 500

from werkzeug.utils import secure_filename
from googleapiclient.http import MediaIoBaseUpload
import io


def get_or_create_subfolder(service, folder_name: str, parent_id: str):
    """Check if a folder with name exists under parent, else create it"""
    query = (
        f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' "
        f"and '{parent_id}' in parents and trashed = false"
    )

    response = service.files().list(q=query, fields="files(id, name)").execute()
    folders = response.get("files", [])

    if folders:
        return folders[0]["id"]

    # Folder not found, so create it
    metadata = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_id],
    }
    created_folder = service.files().create(body=metadata, fields="id").execute()
    return created_folder["id"]

class UploadDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        file = None
        hub = None
        doc_type = None

        try:
            if "file" not in request.files:
                AuditLogger.log(
                    user_id=uid,
                    action="UPLOAD_DRIVE_FILE_FAILED",
                    resource_type="google_drive",
                    resource_id=None,
                    success=False,
                    error_message="No file provided",
                    metadata={"input": {}, "error": "No file in request"},
                )
                return {"status": 0, "message": "No file provided"}, 400

            file = request.files["file"]
            hub = request.form.get("hub", "").capitalize()
            doc_type = request.form.get("docType", "").strip()

            if not hub or hub not in ["Home", "Family", "Finance", "Health"]:
                AuditLogger.log(
                    user_id=uid,
                    action="UPLOAD_DRIVE_FILE_FAILED",
                    resource_type="google_drive",
                    resource_id=None,
                    success=False,
                    error_message="Invalid or missing hub name",
                    metadata={"input": {"hub": hub}, "error": "Invalid hub"},
                )
                return {"status": 0, "message": "Invalid or missing hub name"}, 400

            if hub == "Family" and doc_type != "EstateDocuments":
                AuditLogger.log(
                    user_id=uid,
                    action="UPLOAD_DRIVE_FILE_FAILED",
                    resource_type="google_drive",
                    resource_id=None,
                    success=False,
                    error_message="Missing or invalid docType for Family hub",
                    metadata={"input": {"docType": doc_type}, "error": "Invalid docType"},
                )
                return {
                    "status": 0,
                    "message": "Missing or invalid docType for Family hub",
                }, 400

            service = self.get_drive_service(uid)
            if not service:
                AuditLogger.log(
                    user_id=uid,
                    action="UPLOAD_DRIVE_FILE_FAILED",
                    resource_type="google_drive",
                    resource_id=None,
                    success=False,
                    error_message="Google Drive not connected or token expired",
                    metadata={"input": {"hub": hub, "docType": doc_type}, "error": "No drive service"},
                )
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }, 401

            # Step 1: Ensure base folder structure exists
            folder_data = ensure_drive_folder_structure(service)
            family_folder_id = folder_data["subfolders"].get("Family")
            if not family_folder_id:
                AuditLogger.log(
                    user_id=uid,
                    action="UPLOAD_DRIVE_FILE_FAILED",
                    resource_type="google_drive",
                    resource_id=None,
                    success=False,
                    error_message="Family folder not found",
                    metadata={"input": {"hub": hub}, "error": "Missing Family folder"},
                )
                return {"status": 0, "message": "Family folder not found"}, 404

            # Step 2: Ensure Estate Documents folder exists
            estate_folder_id = get_or_create_subfolder(
                service, "Estate Documents", parent_id=family_folder_id
            )

            # Step 3: Upload file
            file_metadata = {
                "name": secure_filename(file.filename),
                "parents": [estate_folder_id],
            }
            media = MediaIoBaseUpload(
                io.BytesIO(file.read()),
                mimetype=file.content_type or "application/octet-stream",
            )

            uploaded_file = (
                service.files()
                .create(
                    body=file_metadata, media_body=media, fields="id, name, webViewLink"
                )
                .execute()
            )

            # ✅ Success log
            AuditLogger.log(
                user_id=uid,
                action="UPLOAD_DRIVE_FILE",
                resource_type="google_drive",
                resource_id=uploaded_file.get("id"),
                success=True,
                metadata={
                    "file_name": uploaded_file.get("name"),
                    "webViewLink": uploaded_file.get("webViewLink"),
                    "hub": hub,
                    "docType": doc_type,
                },
            )

            return {
                "status": 1,
                "message": "File uploaded successfully",
                "payload": {"file": uploaded_file},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPLOAD_DRIVE_FILE_FAILED",
                resource_type="google_drive",
                resource_id=None,
                success=False,
                error_message="Failed to upload drive file",
                metadata={
                    "input": {
                        "hub": hub,
                        "docType": doc_type,
                        "file": file.filename if file else None,
                        "error": str(e),
                    },
                    
                },
            )
            return {
                "status": 0,
                "message": f"Failed to upload file: {str(e)}",
                "payload": {},
            }, 500


class GetFamilyDriveFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected",
                    "payload": {},
                }, 401

            folder_data = ensure_drive_folder_structure(service)
            family_folder_id = folder_data["subfolders"].get("Family")
            if not family_folder_id:
                return {
                    "status": 0,
                    "message": "Family folder not found",
                    "payload": {},
                }, 404

            # 🔥 Get or create "Estate Documents" subfolder inside Family
            estate_folder_id = get_or_create_subfolder(
                service, "Estate Documents", parent_id=family_folder_id
            )

            # 🔍 Fetch only files from Estate Documents folder
            query = f"'{estate_folder_id}' in parents and trashed = false"
            results = (
                service.files()
                .list(q=query, fields="files(id, name, webViewLink)", spaces="drive")
                .execute()
            )
            files = results.get("files", [])

            return {
                "status": 1,
                "message": "Estate documents fetched successfully",
                "payload": {"files": files},
            }, 200

        except Exception as e:
            return {
                "status": 0,
                "message": f"Failed to fetch estate documents: {str(e)}",
            }, 500


class DeleteDriveFile(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        file_id = request.args.get("file_id")
        if not file_id:
            AuditLogger.log(
                user_id=uid,
                action="delete_drive_file",
                resource_type="google_drive",
                resource_id=None,
                success=False,
                error_message="Missing file_id",
                metadata={}
            )
            return {"status": 0, "message": "Missing file_id"}, 400

        service = self.get_drive_service(uid)
        if not service:
            AuditLogger.log(
                user_id=uid,
                action="delete_drive_file",
                resource_type="google_drive",
                resource_id=file_id,
                success=False,
                error_message="Drive not connected",
                metadata={}
            )
            return {"status": 0, "message": "Drive not connected"}, 401

        try:
            service.files().delete(fileId=file_id).execute()

            # Audit log for successful deletion
            AuditLogger.log(
                user_id=uid,
                action="delete_drive_file",
                resource_type="google_drive",
                resource_id=file_id,
                success=True,
                metadata={}
            )

            return {"status": 1, "message": "File deleted"}, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="delete_drive_file",
                resource_type="google_drive",
                resource_id=file_id,
                success=False,
                error_message="Delete failed",
                metadata={"error":{str(e)}}
            )
            return {"status": 0, "message": f"Delete failed: {str(e)}"}, 500



class UploadDocumentRecordFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        target_user_id = request.form.get("userId", uid)

        try:
            if "file" not in request.files:
                AuditLogger.log(
                    user_id=uid,
                    action="upload_drive_file",
                    resource_type="google_drive",
                    resource_id=None,
                    success=False,
                    error_message="No file provided",
                    metadata={"target_user_id": target_user_id}
                )
                return {"status": 0, "message": "No file provided"}, 400

            file = request.files["file"]

            account = DBHelper.find_one(
                table_name="connected_accounts",
                filters={"user_id": target_user_id, "provider": "google", "is_active": 1},
                select_fields=["access_token", "refresh_token", "user_id"]
            )
            if not account:
                AuditLogger.log(
                    user_id=uid,
                    action="upload_drive_file",
                    resource_type="google_drive",
                    resource_id=None,
                    success=False,
                    error_message="Google Drive not connected",
                    metadata={"target_user_id": target_user_id}
                )
                return {"status": 0, "message": "Google Drive not connected for this member"}, 401

            creds = Credentials(
                token=account["access_token"],
                refresh_token=account["refresh_token"],
                token_uri="https://oauth2.googleapis.com/token",
                client_id=CLIENT_ID,
                client_secret=CLIENT_SECRET,
                scopes=SCOPE.split(),
            )

            if not creds.valid or creds.expired:
                if creds.refresh_token:
                    creds.refresh(Request())
                    DBHelper.update(
                        "connected_accounts",
                        filters={"user_id": target_user_id, "provider": "google"},
                        data={"access_token": creds.token, "token_expiry": creds.expiry},
                    )
                else:
                    AuditLogger.log(
                        user_id=uid,
                        action="upload_drive_file",
                        resource_type="google_drive",
                        resource_id=None,
                        success=False,
                        error_message="No valid Google Drive credentials",
                        metadata={"target_user_id": target_user_id}
                    )
                    return {"status": 0, "message": "No valid Google Drive credentials"}, 401

            service = build("drive", "v3", credentials=creds, cache_discovery=False)

            # Folder structure
            root_id = get_or_create_subfolder(service, "DOCKLY", "root")
            family_id = get_or_create_subfolder(service, "Family", root_id)
            documents_id = get_or_create_subfolder(service, "Documents and Records", family_id)

            file_metadata = {
                "name": secure_filename(file.filename),
                "parents": [documents_id],
            }
            media = MediaIoBaseUpload(
                io.BytesIO(file.read()),
                mimetype=file.content_type or "application/octet-stream",
                resumable=True,
            )
            uploaded_file = service.files().create(
                body=file_metadata,
                media_body=media,
                fields="id, name, mimeType, size, modifiedTime, webViewLink",
            ).execute()

            # Audit log for success
            AuditLogger.log(
                user_id=uid,
                action="upload_drive_file",
                resource_type="google_drive",
                resource_id=uploaded_file.get("id"),
                success=True,
                metadata={"target_user_id": target_user_id, "file_name": file.filename}
            )

            return {
                "status": 1,
                "message": "File uploaded successfully",
                "payload": {"file": uploaded_file},
            }, 200

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="upload_drive_file",
                resource_type="google_drive",
                resource_id=None,
                success=False,
                error_message="Upload failed",
                metadata={"target_user_id": target_user_id, "error": str(e)}
            )
            return {"status": 0, "message": f"Upload failed: {str(e)}"}, 500


class GetDocumentRecordsFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            # Get target user id (default = current user)
            target_user_id = request.args.get("userId", uid)

            # Find target user’s Google account
            account = DBHelper.find_one(
                table_name="connected_accounts",
                filters={"user_id": target_user_id, "provider": "google", "is_active": 1},
                select_fields=["access_token", "refresh_token", "user_id"]
            )
            if not account:
                return {"status": 0, "message": "Google Drive not connected for this member"}, 401

            creds = Credentials(
                token=account["access_token"],
                refresh_token=account["refresh_token"],
                token_uri="https://oauth2.googleapis.com/token",
                client_id=CLIENT_ID,
                client_secret=CLIENT_SECRET,
                scopes=SCOPE.split(),
            )
            if not creds.valid or creds.expired:
                if creds.refresh_token:
                    creds.refresh(Request())
                    DBHelper.update(
                        "connected_accounts",
                        filters={"user_id": target_user_id, "provider": "google"},
                        data={"access_token": creds.token, "token_expiry": creds.expiry},
                    )
                else:
                    return {"status": 0, "message": "No valid Google Drive credentials"}, 401

            service = build("drive", "v3", credentials=creds, cache_discovery=False)

            # Navigate: DOCKLY → Family → Documents and Records
            root_id = get_or_create_subfolder(service, "DOCKLY", "root")
            family_id = get_or_create_subfolder(service, "Family", root_id)
            documents_id = get_or_create_subfolder(service, "Documents and Records", family_id)

            query = f"'{documents_id}' in parents and trashed = false"
            results = service.files().list(
                q=query,
                fields="files(id, name, mimeType, size, modifiedTime, webViewLink, size)",
                spaces="drive",
            ).execute()

            return {
                "status": 1,
                "message": "Files fetched successfully",
                "payload": {"files": results.get("files", [])},
            }
        except Exception as e:
            traceback.print_exc()
            return {"status": 0, "message": f"Failed to fetch files: {str(e)}"}, 500


class UploadMedicalRecordFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        target_uid = request.args.get("userId") or uid

        try:
            if "file" not in request.files:
                AuditLogger.log(
                    user_id=uid,
                    action="upload_medical_record",
                    resource_type="google_drive",
                    resource_id=None,
                    success=False,
                    error_message="No file provided",
                    metadata={"target_user_id": target_uid}
                )
                return {"status": 0, "message": "No file provided"}, 400

            file = request.files["file"]

            service = self.get_drive_service(target_uid)
            if not service:
                AuditLogger.log(
                    user_id=uid,
                    action="upload_medical_record",
                    resource_type="google_drive",
                    resource_id=None,
                    success=False,
                    error_message="Google Drive not connected",
                    metadata={"target_user_id": target_uid}
                )
                return {"status": 0, "message": "Google Drive not connected"}, 401

            root_id = get_or_create_subfolder(service, "DOCKLY", "root")
            family_id = get_or_create_subfolder(service, "Family", root_id)
            medical_id = get_or_create_subfolder(service, "Medical Records", family_id)

            file_metadata = {"name": secure_filename(file.filename), "parents": [medical_id]}
            media = MediaIoBaseUpload(
                io.BytesIO(file.read()),
                mimetype=file.content_type or "application/octet-stream",
                resumable=True
            )

            uploaded_file = service.files().create(
                body=file_metadata,
                media_body=media,
                fields="id, name, mimeType, size, modifiedTime, webViewLink",
            ).execute()

            AuditLogger.log(
                user_id=uid,
                action="upload_medical_record",
                resource_type="google_drive",
                resource_id=uploaded_file.get("id"),
                success=True,
                metadata={"target_user_id": target_uid, "file_name": file.filename}
            )

            return {
                "status": 1,
                "message": "Medical file uploaded successfully",
                "payload": {"file": uploaded_file}
            }, 200

        except Exception as e:
            traceback.print_exc()
            AuditLogger.log(
                user_id=uid,
                action="upload_medical_record",
                resource_type="google_drive",
                resource_id=None,
                success=False,
                error_message=str(e),
                metadata={"target_user_id": target_uid}
            )
            return {"status": 0, "message": f"Upload failed: {str(e)}"}, 500


class GetMedicalRecordFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            target_uid = request.args.get("userId") or uid  # ✅ pick family member if provided

            service = self.get_drive_service(target_uid)  # ✅ use target_uid
            if not service:
                return {"status": 0, "message": "Google Drive not connected"}, 401

            root_id = get_or_create_subfolder(service, "DOCKLY", "root")
            family_id = get_or_create_subfolder(service, "Family", root_id)
            medical_id = get_or_create_subfolder(service, "Medical Records", family_id)

            query = f"'{medical_id}' in parents and trashed = false"
            results = service.files().list(
                q=query,
                fields="files(id, name, mimeType, size, modifiedTime, webViewLink)",
                spaces="drive",
            ).execute()

            return {"status": 1, "message": "Medical files fetched successfully", "payload": {"files": results.get("files", [])}}

        except Exception as e:
            traceback.print_exc()
            return {"status": 0, "message": f"Failed to fetch files: {str(e)}"}, 500


class AddBeneficiary(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                AuditLogger.log(
                    user_id=uid,
                    action="add_beneficiary",
                    resource_type="beneficiaries",
                    resource_id=None,
                    success=False,
                    error_message="No input data provided"
                )
                return {"status": 0, "message": "No input data provided"}, 400

            beneficiary = inputData.get("beneficiary", {})
            required_fields = ["userId", "account", "primary_beneficiary", "addedBy"]
            missing = [f for f in required_fields if f not in beneficiary]
            if missing:
                AuditLogger.log(
                    user_id=uid,
                    action="add_beneficiary",
                    resource_type="beneficiaries",
                    resource_id=None,
                    success=False,
                    error_message=f"Missing fields: {', '.join(missing)}"
                )
                return {
                    "status": 0,
                    "message": f"Missing fields: {', '.join(missing)}",
                }, 400

            now = datetime.now().isoformat()

            beneficiary_id = DBHelper.insert(
                table_name="beneficiaries",
                return_column="id",
                user_id=uid,
                account=beneficiary["account"],
                primary_beneficiary=beneficiary["primary_beneficiary"],
                secondary_beneficiary=beneficiary.get("secondary_beneficiary", ""),
                created_at=now,
                updated_at=now,
            )

            AuditLogger.log(
                user_id=uid,
                action="add_beneficiary",
                resource_type="beneficiaries",
                resource_id=beneficiary_id,
                success=True,
                metadata={
                    "account": beneficiary["account"],
                    "primary_beneficiary": beneficiary["primary_beneficiary"]
                }
            )

            return {
                "status": 1,
                "message": "Beneficiary added",
                "payload": {"id": beneficiary_id},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="add_beneficiary",
                resource_type="beneficiaries",
                resource_id=None,
                success=False,
                error_message=str(e)
            )
            return {"status": 0, "message": f"Failed to add beneficiary: {str(e)}"}, 500


class GetBeneficiaries(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            user_id = request.args.get("userId")
            if not user_id:
                return {"status": 0, "message": "User ID is required"}, 400

            beneficiaries = DBHelper.find_all(
                table_name="beneficiaries",
                filters={"user_id": user_id},
            )

            for b in beneficiaries:
                updated_at = b.pop("updated_at", None)
                created_at = b.pop("created_at", None)

                b["updated"] = updated_at.strftime("%Y-%m-%d") if updated_at else ""
                b["created"] = created_at.strftime("%Y-%m-%d") if created_at else ""

            return {"status": 1, "payload": beneficiaries}, 200

        except Exception as e:
            return {
                "status": 0,
                "message": f"Failed to fetch beneficiaries: {str(e)}",
            }, 500


class UpdateBeneficiary(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        try:
            inputData = request.get_json(silent=True)
            beneficiary = inputData.get("beneficiary", {})

            required_fields = [
                "id",
                "userId",
                "account",
                "primary_beneficiary",
                "addedBy",
            ]
            missing = [f for f in required_fields if f not in beneficiary]
            if missing:
                AuditLogger.log(
                    user_id=uid,
                    action="update_beneficiary",
                    resource_type="beneficiaries",
                    resource_id=beneficiary.get("id"),
                    success=False,
                    error_message=f"Missing fields: {', '.join(missing)}"
                )
                return {
                    "status": 0,
                    "message": f"Missing fields: {', '.join(missing)}",
                }, 400

            record = DBHelper.find_one(
                "beneficiaries",
                {"id": beneficiary["id"], "user_id": beneficiary["userId"]},
            )
            if not record:
                AuditLogger.log(
                    user_id=uid,
                    action="update_beneficiary",
                    resource_type="beneficiaries",
                    resource_id=beneficiary.get("id"),
                    success=False,
                    error_message="Beneficiary not found"
                )
                return {"status": 0, "message": "Beneficiary not found"}, 404

            now = datetime.now().isoformat()

            DBHelper.update_one(
                table_name="beneficiaries",
                filters={"id": beneficiary["id"]},
                updates={
                    "account": beneficiary["account"],
                    "primary_beneficiary": beneficiary["primary_beneficiary"],
                    "secondary_beneficiary": beneficiary.get("secondary_beneficiary", ""),
                    "updated": beneficiary.get("updated", ""),
                    "updated_at": now,
                },
            )

            AuditLogger.log(
                user_id=uid,
                action="update_beneficiary",
                resource_type="beneficiaries",
                resource_id=beneficiary["id"],
                success=True,
                metadata={
                    "account": beneficiary["account"],
                    "primary_beneficiary": beneficiary["primary_beneficiary"],
                }
            )

            return {"status": 1, "message": "Beneficiary updated"}, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="update_beneficiary",
                resource_type="beneficiaries",
                resource_id=beneficiary.get("id"),
                success=False,
                error_message=str(e)
            )
            return {
                "status": 0,
                "message": f"Failed to update beneficiary: {str(e)}",
            }, 500



class AddDevice(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(silent=True)
            if not data:
                AuditLogger.log(
                    user_id=uid,
                    action="add_device",
                    resource_type="user_devices",
                    success=False,
                    error_message="No input data provided"
                )
                return {"status": 0, "message": "No input data provided"}, 400

            device = data.get("device", {})
            if not device:
                AuditLogger.log(
                    user_id=uid,
                    action="add_device",
                    resource_type="user_devices",
                    success=False,
                    error_message="No device data provided"
                )
                return {"status": 0, "message": "No device data provided"}, 400

            required_fields = ["deviceName", "deviceModel", "userId", "addedBy", "passcode"]
            missing = [field for field in required_fields if field not in device]
            if missing:
                AuditLogger.log(
                    user_id=uid,
                    action="add_device",
                    resource_type="user_devices",
                    success=False,
                    error_message=f"Missing fields: {', '.join(missing)}"
                )
                return {
                    "status": 0,
                    "message": f"Missing fields: {', '.join(missing)}",
                }, 400

            now = datetime.now().isoformat()

            device_id = DBHelper.insert(
                table_name="user_devices",
                return_column="id",
                user_id=uid,
                family_member_user_id=device["userId"],
                device_name=device["deviceName"],
                device_model=device["deviceModel"],
                passcode=device["passcode"],
                added_by=device["addedBy"],
                added_time=now,
                edited_by=device.get("editedBy", device["addedBy"]),
                updated_at=now,
            )

            AuditLogger.log(
                user_id=uid,
                action="add_device",
                resource_type="user_devices",
                resource_id=device_id,
                success=True,
                metadata={
                    "device_name": device["deviceName"],
                    "device_model": device["deviceModel"],
                }
            )

            return {
                "status": 1,
                "message": "Device added successfully",
                "payload": {"id": device_id},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="add_device",
                resource_type="user_devices",
                success=False,
                error_message=str(e)
            )
            return {"status": 0, "message": f"Failed to add device: {str(e)}"}, 500


class GetDevices(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            user_id = request.args.get("userId")
            if not user_id:
                return {"status": 0, "message": "Missing userId"}, 400

            results = DBHelper.find_all(
                table_name="user_devices",
                filters={"family_member_user_id": user_id}
            )

            for device in results:
                for key in device:
                    if isinstance(device[key], datetime):
                        device[key] = device[key].isoformat()

            return {
                "status": 1,
                "message": "Devices fetched successfully",
                "payload": results,
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch devices: {str(e)}"}, 500


class UpdateDevice(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        try:
            data = request.get_json(silent=True)
            if not data:
                AuditLogger.log(
                    user_id=uid,
                    action="update_device",
                    resource_type="user_devices",
                    success=False,
                    error_message="No input data provided"
                )
                return {"status": 0, "message": "No input data provided"}, 400

            device = data.get("device", {})
            if not device or "id" not in device:
                AuditLogger.log(
                    user_id=uid,
                    action="update_device",
                    resource_type="user_devices",
                    success=False,
                    error_message="Missing device ID or data"
                )
                return {"status": 0, "message": "Missing device ID or data"}, 400

            update_fields = {
                "device_name": device.get("deviceName"),
                "device_model": device.get("deviceModel"),
                "passcode": device.get("passcode"),
                "edited_by": device.get("editedBy", uid),
                "updated_at": datetime.now().isoformat(),
            }
            update_fields = {k: v for k, v in update_fields.items() if v is not None}

            DBHelper.update_one(
                table_name="user_devices",
                filters={"id": device["id"]},
                updates=update_fields,
            )

            AuditLogger.log(
                user_id=uid,
                action="update_device",
                resource_type="user_devices",
                resource_id=device["id"],
                success=True,
                metadata={k: update_fields[k] for k in ["device_name", "device_model"] if k in update_fields}
            )

            return {"status": 1, "message": "Device updated successfully"}, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="update_device",
                resource_type="user_devices",
                resource_id=device.get("id") if device else None,
                success=False,
                error_message=str(e)
            )
            return {"status": 0, "message": f"Failed to update device: {str(e)}"}, 500


class TagEmailSender:
    def __init__(self):
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.smtp_user = EMAIL_SENDER
        self.smtp_password = EMAIL_PASSWORD

    def send_project_email(self, recipient_email, project):
        msg = EmailMessage()
        msg["Subject"] = f"Shared Project: {project['title']}"
        msg["From"] = self.smtp_user
        msg["To"] = recipient_email

        created = project.get("created_at", "")
        description = project.get("description", "")
        deadline = project.get("deadline", "")
        status = project.get("status", "")

        msg.set_content(
            f"""
Hi there!

I wanted to tag this Project with you:

Title: {project['title']}
Description: {description}
Deadline: {deadline}
Status: {status}

Best regards!
""".strip()
        )

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            return True, "Email sent successfully"
        except Exception as e:
            return False, str(e)


class ShareProject(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(force=True)
        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="share_project",
                resource_type="projects",
                success=False,
                error_message=f"Invalid JSON: {str(e)}"
            )
            return {"status": 0, "message": f"Invalid JSON: {str(e)}"}, 400

        emails = data.get("email")
        project = data.get("project")
        tagged_members = data.get("tagged_members", [])

        if not emails or not project:
            AuditLogger.log(
                user_id=uid,
                action="share_project",
                resource_type="projects",
                success=False,
                error_message="Both 'email' and 'project' are required."
            )
            return {
                "status": 0,
                "message": "Both 'email' and 'project' are required.",
            }, 422

        if isinstance(emails, str):
            emails = [emails]

        email_sender = TagEmailSender()
        failures = []
        notifications_created = []
        resolved_tagged_ids = []

        # Resolve UIDs for tagged members
        for member_email in tagged_members:
            family_member = DBHelper.find_one(
                "family_members",
                filters={"email": member_email},
                select_fields=["fm_user_id"],
            )
            if family_member and family_member["fm_user_id"]:
                resolved_tagged_ids.append(family_member["fm_user_id"])

        # Send emails
        for email in emails:
            success, message = email_sender.send_project_email(email, project)
            AuditLogger.log(
                user_id=uid,
                action="share_project_email",
                resource_type="projects",
                resource_id=project.get("id"),
                success=success,
                metadata={"email": email, "project_title": project.get("title")},
                error_message=None if success else message
            )
            if not success:
                failures.append((email, message))

        # Send notifications
        for member_email in tagged_members:
            family_member = DBHelper.find_one(
                "family_members",
                filters={"email": member_email},
                select_fields=["id", "name", "email", "fm_user_id"],
            )

            if not family_member:
                continue

            receiver_uid = family_member.get("fm_user_id")
            if not receiver_uid:
                user_record = DBHelper.find_one(
                    "users",
                    filters={"email": family_member["email"]},
                    select_fields=["uid"],
                )
                receiver_uid = user_record.get("uid") if user_record else None

            if not receiver_uid:
                continue

            notification_data = {
                "sender_id": uid,
                "receiver_id": receiver_uid,
                "message": f"{user['user_name']} tagged a project '{project.get('title', 'Untitled')}' with you",
                "task_type": "tagged",
                "action_required": False,
                "status": "unread",
                "hub": None,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "metadata": {
                    "project": project,
                    "sender_name": user["user_name"],
                    "tagged_member": {
                        "name": family_member["name"],
                        "email": family_member["email"],
                    },
                },
            }

            notif_id = DBHelper.insert(
                "notifications", return_column="id", **notification_data
            )
            notifications_created.append(notif_id)

            AuditLogger.log(
                user_id=uid,
                action="share_project_notification",
                resource_type="notifications",
                resource_id=notif_id,
                success=True,
                metadata={"receiver_uid": receiver_uid, "project_id": project.get("id")}
            )

        # Update tagged_ids in the project
        if resolved_tagged_ids:
            project_record = DBHelper.find_one(
                "projects", filters={"id": project.get("id")}
            )
            if not project_record:
                AuditLogger.log(
                    user_id=uid,
                    action="update_project_tagged_ids",
                    resource_type="projects",
                    resource_id=project.get("id"),
                    success=False,
                    error_message="Project not found"
                )
                return {
                    "status": 0,
                    "message": "Project not found. Cannot tag members.",
                }, 404

            existing_ids = project_record.get("tagged_ids") or []
            combined_ids = list(set(existing_ids + resolved_tagged_ids))
            pg_array_str = "{" + ",".join(f'"{str(i)}"' for i in combined_ids) + "}"

            DBHelper.update_one(
                table_name="projects",
                filters={"id": project.get("id")},
                updates={"tagged_ids": pg_array_str},
            )

            AuditLogger.log(
                user_id=uid,
                action="update_project_tagged_ids",
                resource_type="projects",
                resource_id=project.get("id"),
                success=True,
                metadata={"tagged_ids": combined_ids}
            )

        if failures:
            return {
                "status": 0,
                "message": f"Failed to send to {len(failures)} recipients",
                "errors": failures,
            }, 500

        return {
            "status": 1,
            "message": f"Project shared via email. {len(notifications_created)} notification(s) created.",
            "payload": {"notifications_created": notifications_created},
        }


class AddFamilyMemberWithoutInvite(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            inputData = request.get_json(silent=True)
            if not inputData:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_FAMILY_MEMBER_WITHOUT_INVITE",
                    resource_type="family_member",
                    resource_id="N/A",
                    success=False,
                    error_message="No input data provided",
                    metadata={},
                )
                return {"status": 0, "message": "No input data provided"}, 400

            if user["role"] != DocklyUsers.PaidMember.value:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_FAMILY_MEMBER_WITHOUT_INVITE",
                    resource_type="family_member",
                    resource_id="N/A",
                    success=False,
                    error_message="Only paid members can add family members",
                    metadata=inputData,
                )
                return {
                    "status": 0,
                    "message": "Only paid members can add family members.",
                    "payload": {},
                }, 403

            # Generate UID for the new user
            new_uid = uniqueId(digit=5, isNum=True, prefix="USERX")

            # Step 1: Insert into users table
            DBHelper.insert(
                "users",
                return_column="uid",
                uid=new_uid,
                user_name=inputData.get("name", ""),
                email=None,
                email_verified=0,
                is_active=1,
                role=0,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )

            # Step 2: Get or create family_group_id for current user
            gid_record = DBHelper.find_one(
                "family_members",
                filters={"user_id": uid},
                select_fields=["family_group_id"],
            )
            gid = gid_record.get("family_group_id") if gid_record else uniqueId(digit=5, isNum=True, prefix="G")

            # Step 3: Prepare shared items
            sharedKeys = list(inputData.get("sharedItems", {}).keys())
            sharedItems = [
                DBHelper.find_one("boards", filters={"board_name": key}, select_fields=["id"])
                for key in sharedKeys
            ]
            sharedItemsIds = [item["id"] for item in sharedItems if item]

            # Step 4: Assign colors
            color_for_existing_user = assign_family_member_color(gid, new_uid, uid)
            color_for_new_user = assign_family_member_color(gid, uid, new_uid)

            # Step 5: Insert into family_members for current user (view of new member)
            fid1 = DBHelper.insert(
                "family_members",
                return_column="id",
                name=inputData.get("name", ""),
                relationship=inputData.get("relationship", ""),
                user_id=uid,
                fm_user_id=new_uid,
                email=inputData.get("email", None),
                access_code=inputData.get("accessCode", ""),
                family_group_id=gid,
                method="Direct",
                shared_items=",".join(sharedKeys),
                permissions="",
                invited_by=uid,
                color=color_for_existing_user,
                created_at=datetime.utcnow(),
            )

            # Step 6: Insert into family_members for the new user (view of current user)
            fid2 = DBHelper.insert(
                "family_members",
                return_column="id",
                name=user.get("user_name", ""),
                relationship=inputData.get("relationship", ""),
                user_id=new_uid,
                fm_user_id=uid,
                email=None,
                access_code=inputData.get("accessCode", ""),
                family_group_id=gid,
                method="Direct",
                shared_items=",".join(sharedKeys),
                permissions="",
                invited_by=uid,
                color=color_for_new_user,
                created_at=datetime.utcnow(),
            )

            # Step 7: Insert shared items mapping
            for hub_id in sharedItemsIds:
                DBHelper.insert(
                    "family_hubs_access_mapping",
                    return_column="id",
                    user_id=uid,
                    family_member_id=fid1,
                    hubs=hub_id,
                    permissions=Permissions.Read.value,
                )

            # Audit log success
            AuditLogger.log(
                user_id=uid,
                action="ADD_FAMILY_MEMBER_WITHOUT_INVITE",
                resource_type="family_member",
                resource_id=str(fid1),
                success=True,
                metadata={"new_user_uid": new_uid, "fid2": fid2, "shared_items": sharedKeys},
            )

            return {
                "status": 1,
                "message": "Family member added successfully without invite",
                "payload": {"id": fid1, "new_user_uid": new_uid},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_FAMILY_MEMBER_WITHOUT_INVITE",
                resource_type="family_member",
                resource_id="N/A",
                success=False,
                error_message=str(e),
                metadata=inputData if "inputData" in locals() else {},
            )
            return {"status": 0, "message": f"Failed to add family member: {str(e)}"}, 500

class AddSchool(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(silent=True)
            if not data:
                AuditLogger.log(
                    user_id=uid,
                    action="add_school",
                    resource_type="school",
                    resource_id="N/A",
                    success=False,
                    error_message="No input data provided",
                    metadata={},
                )
                return {"status": 0, "message": "No input data provided"}, 400

            school = data.get("school", {})
            if not school.get("name"):
                AuditLogger.log(
                    user_id=uid,
                    action="add_school",
                    resource_type="school",
                    resource_id="N/A",
                    success=False,
                    error_message="School name is required",
                    metadata=data,
                )
                return {"status": 0, "message": "School name is required"}, 400

            current_time = datetime.now().isoformat()

            school_id = DBHelper.insert(
                "schools",
                return_column="id",
                user_id=uid,
                name=school.get("name", ""),
                grade_level=school.get("gradeLevel", ""),
                student_id=school.get("studentId", ""),
                custom_fields=json.dumps(school.get("customFields", [])),
                links=json.dumps(school.get("links", [])),
                created_at=current_time,
                updated_at=current_time,
            )

            AuditLogger.log(
                user_id=uid,
                action="add_school",
                resource_type="school",
                resource_id=str(school_id),
                success=True,
                metadata={"name": school.get("name", "")},
            )

            return {
                "status": 1,
                "message": "School added successfully",
                "payload": {"id": school_id},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="add_school",
                resource_type="school",
                resource_id="N/A",
                success=False,
                error_message=str(e),
                metadata=data if "data" in locals() else {},
            )
            return {"status": 0, "message": f"Failed to add school: {str(e)}"}, 500

class GetSchools(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            schools = DBHelper.find_all(
                table_name="schools",
                select_fields=["id", "name", "grade_level", "student_id", "custom_fields", "links", "created_at", "updated_at"],
                filters={"user_id": uid, "is_active": 1}
            )

            school_list = []
            for school in schools:
                custom_fields = school.get("custom_fields", [])
                if isinstance(custom_fields, str):
                    custom_fields = json.loads(custom_fields)
                
                links = school.get("links", [])
                if isinstance(links, str):
                    links = json.loads(links)

                school_list.append({
                    "id": school["id"],
                    "name": school["name"],
                    "gradeLevel": school.get("grade_level", ""),
                    "studentId": school.get("student_id", ""),
                    "customFields": custom_fields,
                    "links": links,
                    "createdAt": school["created_at"].isoformat() if school["created_at"] else "",
                    "updatedAt": school["updated_at"].isoformat() if school["updated_at"] else ""
                })

            return {
                "status": 1,
                "message": "Schools fetched successfully",
                "payload": {"schools": school_list}
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch schools: {str(e)}"}, 500

class UpdateSchool(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        try:
            data = request.get_json(silent=True)
            if not data:
                AuditLogger.log(
                    user_id=uid,
                    action="update_school",
                    resource_type="school",
                    resource_id="N/A",
                    success=False,
                    error_message="No input data provided",
                    metadata={},
                )
                return {"status": 0, "message": "No input data provided"}, 400

            school = data.get("school", {})
            school_id = school.get("id")
            
            if not school_id:
                AuditLogger.log(
                    user_id=uid,
                    action="update_school",
                    resource_type="school",
                    resource_id="N/A",
                    success=False,
                    error_message="School ID is required",
                    metadata=data,
                )
                return {"status": 0, "message": "School ID is required"}, 400

            current_time = datetime.now().isoformat()
            
            DBHelper.update_one(
                table_name="schools",
                filters={"id": school_id, "user_id": uid},
                updates={
                    "name": school.get("name", ""),
                    "grade_level": school.get("gradeLevel", ""),
                    "student_id": school.get("studentId", ""),
                    "custom_fields": json.dumps(school.get("customFields", [])),
                    "links": json.dumps(school.get("links", [])),
                    "updated_at": current_time
                }
            )

            AuditLogger.log(
                user_id=uid,
                action="update_school",
                resource_type="school",
                resource_id=str(school_id),
                success=True,
                metadata={"name": school.get("name", "")},
            )

            return {
                "status": 1,
                "message": "School updated successfully",
                "payload": {"id": school_id}
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="update_school",
                resource_type="school",
                resource_id=school.get("id") if "school" in locals() else "N/A",
                success=False,
                error_message=str(e),
                metadata=data if "data" in locals() else {},
            )
            return {"status": 0, "message": f"Failed to update school: {str(e)}"}, 500


class DeleteSchool(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        try:
            school_id = request.args.get("id")
            if not school_id:
                AuditLogger.log(
                    user_id=uid,
                    action="delete_school",
                    resource_type="school",
                    resource_id="N/A",
                    success=False,
                    error_message="School ID is required",
                    metadata={},
                )
                return {"status": 0, "message": "School ID is required"}, 400

            DBHelper.update_one(
                table_name="schools",
                filters={"id": school_id, "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.now().isoformat()}
            )

            AuditLogger.log(
                user_id=uid,
                action="delete_school",
                resource_type="school",
                resource_id=school_id,
                success=True,
                metadata={},
            )

            return {"status": 1, "message": "School deleted successfully"}, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="delete_school",
                resource_type="school",
                resource_id=school_id if "school_id" in locals() else "N/A",
                success=False,
                error_message=str(e),
                metadata={},
            )
            return {"status": 0, "message": f"Failed to delete school: {str(e)}"}, 500

class AddActivity(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(silent=True)
            if not data:
                AuditLogger.log(
                    user_id=uid,
                    action="add_activity",
                    resource_type="activity",
                    resource_id="N/A",
                    success=False,
                    error_message="No input data provided",
                    metadata={},
                )
                return {"status": 0, "message": "No input data provided"}, 400

            activity = data.get("activity", {})
            if not activity.get("name"):
                AuditLogger.log(
                    user_id=uid,
                    action="add_activity",
                    resource_type="activity",
                    resource_id="N/A",
                    success=False,
                    error_message="Activity name is required",
                    metadata=data,
                )
                return {"status": 0, "message": "Activity name is required"}, 400

            current_time = datetime.now().isoformat()
            
            activity_id = DBHelper.insert(
                "activities",
                return_column="id",
                user_id=uid,
                name=activity.get("name", ""),
                schedule=activity.get("schedule", ""),
                custom_fields=json.dumps(activity.get("customFields", [])),
                links=json.dumps(activity.get("links", [])),
                created_at=current_time,
                updated_at=current_time
            )

            AuditLogger.log(
                user_id=uid,
                action="add_activity",
                resource_type="activity",
                resource_id=str(activity_id),
                success=True,
                metadata={"name": activity.get("name", "")},
            )

            return {
                "status": 1,
                "message": "Activity added successfully",
                "payload": {"id": activity_id}
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="add_activity",
                resource_type="activity",
                resource_id="N/A",
                success=False,
                error_message=str(e),
                metadata=data if "data" in locals() else {},
            )
            return {"status": 0, "message": f"Failed to add activity: {str(e)}"}, 500

class GetActivities(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            activities = DBHelper.find_all(
                table_name="activities",
                select_fields=["id", "name", "schedule", "custom_fields", "links", "created_at", "updated_at"],
                filters={"user_id": uid, "is_active": 1}
            )

            activity_list = []
            for activity in activities:
                custom_fields = activity.get("custom_fields", [])
                if isinstance(custom_fields, str):
                    custom_fields = json.loads(custom_fields)
                
                links = activity.get("links", [])
                if isinstance(links, str):
                    links = json.loads(links)

                activity_list.append({
                    "id": activity["id"],
                    "name": activity["name"],
                    "schedule": activity.get("schedule", ""),
                    "customFields": custom_fields,
                    "links": links,
                    "createdAt": activity["created_at"].isoformat() if activity["created_at"] else "",
                    "updatedAt": activity["updated_at"].isoformat() if activity["updated_at"] else ""
                })

            return {
                "status": 1,
                "message": "Activities fetched successfully",
                "payload": {"activities": activity_list}
            }, 200

        except Exception as e:
            return {"status": 0, "message": f"Failed to fetch activities: {str(e)}"}, 500

class UpdateActivity(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        try:
            data = request.get_json(silent=True)
            if not data:
                AuditLogger.log(
                    user_id=uid,
                    action="update_activity",
                    resource_type="activity",
                    resource_id="N/A",
                    success=False,
                    error_message="No input data provided",
                    metadata={},
                )
                return {"status": 0, "message": "No input data provided"}, 400

            activity = data.get("activity", {})
            activity_id = activity.get("id")
            
            if not activity_id:
                AuditLogger.log(
                    user_id=uid,
                    action="update_activity",
                    resource_type="activity",
                    resource_id="N/A",
                    success=False,
                    error_message="Activity ID is required",
                    metadata=data,
                )
                return {"status": 0, "message": "Activity ID is required"}, 400

            current_time = datetime.now().isoformat()
            
            DBHelper.update_one(
                table_name="activities",
                filters={"id": activity_id, "user_id": uid},
                updates={
                    "name": activity.get("name", ""),
                    "schedule": activity.get("schedule", ""),
                    "custom_fields": json.dumps(activity.get("customFields", [])),
                    "links": json.dumps(activity.get("links", [])),
                    "updated_at": current_time
                }
            )

            AuditLogger.log(
                user_id=uid,
                action="update_activity",
                resource_type="activity",
                resource_id=str(activity_id),
                success=True,
                metadata={"name": activity.get("name", "")},
            )

            return {
                "status": 1,
                "message": "Activity updated successfully",
                "payload": {"id": activity_id}
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="update_activity",
                resource_type="activity",
                resource_id=activity.get("id") if "activity" in locals() else "N/A",
                success=False,
                error_message=str(e),
                metadata=data if "data" in locals() else {},
            )
            return {"status": 0, "message": f"Failed to update activity: {str(e)}"}, 500


class DeleteActivity(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        try:
            activity_id = request.args.get("id")
            if not activity_id:
                AuditLogger.log(
                    user_id=uid,
                    action="delete_activity",
                    resource_type="activity",
                    resource_id="N/A",
                    success=False,
                    error_message="Activity ID is required",
                    metadata={},
                )
                return {"status": 0, "message": "Activity ID is required"}, 400

            DBHelper.update_one(
                table_name="activities",
                filters={"id": activity_id, "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.now().isoformat()}
            )

            AuditLogger.log(
                user_id=uid,
                action="delete_activity",
                resource_type="activity",
                resource_id=str(activity_id),
                success=True,
                metadata={},
            )

            return {"status": 1, "message": "Activity deleted successfully"}, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="delete_activity",
                resource_type="activity",
                resource_id=activity_id if "activity_id" in locals() else "N/A",
                success=False,
                error_message=str(e),
                metadata={},
            )
            return {"status": 0, "message": f"Failed to delete activity: {str(e)}"}, 500
