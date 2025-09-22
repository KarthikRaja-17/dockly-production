import { api } from '../apiConfig';

export async function GetAllUsers(
  params: any,
  userType: 'app' | 'waitlist' = 'app'
) {
  return api.get('/get/all/users', {
    params: { ...params, user_type: userType },
  });
}

export async function GetUserStats(
  params: any,
  userType: 'app' | 'waitlist' = 'app'
) {
  return api.get('/get/all/users/stats', {
    params: { ...params, user_type: userType },
  });
}

export async function CreateUser(
  userData: any,
  userType: 'app' | 'waitlist' = 'app'
) {
  return api.post('/admin/users/create', { ...userData, user_type: userType });
}

export async function UpdateUser(
  uid: string,
  userData: any,
  userType: 'app' | 'waitlist' = 'app'
) {
  return api.put(`/admin/users/update/${uid}`, {
    ...userData,
    user_type: userType,
  });
}

export async function SuspendUser(
  uid: string,
  userType: 'app' | 'waitlist' = 'app'
) {
  return api.put(`/admin/users/suspend/${uid}`, { user_type: userType });
}

export async function GetUserMenus(userId: string) {
  return api.get(`/get/user/menus/${userId}`);
}

export async function DeleteUserPermission(
  permissionId: string,
  userId: string
) {
  return api.delete(
    `/admin/users/permissions/${permissionId}?userId=${userId}`
  );
}

export async function AddUserPermissions(userId: string, permissions: any[]) {
  return api.post(`/admin/users/permissions/${userId}`, { permissions });
}

export async function GetAllBoards() {
  return api.get('/get/all/boards');
}

export async function GetAllHubs() {
  return api.get('/get/all/hubs');
}
