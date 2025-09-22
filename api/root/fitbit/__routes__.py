# fitbit/__routes__.py

from .models import (
    AddFitbitAccount,
    FitbitCallback,
    SyncFitbitData,
    GetFitbitDashboard,
    GetFitbitConnectionStatus,
    DisconnectFitbit,
    GetFitbitDailyData,
    GetFitbitSleepData,
    GetFitbitActivities,
    GetFitbitSyncLogs,
    FitbitWebhook,
    # NEW: Goals endpoints
    GetFitbitGoals,
    SyncFitbitGoals,
)
from . import fitbit_api

# OAuth and Connection Management
fitbit_api.add_resource(AddFitbitAccount, "/add-fitbit")
fitbit_api.add_resource(FitbitCallback, "/auth/callback/fitbit")
fitbit_api.add_resource(GetFitbitConnectionStatus, "/get/fitbit/connection-status")
fitbit_api.add_resource(DisconnectFitbit, "/disconnect/fitbit")

# Data Synchronization
fitbit_api.add_resource(SyncFitbitData, "/sync/fitbit")

# NEW: Goals Management
fitbit_api.add_resource(GetFitbitGoals, "/get/fitbit/goals")
fitbit_api.add_resource(SyncFitbitGoals, "/sync/fitbit/goals")

# Dashboard and Data Retrieval
fitbit_api.add_resource(GetFitbitDashboard, "/get/fitbit/dashboard")
fitbit_api.add_resource(GetFitbitDailyData, "/get/fitbit/daily-data")
fitbit_api.add_resource(GetFitbitSleepData, "/get/fitbit/sleep-data")
fitbit_api.add_resource(GetFitbitActivities, "/get/fitbit/activities")
fitbit_api.add_resource(GetFitbitSyncLogs, "/get/fitbit/sync-logs")

# Webhooks
fitbit_api.add_resource(FitbitWebhook, "/webhook/fitbit")