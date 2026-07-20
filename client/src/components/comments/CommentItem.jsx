import { formatDateTime } from '../../utils/format.js';

const CommentItem = ({ comment }) => {
  return (
    <article className="comment-item">
      <header className="comment-item__header">
        <span className="comment-item__author">{comment.authorId?.name || 'Unknown'}</span>
        <time className="comment-item__date" dateTime={comment.createdAt}>
          {formatDateTime(comment.createdAt)}
        </time>
      </header>
      <p className="comment-item__body">{comment.body}</p>
    </article>
  );
};

export default CommentItem;
