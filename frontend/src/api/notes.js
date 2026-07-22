import client from './client';

export const getNotes = (tag) =>
  client.get('/notes', { params: tag ? { tag } : {} }).then((r) => r.data.notes);

export const addNote = (payload) => client.post('/notes', payload).then((r) => r.data.note);

export const updateNote = (id, payload) =>
  client.put(`/notes/${id}`, payload).then((r) => r.data.note);

export const deleteNote = (id) => client.delete(`/notes/${id}`).then((r) => r.data);
