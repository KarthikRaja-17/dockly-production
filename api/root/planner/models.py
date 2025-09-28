# Route registrations
from datetime import date, timedelta, datetime
from email.message import EmailMessage
import json
import smtplib
from flask import request
from flask_restful import Resource
from datetime import datetime
from root.helpers.logs import AuditLogger
from .outlook import (
    create_outlook_calendar_event,
    fetch_outlook_calendar_events,
    transform_outlook_event,
)
from root.db.dbHelper import DBHelper
from root.common import GoalStatus, Priority, Status
from root.utilis import create_calendar_event, uniqueId, update_calendar_event
from root.auth.auth import auth_required
from google.oauth2.credentials import Credentials
from root.config import (
    CLIENT_ID,
    CLIENT_SECRET,
    EMAIL_PASSWORD,
    EMAIL_SENDER,
    SCOPE,
    SMTP_PORT,
    SMTP_SERVER,
    uri,
)
from googleapiclient.discovery import build
from google.auth.exceptions import GoogleAuthError
from datetime import datetime
from root.utilis import extract_datetime
from google.auth.transport.requests import Request
import requests

light_colors = [
    "#FDA098",
    "#C0DDF5",
    "#C4F6C6",
    "#FFA726",
    "#DFB2E7",
    "#FAADC6",
    "#B9FCBB",
    "#B4D3FD",
    "#F8AFAF",
    "#5C6BC0",
]

class GetPlannerDataComprehensive(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        show_dockly = request.args.get("show_dockly", "true").lower() == "true"
        filtered_emails = request.args.getlist("filtered_emails[]")
        family_group_id = request.args.get("family_group_id")  # Add this parameter

        response_data = {
            "goals": [],
            "todos": [],
            "events": [],
            "notes": [],
            "connected_accounts": [],
            "person_colors": {},
            "family_members": [],
            "filters": {
                "show_dockly": show_dockly,
                "filtered_emails": filtered_emails,
                "family_group_id": family_group_id,  # Include in response
            },
        }

        try:
            # --- Family members & user IDs ---
            family_members = self._get_family_members(
                uid, family_group_id
            )  # Pass family_group_id

            # Collect ALL user_ids across all groups
            all_user_ids = set()
            for m in family_members:
                if m.get("user_id"):
                    all_user_ids.add(m["user_id"])
                if m.get("fm_user_id"):
                    all_user_ids.add(m["fm_user_id"])

            # Always include the logged-in user
            all_user_ids.add(uid)
            all_user_ids = list(all_user_ids)

            response_data["family_members"] = family_members

            # --- Core DB fetch in one go ---
            query_results = DBHelper.find_multi_users(
                {
                    "events": {
                        "filters": {"is_active": 1},
                        "select_fields": [
                            "id",
                            "user_id",
                            "title",
                            "date",
                            "end_date",
                            "start_time",
                            "end_time",
                            "outlook_calendar_id",
                            "synced_to_google",
                            "synced_to_outlook",
                        ],
                    },
                    "connected_accounts": {
                        "filters": {"is_active": Status.ACTIVE.value},
                        "select_fields": [
                            "user_id",
                            "access_token",
                            "refresh_token",
                            "email",
                            "provider",
                            "user_object",
                        ],
                    },
                },
                all_user_ids,
            )

            # --- Dockly goals/todos/notes (skip if disabled) ---
            goals, todos, all_notes = [], [], []
            if show_dockly:
                # Fetch weekly goals with tagged_ids logic
                goals = DBHelper.find_with_or_and_array_match(
                    table_name="goals",
                    select_fields=[
                        "id",
                        "user_id",
                        "goal",
                        "date",
                        "time",
                        "priority",
                        "goal_status",
                        "status",
                        "google_calendar_id",
                        "outlook_calendar_id",
                        "synced_to_google",
                        "synced_to_outlook",
                    ],
                    uid=uid,
                    array_field="tagged_ids",
                    filters={"status": Status.ACTIVE.value, "is_active": 1},
                )

                # Fetch weekly todos with tagged_ids logic
                todos = DBHelper.find_with_or_and_array_match(
                    table_name="todos",
                    select_fields=[
                        "id",
                        "user_id",
                        "text",
                        "date",
                        "completed",
                        "priority",
                        "goal_id",
                        "google_calendar_id",
                        "outlook_calendar_id",
                        "synced_to_google",
                        "synced_to_outlook",
                    ],
                    uid=uid,
                    array_field="tagged_ids",
                    filters={"is_active": 1},
                )

            # Put into query_results format for later logic
            query_results["goals"] = goals
            query_results["todos"] = todos
            query_results["notes"] = all_notes

            # --- User details (batch fetch) ---
            user_details = self._get_users_details(all_user_ids)

            # --- Populate Dockly goals/todos/notes ---
            if show_dockly:
                response_data["goals"] = goals
                response_data["todos"] = todos
                response_data["notes"] = [
                    {
                        "id": n["id"],
                        "user_id": n["user_id"],
                        "note": n["note"],
                        "timing": n["timing"].isoformat() if n["timing"] else None,
                        "members": n["members"],
                        "created_at": (
                            n["created_at"].isoformat() if n["created_at"] else None
                        ),
                    }
                    for n in all_notes
                ]

            # --- Connected accounts (Dockly + external) ---
            connected_accounts_data = query_results.get("connected_accounts", [])
            all_events, dockly_event_keys = [], set()

            if show_dockly:
                # Add Dockly pseudo-accounts for ALL family members
                for user_id in all_user_ids:
                    fm_color = next(
                        (
                            fm.get("color")
                            for fm in family_members
                            if fm.get("user_id") == user_id
                        ),
                        None,
                    )
                    user_info = user_details.get(user_id, {})
                    dockly_account = {
                        "user_id": user_id,
                        "provider": "dockly",
                        "email": user_info.get("email", f"dockly@user{user_id}.com"),
                        "color": fm_color or "#0033FF",
                        "isDockly": True,
                        "userName": user_info.get(
                            "user_name", f"Dockly User {user_id}"
                        ),
                        "displayName": user_info.get(
                            "user_name", f"Dockly User {user_id}"
                        ),
                    }
                    response_data["connected_accounts"].append(dockly_account)

            # External accounts (Google/Outlook)
            for i, cred_data in enumerate(connected_accounts_data):
                provider = cred_data.get("provider", "google").lower()
                email = cred_data.get("email")
                user_id = cred_data.get("user_id")

                fm_color = next(
                    (
                        fm.get("color")
                        for fm in family_members
                        if fm.get("user_id") == user_id
                        or (fm.get("email") or "").lower() == (email or "").lower()
                    ),
                    None,
                )
                color = fm_color or light_colors[i % len(light_colors)]
                try:
                    user_object = json.loads(cred_data.get("user_object") or "{}")
                except:
                    user_object = {}

                acc = {
                    "user_id": user_id,
                    "provider": provider,
                    "email": email,
                    "color": color,
                    "userName": user_object.get("name", email.split("@")[0]),
                    "displayName": user_object.get("name", email.split("@")[0]),
                }
                response_data["connected_accounts"].append(acc)
                response_data["person_colors"][f"{acc['userName']}_{user_id}"] = {
                    "color": color,
                    "email": email,
                    "user_id": user_id,
                }

                # Calendar events fetch (parallelization possible here)
                try:
                    if provider == "google":
                        g_events = self._fetch_google_calendar_events_for_account(
                            cred_data
                        )
                        for ev in g_events:
                            ev.update(
                                {
                                    "source_email": email,
                                    "account_color": color,
                                    "provider": provider,
                                    "user_id": user_id,
                                }
                            )
                        all_events.extend(g_events)
                    elif provider == "outlook":
                        o_events = self._fetch_outlook_calendar_events_for_account(
                            cred_data, color, email
                        )
                        for ev in o_events:
                            ev["user_id"] = user_id
                        all_events.extend(o_events)
                except Exception as e:
                    print(f"Error fetching {provider} events for {email}: {e}")

            # --- Add Dockly events (goals/todos/notes/manual) ---
            if show_dockly:
                all_events.extend(
                    self._dockly_events_from_data(
                        {
                            "goals": goals,
                            "todos": todos,
                            "notes": all_notes,
                            "events": query_results.get("events", []),
                        },
                        family_members,
                        user_details,
                    )
                )
                for e in all_events:
                    if e.get("provider") == "dockly":
                        dockly_event_keys.add(
                            (
                                e.get("source_email", "").lower().strip(),
                                e.get("summary", "").lower().strip(),
                                e.get("start", {}).get("dateTime", "").split("T")[0],
                            )
                        )

            # --- Deduplicate & filter ---
            seen, unique_events = set(), []
            for e in all_events:
                key = (
                    e.get("source_email", "").lower().strip(),
                    e.get("summary", "").lower().strip(),
                    e.get("start", {}).get("dateTime", "").split("T")[0],
                )
                if filtered_emails and e.get("source_email") not in filtered_emails:
                    continue
                if e.get("provider") == "google" and key in dockly_event_keys:
                    continue
                if key in seen:
                    continue
                seen.add(key)
                unique_events.append(e)

            response_data["events"] = unique_events

            # --- Upcoming events ---
            providers = [a.get("provider") for a in response_data["connected_accounts"]]
            if "google" in providers:
                upcoming = [
                    e
                    for e in unique_events
                    if e.get("provider") == "google" and e.get("user_id") == uid
                ]
            else:
                upcoming = (
                    [
                        e
                        for e in unique_events
                        if e.get("provider") == "dockly" and e.get("user_id") == uid
                    ]
                    if show_dockly
                    else []
                )
            response_data["upcoming_events"] = upcoming

            return {
                "status": 1,
                "message": "Planner data fetched successfully",
                "payload": response_data,
            }

        except Exception as e:
            print(f"Error in GetPlannerDataComprehensive: {e}")
            return {
                "status": 0,
                "message": "Failed to fetch planner data",
                "payload": response_data,
                "error": str(e),
            }
    # helper to generate Dockly events from goals/todos/notes/events
    def _dockly_events_from_data(self, data, family_members, user_details):
        all_events = []
        # Goals → Events
        for goal in data.get("goals", []):
            uid = goal.get("user_id")
            user_info = user_details.get(uid, {})
            all_events.append(
                {
                    "id": f"goal_{goal.get('id')}",
                    "summary": goal.get("goal"),
                    "start": {
                        "dateTime": f"{self._format_date(goal.get('date'))}T00:00:00Z"
                    },
                    "end": {
                        "dateTime": f"{self._format_date(goal.get('date'))}T23:59:59Z"
                    },
                    "type": "goal",
                    "source": "dockly",
                    "source_email": user_info.get("email", f"dockly@user{uid}.com"),
                    "provider": "dockly",
                    "account_color": next(
                        (
                            fm.get("color")
                            for fm in family_members
                            if fm.get("user_id") == uid
                        ),
                        "#0033FF",
                    ),
                    "priority": self._get_priority_text(goal.get("priority")),
                    "status": self._get_goal_status_text(goal.get("goal_status")),
                    "synced_to_google": goal.get("synced_to_google", False),
                    "synced_to_outlook": goal.get("synced_to_outlook", False),
                    "user_id": uid,
                }
            )

        # Todos → Events
        for todo in data.get("todos", []):
            uid = todo.get("user_id")
            user_info = user_details.get(uid, {})
            all_events.append(
                {
                    "id": f"todo_{todo.get('id')}",
                    "summary": todo.get("text"),
                    "start": {
                        "dateTime": f"{self._format_date(todo.get('date'))}T00:00:00Z"
                    },
                    "end": {
                        "dateTime": f"{self._format_date(todo.get('date'))}T23:59:59Z"
                    },
                    "type": "todo",
                    "source": "dockly",
                    "source_email": user_info.get("email", f"dockly@user{uid}.com"),
                    "provider": "dockly",
                    "account_color": next(
                        (
                            fm.get("color")
                            for fm in family_members
                            if fm.get("user_id") == uid
                        ),
                        "#0033FF",
                    ),
                    "priority": todo.get("priority", "medium"),
                    "completed": todo.get("completed", False),
                    "synced_to_google": todo.get("synced_to_google", False),
                    "synced_to_outlook": todo.get("synced_to_outlook", False),
                    "user_id": uid,
                }
            )

        # Notes → Events
        for note in data.get("notes", []):
            uid = note.get("user_id")
            user_info = user_details.get(uid, {})

            # derive date/times
            note_date = datetime.now().date()
            start_time, end_time = "00:00:00", "23:59:59"
            if note.get("timing"):
                try:
                    dt = datetime.fromisoformat(note["timing"].replace("Z", "+00:00"))
                    note_date = dt.date()
                    start_time = dt.strftime("%H:%M:%S")
                    end_time = (dt + timedelta(hours=1)).strftime("%H:%M:%S")
                except:
                    pass
            elif note.get("created_at"):
                try:
                    dt = datetime.fromisoformat(
                        note["created_at"].replace("Z", "+00:00")
                    )
                    note_date = dt.date()
                    start_time = dt.strftime("%H:%M:%S")
                    end_time = (dt + timedelta(hours=1)).strftime("%H:%M:%S")
                except:
                    pass

            date_str = self._format_date(note_date)
            all_events.append(
                {
                    "id": f"note_{note.get('id')}",
                    "summary": note.get("note"),
                    "start": {"dateTime": f"{date_str}T{start_time}Z"},
                    "end": {"dateTime": f"{date_str}T{end_time}Z"},
                    "type": "note",
                    "source": "dockly",
                    "source_email": user_info.get("email", f"dockly@user{uid}.com"),
                    "provider": "dockly",
                    "account_color": next(
                        (
                            fm.get("color")
                            for fm in family_members
                            if fm.get("user_id") == uid
                        ),
                        "#0033FF",
                    ),
                    "members": note.get("members"),
                    "created_at": self._serialize_datetime(note.get("created_at")),
                    "timing": self._serialize_datetime(note.get("timing")),
                    "user_id": uid,
                }
            )

        # Manual Events
        for ev in data.get("events", []):
            uid = ev.get("user_id")
            user_info = user_details.get(uid, {})
            start_date = self._format_date(ev.get("date"))
            end_date = self._format_date(ev.get("end_date") or ev.get("date"))

            # adjust if all-day
            if ev.get("start_time") == "12:00 AM" and ev.get("end_time") in [
                "11:59 PM",
                "11:59:59 PM",
            ]:
                try:
                    end_date_obj = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(
                        days=1
                    )
                    end_date = end_date_obj.strftime("%Y-%m-%d")
                except:
                    pass

            all_events.append(
                {
                    "id": f"event_{ev.get('id')}",
                    "summary": ev.get("title"),
                    "start": {
                        "dateTime": f"{start_date}T{self._normalize_time(ev.get('start_time'),'09:00:00')}"
                    },
                    "end": {
                        "dateTime": f"{end_date}T{self._normalize_time(ev.get('end_time'),'10:00:00')}"
                    },
                    "type": "event",
                    "source": "dockly",
                    "source_email": user_info.get("email", f"dockly@user{uid}.com"),
                    "provider": "dockly",
                    "account_color": next(
                        (
                            fm.get("color")
                            for fm in family_members
                            if fm.get("user_id") == uid
                        ),
                        "#0033FF",
                    ),
                    "synced_to_google": ev.get("synced_to_google", False),
                    "synced_to_outlook": ev.get("synced_to_outlook", False),
                    "user_id": uid,
                }
            )

        return all_events

    def _get_family_members(self, user_id, family_group_id=None):
        """Get family members filtered by family group ID if provided."""
        try:
            if family_group_id:
                # If family_group_id is specified, get members from that specific group
                members = DBHelper.find_all(
                    table_name="family_members",
                    select_fields=[
                        "fm_user_id",
                        "user_id",
                        "email",
                        "name",
                        "relationship",
                        "color",
                        "family_group_id",
                    ],
                    filters={"family_group_id": family_group_id},
                )

                # Format the response
                unique_members = []
                seen = set()

                for m in members:
                    fm_uid = m.get("fm_user_id") or m.get("user_id")
                    if not fm_uid or fm_uid in seen:
                        continue

                    seen.add(fm_uid)
                    unique_members.append(
                        {
                            "user_id": fm_uid,
                            "email": m.get("email"),
                            "name": m.get("name"),
                            "relationship": (
                                "me" if fm_uid == user_id else m.get("relationship")
                            ),
                            "color": m.get("color") or "#0033FF",
                            "family_group_id": m.get("family_group_id"),
                        }
                    )

                return unique_members
            else:
                # Original logic for when no family_group_id is specified
                # Step 1: Get all family group IDs where this user is a member
                user_groups = DBHelper.find_all(
                    table_name="family_members",
                    select_fields=["family_group_id"],
                    filters={"fm_user_id": user_id},
                )

                group_ids = list(
                    set(
                        [
                            g["family_group_id"]
                            for g in user_groups
                            if g.get("family_group_id")
                        ]
                    )
                )

                if not group_ids:
                    # No family groups — return just the current user
                    user = DBHelper.find_one(
                        table_name="users",
                        filters={"uid": user_id},
                        select_fields=["uid", "email", "user_name"],
                    )
                    return [
                        {
                            "user_id": user_id,
                            "email": user.get("email"),
                            "name": user.get("user_name"),
                            "relationship": "me",
                            "color": "#FFD1DC",
                        }
                    ]

                # Step 2: Get all members from these family groups
                all_members = []
                for gid in group_ids:
                    members = DBHelper.find_all(
                        table_name="family_members",
                        select_fields=[
                            "fm_user_id",
                            "user_id",
                            "email",
                            "name",
                            "relationship",
                            "color",
                            "family_group_id",
                        ],
                        filters={"family_group_id": gid},
                    )
                    all_members.extend(members)

                # Step 3: Deduplicate by fm_user_id / user_id
                seen = set()
                unique_members = []
                for m in all_members:
                    fm_uid = m.get("fm_user_id") or m.get("user_id")
                    if not fm_uid:
                        continue
                    if fm_uid not in seen:
                        seen.add(fm_uid)
                        unique_members.append(
                            {
                                "user_id": fm_uid,
                                "email": m.get("email"),
                                "name": m.get("name"),
                                "relationship": (
                                    "me" if fm_uid == user_id else m.get("relationship")
                                ),
                                "color": m.get("color") or "#0033FF",
                                "family_group_id": m.get("family_group_id"),
                            }
                        )

                return unique_members

        except Exception as e:
            print(f"Error fetching family members (multi-group): {e}")
            return []

    from datetime import datetime

    def _serialize_datetime(self, dt):
        """Safely serialize datetime objects to ISO format strings"""
        if dt is None:
            return None
        if isinstance(dt, datetime):
            return dt.isoformat()
        if isinstance(dt, str):
            return dt  # Already a string
        return str(dt)

    def _get_users_details(self, user_ids):
        """Get user details for multiple users"""
        try:
            if not user_ids:
                return {}

            users = DBHelper.find_in(
                "users",
                select_fields=["uid", "email", "user_name"],
                field="uid",
                values=user_ids,
            )

            return {user["uid"]: user for user in users}
        except Exception as e:
            print(f"Error fetching user details: {e}")
            return {}

    def _fetch_outlook_calendar_events_for_account(self, cred_data, color, email):
        """Fetch Outlook Calendar events for a specific account"""
        try:
            access_token = cred_data.get("access_token")
            raw_events = fetch_outlook_calendar_events(access_token)

            transformed_events = []
            for event in raw_events:
                transformed = transform_outlook_event(event, color, email)
                if transformed:
                    transformed_events.append(transformed)

            return transformed_events
        except Exception as e:
            print(f"Error fetching Outlook Calendar events: {e}")
            return []

    def _fetch_google_calendar_events_for_account(self, cred_data):
        """Fetch Google Calendar events for a specific account, refreshing token if needed"""
        try:
            creds = Credentials(
                token=cred_data["access_token"],
                refresh_token=cred_data["refresh_token"],
                token_uri="https://oauth2.googleapis.com/token",
                client_id=CLIENT_ID,
                client_secret=CLIENT_SECRET,
                scopes=SCOPE.split(),
            )

            # If token is expired, refresh it
            if not creds.valid or creds.expired:
                if creds.refresh_token:
                    creds.refresh(Request())

                    # Save updated token & expiry to DB
                    DBHelper.update(
                        "connected_accounts",
                        filters={"user_id": cred_data["user_id"], "provider": "google"},
                        update_fields={
                            "access_token": creds.token,
                            "token_expiry": creds.expiry,
                        },
                    )
                else:
                    print(f"No refresh token available for {cred_data.get('email')}")
                    return []

            service = build("calendar", "v3", credentials=creds, cache_discovery=False)
            time_min = (datetime.utcnow() - timedelta(days=7)).isoformat() + "Z"

            events_result = (
                service.events()
                .list(
                    calendarId="primary",
                    timeMin=time_min,
                    maxResults=100,
                    singleEvents=True,
                    orderBy="startTime",
                )
                .execute()
            )

            events = events_result.get("items", [])

            # Tag events with the account info for filtering
            for event in events:
                event["source_email"] = cred_data.get("email")
                event["provider"] = "google"
            return events

        except Exception as e:
            print(
                f"Error fetching Google Calendar events for {cred_data.get('email')}: {e}"
            )
            return []

    def _format_date(self, date_obj):
        """Helper method to format date objects"""
        if isinstance(date_obj, (datetime, date)):
            return date_obj.strftime("%Y-%m-%d")
        elif isinstance(date_obj, str):
            try:
                parsed_date = datetime.strptime(date_obj, "%Y-%m-%d")
                return parsed_date.strftime("%Y-%m-%d")
            except:
                return date_obj
        return str(date_obj) if date_obj else ""

    def _get_goal_status_text(self, status_value):
        """Convert goal status enum to text"""
        status_map = {0: "Yet to Start", 1: "In Progress", 2: "Completed"}
        return status_map.get(status_value, "Yet to Start")

    def _get_priority_text(self, priority_value):
        """Convert priority enum to text"""
        priority_map = {0: "low", 1: "medium", 2: "high"}
        return priority_map.get(priority_value, "low")

    def _normalize_time(self, time_str, fallback=None):
        if not time_str:
            return fallback
        try:
            parsed = datetime.strptime(time_str.strip(), "%I:%M %p")
            return parsed.strftime("%H:%M:%S")
        except:
            try:
                parsed = datetime.strptime(time_str.strip(), "%H:%M:%S")
                return parsed.strftime("%H:%M:%S")
            except:
                try:
                    parsed = datetime.strptime(time_str.strip(), "%H:%M")
                    return parsed.strftime("%H:%M:%S")
                except:
                    return fallback

class AddWeeklyGoals(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True) or {}
        goal_id = uniqueId(digit=15, isNum=True)

        try:
            # Extract flags
            sync_to_google = data.get("sync_to_google", True)
            sync_to_outlook = data.get("sync_to_outlook", True)

            # Compute goal date (default: current week's Saturday)
            goal_date = data.get("date")
            if not goal_date:
                today = datetime.today()
                days_until_saturday = (5 - today.weekday()) % 7  # always 0–6 range
                goal_date = (today + timedelta(days=days_until_saturday)).strftime("%Y-%m-%d")

            # Default time = now
            goal_time = data.get("time", datetime.now().strftime("%I:%M %p"))

            # Build goal object
            goal = {
                "id": goal_id,
                "user_id": uid,
                "goal": data.get("goal", ""),
                "date": goal_date,
                "time": goal_time,
                "priority": Priority.LOW.value,
                "goal_status": GoalStatus.YET_TO_START.value,
                "status": Status.ACTIVE.value,
                "google_calendar_id": None,
                "outlook_calendar_id": None,
                "synced_to_google": False,
                "synced_to_outlook": False,
            }

            # Calendar sync
            start_dt = datetime.strptime(goal_date, "%Y-%m-%d")
            end_dt = start_dt + timedelta(days=1)

            def log_failure(provider, error):
                AuditLogger.log(
                    user_id=uid,
                    action="add_weekly_goal",
                    resource_type="goal",
                    resource_id=str(goal_id),
                    success=False,
                    error_message=f"Failed to sync goal to {provider} Calendar",
                    metadata={"input": data, "error": str(error)},
                )

            # Google Calendar sync
            if sync_to_google:
                try:
                    event_id = create_calendar_event(uid, goal["goal"], start_dt, end_dt)
                    goal.update({"google_calendar_id": event_id, "synced_to_google": True})
                except Exception as e:
                    log_failure("Google", e)

            # Outlook Calendar sync
            if sync_to_outlook:
                try:
                    outlook_account = DBHelper.find_one(
                        "connected_accounts",
                        filters={"user_id": uid, "provider": "outlook", "is_active": 1},
                        select_fields=["access_token"],
                    )
                    if outlook_account:
                        event_id = create_outlook_calendar_event(
                            outlook_account["access_token"], goal["goal"], start_dt, end_dt
                        )
                        goal.update({"outlook_calendar_id": event_id, "synced_to_outlook": True})
                except Exception as e:
                    log_failure("Outlook", e)

            # Store in DB
            DBHelper.insert("goals", return_column="id", **goal)

            # Success log
            AuditLogger.log(
                user_id=uid,
                action="add_weekly_goal",
                resource_type="goal",
                resource_id=str(goal_id),
                success=True,
                metadata={"input": data, "goal": goal},
            )

            return {"status": 1, "message": "Weekly Goal Added Successfully", "payload": goal}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="add_weekly_goal",
                resource_type="goal",
                resource_id=str(goal_id),
                success=False,
                error_message="Failed to add weekly goal",
                metadata={"input": data, "error": str(e)},
            )
            return {"status": 0, "message": "Failed to add weekly goal"}

class UpdateWeeklyGoals(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        data = request.get_json(silent=True) or {}
        goal_id = data.get("id")

        try:
            if not goal_id:
                AuditLogger.log(
                    user_id=uid,
                    action="update_weekly_goal",
                    resource_type="goal",
                    resource_id="unknown",
                    success=False,
                    error_message="Goal ID is required",
                    metadata={"input": data},
                )
                return {"status": 0, "message": "Goal ID is required", "payload": {}}

            # Fetch existing goal (for sync checks)
            existing_goal = DBHelper.find_one(
                "goals",
                filters={"id": goal_id, "user_id": uid},
                select_fields=["google_calendar_id", "synced_to_google"],
            )

            # Prepare updates
            updates = {
                "goal": data.get("goal", ""),
                "date": data.get("date", ""),
                "time": data.get("time", ""),
                "synced_to_google": data.get("sync_to_google", True),
            }

            # Validate date
            try:
                start_dt = datetime.strptime(updates["date"], "%Y-%m-%d")
                end_dt = start_dt + timedelta(days=1)
            except ValueError:
                AuditLogger.log(
                    user_id=uid,
                    action="update_weekly_goal",
                    resource_type="goal",
                    resource_id=str(goal_id),
                    success=False,
                    error_message="Invalid date format",
                    metadata={"input": data},
                )
                return {"status": 0, "message": "Invalid date format", "payload": {}}

            # --- Google Calendar Sync ---
            if updates["synced_to_google"]:
                try:
                    if existing_goal and existing_goal.get("google_calendar_id"):
                        # Update existing event
                        update_calendar_event(
                            uid,
                            existing_goal["google_calendar_id"],
                            updates["goal"],
                            start_dt,
                            end_dt,
                        )
                    else:
                        # Create new event
                        google_event_id = create_calendar_event(
                            uid, updates["goal"], start_dt, end_dt
                        )
                        updates["google_calendar_id"] = google_event_id
                except Exception as e:
                    updates["synced_to_google"] = False
                    AuditLogger.log(
                        user_id=uid,
                        action="update_weekly_goal",
                        resource_type="goal",
                        resource_id=str(goal_id),
                        success=False,
                        error_message="Failed to sync goal update to Google Calendar",
                        metadata={"input": data, "error": str(e)},
                    )

            # --- Save Updates ---
            DBHelper.update_one(
                table_name="goals",
                filters={"id": goal_id, "user_id": uid},
                updates=updates,
            )

            # --- Success Log ---
            AuditLogger.log(
                user_id=uid,
                action="update_weekly_goal",
                resource_type="goal",
                resource_id=str(goal_id),
                success=True,
                metadata={"input": data, "updates": updates},
            )

            return {
                "status": 1,
                "message": "Weekly Goal Updated Successfully",
                "payload": updates,
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="update_weekly_goal",
                resource_type="goal",
                resource_id=str(goal_id) if goal_id else "unknown",
                success=False,
                error_message="Failed to update weekly goal",
                metadata={"input": data, "error": str(e)},
            )
            return {"status": 0, "message": "Failed to update weekly goal"}

class AddWeeklyTodos(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True) or {}
        todo_id = uniqueId(digit=15, isNum=True)

        try:
            # Flags
            sync_to_google = data.get("sync_to_google", True)
            sync_to_outlook = data.get("sync_to_outlook", True)

            # Compute todo date (default: current week's Saturday)
            todo_date = data.get("date")
            if not todo_date:
                today = datetime.today()
                days_until_saturday = (5 - today.weekday()) % 7
                todo_date = (today + timedelta(days=days_until_saturday)).strftime("%Y-%m-%d")

            todo_time = data.get("time", datetime.now().strftime("%I:%M %p"))

            # Build todo object
            todo = {
                "id": todo_id,
                "user_id": uid,
                "text": data.get("text", ""),
                "date": todo_date,
                "time": todo_time,
                "priority": data.get("priority", "medium"),
                "completed": False,
                "goal_id": data.get("goal_id"),
                "google_calendar_id": None,
                "outlook_calendar_id": None,
                "synced_to_google": False,
                "synced_to_outlook": False,
            }

            # Calendar datetime
            start_dt = datetime.strptime(todo_date, "%Y-%m-%d")
            end_dt = start_dt + timedelta(days=1)

            def log_failure(provider, error):
                AuditLogger.log(
                    user_id=uid,
                    action="add_weekly_todo",
                    resource_type="todo",
                    resource_id=str(todo_id),
                    success=False,
                    error_message=f"Failed to sync todo to {provider} Calendar",
                    metadata={"input": data, "error": str(error)},
                )

            # Google sync
            if sync_to_google:
                try:
                    event_id = create_calendar_event(uid, todo["text"], start_dt, end_dt)
                    todo.update({"google_calendar_id": event_id, "synced_to_google": True})
                except Exception as e:
                    log_failure("Google", e)

            # Outlook sync
            if sync_to_outlook:
                try:
                    outlook_account = DBHelper.find_one(
                        "connected_accounts",
                        filters={"user_id": uid, "provider": "outlook", "is_active": 1},
                        select_fields=["access_token"],
                    )
                    if outlook_account:
                        event_id = create_outlook_calendar_event(
                            outlook_account["access_token"], todo["text"], start_dt, end_dt
                        )
                        todo.update({"outlook_calendar_id": event_id, "synced_to_outlook": True})
                except Exception as e:
                    log_failure("Outlook", e)

            # Store in DB
            DBHelper.insert("todos", return_column="id", **todo)

            # Success log
            AuditLogger.log(
                user_id=uid,
                action="add_weekly_todo",
                resource_type="todo",
                resource_id=str(todo_id),
                success=True,
                metadata={"input": data, "todo": todo},
            )

            return {"status": 1, "message": "Weekly Todo Added Successfully", "payload": todo}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="add_weekly_todo",
                resource_type="todo",
                resource_id=str(todo_id),
                success=False,
                error_message="Failed to add weekly todo",
                metadata={"input": data, "error": str(e)},
            )
            return {"status": 0, "message": "Failed to add weekly todo"}

class UpdateWeeklyTodos(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        data = request.get_json(silent=True) or {}
        todo_id = data.get("id")

        try:
            if not todo_id:
                AuditLogger.log(
                    user_id=uid,
                    action="update_weekly_todo",
                    resource_type="todo",
                    resource_id="unknown",
                    success=False,
                    error_message="Todo ID is required",
                    metadata={"input": data},
                )
                return {"status": 0, "message": "Todo ID is required", "payload": {}}

            # Fetch existing todo (for sync checks)
            existing_todo = DBHelper.find_one(
                "todos",
                filters={"id": todo_id, "user_id": uid},
                select_fields=["google_calendar_id", "synced_to_google"],
            )

            # Prepare update fields
            updates = {
                "text": data.get("text", ""),
                "date": data.get("date", ""),
                "time": data.get("time", ""),
                "priority": data.get("priority", "medium"),
                "goal_id": data.get("goal_id"),
                "synced_to_google": data.get("sync_to_google", True),
            }

            if "completed" in data:
                updates["completed"] = str(data.get("completed")).lower() == "true"

            # Validate date
            try:
                start_dt = datetime.strptime(updates["date"], "%Y-%m-%d")
                end_dt = start_dt + timedelta(days=1)
            except ValueError:
                AuditLogger.log(
                    user_id=uid,
                    action="update_weekly_todo",
                    resource_type="todo",
                    resource_id=str(todo_id),
                    success=False,
                    error_message="Invalid date format",
                    metadata={"input": data},
                )
                return {"status": 0, "message": "Invalid date format", "payload": {}}

            # --- Google Calendar Sync ---
            if updates["synced_to_google"]:
                try:
                    if existing_todo and existing_todo.get("google_calendar_id"):
                        update_calendar_event(
                            uid,
                            existing_todo["google_calendar_id"],
                            updates["text"],
                            start_dt,
                            end_dt,
                        )
                    else:
                        google_event_id = create_calendar_event(
                            uid, updates["text"], start_dt, end_dt
                        )
                        updates["google_calendar_id"] = google_event_id
                except Exception as e:
                    updates["synced_to_google"] = False
                    AuditLogger.log(
                        user_id=uid,
                        action="update_weekly_todo",
                        resource_type="todo",
                        resource_id=str(todo_id),
                        success=False,
                        error_message="Failed to sync todo update to Google Calendar",
                        metadata={"input": data, "error": str(e)},
                    )

            # --- Save Updates ---
            DBHelper.update_one(
                table_name="todos",
                filters={"id": todo_id, "user_id": uid},
                updates=updates,
            )

            # --- Success Log ---
            AuditLogger.log(
                user_id=uid,
                action="update_weekly_todo",
                resource_type="todo",
                resource_id=str(todo_id),
                success=True,
                metadata={"input": data, "updates": updates},
            )

            return {
                "status": 1,
                "message": "Weekly Todo Updated Successfully",
                "payload": updates,
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="update_weekly_todo",
                resource_type="todo",
                resource_id=str(todo_id) if todo_id else "unknown",
                success=False,
                error_message="Failed to update weekly todo",
                metadata={"input": data, "error": str(e)},
            )
            return {"status": 0, "message": "Failed to update weekly todo"}

# Enhanced GetCalendarEvents to include proper account filtering
class GetCalendarEvents(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            # Get filter parameters
            show_dockly = request.args.get("show_dockly", "true").lower() == "true"
            show_google = request.args.get("show_google", "true").lower() == "true"

            selectFields = [
                "access_token",
                "refresh_token",
                "email",
                "provider",
                "user_object",
            ]
            allCreds = DBHelper.find(
                "connected_accounts",
                filters={"user_id": uid, "is_active": Status.ACTIVE.value},
                select_fields=selectFields,
            )

            merged_events = []
            connected_accounts = []
            account_colors = {}
            usersObjects = []
            errors = []

            # Add Dockly as a virtual account if enabled
            if show_dockly:
                connected_accounts.append(
                    {
                        "provider": "dockly",
                        "email": user.get("email", "dockly@user.com"),
                        "color": "#0033FF",
                        "userName": user.get("user_name", "Dockly User"),
                        "displayName": user.get("user_name", "Dockly User"),
                    }
                )
                account_colors["dockly:dockly@user.com"] = "#0033FF"

            # Process Google Calendar accounts only if show_google is True
            if show_google and allCreds:
                for i, credData in enumerate(allCreds):
                    provider = credData.get("provider", "google").lower()
                    access_token = credData.get("access_token")
                    refresh_token = credData.get("refresh_token")
                    email = credData.get("email")
                    color = light_colors[i % len(light_colors)]
                    userObject = credData.get("user_object")

                    try:
                        userObjectData = json.loads(userObject) if userObject else {}
                    except:
                        userObjectData = {}

                    usersObjects.append(userObjectData)

                    try:
                        events = []
                        if provider == "google":
                            creds = Credentials(
                                token=access_token,
                                refresh_token=refresh_token,
                                token_uri=uri,
                                client_id=CLIENT_ID,
                                client_secret=CLIENT_SECRET,
                                scopes=SCOPE.split(),
                            )

                            service = build("calendar", "v3", credentials=creds)

                            # Get events from the past week to future
                            time_min = (
                                datetime.utcnow() - timedelta(days=7)
                            ).isoformat() + "Z"

                            events_result = (
                                service.events()
                                .list(
                                    calendarId="primary",
                                    timeMin=time_min,
                                    maxResults=100,
                                    singleEvents=True,
                                    orderBy="startTime",
                                )
                                .execute()
                            )

                            events = events_result.get("items", [])

                        # Mark event source
                        for ev in events:
                            ev["source_email"] = email
                            ev["provider"] = provider
                            ev["account_color"] = color

                        merged_events.extend(events)

                        # Add to connected accounts
                        connected_accounts.append(
                            {
                                "provider": provider,
                                "email": email,
                                "color": color,
                                "userName": userObjectData.get("name", email.split("@")[0]),
                                "displayName": userObjectData.get(
                                    "name", email.split("@")[0]
                                ),
                            }
                        )

                        account_colors[f"{provider}:{email}"] = color

                    except Exception as e:
                        print(f"Error fetching events for {email}: {str(e)}")
                        errors.append(
                            {"email": email, "provider": provider, "error": str(e)}
                        )
                        AuditLogger.log(
                            user_id=uid,
                            action="get_calendar_events",
                            resource_type="calendar_events",
                            resource_id=email,
                            success=False,
                            error_message=f"Failed to fetch events for {email}",
                            metadata={"email": email, "provider": provider, "error": str(e)},
                        )

            # Sort merged events
            merged_events.sort(key=lambda e: e.get("start", {}).get("dateTime", ""))

            return {
                "status": 1,
                "message": "Calendar events fetched successfully",
                "payload": {
                    "events": merged_events,
                    "connected_accounts": connected_accounts,
                    "account_colors": account_colors,
                    "usersObjects": usersObjects,
                    "errors": errors,
                    "filters": {
                        "show_dockly": show_dockly,
                        "show_google": show_google,
                    },
                },
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="get_calendar_events",
                resource_type="calendar_events",
                resource_id="multiple",
                success=False,
                error_message="Failed to fetch calendar events",
                metadata={"error": str(e)},
            )
            return {"status": 0, "message": "Failed to fetch calendar events"}

class AddSmartNote(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = None
        
        try:
            inputData = request.get_json(silent=True)
            full_text = inputData.get("note", "").strip()
            members = inputData.get("members", "")
            uid = inputData.get("userId", "")
            frontend_timing = inputData.get("timing")
            source = inputData.get("source", "planner")
            email = inputData.get("email", "")

            if not uid:
                AuditLogger.log(
                    user_id=uid,
                    action="ADD_SMART_NOTE",
                    resource_type="smart_note",
                    resource_id="unknown",
                    success=False,
                    error_message="Missing userId",
                    metadata={"input": inputData if inputData else {}},
                )
                return {"status": 0, "message": "Missing userId"}, 400

            # Extract datetime
            if frontend_timing:
                try:
                    parsed_datetime = datetime.fromisoformat(frontend_timing)
                except Exception as e:
                    print("Invalid frontend timing:", e)
                    parsed_datetime = extract_datetime(full_text)
            else:
                parsed_datetime = extract_datetime(full_text)

            # If no email provided, try to resolve from family_members
            if members and not email:
                try:
                    family_member = DBHelper.find_one(
                        "family_members", filters={"user_id": uid, "name": members}
                    )
                    if family_member and family_member.get("email"):
                        email = family_member["email"]
                except Exception as e:
                    print(f"Failed to resolve email for {members}:", e)

            # Detect Goal or Task by prefix
            if full_text.lower().startswith("g "):
                # It's a Goal
                goal_text = full_text[2:].strip()
                goal_date = parsed_datetime.strftime("%Y-%m-%d")
                goal_time = parsed_datetime.strftime("%I:%M %p")

                google_event_id = None
                try:
                    # Create Google Calendar event and get event ID
                    google_event_id = create_calendar_event(
                        uid,
                        goal_text,
                        parsed_datetime,
                        parsed_datetime + timedelta(hours=1),
                    )
                except Exception as e:
                    print("Failed to create Google Calendar event for goal:", e)

                try:
                    DBHelper.insert(
                        "goals",
                        id=uniqueId(digit=15, isNum=True),
                        user_id=uid,
                        goal=goal_text,
                        date=goal_date,
                        time=goal_time,
                        priority=Priority.LOW.value,
                        goal_status=GoalStatus.YET_TO_START.value,
                        status=Status.ACTIVE.value,
                        google_calendar_id=google_event_id,
                        outlook_calendar_id=None,
                        synced_to_google=bool(google_event_id),
                        synced_to_outlook=False,
                    )
                except Exception as e:
                    print("Failed to add goal:", e)

            elif full_text.lower().startswith("t "):
                # It's a Task
                todo_text = full_text[2:].strip()
                todo_date = parsed_datetime.strftime("%Y-%m-%d")
                todo_time = parsed_datetime.strftime("%I:%M %p")

                google_event_id = None
                try:
                    # Create Google Calendar event and get event ID
                    google_event_id = create_calendar_event(
                        uid,
                        todo_text,
                        parsed_datetime,
                        parsed_datetime + timedelta(hours=1),
                    )
                except Exception as e:
                    print("Failed to create Google Calendar event for todo:", e)

                try:
                    DBHelper.insert(
                        "todos",
                        id=uniqueId(digit=15, isNum=True),
                        user_id=uid,
                        text=todo_text,
                        date=todo_date,
                        time=todo_time,
                        priority="medium",
                        completed=False,
                        goal_id=None,
                        google_calendar_id=google_event_id,
                        outlook_calendar_id=None,
                        synced_to_google=bool(google_event_id),
                        synced_to_outlook=False,
                    )
                except Exception as e:
                    print("Failed to add todo:", e)

            else:
                # Normal Smart Note flow
                DBHelper.insert(
                    "smartnotes",
                    user_id=uid,
                    note=full_text,
                    timing=parsed_datetime,
                    members=members,
                    source=source,
                )

                try:
                    create_calendar_event(
                        user_id=uid,
                        title=full_text,
                        start_dt=parsed_datetime,
                    )
                except Exception as e:
                    print("Failed to create calendar event:", e)

                if email:
                    try:
                        send_mention_email(
                            email=email,
                            full_text=full_text,
                            mentioned_by=user.get("user_name") or "a Dockly user",
                        )
                    except Exception as e:
                        print("Failed to send mention email:", e)

            AuditLogger.log(
                user_id=uid,
                action="ADD_SMART_NOTE",
                resource_type="smart_note",
                resource_id="new",
                success=True,
                metadata={"input": inputData if inputData else {}, "parsed_timing": parsed_datetime.isoformat()},
            )

            return {
                "status": 1,
                "message": "Entry Added Successfully",
                "payload": {
                    "parsedTiming": parsed_datetime.isoformat(),
                },
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="add_smart_note",
                resource_type="smart_note",
                resource_id="unknown",
                success=False,
                error_message="Failed to add smart note",
                metadata={"input": inputData if inputData else {}, "error": str(e)},
            )
            return {"status": 0, "message": "Failed to add smart note"}


def send_mention_email(email, full_text, mentioned_by):
    try:
        msg = EmailMessage()
        msg["Subject"] = "You were mentioned on Dockly"
        msg["From"] = EMAIL_SENDER
        msg["To"] = email

        message_body = f"""
Hi there,

You were mentioned by *{mentioned_by}* in a Smart Note.

Note Content:
"{full_text}"

Kindly check Dockly for more details.

Best regards,  
Dockly Team
        """.strip()

        msg.set_content(message_body)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)

        return {"status": 1, "email": email}
    except Exception as e:
        return {"status": 0, "email": email, "error": str(e)}


class GetSmartNotes(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            source = request.args.get("source")
            filters = {"user_id": uid}
            if source:
                filters["source"] = source

            notes = DBHelper.find_all(
                table_name="smartnotes",
                filters=filters,
                select_fields=["id", "note", "timing", "members", "created_at"],
            )

            user_notes = []
            for note in notes:
                user_notes.append(
                    {
                        "id": note["id"],
                        "note": note["note"],
                        "timing": note["timing"].isoformat() if note["timing"] else None,
                        "members": note["members"],
                        "created_at": (
                            note["created_at"].isoformat() if note["created_at"] else None
                        ),
                    }
                )

            return {
                "status": 1,
                "message": "Smart Notes fetched successfully",
                "payload": {"notes": user_notes},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="GET_SMART_NOTES",
                resource_type="smart_note",
                resource_id="multiple",
                success=False,
                error_message="Failed to fetch smart notes",
                metadata={"error": str(e)},
            )
            return {"status": 0, "message": "Failed to fetch smart notes"}


def add_calendar_guests(user_id, calendar_event_id, guest_emails):
    """
    Adds new guests to an existing Google Calendar event.

    user_id: ID of the goal creator (the owner of the event)
    calendar_event_id: google_calendar_id stored in your DB
    guest_emails: list of email addresses to add as guests
    """
    try:
        if not guest_emails:
            return None

        # 1. Get creator's connected account credentials
        user_cred = DBHelper.find_one(
            "connected_accounts",
            filters={"user_id": user_id},
            select_fields=["access_token", "refresh_token", "email"],
        )
        if not user_cred:
            raise Exception("No connected Google account found.")

        creds = Credentials(
            token=user_cred["access_token"],
            refresh_token=user_cred["refresh_token"],
            token_uri=uri,
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET,
            scopes=SCOPE.split(),
        )

        service = build("calendar", "v3", credentials=creds)

        # 2. Fetch the existing event
        event = (
            service.events().get(calendarId="primary", eventId=calendar_event_id).execute()
        )

        # 3. Merge current attendees with new guests (avoid duplicates)
        existing_attendees = event.get("attendees", [])
        for email in guest_emails:
            if not any(att.get("email") == email for att in existing_attendees):
                existing_attendees.append({"email": email})

        event["attendees"] = existing_attendees

        # Keep guest permissions consistent
        event["guestsCanModify"] = True
        event["guestsCanInviteOthers"] = True
        event["guestsCanSeeOtherGuests"] = True

        # 4. Update the event with sendUpdates='all'
        updated_event = (
            service.events()
            .update(
                calendarId="primary",
                eventId=calendar_event_id,
                body=event,
                sendUpdates="all",
            )
            .execute()
        )

        return updated_event.get("id")
        
    except Exception as e:
        AuditLogger.log(
            user_id=user_id,
            action="add_calendar_guests",
            resource_type="calendar_event",
            resource_id=calendar_event_id,
            success=False,
            error_message="Failed to add calendar guests",
            metadata={"guest_emails": guest_emails, "error": str(e)},
        )
        raise e

class ShareGoal(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = None
        
        try:
            try:
                data = request.get_json(force=True)
            except Exception as e:
                AuditLogger.log(
                    user_id=uid,
                    action="SHARE_GOAL",
                    resource_type="goal",
                    resource_id="unknown",
                    success=False,
                    error_message=f"Invalid JSON: {str(e)}",
                    metadata={},
                )
                return {"status": 0, "message": f"Invalid JSON: {str(e)}"}, 400

            emails = data.get("email")
            goal = data.get("goal")
            tagged_members = data.get("tagged_members", [])

            if not emails or not goal:
                AuditLogger.log(
                    user_id=uid,
                    action="SHARE_GOAL",
                    resource_type="goal",
                    resource_id="unknown",
                    success=False,
                    error_message="Both 'email' and 'goal' are required",
                    metadata={"input": data if data else {}},
                )
                return {
                    "status": 0,
                    "message": "Both 'email' and 'goal' are required.",
                }, 422

            # Normalize email array
            if isinstance(emails, str):
                emails = [emails]

            email_sender = EmailSender()
            failures = []
            notifications_created = []
            resolved_tagged_ids = []

            # 🧠 Resolve tagged user UIDs from emails
            for member_email in tagged_members:
                family_member = DBHelper.find_one(
                    "family_members",
                    filters={"email": member_email},
                    select_fields=["fm_user_id"],
                )
                if family_member and family_member["fm_user_id"]:
                    resolved_tagged_ids.append(family_member["fm_user_id"])

            # 📧 Send emails
            for email in emails:
                success, msg = email_sender.send_goal_email(email, goal)
                if not success:
                    failures.append((email, msg))

            # 🔔 Create notifications
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
                    "message": f"{user['user_name']} tagged a goal '{goal.get('title', 'Untitled')}' with you",
                    "task_type": "tagged",
                    "action_required": False,
                    "status": "unread",
                    "hub": None,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "metadata": {
                        "goal": goal,
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

            # 📝 Update tagged_ids in DB
            if resolved_tagged_ids:
                goal_record = DBHelper.find_one("goals", filters={"id": goal.get("id")})
                if not goal_record:
                    AuditLogger.log(
                        user_id=uid,
                        action="share_goal",
                        resource_type="goal",
                        resource_id=str(goal.get("id")),
                        success=False,
                        error_message="Goal not found. Cannot tag members.",
                        metadata={"input": data if data else {}},
                    )
                    return {
                        "status": 0,
                        "message": "Goal not found. Cannot tag members.",
                    }, 404

                existing_ids = goal_record.get("tagged_ids") or []
                combined_ids = list(set(existing_ids + resolved_tagged_ids))
                pg_array_str = "{" + ",".join(f'"{str(i)}"' for i in combined_ids) + "}"

                DBHelper.update_one(
                    table_name="goals",
                    filters={"id": goal.get("id")},
                    updates={"tagged_ids": pg_array_str},
                )

                # ✅ Add tagged members as Google Calendar guests
                if goal_record.get("google_calendar_id"):
                    try:
                        add_calendar_guests(
                            user_id=uid,  # goal creator
                            calendar_event_id=goal_record["google_calendar_id"],
                            guest_emails=tagged_members,  # list of emails
                        )
                    except Exception as e:
                        print(f"⚠ Failed to add calendar guests: {str(e)}")

            if failures:
                AuditLogger.log(
                    user_id=uid,
                    action="share_goal",
                    resource_type="goal",
                    resource_id=str(goal.get("id", "unknown")),
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
                action="share_goal",
                resource_type="goal",
                resource_id=str(goal.get("id", "unknown")),
                success=True,
                metadata={"input": data if data else {}, "notifications_created": notifications_created},
            )

            return {
                "status": 1,
                "message": f"Goal shared via email. {len(notifications_created)} notification(s) created.",
                "payload": {"notifications_created": notifications_created},
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="share_goal",
                resource_type="goal",
                resource_id="unknown",
                success=False,
                error_message="Failed to share goal",
                metadata={"input": data if data else {}, "error": str(e)},
            )
            return {"status": 0, "message": "Failed to share goal"}

class EmailSender:
    def __init__(self):
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.smtp_user = EMAIL_SENDER
        self.smtp_password = EMAIL_PASSWORD

    def send_goal_email(self, recipient_email, goal):
        try:
            msg = EmailMessage()
            msg["Subject"] = f"Shared Goal: {goal['title']}"
            msg["From"] = self.smtp_user
            msg["To"] = recipient_email

            created = goal.get("created_at") or ""
            if created:
                created = created.split("T")[0]

            msg.set_content(
                f"""
Hi there!

I wanted to share this Goal with you:

Title: {goal['title']}
Date: {goal['date']}


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
                
        except Exception as e:
            return False, str(e)

    def send_todo_email(self, recipient_email, todo):
        try:
            msg = EmailMessage()
            msg["Subject"] = f"Shared Todo: {todo['title']}"
            msg["From"] = self.smtp_user
            msg["To"] = recipient_email

            created = todo.get("created_at") or ""
            if created:
                created = created.split("T")[0]

            msg.set_content(
                f"""
Hi there!

I wanted to share this Todo with you:

Title: {todo['title']}
Date: {todo['date']}
priority: {todo['priority']}


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
                
        except Exception as e:
            return False, str(e)

class ShareTodo(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = None
        
        try:
            try:
                data = request.get_json(force=True)
            except Exception as e:
                AuditLogger.log(
                    user_id=uid,
                    action="SHARE_TODO",
                    resource_type="todo",
                    resource_id="unknown",
                    success=False,
                    error_message=f"Invalid JSON: {str(e)}",
                    metadata={},
                )
                return {"status": 0, "message": f"Invalid JSON: {str(e)}"}, 400

            emails = data.get("email")
            todo = data.get("todo")
            tagged_members = data.get("tagged_members", [])

            if not emails or not todo:
                AuditLogger.log(
                    user_id=uid,
                    action="SHARE_TODO",
                    resource_type="todo",
                    resource_id="unknown",
                    success=False,
                    error_message="Both 'email' and 'todo' are required",
                    metadata={"input": data if data else {}},
                )
                return {
                    "status": 0,
                    "message": "Both 'email' and 'todo' are required.",
                }, 422

            # Normalize emails to list
            if isinstance(emails, str):
                emails = [emails]

            email_sender = EmailSender()
            failures = []
            notifications_created = []
            resolved_tagged_ids = []

            # ✅ Resolve tagged_ids for DB update
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
                success, message = email_sender.send_todo_email(email, todo)
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
                    "message": f"{user['user_name']} tagged a task '{todo.get('title', 'Untitled')}' with you",
                    "task_type": "tagged",
                    "action_required": False,
                    "status": "unread",
                    "hub": None,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "metadata": {
                        "todo": todo,
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

            # 🔁 Update tagged_ids in the weekly_todos table
            if resolved_tagged_ids:
                todo_record = DBHelper.find_one("todos", filters={"id": todo.get("id")})
                if not todo_record:
                    AuditLogger.log(
                        user_id=uid,
                        action="SHARE_TODO",
                        resource_type="todo",
                        resource_id=str(todo.get("id")),
                        success=False,
                        error_message="Todo not found. Cannot tag members.",
                        metadata={"input": data if data else {}},
                    )
                    return {
                        "status": 0,
                        "message": "Todo not found. Cannot tag members.",
                    }, 404

                existing_ids = todo_record.get("tagged_ids") or []
                combined_ids = list(set(existing_ids + resolved_tagged_ids))
                pg_array_str = "{" + ",".join(f'"{str(i)}"' for i in combined_ids) + "}"

                DBHelper.update_one(
                    table_name="todos",
                    filters={"id": todo.get("id")},
                    updates={"tagged_ids": pg_array_str},
                )
                # ✅ Add tagged members as Google Calendar guests
                if todo_record.get("google_calendar_id"):
                    try:
                        add_calendar_guests(
                            user_id=uid,  # goal creator
                            calendar_event_id=todo_record["google_calendar_id"],
                            guest_emails=tagged_members,  # list of emails
                        )
                    except Exception as e:
                        print(f"⚠ Failed to add calendar guests: {str(e)}")

            if failures:
                AuditLogger.log(
                    user_id=uid,
                    action="SHARE_TODO",
                    resource_type="todo",
                    resource_id=str(todo.get("id", "unknown")),
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
                action="SHARE_TODO",
                resource_type="todo",
                resource_id=str(todo.get("id", "unknown")),
                success=True,
                metadata={"input": data if data else {}, "notifications_created": notifications_created, "tagged_ids": resolved_tagged_ids},
            )

            return {
                "status": 1,
                "message": f"Todo shared via email. {len(notifications_created)} notification(s) created.",
                "payload": {
                    "notifications_created": notifications_created,
                    "tagged_ids": resolved_tagged_ids,  # ✅ return tagged_ids in payload
                },
            }

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="SHARE_TODO",
                resource_type="todo",
                resource_id="unknown",
                success=False,
                error_message="Failed to share todo",
                metadata={"input": data if data else {}, "error": str(e)},
            )
            return {"status": 0, "message": "Failed to share todo"}

class DeleteWeeklyGoal(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(silent=True) or {}
            goal_id = data.get("id")

            if not goal_id:
                AuditLogger.log(
                    user_id=uid,
                    action="DELETE_WEEKLY_GOAL",
                    resource_type="goal",
                    resource_id="unknown",
                    success=False,
                    error_message="Goal ID is required",
                    metadata={"input": data},
                )
                return {"status": 0, "message": "Goal ID is required", "payload": {}}

            try:
                DBHelper.update_one(
                    table_name="goals",
                    filters={"id": goal_id, "user_id": uid},
                    updates={"is_active": 0},
                )
            except Exception as e:
                AuditLogger.log(
                    user_id=uid,
                    action="DELETE_WEEKLY_GOAL",
                    resource_type="goal",
                    resource_id=str(goal_id),
                    success=False,
                    error_message="Failed to delete weekly goal",
                    metadata={"input": data, "goal_id": goal_id, "error": str(e)},
                )
                return {"status": 0, "message": "Failed to delete weekly goal", "payload": {}}

            AuditLogger.log(
                user_id=uid,
                action="DELETE_WEEKLY_GOAL",
                resource_type="goal",
                resource_id=str(goal_id),
                success=True,
                metadata={"input": data, "goal_id": goal_id},
            )
            return {"status": 1, "message": "Weekly goal deleted successfully", "payload": {}}

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="DELETE_WEEKLY_GOAL",
                resource_type="goal",
                resource_id=str(goal_id) if "goal_id" in locals() else "unknown",
                success=False,
                error_message="Unexpected error while deleting weekly goal",
                metadata={"input": data if "data" in locals() else {}, "error": str(e)},
            )
            return {"status": 0, "message": "Failed to delete weekly goal"}

class DeleteWeeklyTodo(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True) or {}
        todo_id = data.get("id")

        if not todo_id:
            AuditLogger.log(
                user_id=uid,
                action="DELETE_WEEKLY_TODO",
                resource_type="todo",
                resource_id="unknown",
                success=False,
                error_message="Todo ID is required",
                metadata={"input": data},
            )
            return {"status": 0, "message": "Todo ID is required", "payload": {}}

        try:
            DBHelper.update_one(
                table_name="todos",
                filters={"id": todo_id, "user_id": uid},
                updates={"is_active": 0},
            )

            AuditLogger.log(
                user_id=uid,
                action="DELETE_WEEKLY_TODO",
                resource_type="todo",
                resource_id=str(todo_id),
                success=True,
                metadata={"input": data, "todo_id": todo_id},
            )
            return {
                "status": 1,
                "message": "Weekly todo deleted successfully",
                "payload": {},
            }

        except Exception as e:
            error_message = f"Failed to delete weekly todo: {str(e)}"
            print(error_message)
            AuditLogger.log(
                user_id=uid,
                action="DELETE_WEEKLY_TODO",
                resource_type="todo",
                resource_id=str(todo_id),
                success=False,
                error_message=error_message,
                metadata={"input": data, "todo_id": todo_id},
            )
            return {"status": 0, "message": "Failed to delete weekly todo", "payload": {}}

class AddHabit(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True) or {}
        habit_id = None

        if not data:
            AuditLogger.log(
                user_id=uid,
                action="ADD_HABIT",
                resource_type="habit",
                resource_id="unknown",
                success=False,
                error_message="No input data provided",
                metadata={},
            )
            return {"status": 0, "message": "No input data provided"}, 400

        habit = data.get("habit", {})
        if not habit:
            AuditLogger.log(
                user_id=uid,
                action="ADD_HABIT",
                resource_type="habit",
                resource_id="unknown",
                success=False,
                error_message="No habit data provided",
                metadata={"input": data},
            )
            return {"status": 0, "message": "No habit data provided"}, 400

        # Validate required fields
        required_fields = ["name", "userId"]
        missing = [field for field in required_fields if field not in habit]
        if missing:
            AuditLogger.log(
                user_id=uid,
                action="ADD_HABIT",
                resource_type="habit",
                resource_id="unknown",
                success=False,
                error_message=f"Missing fields: {', '.join(missing)}",
                metadata={"input": data},
            )
            return {"status": 0, "message": f"Missing fields: {', '.join(missing)}"}, 400

        try:
            now = datetime.now()
            today = date.today()

            # Insert habit
            habit_id = DBHelper.insert(
                table_name="habits",
                return_column="id",
                user_id=habit["userId"],
                name=habit["name"],
                description=habit.get("description"),
                status=False,
                added_time=now.isoformat(),
                updated_at=now.isoformat(),
            )

            # Create progress row for today
            DBHelper.insert(
                table_name="habit_progress",
                return_column="id",
                habit_id=habit_id,
                progress_date=today.isoformat(),
                status=False,
            )

            AuditLogger.log(
                user_id=uid,
                action="ADD_HABIT",
                resource_type="habit",
                resource_id=str(habit_id),
                success=True,
                metadata={"input": data, "habit_id": habit_id},
            )

            return {
                "status": 1,
                "message": "Habit added successfully",
                "payload": {"id": habit_id},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="ADD_HABIT",
                resource_type="habit",
                resource_id=str(habit_id) if habit_id else "unknown",
                success=False,
                error_message="Failed to add habit",
                metadata={"input": data, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to add habit: {str(e)}"}, 500

class GetHabits(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            user_id = request.args.get("userId")
            query_date = request.args.get("date", date.today().isoformat())
            today_str = date.today().isoformat()

            if not user_id:
                AuditLogger.log(
                    user_id=uid,
                    action="get_habits",
                    resource_type="habit",
                    resource_id="multiple",
                    success=False,
                    error_message="Missing userId",
                    metadata={"query_date": query_date},
                )
                return {"status": 0, "message": "Missing userId"}, 400

            # Fetch all active habits for user
            habits = DBHelper.find_all(
                "habits", filters={"user_id": user_id, "is_active": 1}
            )
            results = []

            for habit in habits:
                # Fetch progress for the requested date
                progress = DBHelper.find_one(
                    "habit_progress",
                    filters={"habit_id": habit["id"], "progress_date": query_date},
                )

                # Auto-create today's progress if not exists
                if not progress and query_date == today_str:
                    progress_id = DBHelper.insert(
                        "habit_progress",
                        return_column="id",
                        habit_id=habit["id"],
                        progress_date=query_date,
                        status=False,
                    )
                    progress = {
                        "id": progress_id,
                        "habit_id": habit["id"],
                        "progress_date": query_date,
                        "status": False,
                    }

                # Default progress for past/future or if still None
                if not progress:
                    progress = {
                        "id": None,
                        "habit_id": habit["id"],
                        "progress_date": query_date,
                        "status": False,
                    }

                # Update habit status from progress
                habit["status"] = progress["status"]
                habit["progress_date"] = progress["progress_date"]

                # Serialize datetime/date fields to ISO
                for key, value in habit.items():
                    if isinstance(value, (datetime, date)):
                        habit[key] = value.isoformat()

                results.append(habit)

          

            return {
                "status": 1,
                "message": "Habits fetched successfully",
                "payload": results,
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="get_habits",
                resource_type="habit",
                resource_id="multiple",
                success=False,
                error_message="Failed to fetch habits",
                metadata={"error": str(e)},
            )
            return {"status": 0, "message": f"Failed to fetch habits: {str(e)}"}, 500

class UpdateHabitProgress(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = None
        habit_id = None

        try:
            data = request.get_json(silent=True)
            if not data or "habit" not in data:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_HABIT_PROGRESS",
                    resource_type="habit",
                    resource_id="unknown",
                    success=False,
                    error_message="No habit data provided",
                    metadata={"input": data or {}},
                )
                return {"status": 0, "message": "No habit data provided"}, 400

            habit = data["habit"]
            habit_id = habit.get("id")
            if not habit_id:
                AuditLogger.log(
                    user_id=uid,
                    action="UPDATE_HABIT_PROGRESS",
                    resource_type="habit",
                    resource_id="unknown",
                    success=False,
                    error_message="Missing habit ID",
                    metadata={"input": data},
                )
                return {"status": 0, "message": "Missing habit ID"}, 400

            progress_date = habit.get("progress_date") or date.today().isoformat()

            # Prevent future progress updates
            if datetime.fromisoformat(progress_date).date() > date.today():
                return {
                    "status": 0,
                    "message": "Cannot update future habit progress",
                }, 400

                # Ensure habit exists
                habit_db = DBHelper.find_one("habits", filters={"id": habit_id})
                if not habit_db:
                    AuditLogger.log(
                        user_id=uid,
                        action="update_habit_progress",
                        resource_type="habit",
                        resource_id=str(habit_id),
                        success=False,
                        error_message="Habit not found",
                        metadata={"input": data if data else {}},
                    )
                    return {"status": 0, "message": "Habit not found"}, 404

            # Find or create progress row
            progress = DBHelper.find_one(
                "habit_progress",
                filters={"habit_id": habit_id, "progress_date": progress_date},
            )
            if not progress:
                progress_id = DBHelper.insert(
                    "habit_progress",
                    return_column="id",
                    habit_id=habit_id,
                    progress_date=progress_date,
                    status=False,
                )
                if not progress:
                    progress_id = DBHelper.insert(
                        table_name="habit_progress",
                        return_column="id",
                        habit_id=habit_id,
                        progress_date=progress_date,
                        status=False,
                    )
                    progress = {"id": progress_id, "status": False}

                # Toggle or set status
                new_status = habit.get("status", not progress["status"])

                DBHelper.update_one(
                    "habit_progress",
                    filters={"habit_id": habit_id, "progress_date": progress_date},
                    updates={"status": new_status},
                )

            DBHelper.update_one(
                "habits",
                filters={"id": habit_id},
                updates={
                    "status": new_status,
                    "updated_at": datetime.now().isoformat(),
                },
            )

            AuditLogger.log(
                user_id=uid,
                action="UPDATE_HABIT_PROGRESS",
                resource_type="habit",
                resource_id=str(habit_id),
                success=True,
                metadata={
                    "input": data,
                    "new_status": new_status,
                    "progress_date": progress_date,
                },
            )

            return {
                "status": 1,
                "message": "Habit status updated successfully",
                "payload": {
                    "habit_id": habit_id,
                    "progress_date": progress_date,
                    "status": new_status,
                },
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_HABIT_PROGRESS",
                resource_type="habit",
                resource_id=str(habit_id) if habit_id else "unknown",
                success=False,
                error_message="Failed to update habit progress",
                metadata={"input": data or {}, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to update habit: {str(e)}"}, 500

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="UPDATE_HABIT_PROGRESS",
                resource_type="habit",
                resource_id=str(habit_id) if habit_id else "unknown",
                success=False,
                error_message="Failed to update habit progress",
                metadata={"input": data if data else {}, "error": str(e)},
            )
            return {"status": 0, "message": "Failed to update habit progress"}


class EditHabit(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        data = None
        habit_id = None

        try:
            data = request.get_json(silent=True)
            if not data or "habit" not in data:
                AuditLogger.log(
                    user_id=uid,
                    action="EDIT_HABIT",
                    resource_type="habit",
                    resource_id="unknown",
                    success=False,
                    error_message="No habit data provided",
                    metadata={"input": data or {}},
                )
                return {"status": 0, "message": "No habit data provided"}, 400

            habit = data["habit"]
            habit_id = habit.get("id")
            if not habit_id:
                AuditLogger.log(
                    user_id=uid,
                    action="EDIT_HABIT",
                    resource_type="habit",
                    resource_id="unknown",
                    success=False,
                    error_message="Missing habit ID",
                    metadata={"input": data},
                )
                return {"status": 0, "message": "Missing habit ID"}, 400

            habit_db = DBHelper.find_one("habits", filters={"id": habit_id})
            if not habit_db:
                return {"status": 0, "message": "Habit not found"}, 404

            # Prepare updates
            updates = {k: habit[k] for k in ["name", "description"] if k in habit}
            if not updates:
                return {"status": 0, "message": "No valid fields to update"}, 400

            updates["updated_at"] = datetime.now().isoformat()
            DBHelper.update_one("habits", filters={"id": habit_id}, updates=updates)

            AuditLogger.log(
                user_id=uid,
                action="EDIT_HABIT",
                resource_type="habit",
                resource_id=str(habit_id),
                success=True,
                metadata={"input": data, "updates": updates},
            )

            return {"status": 1, "message": "Habit updated successfully"}, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="EDIT_HABIT",
                resource_type="habit",
                resource_id=str(habit_id) if habit_id else "unknown",
                success=False,
                error_message="Failed to edit habit",
                metadata={"input": data or {}, "error": str(e)},
            )
            return {"status": 0, "message": f"Failed to edit habit: {str(e)}"}, 500

class DeleteHabit(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        habit_id = data.get("id") if data else None

        if not habit_id:
            AuditLogger.log(
                user_id=uid,
                action="DELETE_HABIT",
                resource_type="habit",
                resource_id="unknown",
                success=False,
                error_message="Habit ID is required",
                metadata={"input": data or {}},
            )
            return {"status": 0, "message": "Habit ID is required"}, 400

        try:
            # Soft delete: mark habit as inactive
            DBHelper.update_one(
                table_name="habits",
                filters={"id": habit_id, "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.now().isoformat()},
            )

            AuditLogger.log(
                user_id=uid,
                action="DELETE_HABIT",
                resource_type="habit",
                resource_id=str(habit_id),
                success=True,
                metadata={"input": data or {}, "habit_id": habit_id},
            )

            return {
                "status": 1,
                "message": "Habit deleted (soft) successfully",
                "payload": {},
            }, 200

        except Exception as e:
            AuditLogger.log(
                user_id=uid,
                action="DELETE_HABIT",
                resource_type="habit",
                resource_id=str(habit_id),
                success=False,
                error_message="Failed to delete habit",
                metadata={"input": data or {}, "habit_id": habit_id, "error": str(e)},
            )
            return {
                "status": 0,
                "message": f"Failed to delete habit: {str(e)}",
                "payload": {},
            }, 500
