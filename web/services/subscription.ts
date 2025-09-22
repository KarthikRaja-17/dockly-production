import { api } from './apiConfig';

export async function getSubscriptions(params: any) {
  return api.get('/get/subscriptions', {
    params,
  });
}
