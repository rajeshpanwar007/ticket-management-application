import { useEffect, useState } from 'react';
import UserSelect from '../tickets/UserSelect.jsx';
import { validateCommentForm } from '../../utils/validation.js';

const CommentForm = ({ users = [], onSubmit, isSubmitting = false, error }) => {
  const [values, setValues] = useState({ body: '', authorId: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!values.authorId && users.length > 0) {
      const defaultAuthor = users.find((user) => user.role === 'customer')?._id ?? users[0]._id;
      setValues((current) => ({ ...current, authorId: defaultAuthor }));
    }
  }, [users, values.authorId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateCommentForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await onSubmit?.({
      body: values.body.trim(),
      authorId: values.authorId,
    });

    setValues({ body: '', authorId: values.authorId });
    setErrors({});
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit} noValidate>
      <UserSelect
        label="Author"
        users={users}
        value={values.authorId}
        onChange={(authorId) => {
          setValues((current) => ({ ...current, authorId }));
          setErrors((current) => ({ ...current, authorId: undefined }));
        }}
        error={errors.authorId}
      />

      <textarea
        className="comment-form__input"
        placeholder="Add a comment..."
        aria-label="Comment body"
        rows={3}
        value={values.body}
        onChange={(event) => {
          setValues((current) => ({ ...current, body: event.target.value }));
          setErrors((current) => ({ ...current, body: undefined }));
        }}
      />
      {errors.body && <p className="comment-form__error" role="alert">{errors.body}</p>}
      {error && <p className="comment-form__error" role="alert">{error}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
};

export default CommentForm;
