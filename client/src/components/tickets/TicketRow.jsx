import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';

// TODO: Implement ticket table row

const TicketRow = ({ ticket, onClick }) => {
  return (
    <tr className="ticket-row" onClick={() => onClick?.(ticket._id)}>
      <td>{ticket.title}</td>
      <td><StatusBadge status={ticket.status} /></td>
      <td><PriorityBadge priority={ticket.priority} /></td>
      <td>{ticket.assignedTo?.name || 'Unassigned'}</td>
      <td>{ticket.createdAt}</td>
    </tr>
  );
};

export default TicketRow;
