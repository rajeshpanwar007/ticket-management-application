import * as userService from '../services/user.service.js';

export const listUsers = async (req, res) => {
  // TODO: Implement
  const result = await userService.getUsers(req.query);
  res.status(200).json(result);
};

export const getUser = async (req, res) => {
  // TODO: Implement
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({ user });
};
