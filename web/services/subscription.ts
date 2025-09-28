import { api } from './apiConfig';

export async function getSubscriptions(params: any) {
  return api.get('/get/subscriptions', {
    params,
  });
}

export async function addSubscription(params: any) {
  return api.post('/create-checkout-session', params);
}
