import axios from "axios";
import { api } from "./apiConfig";

// ==================== FITBIT MODULE API FUNCTIONS ====================

// Fitbit Connection API Functions
export async function connectFitbit(params: any) {
  return api.get("/add-fitbit", {
    params: { ...params },
  });
}

export async function syncFitbitData(params: any) {
  console.log("Sending POST request to /sync/fitbit with payload:", params);
  try {
    const response = await api.post("/sync/fitbit", params);
    console.log("Response from /sync/fitbit:", response.data);
    return response;
  } catch (error: any) {
    console.error("Error in syncFitbitData:", error.message);
    throw error;
  }
}

export async function getFitbitDashboard(params: any) {
  console.log("Sending GET request to /get/fitbit/dashboard with payload:", params);
  try {
    const response = await api.get("/get/fitbit/dashboard", {
      params: { ...params },
    });
    console.log("Response from /get/fitbit/dashboard:", response.data);
    return response;
  } catch (error: any) {
    console.error("Error in getFitbitDashboard:", error.message);
    throw error;
  }
}

// Fitbit Data Retrieval Functions
export async function getFitbitDailyData(payload: { 
  uid: string; 
  startDate?: string; 
  endDate?: string; 
  limit?: number; 
}) {
  console.log("Sending GET request to /get/fitbit/daily-data with payload:", payload);
  try {
    const response = await api.get("/get/fitbit/daily-data", {
      params: payload,
    });
    console.log("Response from /get/fitbit/daily-data:", response.data);
    return response;
  } catch (error: any) {
    console.error("Error in getFitbitDailyData:", error.message);
    throw error;
  }
}

export async function getFitbitSleepData(payload: { 
  uid: string; 
  startDate?: string; 
  endDate?: string; 
  limit?: number; 
}) {
  console.log("Sending GET request to /get/fitbit/sleep-data with payload:", payload);
  try {
    const response = await api.get("/get/fitbit/sleep-data", {
      params: payload,
    });
    console.log("Response from /get/fitbit/sleep-data:", response.data);
    return response;
  } catch (error: any) {
    console.error("Error in getFitbitSleepData:", error.message);
    throw error;
  }
}

export async function getFitbitActivities(payload: { 
  uid: string; 
  startDate?: string; 
  endDate?: string; 
  limit?: number; 
}) {
  console.log("Sending GET request to /get/fitbit/activities with payload:", payload);
  try {
    const response = await api.get("/get/fitbit/activities", {
      params: payload,
    });
    console.log("Response from /get/fitbit/activities:", response.data);
    return response;
  } catch (error: any) {
    console.error("Error in getFitbitActivities:", error.message);
    throw error;
  }
}

export async function getFitbitSyncLogs(payload: { uid: string; limit?: number }) {
  console.log("Sending GET request to /get/fitbit/sync-logs with payload:", payload);
  try {
    const response = await api.get("/get/fitbit/sync-logs", {
      params: payload,
    });
    console.log("Response from /get/fitbit/sync-logs:", response.data);
    return response;
  } catch (error: any) {
    console.error("Error in getFitbitSyncLogs:", error.message);
    throw error;
  }
}

// Fitbit Account Management
export async function disconnectFitbit(payload: { uid: string }) {
  console.log("Sending POST request to /disconnect/fitbit with payload:", payload);
  try {
    const response = await api.post("/disconnect/fitbit", payload);
    console.log("Response from /disconnect/fitbit:", response.data);
    return response;
  } catch (error: any) {
    console.error("Error in disconnectFitbit:", error.message);
    throw error;
  }
}

export async function getFitbitConnectionStatus(payload: { uid: string }) {
  console.log("Sending GET request to /get/fitbit/connection-status with payload:", payload);
  try {
    const response = await api.get("/get/fitbit/connection-status", {
      params: payload,
    });
    console.log("Response from /get/fitbit/connection-status:", response.data);
    return response;
  } catch (error: any) {
    console.error("Error in getFitbitConnectionStatus:", error.message);
    throw error;
  }
}

// Fitbit Goals Management
export async function getFitbitGoals(payload: { uid: string; refresh?: boolean }) {
  return api.get("/get/fitbit/goals", { params: payload });
}

export async function syncFitbitGoals(payload: { uid: string }) {
  return api.post("/sync/fitbit/goals", payload);
}