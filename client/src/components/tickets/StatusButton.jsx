import { STATUS_ACTION_LABELS } from '../../constants/ticketStatus.js';

// TODO: Implement single status action button

const StatusButton = ({ status, onClick, loading = false }) => {
  return (
    <button
      type="button"
      className={`status-button status-button--${status}`}
      onClick={() => onClick(status)}
      disabled={loading}
    >
      {loading ? 'Updating...' : STATUS_ACTION_LABELS[status] || status}
    </button>
  );
};

export default StatusButton;
