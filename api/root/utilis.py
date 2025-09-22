from enum import Enum
from random import choice
import string
import pytz
from datetime import datetime, timezone
import uuid
from flask import json, request, session
from datetime import datetime, timedelta
import requests
from root.config import CLIENT_ID, CLIENT_SECRET, SCOPE, WEB_URL, uri
from root.db.dbHelper import DBHelper
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials


def numGenerator(size=6, chars=string.digits):
    return "".join(choice(chars) for _ in range(size))


def alphaNumGenerator(size=4, chars="ABCDEFGHJKLMNPQRSTUVWYZ123456789"):
    return "".join(choice(chars) for _ in range(size))


def get_local_timezone():
    return datetime.now().astimezone().tzinfo


def dateTimeToReadableDate(dateTime, format="%Y-%m-%d %H:%M:%S"):
    if not dateTime:
        return None
    return (
        dateTime.replace(tzinfo=timezone.utc)
        .astimezone(get_local_timezone())
        .strftime(format)
    )


SESSION_TIMEOUT_MINUTES = 1


def get_ip():
    if request.headers.get("X-Forwarded-For"):
        return request.headers.get("X-Forwarded-For").split(",")[0]
    return request.remote_addr


def get_geo_location(ip):
    try:
        res = requests.get(f"https://ipinfo.io/{ip}/json")
        if res.status_code == 200:
            return res.json()
    except:
        pass
    return {}


def handle_user_session(uid):
    now = datetime.utcnow()

    if "session_id" not in session or "last_active" not in session:
        session["session_id"] = str(uuid.uuid4())
        session["created_at"] = now.isoformat()
        session["last_active"] = now.isoformat()
        session.permanent = True
    else:
        last_active = datetime.fromisoformat(session["last_active"])
        if (now - last_active) > timedelta(minutes=SESSION_TIMEOUT_MINUTES):
            session.clear()
            session["session_id"] = str(uuid.uuid4())
            session["created_at"] = now.isoformat()
        session["last_active"] = now.isoformat()

    ip = get_ip()
    geo = get_geo_location(ip)

    session_data = {
        "uid": uid,
        "session_id": session["session_id"],
        "ip_address": ip,
        "geo_location": str(geo),
        "created_at": session["created_at"],
    }

    existing_session = DBHelper.find_one("user_sessions", {"uid": uid})

    if existing_session:
        DBHelper.update_one("user_sessions", filters={"uid": uid}, updates=session_data)
    else:
        DBHelper.insert("user_sessions", **session_data)

    return {
        "session_id": session["session_id"],
        "created_at": session["created_at"],
        "last_active": session["last_active"],
        "ip_address": ip,
        "geo_location": geo,
    }


class Status(Enum):
    REMOVED = 0
    ACTIVE = 1


def uniqueId(digit=4, isNum=False, ref={}, prefix=None, suffix=None):
    _id = numGenerator(digit) if isNum else alphaNumGenerator(digit)

    if prefix is not None:
        _id = f"{prefix}X{_id}"

    if suffix is not None:
        _id = f"{_id}X{suffix}"

    existing = DBHelper.find_one("uuid", filters={"uid": _id})

    if existing:
        return uniqueId(digit, isNum, ref, prefix, suffix)
    else:
        ref.pop("uid", None)
        DBHelper.insert("uuid", return_column="uid", uid=_id, **ref)
        return _id


def create_calendar_event(user_id, title, start_dt, end_dt=None, attendees=None):
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

    if end_dt is None:
        end_dt = start_dt + timedelta(hours=1)

    event = {
        "summary": title,
        "start": {"dateTime": start_dt.isoformat(), "timeZone": "Asia/Kolkata"},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": "Asia/Kolkata"},
        "attendees": attendees or [],
        "guestsCanModify": True,
        "guestsCanInviteOthers": True,
        "guestsCanSeeOtherGuests": True,
    }

    created_event = service.events().insert(calendarId="primary", body=event).execute()

    return created_event.get("id")  # ✅ return only the Google event ID


def update_calendar_event(
    user_id, calendar_event_id, title, start_dt, end_dt=None, attendees=None
):
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

    if end_dt is None:
        end_dt = start_dt + timedelta(hours=1)

    # First: Get the existing event from Google
    existing_event = (
        service.events().get(calendarId="primary", eventId=calendar_event_id).execute()
    )

    # Update fields
    existing_event["summary"] = title
    existing_event["start"] = {
        "dateTime": start_dt.isoformat(),
        "timeZone": "Asia/Kolkata",
    }
    existing_event["end"] = {"dateTime": end_dt.isoformat(), "timeZone": "Asia/Kolkata"}
    existing_event["attendees"] = attendees or []
    existing_event["guestsCanModify"] = True
    existing_event["guestsCanInviteOthers"] = True
    existing_event["guestsCanSeeOtherGuests"] = True

    # Update on Google Calendar
    updated_event = (
        service.events()
        .update(calendarId="primary", eventId=calendar_event_id, body=existing_event)
        .execute()
    )

    return updated_event.get("id")  # Optional return


def delete_calendar_event(user_id, calendar_event_id):
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

    try:
        service.events().delete(
            calendarId="primary", eventId=calendar_event_id
        ).execute()
        return True  # ✅ return True if successfully deleted
    except Exception as e:
        print(f"⚠ Failed to delete Google Calendar event {calendar_event_id}: {str(e)}")
        return False  # still continue with DB deletion


def extract_datetime(text: str, now: datetime | None = None) -> datetime:
    from datetime import datetime, timedelta, time
    import pytz, re
    from dateparser.search import search_dates

    us_tz = pytz.timezone("America/New_York")
    now = now.astimezone(us_tz) if now else datetime.now(us_tz)

    DEFAULT_HOUR = 10
    DEFAULT_MINUTE = 0

    cleaned_text = re.sub(r"@+\w+", "", text).strip()

    time_regex_12h = re.compile(r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b", re.I)
    time_regex_24h = re.compile(r"\b(\d{1,2}):(\d{2})\b")

    time_match = time_regex_12h.search(cleaned_text) or time_regex_24h.search(
        cleaned_text
    )

    explicit_hour = explicit_minute = None
    if time_match:
        explicit_hour = int(time_match.group(1))
        explicit_minute = int(time_match.group(2) or 0)

        meridian = (
            time_match.group(3).lower()
            if len(time_match.groups()) >= 3 and time_match.group(3)
            else None
        )
        if meridian == "pm" and explicit_hour != 12:
            explicit_hour += 12
        if meridian == "am" and explicit_hour == 12:
            explicit_hour = 0

    custom_formats = [
        r"\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b",
        r"\b\d{1,2}(st|nd|rd|th)?\s+\w+\b",
        r"\bon\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        r"\b(this|next)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        r"\b\d{1,2}(st|nd|rd|th)\b",
    ]

    for pattern in custom_formats:
        match = re.search(pattern, cleaned_text, re.I)
        if not match:
            continue

        date_part = match.group(0).strip()

        if re.fullmatch(r"\d{1,2}[./-]\d{1,2}[./-]\d{2,4}", date_part):
            day_str, month_str, year_str = re.split(r"[./-]", date_part)
            day = int(day_str)
            month = int(month_str)
            year = int(year_str)
            if year < 100:
                year += 2000 if year < 70 else 1900

            hour = explicit_hour if explicit_hour is not None else DEFAULT_HOUR
            minute = explicit_minute if explicit_minute is not None else DEFAULT_MINUTE

            try:
                candidate = us_tz.localize(datetime(year, month, day, hour, minute))
            except ValueError:
                pass
            else:
                return candidate

        if re.fullmatch(r"\d{1,2}(st|nd|rd|th)", date_part, re.I):
            day = int(re.sub(r"(st|nd|rd|th)", "", date_part, flags=re.I))
            hour = explicit_hour if explicit_hour is not None else DEFAULT_HOUR
            minute = explicit_minute if explicit_minute is not None else DEFAULT_MINUTE
            year, month = now.year, now.month
            try:
                candidate = us_tz.localize(datetime(year, month, day, hour, minute))
            except ValueError:
                month += 1
                if month == 13:
                    month, year = 1, year + 1
                candidate = us_tz.localize(datetime(year, month, day, hour, minute))

            if candidate < now:
                month += 1
                if month == 13:
                    month, year = 1, year + 1
                candidate = us_tz.localize(datetime(year, month, day, hour, minute))

            return candidate

        hh = explicit_hour if explicit_hour is not None else DEFAULT_HOUR
        mm = explicit_minute if explicit_minute is not None else DEFAULT_MINUTE
        full_phrase = f"{date_part} {hh}:{mm:02d}"

        parsed = search_dates(
            full_phrase,
            settings={
                "PREFER_DATES_FROM": "future",
                "RELATIVE_BASE": now,
                "TIMEZONE": "America/New_York",
                "TO_TIMEZONE": "America/New_York",
                "RETURN_AS_TIMEZONE_AWARE": True,
                "DATE_ORDER": "DMY",
            },
        )
        if parsed:
            return parsed[0][1].astimezone(us_tz)

    if explicit_hour is not None:
        target_date = now.date()
        # Detect words like "tomorrow" or "day after"
        if "tomorrow" in cleaned_text.lower():
            target_date += timedelta(days=1)
        elif "day after" in cleaned_text.lower():
            target_date += timedelta(days=2)
        elif "next" in cleaned_text.lower():
            target_date += timedelta(days=7)

        combined = us_tz.localize(
            datetime.combine(target_date, time(explicit_hour, explicit_minute))
        )
        if combined < now:
            combined += timedelta(days=1)
        return combined

    results = search_dates(
        cleaned_text,
        settings={
            "PREFER_DATES_FROM": "future",
            "RELATIVE_BASE": now,
            "TIMEZONE": "America/New_York",
            "TO_TIMEZONE": "America/New_York",
            "RETURN_AS_TIMEZONE_AWARE": True,
            "DATE_ORDER": "DMY",
        },
    )

    if results:
        dt = results[0][1].astimezone(us_tz)
        if dt.hour == 0 and dt.minute == 0 and explicit_hour is None:
            dt = dt.replace(hour=DEFAULT_HOUR, minute=DEFAULT_MINUTE)
        if dt < now:
            dt += timedelta(days=1)
        return dt

    return now


from user_agents import parse
from flask import request


def get_device_info():
    user_agent_str = request.headers.get("User-Agent")
    user_agent = parse(user_agent_str)

    return f"{user_agent.device.family} | {user_agent.os.family} {user_agent.os.version_string} | {user_agent.browser.family} {user_agent.browser.version_string}"


# from root.db.db import postgres
# from flask import request
# from pywebpush import webpush, WebPushException

# conn = postgres.get_connection()


# def send_notification(message="You have a new update on Dockly!"):
#     payload = {
#         "title": "Dockly Notification",
#         "body": message,
#         "url": WEB_URL,
#         "icon": f"{WEB_URL}/logoBlue.png",
#     }

#     with conn.cursor() as cur:
#         cur.execute("SELECT endpoint, auth, p256dh FROM subscriptions")
#         rows = cur.fetchall()

#     for row in rows:
#         sub = {"endpoint": row[0], "keys": {"auth": row[1], "p256dh": row[2]}}
#         try:
#             webpush(
#                 subscription_info=sub,
#                 data=json.dumps(payload),
#                 vapid_private_key=VAPID_PRIVATE_KEY,
#                 vapid_claims=VAPID_CLAIMS,
#             )
#         except WebPushException as e:
#             print(f"Push failed: {e}")

#     return {"status": "Notification sent"}

import io
import traceback
from werkzeug.utils import secure_filename
from googleapiclient.http import MediaIoBaseUpload


def ensure_drive_folder_structure(service, root_name="DOCKLY", subfolders=None):
    if subfolders is None:
        subfolders = ["Home", "Family", "Finance", "Health", "Planner"]

    def find_or_create_folder(name, parent_id=None):
        # Search for folder
        query = f"name='{name}' and mimeType='application/vnd.google-apps.folder'"
        if parent_id:
            query += f" and '{parent_id}' in parents"
        else:
            query += " and 'root' in parents"

        response = service.files().list(q=query, fields="files(id, name)").execute()
        files = response.get("files", [])

        if files:
            return files[0]["id"]
        else:
            # Create folder
            folder_metadata = {
                "name": name,
                "mimeType": "application/vnd.google-apps.folder",
            }
            if parent_id:
                folder_metadata["parents"] = [parent_id]
            folder = service.files().create(body=folder_metadata, fields="id").execute()
            return folder["id"]

    # Ensure root folder
    root_folder_id = find_or_create_folder(root_name)

    # Ensure subfolders
    folder_ids = {}
    for name in subfolders:
        folder_ids[name] = find_or_create_folder(name, parent_id=root_folder_id)

    return {
        "root": root_folder_id,  # ✅ This is what you need
        "subfolders": folder_ids,
    }


def upload_file_to_hub_folder(service, file, hub_name):
    try:
        if hub_name not in ["Home", "Family", "Finance", "Health", "Planner"]:
            return {
                "status": 0,
                "message": f"Invalid hub name: {hub_name}",
                "payload": {},
            }

        # Ensure folders
        folder_ids = ensure_drive_folder_structure(service)
        parent_id = folder_ids.get(hub_name)

        # Prepare file metadata
        file_metadata = {
            "name": secure_filename(file.filename),
            "parents": [parent_id],
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

        return {
            "status": 1,
            "message": f"File '{file.filename}' uploaded successfully to {hub_name}",
            "payload": {"file": uploaded_file},
        }

    except Exception as e:
        traceback.print_exc()
        return {
            "status": 0,
            "message": f"Failed to upload file: {str(e)}",
            "payload": {},
        }


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


FAMILY_MEMBER_COLORS = [
    "#FFD1DC",  # Pastel Pink
    "#FFECB3",  # Pastel Yellow
    "#B3E5FC",  # Pastel Sky Blue
    "#C8E6C9",  # Pastel Green
    "#D1C4E9",  # Pastel Lavender
    "#FFE0B2",  # Pastel Peach
    "#F8BBD0",  # Pastel Rose
    "#DCEDC8",  # Pastel Lime
    "#BBDEFB",  # Pastel Blue
    "#E1BEE7",  # Pastel Purple
    "#FFCCBC",  # Pastel Coral
    "#FFF9C4",  # Pastel Light Yellow
    "#B2DFDB",  # Pastel Teal
    "#F0F4C3",  # Pastel Light Olive
    "#F5CCE8",  # Pastel Violet
    "#C5CAE9",  # Pastel Indigo
    "#F3E5F5",  # Pastel Lilac
    "#E6EE9C",  # Pastel Chartreuse
    "#B2EBF2",  # Pastel Cyan
    "#D7CCC8",  # Pastel Taupe
]


def assign_family_member_color(group_id: str, fm_user_id: str, uid: str) -> str:
    existing_members = DBHelper.find_all(
        table_name="family_members",
        filters={"family_group_id": group_id},
        select_fields=["fm_user_id", "color"],
    )

    used_colors = {m["color"] for m in existing_members if m.get("color")}
    # if this fm_user_id already has a color, return it (avoid reassigning)
    for m in existing_members:
        if m["fm_user_id"] == fm_user_id and m.get("color"):
            return m["color"]

    for c in FAMILY_MEMBER_COLORS:
        if c not in used_colors:
            return c


def format_timestamp(dt):
    now = datetime.utcnow()  # use naive UTC
    diff = now - dt

    seconds = diff.total_seconds()
    if seconds < 60:
        return f"{int(seconds)} seconds ago"
    elif seconds < 3600:
        return f"{int(seconds // 60)} minutes ago"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} hours ago"
    else:
        return f"{int(seconds // 86400)} days ago"
