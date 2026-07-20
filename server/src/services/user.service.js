import User from '../models/user.model.js';
import { NotFoundError } from '../errors/index.js';

const USER_PUBLIC_FIELDS = 'name email role';

export const getUsers = async ({ role } = {}) => {
  const filter = role ? { role } : {};

  const users = await User.find(filter).select(USER_PUBLIC_FIELDS).sort({ name: 1 }).lean();

  return { users, total: users.length };
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select(USER_PUBLIC_FIELDS).lean();

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};
