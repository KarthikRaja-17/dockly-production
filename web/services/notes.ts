import { api } from './apiConfig';

export async function addNotes(params: any) {
  return api.post('/add/sticky-notes', params);
}

export async function getNotes(params: any) {
  return api.get('/get/sticky-notes', {
    params: { ...params },
  });
}
