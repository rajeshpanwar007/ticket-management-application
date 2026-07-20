import apiClient from './client.js';

export const getTickets = async (params = {}) => {
  const { data } = await apiClient.get('/tickets', { params });
  return data;
};

export const getTicketById = async (id) => {
  const { data } = await apiClient.get(`/tickets/${id}`);
  return data.ticket;
};

export const createTicket = async (payload) => {
  const { data } = await apiClient.post('/tickets', payload);
  return data.ticket;
};

export const updateTicket = async (id, payload) => {
  const { data } = await apiClient.patch(`/tickets/${id}`, payload);
  return data.ticket;
};

export const updateTicketStatus = async (id, status) => {
  const { data } = await apiClient.patch(`/tickets/${id}/status`, { status });
  return data.ticket;
};
