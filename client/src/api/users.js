import apiClient from './client.js';

export const getUsers = async (params = {}) => {
  const { data } = await apiClient.get('/users', { params });
  return data;
};

export const getUserById = async (id) => {
  const { data } = await apiClient.get(`/users/${id}`);
  return data.user;
};
