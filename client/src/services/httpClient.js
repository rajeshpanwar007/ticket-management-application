import axios from 'axios';
import { getErrorMessage } from '../utils/apiError.js';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    error.normalizedMessage = getErrorMessage(error);
    return Promise.reject(error);
  },
);

export default httpClient;
