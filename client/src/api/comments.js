import apiClient from './client.js';

export const getComments = async (ticketId) => {
  const { data } = await apiClient.get(`/tickets/${ticketId}/comments`);
  return data;
};

export const addComment = async (ticketId, payload) => {
  const { data } = await apiClient.post(`/tickets/${ticketId}/comments`, payload);
  return data.comment;
};
