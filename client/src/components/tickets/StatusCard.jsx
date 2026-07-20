import { STATUS_LABELS } from '../../constants/ticketStatus.js';

// TODO: Implement status summary card

const StatusCard = ({ status, count, onClick }) => {
  return (
    <button type="button" className={`status-card status-card--${status}`} onClick={() => onClick?.(status)}>
      <span className="status-card__label">{STATUS_LABELS[status]}</span>
      <span className="status-card__count">{count}</span>
    </button>
  );
};

export default StatusCard;
