import { api } from './apiConfig';

export default async function addNotificationsSettings(params: any) {
  return api.post('/settings/notifications', params);
}
