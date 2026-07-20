import { TICKET_STATUSES, STATUS_LABELS } from '../../constants/ticketStatus.js';

// TODO: Implement status filter dropdown

const StatusFilter = ({ value, onChange }) => {
  return (
    <select
      className="status-filter"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filter by status"
    >
      <option value="">All statuses</option>
      {TICKET_STATUSES.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
};

export default StatusFilter;
