import axios from 'axios';

// export const API_URL = 'http://localhost:5000/server/api';
// export const API_URL = 'https://dockly.onrender.com/server/api'; //DEPLOYMENT
// export const API_URL = "https://dockly-deployment.onrender.com/server/api"; //DEPLOYMENTs
//

export const API_URL = 'https://dockly-production.onrender.com/server/api'; //DEPLOYMENT

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (typeof window !== 'undefined') {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('Dtoken'); // ✅ Now runs only on client
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

export async function emailVerification(params: any) {
  return api.post('/user/email/otpVerification', params);
}

export async function mobileVerification(params: any) {
  return api.post('/user/mobile/otpVerification', params);
}

export async function signInVerification(params: any) {
  return api.post('/user/signIn/otpVerification', params);
}

export async function userDetails(params: any) {
  return api.post('/user/add-details', params);
}

export async function userLogin(params: any) {
  return api.post('/user/sign-in', params);
}
export async function getBankDetails(params: any) {
  return api.post('/get-bank-details', params);
}

export async function bankSignup(params: any) {
  return api.post('/signup/bank', params);
}

export async function bankConnect(params: any) {
  return api.post('/connect/bank', params);
}
export async function getBankAccount(params: any) {
  return api.post('/get/bank-account', params);
}

export async function getSmartBookmarks(uid: string) {
  return api.get('/bookmarks/get', {
    params: { uid },
  });
}
export async function getRecentActivities(uid: any) {
  return api.get('user/get/recent-activities', {
    params: { uid },
  });
}

export async function getLoansAndMortgages(params: any) {
  return api.post('/get/loans_and_mortgages', params).then((res) => res.data);
}

// export async function getCurrentUser(params: string) {
//   return api.get("/user/get/currentUser", {
//     params: { params },
//   });
// }

export async function saveBankTransactions({
  session,
  user_id,
  signal,
}: {
  session: any;
  user_id: any;
  signal?: AbortSignal;
}) {
  try {
    console.log('saveBankTransactions: Sending POST request', { user_id });
    const response = await api.post(
      '/save/bank-transactions',
      { session, user_id },
      { signal }
    );
    return response.data;
  } catch (error) {
    console.error('saveBankTransactions: Error', error);
    throw error;
  }
}

export async function getAllTransactions({
  uid,
  page = 1,
  page_size = 10,
  type_filter = 'all',
  signal,
}: {
  uid: string;
  page?: number;
  page_size?: number;
  type_filter?: string;
  signal?: AbortSignal;
}) {
  try {
    console.log('getAllTransactions: Sending GET request', {
      uid,
      page,
      page_size,
      type_filter,
    });
    const response = await api.get('/get/saved-transactions', {
      params: { uid, page, page_size, type_filter },
      signal,
    });
    return response.data;
  } catch (error) {
    console.error('getAllTransactions: Error', error);
    throw error;
  }
}

export async function getRecurringTransactions(params: any) {
  return api.get('/get/recurring-transactions', params).then((res) => res.data);
}

export async function addAccounts(params: any) {
  return api.post('/add/accounts', params);
}

export async function getAccounts(params: any) {
  return api.post('/get/accounts', params);
}

export async function getExpenseIncome(params: any) {
  return api.post('/get/income-expense', params).then((res) => res.data);
}
// /get/total-balance
export async function getTotalBalance(params: any) {
  return api.post('/get/total-balance', params).then((res) => res.data);
}

export async function getCurrentUser(uid: string) {
  console.log('Calling getCurrentUser');
  try {
    const response = await api.get('/currentUser');
    return response;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    throw error;
  }
}
export interface FinanceGoal {
  id: string;
  user_id: string;
  name: string;
  saved_percentage: number;
  target_percentage: number;
  saved_amount: number;
  target_amount: number;
  goal_status: number;
  deadline?: string;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}
export interface ApiResponse<T> {
  status: number;
  message: string;
  payload: T;
}

export async function addFinanceGoal(
  params: any
): Promise<ApiResponse<{ goal: FinanceGoal }>> {
  return api.post('/add/finance-goal', params).then((res) => res.data);
}

export async function getFinanceGoals(
  params: any
): Promise<ApiResponse<{ goals: FinanceGoal[] }>> {
  return api.get('/get/finance-goal', { params }).then((res) => res.data);
}

export async function updateFinanceGoal(
  goalId: string,
  params: any
): Promise<ApiResponse<{ goal: FinanceGoal }>> {
  return api
    .put(`/update/finance-goal/${goalId}`, params)
    .then((res) => res.data);
}

export async function deleteFinanceGoal(
  goalId: string
): Promise<ApiResponse<{ goal: FinanceGoal }>> {
  return api.delete(`/delete/finance-goal/${goalId}`).then((res) => res.data);
}

export async function updateRecurringStatus(payload: {
  uid: string;
  updates: { transaction_id: string; is_recurring: string }[];
}) {
  console.log(
    'Sending PUT request to /update/recurring-status with payload:',
    payload
  );
  try {
    const response = await api.put('/update/recurring-status', payload);
    console.log('Response from /update/recurring-status:', response.data);
    return response.data; // ✅ return backend JSON, not full Axios response
  } catch (error: any) {
    console.error('Error in updateRecurringStatus:', error.message);
    throw error;
  }
}

export async function generateMonthlyBudget(payload: {
  uid: string;
  page?: number;
  page_size?: number;
}) {
  console.log(
    'Sending POST request to /get/monthly-budget with payload:',
    payload
  );
  try {
    const response = await api.post('/get/monthly-budget', payload);
    console.log('Response from /get/monthly-budget:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in generateMonthlyBudget:', error.message);
    throw error;
  }
}

export async function updateMonthlyBudget(payload: {
  uid: string;
  budget_categories: any;
}) {
  console.log(
    'Sending POST request to /update/monthly-budget with payload:',
    payload
  );
  try {
    const response = await api.post('/update/monthly-budget', payload);
    console.log('Response from /update/monthly-budget:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in updateMonthlyBudget:', error.message);
    throw error;
  }
}

export async function saveBudgetCategory(payload: {
  uid: string;
  transaction_id: string;
  category: string;
}) {
  console.log(
    'Sending POST request to /save/budget-category with payload:',
    payload
  );
  try {
    const response = await api.post('/save/budget-category', payload);
    console.log('Response from /save/budget-category:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in saveBudgetCategory:', error.message);
    throw error;
  }
}

export async function getBankTransactions(payload: { uid: string }) {
  console.log(
    'Sending GET request to /get/bank-transactions with payload:',
    payload
  );
  try {
    const response = await api.get('/get/bank-transactions', {
      params: payload,
    });
    console.log('Response from /get/bank-transactions:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in getBankTransactions:', error.message);
    throw error;
  }
}
export async function updateTransactionCategory(
  transaction_id: string,
  value: string,
  payload: {
    uid: string;
    transaction_id: string;
    category: string;
  }
) {
  console.log(
    'Sending POST request to /update/transaction-category with payload:',
    payload
  );
  try {
    const response = await api.post('/update/transaction-category', payload);
    console.log('Response from /update/transaction-category:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in updateTransactionCategory:', error.message);
    throw error;
  }
}

export async function getTransactionsByCategory(payload: {
  uid: string;
  category?: string;
}) {
  console.log(
    'Sending GET request to /get/transactions-by-category with payload:',
    payload
  );
  try {
    const response = await api.get('/get/transactions-by-category', {
      params: payload,
    });
    console.log('Response from /get/transactions-by-category:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in getTransactionsByCategory:', error.message);
    throw error;
  }
}

export async function updateBudgetAllocation(payload: {
  uid: string;
  category: string;
  budget_amount: number;
}) {
  console.log(
    'Sending POST request to /update/budget-allocation with payload:',
    payload
  );
  try {
    const response = await api.post('/update/budget-allocation', payload);
    console.log('Response from /update/budget-allocation:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in updateBudgetAllocation:', error.message);
    throw error;
  }
}
// ==================== HEALTH MODULE API FUNCTIONS ====================
export async function getMedications(params: any) {
  return api.get('/health/medications', {
    params: { ...params },
  });
}

export async function addMedication(params: any) {
  return api.post('/health/medications', params);
}

export async function updateMedication(medicationId: number, params: any) {
  return api.put(`/health/medications/${medicationId}`, params);
}

export async function deleteMedication(medicationId: number) {
  return api.delete(`/health/medications/${medicationId}`);
}

export async function getRefillAlerts(params: any) {
  return api.get('/health/medications/refill-alerts', {
    params: { ...params },
  });
}

// =================== MEDICATION SHARING API ====================
export async function shareMedication(params: {
  email: string | string[];
  medication: {
    id?: number;
    name: string;
    dosage: string;
    conditionTreated: string;
    prescribingDoctor?: string;
    schedule: string;
    refillDaysLeft: number;
    icon?: string;
    isRefillSoon?: boolean;
  };
  tagged_members?: string[];
}) {
  return api.post('/health/medications/share', params);
}

export async function shareInsurance(params: {
  email: string | string[];
  insurance_account: {
    id?: number;
    provider_name: string;
    plan_name: string;
    account_type?: string;
    details: Array<{
      label: string;
      value: string;
    }>;
    contact_info?: string;
    logo_text?: string;
    gradient_style?: string;
    notes?: string;
  };
  tagged_members?: string[];
}) {
  return api.post('/health/insurance/share', params);
}

export async function shareProvider(params: {
  email: string | string[];
  provider: {
    id?: number;
    name: string;
    specialty: string;
    phone?: string;
    practiceName?: string;
    address?: string;
    icon?: string;
    notes?: string;
  };
  tagged_members?: string[];
}) {
  return api.post('/health/providers/share', params);
}

// Wellness Tasks API Functions

// ==================== UPDATED WELLNESS TASK SHARING API ====================

// UPDATED: Share wellness task with new date structure

// UPDATED: Add wellness task with conditional date validation
export async function addWellnessTask(params: {
  icon: string;
  text: string;
  // Legacy field for backward compatibility
  date?: string;
  // NEW: Conditional date fields
  start_date?: string;
  due_date?: string;
  recurring?: boolean;
  details?: string;
  completed?: boolean;
  tagged_members?: string[];
  editing?: boolean;
}) {
  return api.post('/health/wellness/tasks', params);
}

export async function getWellnessTasks(params: any) {
  return api.get('/health/wellness/tasks', {
    params: { ...params },
  });
}
export async function getUpcomingWellnessTasks(params?: any) {
  return api.get('/health/wellness/tasks/upcoming', {
    params: { ...params },
  });
}

export async function getFamilyMembersForHealth(params?: any) {
  return api.get('/health/summary/family-members', {
    params: { ...params },
  });
}

export async function updateWellnessTask(
  taskId: number,
  params: {
    icon?: string;
    text?: string;
    // Legacy field for backward compatibility
    date?: string;
    // NEW: Conditional date fields
    start_date?: string;
    due_date?: string;
    recurring?: boolean;
    details?: string;
    completed?: boolean;
    tagged_members?: string[];
    editing?: boolean;
  }
) {
  return api.put(`/health/wellness/tasks/${taskId}`, params);
}

export async function shareWellnessTask(params: {
  email: string | string[];
  wellness_task: {
    id?: number;
    icon: string;
    text: string;
    // Legacy field for backward compatibility
    date?: string;
    // NEW: Conditional date fields
    start_date?: string;
    due_date?: string;
    recurring?: boolean;
    details?: string;
    completed?: boolean;
  };
  tagged_members?: string[];
}) {
  return api.post('/health/wellness/share/tasks', params);
}

export async function deleteWellnessTask(taskId: number) {
  return api.delete(`/health/wellness/tasks/${taskId}`);
}

export async function toggleWellnessTask(taskId: number) {
  return api.put(`/health/wellness/tasks/${taskId}/toggle`);
}
// Add these functions to your existing apiConfig file

// Healthcare Providers API functions
// Add these functions to your existing apiConfig file

// Healthcare Providers API functions
export const getProviders = (data: any) => {
  return api.get('/health/providers', data);
};

export const addProvider = (data: any) => {
  return api.post('/health/providers', data);
};

export const updateProvider = (id: any, data: any) => {
  return api.put(`/health/providers/${id}`, data);
};

export const deleteProvider = (id: any) => {
  return api.delete(`/health/providers/${id}`);
};

// Insurance Accounts API functions
export const getInsuranceAccounts = (data: any) => {
  return api.get('/health/insurance', data);
};

export const addInsuranceAccount = (data: any) => {
  return api.post('/health/insurance', data);
};

export const updateInsuranceAccount = (id: any, data: any) => {
  return api.put(`/health/insurance/${id}`, data);
};

export const deleteInsuranceAccount = (id: any) => {
  return api.delete(`/health/insurance/${id}`);
};

export async function sendFeedback(params: any) {
  return api.post('/user/send/feedback', params).then((res) => res.data);
}
export async function sendAdditionalEmailOtp(params: any) {
  return api.post('/user/send/additional-email-otp', params);
}

export async function verifyAdditionalEmailOtp(params: any) {
  return api.post('/user/verify/additional-email-otp', params);
}
// ✅ Upload profile picture
export async function uploadProfilePicture(formData: FormData) {
  return api.post('/user/upload/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// ✅ Get all profile pictures
export async function getProfilePictures(params?: any) {
  return api.get('/user/get/profile-pictures', { params });
}

export async function getHealthSummaryInfo(params: any) {
  return api.get('/health/summary/info', {
    params: { ...params },
  });
}

export async function addHealthSummaryInfo(params: any) {
  return api.post('/health/summary/info', params);
}

export async function updateHealthSummaryInfo(params: any) {
  return api.post('/health/summary/info', params);
}

// User Allergies API Functions
export async function getUserAllergies(params: any) {
  return api.get('/health/summary/allergies', {
    params: { ...params },
  });
}

export async function addUserAllergy(params: any) {
  return api.post('/health/summary/allergies', params);
}

export async function updateUserAllergy(allergyId: number, params: any) {
  return api.put(`/health/summary/allergies/${allergyId}`, params);
}

export async function deleteUserAllergy(allergyId: number) {
  return api.delete(`/health/summary/allergies/${allergyId}`);
}

// User Conditions API Functions
export async function getUserConditions(params: any) {
  return api.get('/health/summary/conditions', {
    params: { ...params },
  });
}

export async function addUserCondition(params: any) {
  return api.post('/health/summary/conditions', params);
}

export async function updateUserCondition(conditionId: number, params: any) {
  return api.put(`/health/summary/conditions/${conditionId}`, params);
}

export async function deleteUserCondition(conditionId: number) {
  return api.delete(`/health/summary/conditions/${conditionId}`);
}

// Family Medical History API Functions
export async function getFamilyMedicalHistory(params: any) {
  return api.get('/health/summary/family-history', {
    params: { ...params },
  });
}

export async function addFamilyMedicalHistory(params: any) {
  return api.post('/health/summary/family-history', params);
}

export async function updateFamilyMedicalHistory(
  historyId: number,
  params: any
) {
  return api.put(`/health/summary/family-history/${historyId}`, params);
}

export async function deleteFamilyMedicalHistory(historyId: number) {
  return api.delete(`/health/summary/family-history/${historyId}`);
}

// ==================== FITBIT MODULE API FUNCTIONS ====================

// Add these functions to your existing apiConfig.ts file

// Fitbit Connection API Functions
export async function connectFitbit(params: any) {
  return api.get('/add-fitbit', {
    params: { ...params },
  });
}

export async function syncFitbitData(params: any) {
  console.log('Sending POST request to /sync/fitbit with payload:', params);
  try {
    const response = await api.post('/sync/fitbit', params);
    console.log('Response from /sync/fitbit:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in syncFitbitData:', error.message);
    throw error;
  }
}

export async function getFitbitDashboard(params: any) {
  console.log(
    'Sending GET request to /get/fitbit/dashboard with payload:',
    params
  );
  try {
    const response = await api.get('/get/fitbit/dashboard', {
      params: { ...params },
    });
    console.log('Response from /get/fitbit/dashboard:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in getFitbitDashboard:', error.message);
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
  console.log(
    'Sending GET request to /get/fitbit/daily-data with payload:',
    payload
  );
  try {
    const response = await api.get('/get/fitbit/daily-data', {
      params: payload,
    });
    console.log('Response from /get/fitbit/daily-data:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in getFitbitDailyData:', error.message);
    throw error;
  }
}

export async function getFitbitSleepData(payload: {
  uid: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  console.log(
    'Sending GET request to /get/fitbit/sleep-data with payload:',
    payload
  );
  try {
    const response = await api.get('/get/fitbit/sleep-data', {
      params: payload,
    });
    console.log('Response from /get/fitbit/sleep-data:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in getFitbitSleepData:', error.message);
    throw error;
  }
}

export async function getFitbitActivities(payload: {
  uid: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  console.log(
    'Sending GET request to /get/fitbit/activities with payload:',
    payload
  );
  try {
    const response = await api.get('/get/fitbit/activities', {
      params: payload,
    });
    console.log('Response from /get/fitbit/activities:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in getFitbitActivities:', error.message);
    throw error;
  }
}

export async function getFitbitSyncLogs(payload: {
  uid: string;
  limit?: number;
}) {
  console.log(
    'Sending GET request to /get/fitbit/sync-logs with payload:',
    payload
  );
  try {
    const response = await api.get('/get/fitbit/sync-logs', {
      params: payload,
    });
    console.log('Response from /get/fitbit/sync-logs:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in getFitbitSyncLogs:', error.message);
    throw error;
  }
}

// Fitbit Account Management
export async function disconnectFitbit(payload: { uid: string }) {
  console.log(
    'Sending POST request to /disconnect/fitbit with payload:',
    payload
  );
  try {
    const response = await api.post('/disconnect/fitbit', payload);
    console.log('Response from /disconnect/fitbit:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in disconnectFitbit:', error.message);
    throw error;
  }
}

export async function getFitbitConnectionStatus(payload: { uid: string }) {
  console.log(
    'Sending GET request to /get/fitbit/connection-status with payload:',
    payload
  );
  try {
    const response = await api.get('/get/fitbit/connection-status', {
      params: payload,
    });
    console.log('Response from /get/fitbit/connection-status:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in getFitbitConnectionStatus:', error.message);
    throw error;
  }
}

// ==================== GARMIN MODULE API FUNCTIONS ====================
// Add these functions to your services/apiConfig.ts file

// Garmin Connection Management
export async function getGarminConnectionStatus(payload: { uid: string }) {
  return api.get('/get/garmin/connection-status', { params: payload });
}

export async function disconnectGarmin(payload: { uid: string }) {
  return api.post('/disconnect/garmin', payload);
}

// Garmin Data Synchronization
export async function syncGarminData(payload: { uid: string }) {
  return api.post('/sync/garmin', payload);
}

// Garmin Goals Management
export async function getGarminGoals(payload: {
  uid: string;
  refresh?: boolean;
}) {
  return api.get('/get/garmin/goals', { params: payload });
}

export async function syncGarminGoals(payload: { uid: string }) {
  return api.post('/sync/garmin/goals', payload);
}

// Garmin Body Composition Management
export async function getGarminBodyData(payload: {
  uid: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return api.get('/get/garmin/body-data', { params: payload });
}

export async function syncGarminBodyData(payload: { uid: string }) {
  return api.post('/sync/garmin/body-data', payload);
}

// Garmin Women's Health Management
export async function getGarminWomensHealthData(payload: {
  uid: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return api.get('/get/garmin/womens-health', { params: payload });
}

export async function syncGarminWomensHealthData(payload: { uid: string }) {
  return api.post('/sync/garmin/womens-health', payload);
}

// Garmin Dashboard and Data Retrieval
export async function getGarminDashboard(payload: { uid: string }) {
  return api.get('/get/garmin/dashboard', { params: payload });
}

export async function getGarminDailyData(payload: {
  uid: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return api.get('/get/garmin/daily-data', { params: payload });
}

export async function getGarminSleepData(payload: {
  uid: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return api.get('/get/garmin/sleep-data', { params: payload });
}

export async function getGarminActivities(payload: {
  uid: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return api.get('/get/garmin/activities', { params: payload });
}

export async function getGarminSyncLogs(payload: {
  uid: string;
  limit?: number;
}) {
  return api.get('/get/garmin/sync-logs', { params: payload });
}

// Garmin OAuth Helper Function
export function initializeGarminOAuth(userId: string, username: string) {
  const popupUrl = `${API_URL}/add-garmin?userId=${encodeURIComponent(
    userId
  )}&username=${encodeURIComponent(username)}`;

  const popup = window.open(
    popupUrl,
    'garmin_oauth',
    'width=600,height=700,scrollbars=yes,resizable=yes'
  );

  return new Promise((resolve, reject) => {
    // Listen for OAuth success messages
    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5000',
        window.location.origin,
      ];

      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      if (event.data && event.data.type === 'GARMIN_OAUTH_SUCCESS') {
        window.removeEventListener('message', handleMessage);

        // Close popup if still open
        if (popup && !popup.closed) {
          popup.close();
        }

        resolve({
          success: true,
          token: event.data.token,
          user: event.data.user,
          sync_results: event.data.sync_results,
        });
      }
    };

    window.addEventListener('message', handleMessage);

    // Check for localStorage fallback every second
    const checkLocalStorage = setInterval(() => {
      try {
        const result = localStorage.getItem('garmin_oauth_result');
        if (result) {
          const parsedResult = JSON.parse(result);
          if (
            parsedResult &&
            parsedResult.type === 'GARMIN_OAUTH_SUCCESS' &&
            parsedResult.userId === userId
          ) {
            localStorage.removeItem('garmin_oauth_result');
            window.removeEventListener('message', handleMessage);
            clearInterval(checkLocalStorage);

            if (popup && !popup.closed) {
              popup.close();
            }

            resolve({
              success: true,
              token: parsedResult.token,
              user: parsedResult.user,
              sync_results: parsedResult.sync_results,
            });
          }
        }
      } catch (error) {
        console.error('Error checking localStorage:', error);
      }
    }, 1000);

    // Handle popup closed manually
    const checkClosed = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkClosed);
        clearInterval(checkLocalStorage);
        window.removeEventListener('message', handleMessage);

        // Check localStorage one final time in case message was missed
        try {
          const result = localStorage.getItem('garmin_oauth_result');
          if (result) {
            const parsedResult = JSON.parse(result);
            if (
              parsedResult &&
              parsedResult.type === 'GARMIN_OAUTH_SUCCESS' &&
              parsedResult.userId === userId
            ) {
              localStorage.removeItem('garmin_oauth_result');
              resolve({
                success: true,
                token: parsedResult.token,
                user: parsedResult.user,
                sync_results: parsedResult.sync_results,
              });
              return;
            }
          }
        } catch (error) {
          console.error('Error with final localStorage check:', error);
        }

        reject(new Error('OAuth popup was closed before completion'));
      }
    }, 1000);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkClosed);
      clearInterval(checkLocalStorage);
      window.removeEventListener('message', handleMessage);

      if (popup && !popup.closed) {
        popup.close();
      }

      reject(new Error('OAuth timeout - please try again'));
    }, 5 * 60 * 1000);
  });
}
