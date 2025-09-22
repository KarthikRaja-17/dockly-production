
from enum import Enum


class Status(Enum):
    REMOVED = 0
    ACTIVE = 1


class DocklyUsers(Enum):
    Guests = 0
    PaidMember = 1
    SuperAdmin = 2
    Developer = 3

class TrialPeriod(Enum):
    DAYS = 14

class EmailVerification(Enum):
    NOT_VERIFIED = 0
    VERIFIED = 1


class MFAStatus(Enum):
    DISABLED = 0
    ENABLED = 1


class HubsEnum(Enum):
    Family = 1
    Finance = 2
    Home = 3
    Health = 4


class Permissions(Enum):
    Read = 0
    Edit = 1
    Add = 2
    Delete = 3
    Notify = 4


class Priority(Enum):
    LOW = 0
    MEDIUM = 1
    HIGH = 2


class GoalStatus(Enum):
    YET_TO_START = 0
    COMPLETED = 1


class FitbitDataTypes(Enum):
    STEPS = "steps"
    HEART_RATE = "heart_rate"
    SLEEP = "sleep"
    WEIGHT = "weight"
    ACTIVITIES = "activities"
    BODY_FAT = "body_fat"


class FitbitSyncStatus(Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    TRIGGERED = "triggered"


class HealthDataProvider(Enum):
    FITBIT = "fitbit"
    MANUAL = "manual"
    IMPORTED = "imported"


# class Shared


Hubs = [
    {
        "label": {"name": "home", "title": "Home"},
        "children": [
            {"name": "property-info", "title": "Property Information"},
            {"name": "mortgage-loans", "title": "Mortgage & Loans"},
            {"name": "home-maintenance", "title": "Home Maintenance"},
            {"name": "utilities", "title": "Utilities"},
            {"name": "insurance", "title": "Insurance"},
        ],
    },
    {
        "label": {"name": "finance", "title": "Finance"},
        "children": [],
    },
    {
        "label": {"name": "family", "title": "Family"},
        "children": [
            {"name": "familyMembers", "title": "Family Members & Pets"},
            {"name": "familyCalendar", "title": "Family Calendar"},
            {"name": "upcomingActivities", "title": "Upcoming Activities"},
            {"name": "familyNotesLists", "title": "Family Notes & Lists"},
            {"name": "familyTasksProjects", "title": "Family Tasks & Projects"},
            {"name": "guardiansEmergencyInfo", "title": "Guardians & Emergency Info"},
            {"name": "importantContacts", "title": "Important Contacts"},
        ],
    },
    {
        "label": {"name": "health", "title": "Health"},
        "children": [
            {"name": "health-info", "title": "Health Information"},
            {"name": "medical-records", "title": "Medical Records"},
            {"name": "emergency-contacts", "title": "Emergency Contacts"},
        ],
    },
]


