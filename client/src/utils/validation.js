const TITLE_MAX = 200;
const DESCRIPTION_MAX = 5000;
const COMMENT_MAX = 2000;

export const validateRequired = (value, fieldName) => {
  if (!value || !String(value).trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMaxLength = (value, max, fieldName) => {
  if (value && String(value).length > max) {
    return `${fieldName} cannot exceed ${max} characters`;
  }
  return null;
};

export const validateTicketForm = (values, mode = 'create') => {
  const errors = {};

  const titleError =
    validateRequired(values.title, 'Title') ||
    validateMaxLength(values.title, TITLE_MAX, 'Title');
  if (titleError) errors.title = titleError;

  const descriptionError =
    validateRequired(values.description, 'Description') ||
    validateMaxLength(values.description, DESCRIPTION_MAX, 'Description');
  if (descriptionError) errors.description = descriptionError;

  if (mode === 'create' && validateRequired(values.createdBy, 'Created by')) {
    errors.createdBy = 'Created by is required';
  }

  return errors;
};

export const validateCommentForm = (values) => {
  const errors = {};

  const bodyError =
    validateRequired(values.body, 'Comment') ||
    validateMaxLength(values.body, COMMENT_MAX, 'Comment');
  if (bodyError) errors.body = bodyError;

  if (validateRequired(values.authorId, 'Author')) {
    errors.authorId = 'Author is required';
  }

  return errors;
};
