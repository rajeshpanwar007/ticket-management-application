import * as commentsApi from '../api/comments.js';
import { withRetry } from './retry.js';

export const commentService = {
  getComments: (ticketId) => withRetry(() => commentsApi.getComments(ticketId)),
  addComment: (ticketId, payload) => commentsApi.addComment(ticketId, payload),
};

export default commentService;
