import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx';
import ErrorAlert from '../components/common/ErrorAlert.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import SearchAndFilter from '../components/tickets/SearchAndFilter.jsx';
import TicketTable from '../components/tickets/TicketTable.jsx';
import useTickets from '../hooks/useTickets.js';
import useDebounce from '../hooks/useDebounce.js';
import { useState } from 'react';

// TODO: Implement ticket list page with URL-synced search/filter

const TicketListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const status = searchParams.get('status') || '';
  const debouncedSearch = useDebounce(search);

  const { tickets, total, loading, error, refetch } = useTickets({
    search: debouncedSearch,
    status,
  });

  const handleSearchChange = (value) => {
    setSearch(value);
    // TODO: Sync search param to URL
  };

  const handleStatusChange = (value) => {
    // TODO: Sync status param to URL
    setSearchParams(value ? { status: value } : {});
  };

  if (loading) return <LoadingSkeleton variant="table" />;
  if (error) return <ErrorAlert message={error} onRetry={refetch} />;

  return (
    <div className="ticket-list-page">
      <PageHeader title="Tickets">
        <button type="button" onClick={() => navigate('/tickets/new')}>
          + Create Ticket
        </button>
      </PageHeader>

      <SearchAndFilter
        search={search}
        status={status}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      <p className="ticket-list-page__count">Showing {tickets.length} of {total} tickets</p>

      {tickets.length === 0 ? (
        <EmptyState
          title="No tickets found"
          message="Try adjusting your search or filters."
          actionLabel="Clear Filters"
          onAction={() => navigate('/tickets')}
        />
      ) : (
        <TicketTable tickets={tickets} onRowClick={(id) => navigate(`/tickets/${id}`)} />
      )}
    </div>
  );
};

export default TicketListPage;
