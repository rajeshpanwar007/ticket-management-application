import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx';
import ErrorAlert from '../components/common/ErrorAlert.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import SearchAndFilter from '../components/tickets/SearchAndFilter.jsx';
import TicketTable from '../components/tickets/TicketTable.jsx';
import { useTickets, useDebounce } from '../hooks/index.js';

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

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (status) params.set('status', status);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, status, setSearchParams]);

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleStatusChange = (value) => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (value) params.set('status', value);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  if (loading) return <LoadingSkeleton variant="table" />;
  if (error) return <ErrorAlert message={error} onRetry={refetch} />;

  return (
    <div className="ticket-list-page">
      <PageHeader title="Tickets">
        <button type="button" className="button button--primary" onClick={() => navigate('/tickets/new')}>
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
          onAction={clearFilters}
        />
      ) : (
        <TicketTable tickets={tickets} onRowClick={(ticketId) => navigate(`/tickets/${ticketId}`)} />
      )}
    </div>
  );
};

export default TicketListPage;
