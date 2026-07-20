import TicketTable from './TicketTable.jsx';

// TODO: Implement recent tickets table for dashboard

const RecentTicketsTable = ({ tickets = [], onRowClick, onViewAll }) => {
  const recent = tickets.slice(0, 5);

  return (
    <section className="recent-tickets">
      <div className="recent-tickets__header">
        <h2>Recent Tickets</h2>
        {onViewAll && (
          <button type="button" onClick={onViewAll} className="recent-tickets__view-all">
            View All →
          </button>
        )}
      </div>
      <TicketTable tickets={recent} onRowClick={onRowClick} />
    </section>
  );
};

export default RecentTicketsTable;
