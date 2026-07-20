import * as usersApi from '../api/users.js';
import { withRetry } from './retry.js';

export const userService = {
  getUsers: (params) => withRetry(() => usersApi.getUsers(params)),
  getUserById: (id) => withRetry(() => usersApi.getUserById(id)),
};

export default userService;
