// TODO: Implement form action buttons

const FormActions = ({ onCancel, submitLabel = 'Submit', isSubmitting = false }) => {
  return (
    <div className="form-actions">
      {onCancel && (
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      )}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </div>
  );
};

export default FormActions;
