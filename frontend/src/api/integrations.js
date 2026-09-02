import client from './client';

export const getGoogleConnectUrl = () => client.get('/integrations/google/connect');
export const getEmailStatus = () => client.get('/integrations/email/status');
export const sendEmailTest = (email) => client.post('/integrations/email/test', { email });
