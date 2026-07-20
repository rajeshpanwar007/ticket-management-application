import * as commentService from '../services/comment.service.js';

export const addComment = async (req, res) => {
  // TODO: Implement
  const comment = await commentService.addComment(req.params.id, req.body);
  res.status(201).json({ comment });
};
