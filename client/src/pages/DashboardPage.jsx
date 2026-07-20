import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx';
import ErrorAlert from '../components/common/ErrorAlert.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatusSummaryCards from '../components/tickets/StatusSummaryCards.jsx';
import RecentTicketsTable from '../components/tickets/RecentTicketsTable.jsx';
import { useTickets } from '../hooks/index.js';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { tickets, loading, error, refetch } = useTickets();

  if (loading) return <LoadingSkeleton variant="card" />;
  if (error) return <ErrorAlert message={error} onRetry={refetch} />;

  return (
    <div className="dashboard-page">
      <PageHeader title="Dashboard">
        <button type="button" className="button button--primary" onClick={() => navigate('/tickets/new')}>
          + Create Ticket
        </button>
      </PageHeader>

      {tickets.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          message="Create your first support ticket to get started."
          actionLabel="Create Ticket"
          onAction={() => navigate('/tickets/new')}
        />
      ) : (
        <>
          <StatusSummaryCards
            tickets={tickets}
            onStatusClick={(status) => navigate(`/tickets?status=${status}`)}
          />
          <RecentTicketsTable
            tickets={tickets}
            onRowClick={(ticketId) => navigate(`/tickets/${ticketId}`)}
            onViewAll={() => navigate('/tickets')}
          />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
