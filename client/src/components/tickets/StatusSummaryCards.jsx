import { TICKET_STATUSES } from '../../constants/ticketStatus.js';
import StatusCard from './StatusCard.jsx';

// TODO: Implement status summary cards row

const StatusSummaryCards = ({ tickets = [], onStatusClick }) => {
  const counts = TICKET_STATUSES.reduce((acc, status) => {
    acc[status] = tickets.filter((t) => t.status === status).length;
    return acc;
  }, {});

  return (
    <div className="status-summary-cards">
      {TICKET_STATUSES.map((status) => (
        <StatusCard
          key={status}
          status={status}
          count={counts[status]}
          onClick={onStatusClick}
        />
      ))}
    </div>
  );
};

export default StatusSummaryCards;
