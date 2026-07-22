import client from './client';

export const getRoutine = (day) =>
  client.get('/routine', { params: day ? { day } : {} }).then((r) => r.data.classes);

export const addClass = (payload) => client.post('/routine', payload).then((r) => r.data.class);

export const updateClass = (id, payload) =>
  client.put(`/routine/${id}`, payload).then((r) => r.data.class);

export const deleteClass = (id) => client.delete(`/routine/${id}`).then((r) => r.data);
