// TODO: Implement empty state component

const EmptyState = ({ title, message, actionLabel, onAction }) => {
  return (
    <div className="empty-state">
      <h2 className="empty-state__title">{title}</h2>
      {message && <p className="empty-state__message">{message}</p>}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="empty-state__action">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
