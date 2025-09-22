
from email.message import EmailMessage
import smtplib
import uuid
from flask import request
from flask_restful import Resource
import time

from root.db.dbHelper import DBHelper
from root.config import EMAIL_PASSWORD, EMAIL_SENDER, SMTP_PORT, SMTP_SERVER, WEB_URL
from root.helpers.logs import AuditLogger


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

            AuditLogger.log(
                user_id=uid,
                action="GET_BOOKMARKS",
                resource_type="bookmarks",
                resource_id=None,
                success=True,
                metadata={"count": len(bookmarks)},
            )

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

            # ✅ Log success
            AuditLogger.log(
                user_id=uid,
                action="GET_BOOKMARKS",
                resource_type="bookmarks",
                resource_id=None,
                success=True,
                metadata={"count": len(bookmarks), "filters": filters, "search": search, "hub": hub, "sort_by": sort_by},
            )

            return {"status": 1, "message": "Success", "payload": {"bookmarks": bookmarks}}

        except Exception as e:
            # ✅ Log failure
            AuditLogger.log(
                user_id=uid,
                action="GET_BOOKMARKS_FAILED",
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

