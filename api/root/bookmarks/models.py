
from email.message import EmailMessage
import smtplib
import uuid
from flask import request
from flask_restful import Resource
import time
from root.planner.models import add_calendar_guests
from root.db.dbHelper import DBHelper
from root.config import EMAIL_PASSWORD, EMAIL_SENDER, SMTP_PORT, SMTP_SERVER, WEB_URL
from root.helpers.logs import AuditLogger
from root.auth.auth import auth_required
from datetime import datetime
from typing import Dict, List, Optional, Union
import smtplib
from email.message import EmailMessage
from flask_restful import Resource
from flask import request


class SaveBookmarks(Resource):
    def post(self):
        try:
            data = request.get_json(force=True)
            uid = data.get("uid")
            bookmark = data.get("bookmarks", [{}])[0]

            if not uid or not bookmark.get("title") or not bookmark.get("url"):
                AuditLogger.log(
                    user_id=uid,
                    action="SAVE_BOOKMARK_FAILED",
                    resource_type="bookmarks",
                    resource_id=None,
                    success=False,
                    error_message="Missing required fields: uid, title, url",
                )
                return {
                    "status": 0,
                    "message": "Missing required fields: uid, title, url",
                }, 422

            bookmark_id = f"{int(time.time() * 1000)}_{uid}_{uuid.uuid4().hex[:6]}"

            bookmark_data = {
                "id": bookmark_id,
                "user_id": str(uid),
                "title": bookmark.get("title"),
                "url": bookmark.get("url"),
                "favicon": bookmark.get("favicon", ""),
                "category": bookmark.get("category", ""),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            DBHelper.insert("bookmarks", **bookmark_data)

            AuditLogger.log(
                user_id=uid,
                action="SAVE_BOOKMARK",
                resource_type="bookmarks",
                resource_id=bookmark_id,
                success=True,
                metadata={"title": bookmark.get("title")},
            )

            return {
                "status": 1,
                "message": "Bookmark saved successfully",
                "payload": {"id": bookmark_id},
            }
        except Exception as e:
            AuditLogger.log(
                user_id=data.get("uid") if data else None,
                action="SAVE_BOOKMARK_FAILED",
                resource_type="bookmarks",
                resource_id=None,
                success=False,
                error_message="Failed to save bookmark",
                metadata={"input": data,"error": str(e)},
            )
            return {"status": 0, "message": f"Failed to save bookmark: {str(e)}"}, 500
        


class SaveAllBookmarks(Resource):
    def post(self):
        try:
            data = request.get_json(force=True)
            uid = data.get("uid")
            bookmarks = data.get("bookmarks", [])

            if not uid or not bookmarks:
                AuditLogger.log(
                    user_id=uid,
                    action="SAVE_ALL_BOOKMARKS_FAILED",
                    resource_type="bookmarks",
                    resource_id=None,
                    success=False,
                    error_message="Missing required fields: uid or bookmarks",
                )
                return {
                    "status": 0,
                    "message": "Missing required fields: uid or bookmarks",
                }, 422

            inserted_ids = []
            for bookmark in bookmarks:
                bookmark_id = f"{int(time.time() * 1000)}_{uid}_{uuid.uuid4().hex[:6]}"
                bookmark_data = {
                    "id": bookmark_id,
                    "user_id": str(uid),
                    "title": bookmark.get("title"),
                    "url": bookmark.get("url"),
                    "favicon": bookmark.get("favicon", ""),
                    "category": bookmark.get("category", ""),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }
                DBHelper.insert("bookmarks", **bookmark_data)
                inserted_ids.append(bookmark_id)

            AuditLogger.log(
                user_id=uid,
                action="SAVE_ALL_BOOKMARKS",
                resource_type="bookmarks",
                resource_id=",".join(inserted_ids),
                success=True,
                metadata={"count": len(inserted_ids)},
            )

            return {
                "status": 1,
                "message": f"{len(inserted_ids)} bookmarks saved successfully",
                "payload": {"ids": inserted_ids},
            }
        except Exception as e:
            AuditLogger.log(
                user_id=data.get("uid") if data else None,
                action="SAVE_ALL_BOOKMARKS_FAILED",
                resource_type="bookmarks",
                resource_id=None,
                success=False,
                error_message="Failed to save bookmarks",
            )
            return {"status": 0, "message": f"Failed to save bookmarks: {str(e)}"}, 500


class GetBookmarks(Resource):
    def get(self):
        uid = request.args.get("uid")  # ✅ use query param

        try:
            if not uid:
                AuditLogger.log(
                    user_id=None,
                    action="GET_BOOKMARKS_FAILED",
                    resource_type="bookmarks",
                    resource_id=None,
                    success=False,
                    error_message="UID is required",
                    metadata={"query_params": dict(request.args)},
                )
                return {"status": 0, "message": "UID is required"}, 400

            bookmarks = DBHelper.find("bookmarks", {"uid": uid})

            return {
                "status": 1,
                "message": "Bookmarks fetched successfully",
                "bookmarks": bookmarks,
            }

        except Exception as e:
            # Log the error
            AuditLogger.log(
                user_id=uid,
                action="GET_BOOKMARKS_FAILED",
                resource_type="bookmarks",
                resource_id=None,
                success=False,
                error_message="Failed to fetch bookmarks",
                metadata={"query_params": dict(request.args),"error": str(e)},
            )
            return {
                "status": 0,
                "message": "Failed to fetch bookmarks",
                "error": str(e),
            }, 500


# -------------------------------------------NEW-----------------------------------------------------

from root.auth.auth import auth_required
from datetime import datetime
from root.utilis import Status, uniqueId

from flask_restful import Resource, request
from datetime import datetime



class AddOrUpdateBookmark(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        if not data:
            AuditLogger.log(
                user_id=uid,
                action="BOOKMARK_FAILED",
                resource_type="bookmarks",
                resource_id=None,
                success=False,
                error_message="Invalid or empty input",
                metadata={"raw_request": str(request.data)},
            )
            return {"status": 0, "message": "Invalid input", "payload": {}}, 400

        editing = data.get("editing")
        bookmark_id = data.get("id")

        # 🔹 Helper: Convert Python list to PostgreSQL array
        def format_pg_array(py_list):
            if not py_list:
                return "{}"
            return "{" + ",".join(f'"{str(i)}"' for i in py_list) + "}"

        # 🔹 Handle hubs - convert array to comma-separated string if needed
        hubs_data = data.get("hubs", [])
        if isinstance(hubs_data, list):
            hub_string = ",".join(hubs_data) if hubs_data else "none"
        else:
            hub_string = data.get("hub", "none")

        # 🔹 Handle tags safely
        tags_data = data.get("tags", [])
        tags_array = format_pg_array(tags_data) if isinstance(tags_data, list) else "{}"

        try:
            if editing and bookmark_id:
                # If editing, update existing bookmark
                payload = {
                    "title": data.get("title"),
                    "url": data.get("url"),
                    "description": data.get("description"),
                    "favicon": data.get("favicon", ""),
                    "category": data.get("category"),
                    "tags": tags_array,
                    "hub": hub_string,
                    "is_favorite": data.get("is_favorite", False),
                    "updated_at": datetime.utcnow(),
                }

                DBHelper.update_one(
                    "bookmarks",
                    filters={"id": bookmark_id, "user_id": uid},
                    updates=payload,
                )

                AuditLogger.log(
                    user_id=uid,
                    action="BOOKMARK_UPDATED",
                    resource_type="bookmarks",
                    resource_id=bookmark_id,
                    success=True,
                    metadata=payload,
                )

                return {"status": 1, "message": f"Bookmark '{data.get('title')}' updated successfully", "payload": {}}

            else:
                # If adding, generate new ID
                new_id = uniqueId(digit=5, isNum=True, prefix=uid)
                payload = {
                    "id": new_id,
                    "user_id": uid,
                    "title": data.get("title"),
                    "url": data.get("url"),
                    "description": data.get("description"),
                    "favicon": data.get("favicon", ""),
                    "category": data.get("category"),
                    "tags": tags_array,
                    "hub": hub_string,
                    "is_favorite": data.get("is_favorite", False),
                    "is_active": 1,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }

                DBHelper.insert("bookmarks", **payload)

                AuditLogger.log(
                    user_id=uid,
                    action="BOOKMARK_ADDED",
                    resource_type="bookmarks",
                    resource_id=new_id,
                    success=True,
                    metadata=payload,
                )

                return {"status": 1, "message": f"Bookmark '{data.get('title')}' added successfully", "payload": {}}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="BOOKMARK_FAILED",
                resource_type="bookmarks",
                resource_id=bookmark_id if editing else None,
                success=False,
                error_message="Failed to save bookmark",
                metadata={"input": data,"error": str(e)},
            )
            return {"status": 0, "message": f"Failed to save bookmark: {str(e)}", "payload": {}}, 500


class GetBookmark(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            args = request.args
            search = args.get("search", "").lower()
            category = args.get("category")
            hub = args.get("hub")
            sort_by = args.get("sortBy", "newest")

            # Build filters
            filters = {"is_active": Status.ACTIVE.value}
            if category:
                filters["category"] = category

            # Fetch bookmarks
            bookmarks = DBHelper.find_with_or_and_array_match(
                table_name="bookmarks",
                select_fields=[
                    "id",
                    "title",
                    "url",
                    "description",
                    "favicon",
                    "category",
                    "tags",
                    "hub",
                    "is_favorite",
                    "created_at",
                    "user_id",
                    "tagged_ids",
                ],
                uid=uid,
                array_field="tagged_ids",
                filters=filters,
            )

            # Apply hub filtering after fetching (to handle comma-separated values)
            if hub:
                bookmarks = [
                    b for b in bookmarks
                    if hub in (b.get("hub") or "").split(",")
                ]

            # Convert datetime to string and split hub field into array
            for b in bookmarks:
                if isinstance(b.get("created_at"), datetime):
                    b["created_at"] = b["created_at"].isoformat()

                hub_string = b.get("hub", "none")
                b["hubs"] = hub_string.split(",") if hub_string else ["none"]

            # Apply search filtering
            if search:
                bookmarks = [
                    b
                    for b in bookmarks
                    if search in b["title"].lower()
                    or search in b.get("description", "").lower()
                    or any(search in tag.lower() for tag in (b.get("tags") or []))
                ]

            # Apply sorting
            if sort_by == "title":
                bookmarks.sort(key=lambda x: x["title"])
            elif sort_by == "title-desc":
                bookmarks.sort(key=lambda x: x["title"], reverse=True)
            elif sort_by == "category":
                bookmarks.sort(key=lambda x: x["category"])
            elif sort_by == "oldest":
                bookmarks.sort(key=lambda x: x.get("created_at", ""))
            else:
                bookmarks.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            return {"status": 1, "message": "Success", "payload": {"bookmarks": bookmarks}}

        except Exception as e:
            # ✅ Log failure
            AuditLogger.log(
                user_id=uid,
                action="GET_BOOKMARK_FAILED",
                resource_type="bookmarks",
                resource_id=None,
                success=False,
                error_message=str(e),
                metadata={"query_params": dict(request.args)},
            )
            return {
                "status": 0,
                "message": "Failed to fetch bookmarks",
                "error": str(e),
            }, 500


class DeleteBookmark(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)

        if not data or not data.get("id"):
            AuditLogger.log(
                user_id=uid,
                action="BOOKMARK_DELETE_FAILED",
                resource_type="bookmarks",
                resource_id=None,
                success=False,
                error_message="Missing bookmark ID for deletion",
                metadata={"raw_request": str(request.data)},
            )
            return {"status": 0, "message": "Missing bookmark ID", "payload": {}}, 400

        bid = data.get("id")

        try:
            # Mark bookmark as deleted (soft delete)
            DBHelper.update_one(
                table_name="bookmarks",
                filters={"id": bid, "user_id": uid},
                updates={"is_active": Status.REMOVED.value, "updated_at": datetime.utcnow()},
            )

            AuditLogger.log(
                user_id=uid,
                action="BOOKMARK_DELETED",
                resource_type="bookmarks",
                resource_id=bid,
                success=True,
                metadata={"bookmark_id": bid, "deleted_by": user.get("user_name")},
            )

            return {"status": 1, "message": f"Bookmark '{bid}' deleted successfully", "payload": {}}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="BOOKMARK_DELETE_FAILED",
                resource_type="bookmarks",
                resource_id=bid,
                success=False,
                error_message="Failed to delete bookmark",
                metadata={"input": data,"error": str(e)},
            )
            return {"status": 0, "message": f"Failed to delete bookmark: {str(e)}", "payload": {}}, 500


class ToggleFavorite(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)

        # Accept both {"id": "..."} and raw "id"
        if isinstance(data, dict):
            bid = data.get("id") or data.get("bookmark_id")
        else:
            bid = data

        if not bid:
            AuditLogger.log(
                user_id=uid,
                action="BOOKMARK_FAVORITE_FAILED",
                resource_type="bookmarks",
                resource_id=None,
                success=False,
                error_message="Missing bookmark ID for favorite toggle",
                metadata={"raw_request": str(request.data)},
            )
            return {"status": 0, "message": "Missing bookmark ID", "payload": {}}, 400

        try:
            bookmark = DBHelper.find_one("bookmarks", filters={"id": bid, "user_id": uid})
            if not bookmark:
                AuditLogger.log(
                    user_id=uid,
                    action="BOOKMARK_FAVORITE_FAILED",
                    resource_type="bookmarks",
                    resource_id=bid,
                    success=False,
                    error_message="Bookmark not found",
                )
                return {"status": 0, "message": "Bookmark not found", "payload": {}}, 404

            # Flip favorite status
            new_status = not bookmark.get("is_favorite", False)

            DBHelper.update_one(
                "bookmarks",
                filters={"id": bid, "user_id": uid},
                updates={"is_favorite": new_status, "updated_at": datetime.utcnow()},
            )

            updated = DBHelper.find_one(
                "bookmarks",
                filters={"id": bid, "user_id": uid},
                select_fields=[
                    "id",
                    "title",
                    "url",
                    "description",
                    "favicon",
                    "category",
                    "tags",
                    "is_favorite",
                ],
            )

            AuditLogger.log(
                user_id=uid,
                action="BOOKMARK_FAVORITE_TOGGLED",
                resource_type="bookmarks",
                resource_id=bid,
                success=True,
                metadata={
                    "bookmark_id": bid,
                    "new_status": new_status,
                    "toggled_by": user.get("user_name") if user else None,
                },
            )

            return {
                "status": 1,
                "message": f"Favorite status {'enabled' if new_status else 'disabled'}",
                "payload": {"bookmark": updated},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="BOOKMARK_FAVORITE_FAILED",
                resource_type="bookmarks",
                resource_id=bid,
                success=False,
                error_message="Failed to toggle favorite",
                metadata={"input": data,"error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to toggle favorite: {str(e)}",
                "payload": {},
            }, 500
            
           


class GetBookmarkCategories(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        rows = DBHelper.raw_sql(
            "SELECT DISTINCT category FROM bookmarks WHERE user_id = %s AND is_active = 1",
            (uid,),
        )
        categories = [r["category"] for r in rows]
        return {
            "status": 1,
            "message": "Categories fetched",
            "payload": {"categories": categories},
        }


class GetBookmarkStats(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        total = DBHelper.count(
            "bookmarks", filters={"user_id": uid, "is_active": Status.ACTIVE.value}
        )
        fav = DBHelper.count(
            "bookmarks",
            filters={
                "user_id": uid,
                "is_favorite": True,
                "is_active": Status.ACTIVE.value,
            },
        )

        # Fix: Use alias for the count column to ensure consistent naming
        rows = DBHelper.raw_sql(
            "SELECT COUNT(DISTINCT category) as category_count FROM bookmarks WHERE user_id = %s AND is_active = 1",
            (uid,),
        )

        # Alternative approach: Get the first value regardless of column name
        categories = 0
        if rows and len(rows) > 0:
            # Get the first value from the first row (regardless of column name)
            first_row = rows[0]
            if isinstance(first_row, dict):
                # Try different possible column names
                categories = (
                    first_row.get("category_count")
                    or first_row.get("count")
                    or first_row.get("COUNT(DISTINCT category)")
                    or list(first_row.values())[0]
                    if first_row.values()
                    else 0
                )
            else:
                # If it's a tuple/list, get the first element
                categories = first_row[0] if first_row else 0

        return {
            "status": 1,
            "message": "Stats fetched",
            "payload": {
                "total_bookmarks": total,
                "favorite_bookmarks": fav,
                "categories_count": categories,
            },
        }


class EmailSender:
    def __init__(self):
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.smtp_user = EMAIL_SENDER
        self.smtp_password = EMAIL_PASSWORD

    def send_bookmark_email(self, recipient_email, bookmark, sender_name="Someone"):
        msg = EmailMessage()
        msg["Subject"] = f"Shared Bookmark: {bookmark['title']}"
        msg["From"] = self.smtp_user
        msg["To"] = recipient_email

        created = bookmark.get("created_at") or ""
        if created:
            created = created.split("T")[0]

        msg.set_content(
            f"""
Hi there!

{sender_name} wanted to share this Bookmark with you:

Title: {bookmark['title']}
Url: {bookmark['url']}
Sub Category: {bookmark['category']}


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


class ShareBookmark(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        if not data:
            AuditLogger.log(
                user_id=uid,
                action="BOOKMARK_SHARE_FAILED",
                resource_type="bookmarks",
                resource_id=None,
                success=False,
                error_message="Invalid or empty input",
                metadata={"raw_request": str(request.data)},
            )
            return {"status": 0, "message": "Invalid input", "payload": {}}, 400

        emails = data.get("email")
        bookmark = data.get("bookmark")
        tagged_members = data.get("tagged_members", [])

        if not emails or not bookmark:
            AuditLogger.log(
                user_id=uid,
                action="BOOKMARK_SHARE_FAILED",
                resource_type="bookmarks",
                resource_id=bookmark.get("id") if bookmark else None,
                success=False,
                error_message="Missing 'email' or 'bookmark' in request",
                metadata={"input": data},
            )
            return {
                "status": 0,
                "message": "Both 'email' and 'bookmark' are required.",
                "payload": {}
            }, 422

        try:
            if isinstance(emails, str):
                emails = [emails]

            email_sender = EmailSender()
            failures, notifications_created, resolved_tagged_ids = [], [], []

            # 🔹 Resolve tagged members -> user IDs
            for member_identifier in tagged_members:
                family_member = DBHelper.find_one(
                    "family_members",
                    filters={"email": member_identifier},
                    select_fields=["fm_user_id"],
                )
                if family_member:
                    resolved_tagged_ids.append(family_member["fm_user_id"])

            # 🔹 Send emails
            for email in emails:
                success, message = email_sender.send_bookmark_email(
                    email, bookmark, user["user_name"]
                )
                if not success:
                    failures.append((email, message))

            # 🔹 Create notifications for tagged members
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
                    "message": f"{user['user_name']} tagged a bookmark '{bookmark.get('title', 'Untitled')}' with you",
                    "task_type": "tagged",
                    "action_required": False,
                    "status": "unread",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "metadata": {
                        "bookmark": {
                            "id": bookmark.get("id"),
                            "title": bookmark.get("title"),
                            "url": bookmark.get("url"),
                            "category": bookmark.get("category"),
                            "hub": bookmark.get("hub"),
                            "description": bookmark.get("description", ""),
                        },
                        "sender_name": user["user_name"],
                        "tagged_member": {
                            "name": family_member["name"],
                            "email": family_member["email"],
                        },
                    },
                }

                notification_id = DBHelper.insert(
                    "notifications", return_column="id", **notification_data
                )

                notifications_created.append(
                    {
                        "notification_id": notification_id,
                        "member_name": family_member["name"],
                        "member_email": family_member["email"],
                        "receiver_uid": receiver_uid,
                    }
                )

            # 🔹 Update tagged_ids in bookmarks
            if resolved_tagged_ids:
                bookmark_record = DBHelper.find_one(
                    "bookmarks",
                    filters={"id": bookmark.get("id")},
                    select_fields=["tagged_ids"],
                )
                existing_ids = bookmark_record.get("tagged_ids") or []
                combined_ids = list(set(existing_ids + resolved_tagged_ids))
                pg_array_str = "{" + ",".join(f'"{str(i)}"' for i in combined_ids) + "}"
                DBHelper.update_one(
                    table_name="bookmarks",
                    filters={"id": bookmark.get("id")},
                    updates={"tagged_ids": pg_array_str},
                )

            if failures:
                AuditLogger.log(
                    user_id=uid,
                    action="BOOKMARK_SHARE_PARTIAL",
                    resource_type="bookmarks",
                    resource_id=bookmark.get("id"),
                    success=False,
                    error_message=f"Failed to send to {len(failures)} recipients",
                    metadata={"failures": failures, "bookmark": bookmark},
                )
                return {
                    "status": 0,
                    "message": f"Failed to send to {len(failures)} recipients",
                    "errors": failures,
                }, 500

            # 🔹 Success log
            AuditLogger.log(
                user_id=uid,
                action="BOOKMARK_SHARED",
                resource_type="bookmarks",
                resource_id=bookmark.get("id"),
                success=True,
                metadata={
                    "emails_sent": emails,
                    "notifications_created": len(notifications_created),
                    "tagged_members": tagged_members,
                },
            )

            return {
                "status": 1,
                "message": f"Bookmark shared successfully and {len(notifications_created)} notifications created.",
                "payload": {"notifications_created": notifications_created},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="BOOKMARK_SHARE_FAILED",
                resource_type="bookmarks",
                resource_id=bookmark.get("id") if bookmark else None,
                success=False,
                error_message="Failed to share bookmark",
                metadata={"input": data, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to share bookmark: {str(e)}", "payload": {}}, 500

class ShareItem(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = None
        
        try:
            try:
                data = request.get_json(force=True)
            except Exception as e:
                AuditLogger.log(
                    user_id=uid,
                    action="SHARE_ITEM",
                    resource_type="item",
                    resource_id="unknown",
                    success=False,
                    error_message=f"Invalid JSON: {str(e)}",
                    metadata={},
                )
                return {"status": 0, "message": f"Invalid JSON: {str(e)}"}, 400

            emails = data.get("email")
            item_type = data.get("item_type")  # 'bookmark', 'note', 'project', 'goal', 'todo', 'maintenance_task'
            item_data = data.get("item_data")
            tagged_members = data.get("tagged_members", [])

            if not emails or not item_type or not item_data:
                AuditLogger.log(
                    user_id=uid,
                    action="SHARE_ITEM",
                    resource_type=item_type or "unknown",
                    resource_id="unknown",
                    success=False,
                    error_message="Missing required fields: email, item_type, and item_data are required",
                    metadata={"input": data if data else {}},
                )
                return {
                    "status": 0,
                    "message": "Missing required fields: email, item_type, and item_data are required.",
                }, 422

            # Normalize email array
            if isinstance(emails, str):
                emails = [emails]

            # Validate family member permissions before proceeding
            permission_validation_result = self._validate_family_member_permissions(uid, item_type,tagged_members)
            
            if not permission_validation_result["valid"]:
                AuditLogger.log(
                    user_id=uid,
                    action="SHARE_ITEM",
                    resource_type=item_type,
                    resource_id=str(item_data.get("id", "unknown")),
                    success=False,
                    error_message=permission_validation_result["message"],
                    metadata={"input": data if data else {}},
                )
                return {
                    "status": 0,
                    "message": permission_validation_result["message"]
                }, 403

            email_sender = UnifiedEmailSender()
            failures = []
            notifications_created = []
            resolved_tagged_ids = []

            # Resolve tagged user UIDs from emails
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
                success, msg = email_sender.send_item_email(email, item_type, item_data, user["user_name"])
                if not success:
                    failures.append((email, msg))

            # Create notifications
            for member_email in tagged_members:
                family_member = DBHelper.find_one(
                    "family_members",
                    filters={"email": member_email},
                    select_fields=["name", "email", "fm_user_id"],
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
                    "message": self._get_notification_message(user["user_name"], item_type, item_data),
                    "task_type": "tagged",
                    "action_required": False,
                    "status": "unread",
                    "hub": None,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "metadata": {
                        "item_type": item_type,
                        "item_data": item_data,
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

            # Update tagged_ids in appropriate table
            if resolved_tagged_ids and item_data.get("id"):
                self._update_tagged_ids(item_type, item_data, resolved_tagged_ids, uid, tagged_members)

            if failures:
                AuditLogger.log(
                    user_id=uid,
                    action="SHARE_ITEM",
                    resource_type=item_type,
                    resource_id=str(item_data.get("id", "unknown")),
                    success=False,
                    error_message=f"Failed to send to {len(failures)} recipients",
                    metadata={"input": data if data else {}, "failures": failures},
                )
                return {
                    "status": 0,
                    "message": f"Failed to send to {len(failures)} recipients",
                    "errors": failures,
                }, 500

            AuditLogger.log(
                user_id=uid,
                action="SHARE_ITEM",
                resource_type=item_type,
                resource_id=str(item_data.get("id", "unknown")),
                success=True,
                metadata={
                    "input": data if data else {},
                    "notifications_created": notifications_created,
                    "item_type": item_type,
                },
            )

            return {
                "status": 1,
                "message": f"{item_type.title()} shared via email. {len(notifications_created)} notification(s) created.",
                "payload": {"notifications_created": notifications_created},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="SHARE_ITEM",
                resource_type=item_type if "item_type" in locals() else "unknown",
                resource_id="unknown",
                success=False,
                error_message="Failed to share item",
                metadata={"input": data if data else {}, "error": str(e)},
            )
            return {"status": 0, "message": "Failed to share item"}

    def _validate_family_member_permissions(self, uid: str, item_type: str, tagged_members: List[str]) -> Dict:
        """Validate that only the tagged family members have appropriate permissions for the item type"""
        # Hub and Board ID mappings
        HUB_IDS = {
            'bookmarks': '2a2b3c4d-1111-2222-3333-abcdef784512',  # Accounts
            'notes': '1a2b3c4d-1111-2222-3333-abcdef123744',      # Notes & Lists
            'planner': '3a2b3c4d-1111-2222-3333-abcdef985623',    # Planner
        }

        BOARD_IDS = {
            'family': '1a2b3c4d-1111-2222-3333-abcdef123456',     # Family
            'home': '3c4d5e6f-3333-4444-5555-cdef12345678',       # Home
        }

        # Define required permissions based on item type
        required_permissions = []
        if item_type == 'bookmark':
            required_permissions = [{'target_type': 'hubs', 'target_id': HUB_IDS['bookmarks']}]
        elif item_type == 'note':
            required_permissions = [{'target_type': 'hubs', 'target_id': HUB_IDS['notes']}]
        elif item_type == 'project':
            required_permissions = [
                {'target_type': 'hubs', 'target_id': HUB_IDS['planner']},
                {'target_type': 'board', 'target_id': BOARD_IDS['family']}
            ]
        elif item_type in ['goal', 'todo']:
            required_permissions = [{'target_type': 'hubs', 'target_id': HUB_IDS['planner']}]
        elif item_type == 'maintenance_task':
            required_permissions = [{'target_type': 'board', 'target_id': BOARD_IDS['home']}]
        else:
            return {"valid": False, "message": f"Unknown item type: {item_type}"}

        invalid_members = []

        # ✅ Only validate the provided tagged members
        for member_email in tagged_members:
            family_member = DBHelper.find_one(
                "family_members",
                filters={"email": member_email},
                select_fields=["name", "email", "fm_user_id"]
            )

            if not family_member:
                continue

            user_id = family_member.get("fm_user_id")
            if not user_id:
                # fallback lookup in users table
                user_record = DBHelper.find_one(
                    "users",
                    filters={"email": member_email},
                    select_fields=["uid"]
                )
                user_id = user_record.get("uid") if user_record else None

            if not user_id:
                continue

            # Check if user has any of the required permissions
            has_permission = False
            for required_perm in required_permissions:
                permission_check = DBHelper.find_one(
                    "user_permissions",
                    filters={
                        "user_id": user_id,
                        "target_type": required_perm["target_type"],
                        "target_id": required_perm["target_id"],
                        "can_read": True
                    }
                )
                if permission_check:
                    has_permission = True
                    break

            if not has_permission:
                invalid_members.append(family_member["name"])

        if invalid_members:
            return {
                "valid": False,
                "message": f"The following family members don't have access to this section: {', '.join(invalid_members)}"
            }

        return {"valid": True, "message": "All permissions validated"}

    def _get_notification_message(self, sender_name: str, item_type: str, item_data: Dict) -> str:
        """Generate appropriate notification message based on item type"""
        item_title = item_data.get("title") or item_data.get("text") or item_data.get("name") or "Untitled"
        
        type_mapping = {
            "bookmark": "bookmark",
            "note": "note", 
            "project": "project",
            "goal": "goal",
            "todo": "task",
            "maintenance_task": "maintenance task"
        }
        
        item_name = type_mapping.get(item_type, "item")
        return f"{sender_name} tagged a {item_name} '{item_title}' with you"

    def _update_tagged_ids(self, item_type: str, item_data: Dict, resolved_tagged_ids: List[str], uid: str, tagged_members: List[str] = None):
        """Update tagged_ids in the appropriate table based on item type"""
        table_mapping = {
            "bookmark": "bookmarks",
            "note": "notes_lists", 
            "project": "projects",
            "goal": "goals",
            "todo": "todos",
            "maintenance_task": "maintenance_tasks"
        }
        
        table_name = table_mapping.get(item_type)
        if not table_name:
            return

        try:
            item_record = DBHelper.find_one(table_name, filters={"id": item_data.get("id")})
            if not item_record:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_TAGGED_IDS",
                    resource_type=item_type,
                    resource_id=str(item_data.get("id")),
                    success=False,
                    error_message=f"{item_type.title()} not found. Cannot tag members.",
                    metadata={"input": item_data},
                )
                return

            existing_ids = item_record.get("tagged_ids") or []
            combined_ids = list(set(existing_ids + resolved_tagged_ids))
            pg_array_str = "{" + ",".join(f'"{str(i)}"' for i in combined_ids) + "}"

            DBHelper.update_one(
                table_name=table_name,
                filters={"id": item_data.get("id")},
                updates={"tagged_ids": pg_array_str},
            )

            # Add calendar guests if applicable (for goals and todos)
            if item_type in ["goal", "todo"] and item_record.get("google_calendar_id") and tagged_members:
                try:
                    add_calendar_guests(
                        user_id=uid,
                        calendar_event_id=item_record["google_calendar_id"],
                        guest_emails=[member for member in tagged_members if "@" in member],
                    )
                except Exception as e:
                    print(f"⚠ Failed to add calendar guests: {str(e)}")

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_TAGGED_IDS",
                resource_type=item_type,
                resource_id=str(item_data.get("id")),
                success=False,
                error_message=f"Failed to update tagged_ids: {str(e)}",
                metadata={"item_data": item_data, "tagged_ids": resolved_tagged_ids},
            )


from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from typing import Dict
from datetime import datetime
import os

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")  # Make sure it's set in env

class UnifiedEmailSender:
    def __init__(self, sender_email: str = "tulasidivya.cc@gmail.com"):
        self.sender_email = sender_email

    def send_item_email(
        self,
        recipient_email: str,
        item_type: str,
        item_data: Dict,
        sender_name: str = "Someone"
    ) -> tuple[bool, str]:
        """Send email for any item type via SendGrid"""
        try:
            # Get item title
            item_title = item_data.get("title") or item_data.get("text") or item_data.get("name") or "Untitled"

            # Subject mapping
            subject_mapping = {
                "bookmark": f"Shared Bookmark: {item_title}",
                "note": f"Shared Note: {item_title}",
                "project": f"Shared Project: {item_title}",
                "goal": f"Shared Goal: {item_title}",
                "todo": f"Shared Task: {item_title}",
                "maintenance_task": f"Shared Maintenance Task: {item_title}"
            }
            subject = subject_mapping.get(item_type, f"Shared Item: {item_title}")

            # Generate content
            content = self._generate_email_content(item_type, item_data, sender_name)

            # Create SendGrid message
            message = Mail(
                from_email=self.sender_email,
                to_emails=recipient_email,
                subject=subject,
                html_content=f"<pre style='font-family:inherit'>{content}</pre>"
            )

            # Send via SendGrid
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            response = sg.send(message)

            if 200 <= response.status_code < 300:
                return True, f"Email sent successfully (Status Code: {response.status_code})"
            else:
                return False, f"Failed to send email (Status Code: {response.status_code})"

        except Exception as e:
            return False, str(e)

    def _generate_email_content(self, item_type: str, item_data: Dict, sender_name: str) -> str:
        """Generate email content based on item type (same as before)"""
        if item_type == "bookmark":
            return f"""
Hi there!

{sender_name} wanted to share this Bookmark with you:

Title: {item_data.get('title', 'Untitled')}
URL: {item_data.get('url', 'No URL')}
Sub Category: {item_data.get('category', 'No Category')}
Hub: {item_data.get('hub', 'No Hub')}

Best regards!
Dockly Team.
""".strip()

        elif item_type == "note":
            return f"""
Hi there!

{sender_name} wanted to share this note with you:

Title: {item_data.get('title', 'Untitled')}
Description: {item_data.get('description', 'No description')}
Hub: {item_data.get('hub', 'No Hub')}
Created: {item_data.get('created_at', '').split('T')[0] if item_data.get('created_at') else 'Unknown'}

Best regards!
Dockly Team.
""".strip()

        elif item_type == "project":
            return f"""
Hi there!

{sender_name} wanted to share this Project with you:

Title: {item_data.get('title', 'Untitled')}
Description: {item_data.get('description', 'No description')}
Deadline: {item_data.get('deadline') or item_data.get('due_date', 'No deadline')}
Status: {item_data.get('status', 'Unknown')}

Best regards!
Dockly Team.
""".strip()

        elif item_type == "goal":
            return f"""
Hi there!

{sender_name} wanted to share this Goal with you:

Title: {item_data.get('title', 'Untitled')}
Date: {item_data.get('date', 'No date')}
Time: {item_data.get('time', 'No time')}
Status: {'Completed' if item_data.get('completed') else 'In Progress'}

Best regards!
Dockly Team.
""".strip()

        elif item_type == "todo":
            return f"""
Hi there!

{sender_name} wanted to share this Task with you:

Title: {item_data.get('title', 'Untitled')}
Date: {item_data.get('date', 'No date')}
Time: {item_data.get('time', 'No time')}
Priority: {item_data.get('priority', 'Medium')}
Status: {'Completed' if item_data.get('completed') else 'Pending'}

Best regards!
Dockly Team.
""".strip()

        elif item_type == "maintenance_task":
            due_date = item_data.get("date") or ""
            if due_date and "T" in due_date:
                due_date = due_date.split("T")[0]
            try:
                formatted_date = datetime.strptime(due_date, "%Y-%m-%d").strftime("%B %d, %Y")
            except:
                formatted_date = due_date or "Not Set"

            priority = item_data.get("priority", "Not Set")
            priority_indicator = {
                "HIGH": "🔴 High",
                "MEDIUM": "🟡 Medium",
                "LOW": "🟢 Low"
            }.get(priority, priority)

            recurring_status = "Yes" if item_data.get("isRecurring") or item_data.get("is_recurring") else "No"
            completion_status = "Completed ✅" if item_data.get("completed") else "Pending ⏳"
            property_icon = item_data.get("propertyIcon") or item_data.get("property_icon") or "🏠"

            return f"""
Hi there!

{sender_name} wanted to share this maintenance task with you:

{property_icon} Task: {item_data.get('name') or item_data.get('title', 'Untitled')}
📅 Due Date: {formatted_date}
⚡ Priority: {priority_indicator}
🔄 Recurring: {recurring_status}
📋 Status: {completion_status}

📝 Details: 
{item_data.get('details', 'No additional details provided.')}

Best regards!
Dockly Team.
""".strip()

        else:
            return f"""
Hi there!

{sender_name} wanted to share this {item_type} with you:

Title: {item_data.get('title') or item_data.get('text') or item_data.get('name', 'Untitled')}

Best regards!
Dockly Team.
""".strip()