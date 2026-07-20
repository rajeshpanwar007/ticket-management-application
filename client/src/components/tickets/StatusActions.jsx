import StatusButton from './StatusButton.jsx';
import ErrorAlert from '../common/ErrorAlert.jsx';

// TODO: Implement status actions container

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
      {error && <ErrorAlert message={error} onRetry={onDismissError} />}
    </section>
  );
};

export default StatusActions;
