import { STATUS_LABELS } from '../../constants/ticketStatus.js';

// TODO: Implement status badge styling

const StatusBadge = ({ status }) => {
  return (
    <span className={`status-badge status-badge--${status}`} aria-label={`Status: ${STATUS_LABELS[status]}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
};

export default StatusBadge;
