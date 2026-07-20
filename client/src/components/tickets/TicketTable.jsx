import TicketRow from './TicketRow.jsx';

// TODO: Implement ticket table

const TicketTable = ({ tickets = [], onRowClick }) => {
  return (
    <table className="ticket-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Assignee</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <TicketRow key={ticket._id} ticket={ticket} onClick={onRowClick} />
        ))}
      </tbody>
    </table>
  );
};

export default TicketTable;
