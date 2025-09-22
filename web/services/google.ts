import { api } from './apiConfig';

export async function addGoogleCalendar(params: any) {
  return api.get('/add-googleCalendar', {
    params,
  });
}

export async function getCalendarEvents(params: any) {
  return api.get('/get/calendar/events', {
    params,
  });
}

export async function addGoogleCalendarEvents(params: any) {
  return api.post('/add/calendar/events', params);
}

export async function addNotes(params: any) {
  return api.post('/add/notes', params);
}

export async function deleteNotes(params: any) {
  return api.post('/delete/notes', params);
}

export async function updateNotes(params: any) {
  return api.post('/update/notes', params);
}

export async function getNotes(params: any) {
  return api.get('/get/notes', { params });
}

export async function addEvent(params: any) {
  return api.post('/add/event', params);
}
