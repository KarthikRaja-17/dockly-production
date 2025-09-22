import { api } from './apiConfig';

export async function getDashboardBoards(params: any) {
  return api.get('/get/dashboard/boards', {
    params,
  });
}

export async function getUserHubs(params: any) {
  return api.get('/get/user/hubs', { params });
}

export async function getRecentActivities(params: any) {
  return api.get('/get/notifications', { params });
}

export async function getUserConnectedAccounts(params: any) {
  return api.get('/get/connected-accounts', { params });
}

export async function removeConnectedAccount(accountId: number) {
  return api.post(`/remove/connected-account`, { id: accountId });
}

export async function respondToNotification(params: any) {
  return api.post('/respond/notification', params);
}

export async function fetchSharedItemNotifications() {
  return api.get('/get/notifications/shared-items');
}

export async function markNotificationAsRead(id: number) {
  return api.post('/notifications/mark-read', { id });
}
