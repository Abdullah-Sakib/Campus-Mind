import client from './client';

export const signup = (payload) => client.post('/auth/signup', payload).then((r) => r.data);

export const login = (payload) => client.post('/auth/login', payload).then((r) => r.data);

export const googleAuth = (payload) => client.post('/auth/google', payload).then((r) => r.data);

export const forgotPassword = (email) =>
  client.post('/auth/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (token, password) =>
  client.post('/auth/reset-password', { token, password }).then((r) => r.data);

export const getMe = () => client.get('/auth/me').then((r) => r.data);
