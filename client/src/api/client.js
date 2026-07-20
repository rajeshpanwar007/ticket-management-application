import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: Add request interceptor for auth token (stretch)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: Normalize API error shape from error.response.data
    return Promise.reject(error);
  },
);

export default apiClient;
