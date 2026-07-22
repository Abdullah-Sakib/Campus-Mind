import client from './client';

export const getDashboard = () => client.get('/home/dashboard').then((r) => r.data);
