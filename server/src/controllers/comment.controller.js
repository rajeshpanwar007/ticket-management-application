import * as commentService from '../services/comment.service.js';

export const getComments = async (req, res) => {
  const result = await commentService.getCommentsByTicketId(req.params.id);
  res.status(200).json(result);
};

export const addComment = async (req, res) => {
  const comment = await commentService.addComment(req.params.id, req.body);
  res.status(201).json({ comment });
};
