import CommentItem from './CommentItem.jsx';

// TODO: Implement comment list

const CommentList = ({ comments = [] }) => {
  if (comments.length === 0) {
    return <p className="comment-list__empty">No comments yet.</p>;
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <CommentItem key={comment._id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;
