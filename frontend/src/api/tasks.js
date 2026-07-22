import client from './client';

export const getTasks = (status) =>
  client.get('/tasks', { params: status ? { status } : {} }).then((r) => r.data.tasks);

export const addTask = (payload) => client.post('/tasks', payload).then((r) => r.data.task);

export const updateTask = (id, payload) =>
  client.put(`/tasks/${id}`, payload).then((r) => r.data.task);

export const deleteTask = (id) => client.delete(`/tasks/${id}`).then((r) => r.data);
