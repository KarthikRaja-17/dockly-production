from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import subprocess
import json
import os
import time
import threading
from datetime import datetime
import re
from flask_restful import Resource


class BitwardenManager:
    def __init__(self):
        self.is_logged_in = False
        self.session_key = None

    def check_bitwarden_status(self):
        """Check if Bitwarden CLI is installed and logged in"""
        try:
            result = subprocess.run(["bw", "status"], capture_output=True, text=True)
            if result.returncode == 0:
                status = json.loads(result.stdout)
                return status
            return {"status": "error", "message": "Bitwarden CLI not available"}
        except Exception as e:
            return {
                "status": "error",
                "message": str(e) or "An unexpected error occurred",
            }

    def login(self, email, password):
        """Login to Bitwarden - simplified without 2FA"""
        try:
            # Clear any existing session
            self.logout()

            # Perform login
            cmd = ["bw", "login", email, password, "--nointeraction"]

            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                return {"success": False, "message": result.stderr or "Login failed"}

            # Unlock to get session key
            unlock_result = subprocess.run(
                ["bw", "unlock", password, "--raw"], capture_output=True, text=True
            )
            if unlock_result.returncode == 0:
                self.session_key = unlock_result.stdout.strip()
                self.is_logged_in = True
                return {"success": True, "message": "Successfully logged in"}
            return {
                "success": False,
                "message": unlock_result.stderr or "Unlock failed",
            }
        except Exception as e:
            return {
                "success": False,
                "message": str(e) or "An unexpected error occurred",
            }

    def logout(self):
        """Logout from Bitwarden"""
        try:
            result = subprocess.run(["bw", "logout"], capture_output=True, text=True)
            self.is_logged_in = False
            self.session_key = None
            if result.returncode == 0:
                return {"success": True, "message": "Successfully logged out"}
            return {"success": False, "message": result.stderr or "Logout failed"}
        except Exception as e:
            return {
                "success": False,
                "message": str(e) or "An unexpected error occurred",
            }

    def unlock(self, password):
        """Unlock Bitwarden vault"""
        try:
            result = subprocess.run(
                ["bw", "unlock", password, "--raw"], capture_output=True, text=True
            )
            if result.returncode == 0:
                self.session_key = result.stdout.strip()
                self.is_logged_in = True
                return {"success": True, "message": "Vault unlocked successfully"}
            return {"success": False, "message": result.stderr or "Unlock failed"}
        except Exception as e:
            return {
                "success": False,
                "message": str(e) or "An unexpected error occurred",
            }

    def get_items(self):
        """Get all items from Bitwarden vault"""
        if not self.is_logged_in or not self.session_key:
            return {"success": False, "message": "Not logged in"}

        try:
            env = os.environ.copy()
            env["BW_SESSION"] = self.session_key

            result = subprocess.run(
                ["bw", "list", "items"], capture_output=True, text=True, env=env
            )
            if result.returncode == 0:
                items = json.loads(result.stdout)
                processed_items = []
                for item in items:
                    if item.get("type") == 1:  # Login items
                        processed_item = {
                            "id": item.get("id"),
                            "name": item.get("name"),
                            "username": item.get("login", {}).get("username", ""),
                            "uri": (
                                item.get("login", {})
                                .get("uris", [{}])[0]
                                .get("uri", "")
                                if item.get("login", {}).get("uris")
                                else ""
                            ),
                            "folder": item.get("folderId", ""),
                            "favorite": item.get("favorite", False),
                            "organizationId": item.get("organizationId", ""),
                            "lastModified": item.get("revisionDate", ""),
                            "strength": self.calculate_password_strength(
                                item.get("login", {}).get("password", "")
                            ),
                        }
                        processed_items.append(processed_item)

                return {
                    "success": True,
                    "message": "Items retrieved successfully",
                    "items": processed_items,
                }
            return {
                "success": False,
                "message": result.stderr or "Failed to retrieve items",
            }
        except Exception as e:
            return {
                "success": False,
                "message": str(e) or "An unexpected error occurred",
            }

    def get_password(self, item_id):
        """Get password for specific item"""
        if not self.is_logged_in or not self.session_key:
            return {"success": False, "message": "Not logged in"}

        try:
            env = os.environ.copy()
            env["BW_SESSION"] = self.session_key

            result = subprocess.run(
                ["bw", "get", "password", item_id],
                capture_output=True,
                text=True,
                env=env,
            )
            if result.returncode == 0:
                return {
                    "success": True,
                    "password": result.stdout.strip(),
                    "message": "Password retrieved successfully",
                }
            return {
                "success": False,
                "message": result.stderr or "Failed to retrieve password",
            }
        except Exception as e:
            return {
                "success": False,
                "message": str(e) or "An unexpected error occurred",
            }

    def calculate_password_strength(self, password):
        """Calculate password strength score"""
        if not password:
            return 0

        score = 0

        length = len(password)
        if length >= 12:
            score += 25
        elif length >= 8:
            score += 15
        elif length >= 6:
            score += 10

        if re.search(r"[a-z]", password):
            score += 10
        if re.search(r"[A-Z]", password):
            score += 10
        if re.search(r"\d", password):
            score += 10
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 15

        if re.search(r"123|abc|password|qwerty", password.lower()):
            score -= 20

        return max(0, min(100, score))


def background_sync(bw_manager, socketio):
    """Background sync function"""
    try:
        if bw_manager.session_key:
            env = os.environ.copy()
            env["BW_SESSION"] = bw_manager.session_key
            result = subprocess.run(
                ["bw", "sync"], capture_output=True, text=True, env=env
            )
            if result.returncode == 0:
                socketio.emit("sync_complete", {"message": "Background sync completed"})
            else:
                socketio.emit(
                    "sync_error", {"message": result.stderr or "Background sync failed"}
                )
        else:
            socketio.emit("sync_error", {"message": "No session key available"})
    except Exception as e:
        socketio.emit(
            "sync_error", {"message": str(e) or "An unexpected error occurred"}
        )


bw_manager = BitwardenManager()


class GetStatus(Resource):
    def get(self):
        """Get Bitwarden status"""
        status = bw_manager.check_bitwarden_status()
        return {
            "status": 1,
            "message": "Bitwarden is running",
            "payload": {"status": status},
        }


class Login(Resource):
    def post(self):
        """Login to Bitwarden - simplified without 2FA"""
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return {
                "status": 0,
                "message": "Email and password are required",
                "payload": {},
            }

        result = bw_manager.login(email, password)
        print(f"result: {result}")
        return {
            "status": 1 if result["success"] else 0,
            "message": result["message"],
            "payload": {
                "is_logged_in": bw_manager.is_logged_in,
                "session_key": bw_manager.session_key,
            },
        }


class Unlock(Resource):
    def post(self):
        """Unlock Bitwarden vault"""
        data = request.get_json()
        password = data.get("password")

        if not password:
            return {"status": 0, "message": "Password is required", "payload": {}}

        result = bw_manager.unlock(password)
        return {
            "status": 1 if result["success"] else 0,
            "message": result["message"],
            "payload": {
                "is_logged_in": bw_manager.is_logged_in,
                "session_key": bw_manager.session_key,
            },
        }


class GetItems(Resource):
    def get(self):
        """Get all password items"""
        result = bw_manager.get_items()
        return {
            "status": 1 if result["success"] else 0,
            "message": result["message"],
            "payload": {"items": result.get("items", [])},
        }


class GetPassword(Resource):
    def get(self, item_id):
        """Get password for specific item"""
        result = bw_manager.get_password(item_id)
        return {
            "status": 1 if result["success"] else 0,
            "message": result.get("message", "Failed to retrieve password"),
            "payload": {"password": result.get("password", "")},
        }


class SyncVault(Resource):
    def post(self):
        """Sync Bitwarden vault and emit updated items"""
        if not bw_manager.is_logged_in or not bw_manager.session_key:
            return {"status": 0, "message": "Not logged in", "payload": {}}

        try:
            # Import socketio from the global instance
            from root import socketio

            env = os.environ.copy()
            env["BW_SESSION"] = bw_manager.session_key

            result = subprocess.run(
                ["bw", "sync"], capture_output=True, text=True, env=env
            )
            if result.returncode == 0:
                # Fetch updated items
                items_result = bw_manager.get_items()
                if items_result["success"]:
                    socketio.emit(
                        "items_updated",
                        {
                            "count": len(items_result["items"]),
                            "items": items_result["items"],
                        },
                    )
                    socketio.emit("sync_complete", {"message": "Sync completed"})
                    return {"status": 1, "message": "Sync completed", "payload": {}}
                else:
                    socketio.emit("sync_error", {"message": items_result["message"]})
                    return {
                        "status": 0,
                        "message": items_result["message"],
                        "payload": {},
                    }
            else:
                socketio.emit("sync_error", {"message": result.stderr or "Sync failed"})
                return {
                    "status": 0,
                    "message": result.stderr or "Sync failed",
                    "payload": {},
                }
        except Exception as e:
            try:
                from root import socketio

                socketio.emit(
                    "sync_error", {"message": str(e) or "An unexpected error occurred"}
                )
            except Exception:
                pass
            return {
                "status": 0,
                "message": str(e) or "An unexpected error occurred",
                "payload": {},
            }


class Logout(Resource):
    def post(self):
        """Logout from Bitwarden"""
        result = bw_manager.logout()
        return {
            "status": 1 if result["success"] else 0,
            "message": result["message"],
            "payload": {},
        }
