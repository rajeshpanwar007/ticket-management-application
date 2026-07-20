import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import { formatDate } from '../../utils/format.js';

const TicketRow = ({ ticket, onClick }) => {
  return (
    <tr className="ticket-row" onClick={() => onClick?.(ticket._id)}>
      <td>{ticket.title}</td>
      <td><StatusBadge status={ticket.status} /></td>
      <td><PriorityBadge priority={ticket.priority} /></td>
      <td>{ticket.assignedTo?.name || 'Unassigned'}</td>
      <td>{formatDate(ticket.createdAt)}</td>
    </tr>
  );
};

export default TicketRow;
