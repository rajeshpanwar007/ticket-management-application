// TODO: Implement client-side form validation helpers

export const validateRequired = (value, fieldName) => {
  if (!value || !String(value).trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateTicketForm = (values) => {
  // TODO: Implement full ticket form validation
  return {};
};

export const validateCommentForm = (values) => {
  // TODO: Implement comment form validation
  return {};
};
