import StatusButton from './StatusButton.jsx';

const StatusActions = ({ allowedNextStatuses = [], onTransition, loading = false, error, onDismissError }) => {
  if (!allowedNextStatuses.length) {
    return <p className="status-actions__terminal">No further status changes available.</p>;
  }

  return (
    <section className="status-actions">
      <h2 className="status-actions__title">Status Actions</h2>
      <div className="status-actions__buttons">
        {allowedNextStatuses.map((status) => (
          <StatusButton
            key={status}
            status={status}
            onClick={onTransition}
            loading={loading}
          />
        ))}
      </div>
      {error && (
        <div className="error-alert" role="alert">
          <p className="error-alert__message">{error}</p>
          {onDismissError && (
            <button type="button" className="error-alert__retry" onClick={onDismissError}>
              Dismiss
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default StatusActions;
