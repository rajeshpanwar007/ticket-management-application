import UserSelect from '../tickets/UserSelect.jsx';

// TODO: Implement add comment form

const CommentForm = ({ users = [], onSubmit, isSubmitting = false, error }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Collect body and authorId, call onSubmit
    onSubmit?.({ body: '', authorId: '' });
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <UserSelect label="Author" users={users} value="" onChange={() => {}} />
      <textarea
        className="comment-form__input"
        placeholder="Add a comment..."
        aria-label="Comment body"
        rows={3}
      />
      {error && <p className="comment-form__error" role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
};

export default CommentForm;
