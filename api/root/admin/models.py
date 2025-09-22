from flask import url_for, request
from flask_restful import Resource
from root.db.db import get_postgres_instance
from root.common import DocklyUsers, Status
from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required
from werkzeug.security import generate_password_hash
import uuid
from datetime import datetime, timedelta


class GetAllUsers(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        user_type = request.args.get("user_type", "app")
        db_instance = get_postgres_instance(user_type)

        conn = db_instance.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT uid, user_name, email, phone, role, is_active, created_at, last_login
                    FROM users;
                """
                )
                rows = cur.fetchall()

                # map rows to dicts
                userDetails = []
                for r in rows:
                    u = {
                        "uid": r[0],
                        "user_name": r[1],
                        "email": r[2],
                        "phone": r[3],
                        "role": r[4],
                        "is_active": r[5],
                        "created_at": r[6],
                        "last_login": r[7],
                    }

                    # format timestamps
                    if u.get("created_at"):
                        u["created_at"] = u["created_at"].isoformat()
                    if u.get("last_login"):
                        u["last_login"] = u["last_login"].isoformat()

                    # role mapping
                    try:
                        u["role_name"] = DocklyUsers(u["role"]).name
                    except ValueError:
                        u["role_name"] = "Guests"

                    # status mapping
                    try:
                        status_enum = Status(u["is_active"])
                        u["status"] = (
                            "Active" if status_enum == Status.ACTIVE else "Suspended"
                        )
                    except ValueError:
                        u["status"] = "Suspended"

                    # fake subscription
                    # u["subscription"] = (
                    #     "Free" if u["is_active"] == Status.ACTIVE.value else "Free"
                    # )
                    u["subscription"] = "Free-Trail"
                    # avatar mapping
                    avatar_map = {
                        DocklyUsers.Guests.value: "guest.png",
                        DocklyUsers.PaidMember.value: "paid_member.png",
                        DocklyUsers.SuperAdmin.value: "super_admin.png",
                        DocklyUsers.Developer.value: "developer.png",
                    }
                    avatar_file = avatar_map.get(u["role"], "guest.png")
                    u["avatar"] = url_for(
                        "static", filename=f"avatars/{avatar_file}", _external=True
                    )

                    userDetails.append(u)

            if not userDetails:
                return {
                    "status": 0,
                    "message": "User details not found",
                    "payload": [],
                }

            return {
                "status": 1,
                "message": "User details fetched successfully",
                "payload": userDetails,
            }
        finally:
            db_instance.release_connection(conn)


class GetUserStats(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        user_type = request.args.get("user_type", "app")
        db_instance = get_postgres_instance(user_type)

        conn = db_instance.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT is_active, created_at FROM users;")
                rows = cur.fetchall()

                users = [{"is_active": r[0], "created_at": r[1]} for r in rows]

            # calculate stats...
            total_users = len(users)
            active_users = sum(1 for u in users if u["is_active"] == 1)
            suspended_users = total_users - active_users
            thirty_days_ago = datetime.now() - timedelta(days=30)
            new_users = sum(
                1
                for u in users
                if u["created_at"] and u["created_at"] > thirty_days_ago
            )

            return {
                "status": 1,
                "message": "User stats fetched successfully",
                "payload": {
                    "total_users": total_users,
                    "active_users": active_users,
                    "suspended_users": suspended_users,
                    "new_users": new_users,
                },
            }
        finally:
            db_instance.release_connection(conn)


class CreateUser(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json()

        # Validate required fields
        required_fields = ["user_name", "email", "role"]
        for field in required_fields:
            if not data.get(field):
                return {"status": 0, "message": f"{field} is required", "payload": None}

        # Check if email already exists
        existing_user = DBHelper.find_all(
            "users", select_fields=["email"], filters={"email": data["email"]}
        )

        if existing_user:
            return {
                "status": 0,
                "message": "User with this email already exists",
                "payload": None,
            }

        # Create user data
        user_data = {
            "uid": str(uuid.uuid4()),
            "user_name": data["user_name"],
            "email": data["email"],
            # "password_hash": generate_password_hash(data["password"]),
            "phone": data.get("phone", ""),
            "role": int(data["role"]),
            "is_active": 1,
            "email_verified": 0,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "mfa_enabled": 0,
        }

        try:
            result = DBHelper.insert("users", return_column="uid", **user_data)
            if result:
                return {
                    "status": 1,
                    "message": "User created successfully",
                    "payload": {"uid": user_data["uid"]},
                }
            else:
                return {
                    "status": 0,
                    "message": "Failed to create user",
                    "payload": None,
                }
        except Exception as e:
            return {
                "status": 0,
                "message": f"Database error: {str(e)}",
                "payload": None,
            }


class UpdateUser(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, target_uid):
        data = request.get_json()

        # Check if user exists
        existing_user = DBHelper.find_all(
            "users", select_fields=["uid"], filters={"uid": target_uid}
        )

        if not existing_user:
            return {"status": 0, "message": "User not found", "payload": None}

        # Prepare update data
        update_data = {"updated_at": datetime.now()}

        if data.get("user_name"):
            update_data["user_name"] = data["user_name"]
        if data.get("email"):
            # Check if email is taken by another user
            email_check = DBHelper.find_all(
                "users", select_fields=["uid"], filters={"email": data["email"]}
            )
            if email_check and email_check[0]["uid"] != target_uid:
                return {
                    "status": 0,
                    "message": "Email is already taken by another user",
                    "payload": None,
                }
            update_data["email"] = data["email"]
        if data.get("phone") is not None:
            update_data["phone"] = data["phone"]
        if data.get("role") is not None:
            update_data["role"] = int(data["role"])

        try:
            result = DBHelper.update_one("users", {"uid": target_uid}, update_data)
            if result:
                return {
                    "status": 1,
                    "message": "User updated successfully",
                    "payload": None,
                }
            else:
                return {
                    "status": 0,
                    "message": "Failed to update user",
                    "payload": None,
                }
        except Exception as e:
            return {
                "status": 0,
                "message": f"Database error: {str(e)}",
                "payload": None,
            }


class SuspendUser(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, target_uid):
        # Check if user exists
        existing_user = DBHelper.find_all(
            "users", select_fields=["uid", "is_active"], filters={"uid": target_uid}
        )

        if not existing_user:
            return {"status": 0, "message": "User not found", "payload": None}

        # Don't suspend if already suspended
        if existing_user[0]["is_active"] == 0:
            return {
                "status": 0,
                "message": "User is already suspended",
                "payload": None,
            }

        # Suspend user
        update_data = {"is_active": 0, "updated_at": datetime.now()}

        try:
            result = DBHelper.update_one("users", {"uid": target_uid}, update_data)
            force_logout = DBHelper.update_one(
                "user_sessions", {"user_id": target_uid}, {"force_logout": True}
            )

            if result:
                return {
                    "status": 1,
                    "message": "User suspended successfully",
                    "payload": None,
                }
            else:
                return {
                    "status": 0,
                    "message": "Failed to suspend user",
                    "payload": None,
                }
        except Exception as e:
            return {
                "status": 0,
                "message": f"Database error: {str(e)}",
                "payload": None,
            }


# User Permissions Management Classes
class GetUserMenus(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user, userId):
        print(f"uid: {uid}")
        """Get all menus/permissions for a specific user"""
        try:
            boards = []
            hubs = []

            # Get all user permissions
            all_menus = DBHelper.find_all(
                table_name="user_permissions",
                filters={"user_id": userId},
                select_fields=["id", "target_type", "target_id"],
            )

            for perm in all_menus:
                target_type = perm.get("target_type")  # "boards" or "hubs"
                target_id = perm.get("target_id")
                permission_id = perm.get("id")

                target_data = DBHelper.find_one(
                    table_name=target_type,
                    filters={"id": target_id},
                )

                if not target_data:
                    continue

                # Attach necessary fields with permission ID for deletion
                menu_item = {
                    "permission_id": permission_id,  # For deletion purposes
                    "id": target_data.get("id"),
                    "title": target_data.get("title"),
                    "is_active": target_data.get("is_active"),
                    "display_order": target_data.get("display_order"),
                    "icon": self.get_icon_for_menu(target_type, target_data),
                    "created_at": perm.get("created_at"),
                }

                if target_type == "boards":
                    menu_item["board_name"] = target_data.get("board_name")
                    menu_item["description"] = target_data.get("description", "")
                    boards.append(menu_item)
                elif target_type == "hubs":
                    menu_item["hub_name"] = target_data.get("hub_name")
                    menu_item["description"] = target_data.get("description", "")
                    hubs.append(menu_item)

            return {
                "status": 1,
                "message": "User menus fetched successfully",
                "payload": {
                    "boards": sorted(boards, key=lambda x: x.get("display_order", 0)),
                    "hubs": sorted(hubs, key=lambda x: x.get("display_order", 0)),
                },
            }

        except Exception as e:
            return {
                "status": 0,
                "message": f"Error fetching user menus: {str(e)}",
                "payload": {"boards": [], "hubs": []},
            }

    def get_icon_for_menu(self, target_type, target_data):
        """Map menu items to appropriate icons"""
        if target_type == "boards":
            mapping = {
                "family": "TeamOutlined",
                "finance": "DollarOutlined",
                "home": "HomeOutlined",
                "health": "HeartOutlined",
                "work": "BriefcaseOutlined",
                "education": "BookOutlined",
                "travel": "CarOutlined",
                "fitness": "ThunderboltOutlined",
            }
            return mapping.get(
                target_data.get("board_name", "").lower(), "AppstoreOutlined"
            )

        if target_type == "hubs":
            mapping = {
                "noteslists": "FileTextOutlined",
                "bookmarks": "BookOutlined",
                "vault": "LockOutlined",
                "files": "FolderOpenOutlined",
                "documents": "FileOutlined",
                "media": "PictureOutlined",
                "contacts": "ContactsOutlined",
            }
            return mapping.get(
                target_data.get("hub_name", "").lower(), "AppstoreOutlined"
            )

        return "AppstoreOutlined"


class DeleteUserPermission(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user, permission_id):
        # print(f"userId: {userId}")
        """Delete a specific user permission"""
        userId = request.args.get("userId", None)
        print(f"userId: {userId}")
        try:
            # Check if permission exists
            existing_permission = DBHelper.find_one(
                table_name="user_permissions",
                filters={"target_id": permission_id, "user_id": userId},
                select_fields=["id"],
            )

            if not existing_permission:
                return {"status": 0, "message": "Permission not found", "payload": None}

            # Delete the permission
            deleted = DBHelper.delete_one(
                table_name="user_permissions", filters={"id": existing_permission["id"]}
            )
            force_logout = DBHelper.update_one(
                "user_sessions", {"user_id": userId}, {"force_logout": True}
            )

            if deleted:
                return {
                    "status": 1,
                    "message": "Permission deleted successfully",
                    "payload": {"deleted_permission_id": permission_id},
                }
            else:
                return {
                    "status": 0,
                    "message": "Failed to delete permission",
                    "payload": None,
                }

        except Exception as e:
            return {
                "status": 0,
                "message": f"Error deleting permission: {str(e)}",
                "payload": None,
            }


class AddUserPermissions(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user, userId):
        """Add multiple permissions to a user"""
        try:
            data = request.get_json()
            permissions = data.get("permissions", [])
            print(f"permissions: {permissions}")

            if not permissions:
                return {
                    "status": 0,
                    "message": "No permissions provided",
                    "payload": None,
                }

            # Verify user exists
            user_exists = DBHelper.find_one(table_name="users", filters={"uid": userId})

            if not user_exists:
                return {"status": 0, "message": "User not found", "payload": None}

            added_permissions = []
            print(f"added_permissions: {added_permissions}")
            failed_permissions = []
            print(f"failed_permissions: {failed_permissions}")

            for perm in permissions:
                target_type = perm.get("target_type")  # 'boards' or 'hubs'
                target_id = perm.get("target_id")

                if not target_type or not target_id:
                    failed_permissions.append(
                        {
                            "permission": perm,
                            "reason": "Missing target_type or target_id",
                        }
                    )
                    continue

                # Check if permission already exists
                existing = DBHelper.find_one(
                    table_name="user_permissions",
                    filters={
                        "user_id": userId,
                        "target_type": target_type,
                        "target_id": target_id,
                    },
                )

                if existing:
                    failed_permissions.append(
                        {"permission": perm, "reason": "Permission already exists"}
                    )
                    continue

                # Verify target exists
                target_exists = DBHelper.find_one(
                    table_name=target_type, filters={"id": target_id}
                )

                if not target_exists:
                    failed_permissions.append(
                        {
                            "permission": perm,
                            "reason": f"Target {target_type} with id {target_id} not found",
                        }
                    )
                    continue

                # Add permission
                try:
                    permission_data = {
                        "id": str(uuid.uuid4()),
                        "user_id": userId,
                        "target_type": target_type,
                        "target_id": target_id,
                        "assigned_at": datetime.now(),
                        "updated_at": datetime.now(),
                    }

                    created_permission = DBHelper.insert(
                        table_name="user_permissions",
                        return_column="id",
                        **permission_data,
                    )
                    print(f"created_permission: {created_permission}")

                    if created_permission:
                        added_permissions.append(
                            {
                                "permission_id": created_permission,
                                "target_type": target_type,
                                "target_id": target_id,
                                "target_name": target_exists.get("title", "Unknown"),
                            }
                        )
                    else:
                        failed_permissions.append(
                            {
                                "permission": perm,
                                "reason": "Failed to create permission in database",
                            }
                        )

                except Exception as e:
                    failed_permissions.append(
                        {"permission": perm, "reason": f"Database error: {str(e)}"}
                    )

            force_logout = DBHelper.update_one(
                "user_sessions", {"user_id": userId}, {"force_logout": True}
            )

            return {
                "status": 1 if added_permissions else 0,
                "message": f"Added {len(added_permissions)} permissions, {len(failed_permissions)} failed",
                "payload": {
                    "added_permissions": added_permissions,
                    "failed_permissions": failed_permissions,
                    "total_added": len(added_permissions),
                    "total_failed": len(failed_permissions),
                },
            }

        except Exception as e:
            return {
                "status": 0,
                "message": f"Error adding permissions: {str(e)}",
                "payload": None,
            }


class GetAllBoards(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        """Get all available boards for permission assignment"""
        try:
            boards = DBHelper.find_all(
                table_name="boards",
                select_fields=[
                    "id",
                    "title",
                    "board_name",
                    "description",
                    "is_active",
                    "display_order",
                ],
                filters={"is_active": 1},  # Only active boards
            )

            # Format boards for frontend
            formatted_boards = []
            for board in boards:
                formatted_board = {
                    "id": board.get("id"),
                    "title": board.get("title"),
                    "board_name": board.get("board_name"),
                    "description": board.get("description", ""),
                    "is_active": board.get("is_active"),
                    "display_order": board.get("display_order", 0),
                    "icon": self.get_board_icon(board.get("board_name", "")),
                    "target_type": "boards",
                }
                formatted_boards.append(formatted_board)

            # Sort by display order
            formatted_boards.sort(key=lambda x: x.get("display_order", 0))

            return {
                "status": 1,
                "message": "Boards fetched successfully",
                "payload": formatted_boards,
            }

        except Exception as e:
            return {
                "status": 0,
                "message": f"Error fetching boards: {str(e)}",
                "payload": [],
            }

    def get_board_icon(self, board_name):
        """Get appropriate icon for board"""
        mapping = {
            "family": "TeamOutlined",
            "finance": "DollarOutlined",
            "home": "HomeOutlined",
            "health": "HeartOutlined",
            "work": "BriefcaseOutlined",
            "education": "BookOutlined",
            "travel": "CarOutlined",
            "fitness": "ThunderboltOutlined",
        }
        return mapping.get(board_name.lower(), "AppstoreOutlined")


class GetAllHubs(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        """Get all available hubs for permission assignment"""
        try:
            hubs = DBHelper.find_all(
                table_name="hubs",
                select_fields=[
                    "id",
                    "title",
                    "hub_name",
                    "description",
                    "is_active",
                    "display_order",
                ],
                filters={"is_active": 1},  # Only active hubs
            )

            # Format hubs for frontend
            formatted_hubs = []
            for hub in hubs:
                formatted_hub = {
                    "id": hub.get("id"),
                    "title": hub.get("title"),
                    "hub_name": hub.get("hub_name"),
                    "description": hub.get("description", ""),
                    "is_active": hub.get("is_active"),
                    "display_order": hub.get("display_order", 0),
                    "icon": self.get_hub_icon(hub.get("hub_name", "")),
                    "target_type": "hubs",
                }
                formatted_hubs.append(formatted_hub)

            # Sort by display order
            formatted_hubs.sort(key=lambda x: x.get("display_order", 0))

            return {
                "status": 1,
                "message": "Hubs fetched successfully",
                "payload": formatted_hubs,
            }

        except Exception as e:
            return {
                "status": 0,
                "message": f"Error fetching hubs: {str(e)}",
                "payload": [],
            }

    def get_hub_icon(self, hub_name):
        """Get appropriate icon for hub"""
        mapping = {
            "noteslists": "FileTextOutlined",
            "bookmarks": "BookOutlined",
            "vault": "LockOutlined",
            "files": "FolderOpenOutlined",
            "documents": "FileOutlined",
            "media": "PictureOutlined",
            "contacts": "ContactsOutlined",
        }
        return mapping.get(hub_name.lower(), "AppstoreOutlined")
