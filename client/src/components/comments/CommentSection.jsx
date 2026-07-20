import CommentList from './CommentList.jsx';
import CommentForm from './CommentForm.jsx';

// TODO: Implement comment section wrapper

const CommentSection = ({
  comments = [],
  users = [],
  onAddComment,
  isSubmitting = false,
  error,
}) => {
  return (
    <section className="comment-section">
      <h2 className="comment-section__title">Comments ({comments.length})</h2>
      <CommentList comments={comments} />
      <CommentForm
        users={users}
        onSubmit={onAddComment}
        isSubmitting={isSubmitting}
        error={error}
      />
    </section>
  );
};

export default CommentSection;
