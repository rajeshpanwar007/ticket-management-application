import Comment from '../models/comment.model.js';
import User from '../models/user.model.js';
import { NotFoundError } from '../errors/index.js';
import { COMMENT_AUTHOR_POPULATE } from '../constants/populate.constants.js';
import { getActiveTicketById } from './ticket.service.js';

const ensureUserExists = async (userId, label = 'User') => {
  const exists = await User.exists({ _id: userId });
  if (!exists) {
    throw new NotFoundError(`${label} not found`);
  }
};

const populateComment = (comment) => comment.populate(COMMENT_AUTHOR_POPULATE);

export const getCommentsByTicketId = async (ticketId) => {
  await getActiveTicketById(ticketId);

  const comments = await Comment.find({ ticketId })
    .populate(COMMENT_AUTHOR_POPULATE)
    .sort({ createdAt: 1 })
    .lean();

  return { comments, total: comments.length };
};

export const addComment = async (ticketId, { body, authorId }) => {
  const ticket = await getActiveTicketById(ticketId);
  await ensureUserExists(authorId, 'Author');

  const comment = await Comment.create({
    ticketId,
    authorId,
    body,
  });

  ticket.updatedAt = new Date();
  await ticket.save();

  await populateComment(comment);
  return comment;
};
