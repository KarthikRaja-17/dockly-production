import { api } from '../apiConfig';

// Fitbit OAuth Connection
export async function addFitbitAccount(params: any) {
  return api.get('/add-fitbit', {
    params,
  });
}

// Fitbit Data Sync
export async function syncFitbitData(params: any) {
  return api.post('/sync/fitbit', params);
}

// Get Fitbit Dashboard Data
export async function getFitbitDashboard(params: any) {
  return api.get('/get/fitbit/dashboard', { params });
}

// Get Daily Activity Data
export async function getFitbitDailyData(params: any) {
  return api.get('/get/fitbit/daily-data', { params });
}

// Get Sleep Data
export async function getFitbitSleepData(params: any) {
  return api.get('/get/fitbit/sleep-data', { params });
}

// Get Activities/Workouts
export async function getFitbitActivities(params: any) {
  return api.get('/get/fitbit/activities', { params });
}

// Get Sync Logs
export async function getFitbitSyncLogs(params: any) {
  return api.get('/get/fitbit/sync-logs', { params });
}

// Disconnect Fitbit Account
export async function disconnectFitbit(params: any) {
  return api.post('/disconnect/fitbit', params);
}

// Check Connection Status
export async function getFitbitConnectionStatus(params: any) {
  return api.get('/get/fitbit/connection-status', { params });
}