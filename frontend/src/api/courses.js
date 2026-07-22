import client from './client';

export const getCourses = (semester) =>
  client.get('/courses', { params: semester ? { semester } : {} }).then((r) => r.data.courses);

export const addCourse = (payload) => client.post('/courses', payload).then((r) => r.data.course);

export const updateCourse = (id, payload) =>
  client.put(`/courses/${id}`, payload).then((r) => r.data.course);

export const deleteCourse = (id) => client.delete(`/courses/${id}`).then((r) => r.data);

export const getGpaSummary = () => client.get('/courses/gpa-summary').then((r) => r.data);
