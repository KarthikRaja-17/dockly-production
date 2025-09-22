# Updated planner.py - Add these imports and functions to your existing planner.py

import requests
from datetime import datetime, timedelta
import json

# Microsoft Graph API endpoints
MS_GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0"


def get_outlook_headers(access_token):
    """Get headers for Microsoft Graph API requests"""
    return {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def fetch_outlook_calendar_events(access_token, time_min=None):
    """Fetch calendar events from Microsoft Outlook"""
    try:
        headers = get_outlook_headers(access_token)

        # Set time filter - default to past week to future
        if not time_min:
            time_min = (datetime.utcnow() - timedelta(days=7)).isoformat() + "Z"

        # Microsoft Graph API endpoint for calendar events
        url = f"{MS_GRAPH_BASE_URL}/me/events"
        params = {
            "$filter": f"start/dateTime ge '{time_min}'",
            "$orderby": "start/dateTime",
            "$top": 100,
            "$select": "id,subject,start,end,isAllDay,body,location,organizer,attendees,webLink,createdDateTime,lastModifiedDateTime",
        }

        response = requests.get(url, headers=headers, params=params)

        if response.status_code == 200:
            return response.json().get("value", [])
        else:
            print(
                f"Error fetching Outlook events: {response.status_code} - {response.text}"
            )
            return []

    except Exception as e:
        print(f"Exception fetching Outlook events: {e}")
        return []


def create_outlook_calendar_event(
    access_token, title, start_dt, end_dt=None, attendees=None
):
    """Create a calendar event in Microsoft Outlook"""
    try:
        headers = get_outlook_headers(access_token)

        if end_dt is None:
            end_dt = start_dt + timedelta(hours=1)

        # Check if it's an all-day event (end_dt is more than 23 hours after start_dt)
        duration = end_dt - start_dt
        is_all_day = duration.total_seconds() >= 23 * 3600

        event_data = {
            "subject": title,
            "isAllDay": is_all_day,
            "start": {"dateTime": start_dt.isoformat(), "timeZone": "UTC"},
            "end": {"dateTime": end_dt.isoformat(), "timeZone": "UTC"},
        }

        if is_all_day:
            # For all-day events, use date format
            event_data["start"] = {
                "date": start_dt.strftime("%Y-%m-%d"),
                "timeZone": "UTC",
            }
            event_data["end"] = {"date": end_dt.strftime("%Y-%m-%d"), "timeZone": "UTC"}

        if attendees:
            event_data["attendees"] = [
                {
                    "emailAddress": {"address": email, "name": email.split("@")[0]},
                    "type": "required",
                }
                for email in attendees
            ]

        url = f"{MS_GRAPH_BASE_URL}/me/events"
        response = requests.post(url, headers=headers, json=event_data)

        if response.status_code == 201:
            return response.json().get("id")
        else:
            print(
                f"Error creating Outlook event: {response.status_code} - {response.text}"
            )
            raise Exception(f"Failed to create Outlook event: {response.text}")

    except Exception as e:
        print(f"Exception creating Outlook event: {e}")
        raise e


def update_outlook_calendar_event(
    access_token, event_id, title, start_dt, end_dt=None, attendees=None
):
    """Update a calendar event in Microsoft Outlook"""
    try:
        headers = get_outlook_headers(access_token)

        if end_dt is None:
            end_dt = start_dt + timedelta(hours=1)

        # Check if it's an all-day event
        duration = end_dt - start_dt
        is_all_day = duration.total_seconds() >= 23 * 3600

        event_data = {
            "subject": title,
            "isAllDay": is_all_day,
            "start": {"dateTime": start_dt.isoformat(), "timeZone": "UTC"},
            "end": {"dateTime": end_dt.isoformat(), "timeZone": "UTC"},
        }

        if is_all_day:
            event_data["start"] = {
                "date": start_dt.strftime("%Y-%m-%d"),
                "timeZone": "UTC",
            }
            event_data["end"] = {"date": end_dt.strftime("%Y-%m-%d"), "timeZone": "UTC"}

        if attendees:
            event_data["attendees"] = [
                {
                    "emailAddress": {"address": email, "name": email.split("@")[0]},
                    "type": "required",
                }
                for email in attendees
            ]

        url = f"{MS_GRAPH_BASE_URL}/me/events/{event_id}"
        response = requests.patch(url, headers=headers, json=event_data)

        if response.status_code == 200:
            return response.json().get("id")
        else:
            print(
                f"Error updating Outlook event: {response.status_code} - {response.text}"
            )
            raise Exception(f"Failed to update Outlook event: {response.text}")

    except Exception as e:
        print(f"Exception updating Outlook event: {e}")
        raise e


def transform_outlook_event(event, account_color="#0078D4", source_email=""):
    """Transform Outlook event to unified format"""
    try:
        # Extract start and end times
        start_info = event.get("start", {})
        end_info = event.get("end", {})

        is_all_day = event.get("isAllDay", False)

        if is_all_day:
            start_date = start_info.get("date")
            end_date = end_info.get("date")
            start_time = "12:00 AM"
            end_time = "11:59 PM"
        else:
            start_datetime = start_info.get("dateTime")
            end_datetime = end_info.get("dateTime")

            if start_datetime:
                start_dt = datetime.fromisoformat(start_datetime.replace("Z", "+00:00"))
                start_date = start_dt.strftime("%Y-%m-%d")
                start_time = start_dt.strftime("%I:%M %p")
            else:
                start_date = datetime.now().strftime("%Y-%m-%d")
                start_time = "12:00 PM"

            if end_datetime:
                end_dt = datetime.fromisoformat(end_datetime.replace("Z", "+00:00"))
                end_time = end_dt.strftime("%I:%M %p")
            else:
                end_time = "1:00 PM"

        return {
            "id": event.get("id"),
            "kind": "outlook#event",
            "summary": event.get("subject", "No Title"),
            "start": {
                "date" if is_all_day else "dateTime": start_info.get(
                    "date" if is_all_day else "dateTime"
                ),
                "timeZone": start_info.get("timeZone", "UTC"),
            },
            "end": {
                "date" if is_all_day else "dateTime": end_info.get(
                    "date" if is_all_day else "dateTime"
                ),
                "timeZone": end_info.get("timeZone", "UTC"),
            },
            "creator": {
                "email": event.get("organizer", {})
                .get("emailAddress", {})
                .get("address", source_email)
            },
            "organizer": event.get("organizer", {}),
            "description": event.get("body", {}).get("content", ""),
            "location": event.get("location", {}).get("displayName", ""),
            "attendees": event.get("attendees", []),
            "webLink": event.get("webLink", ""),
            "source_email": source_email,
            "account_color": account_color,
            "provider": "outlook",
            "is_all_day": is_all_day,
            "start_date": start_date,
            "end_date": end_date if is_all_day else start_date,
        }
    except Exception as e:
        print(f"Error transforming Outlook event: {e}")
        return None
