import { useNavigate, useParams } from 'react-router-dom';
import BackLink from '../components/common/BackLink.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx';
import ErrorAlert from '../components/common/ErrorAlert.jsx';
import StatusBadge from '../components/tickets/StatusBadge.jsx';
import TicketForm from '../components/tickets/TicketForm.jsx';
import useTicket from '../hooks/useTicket.js';
import useUsers from '../hooks/useUsers.js';

// TODO: Implement edit ticket page

const EditTicketPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ticket, loading, error, refetch } = useTicket(id);
  const { users } = useUsers();

  const handleSubmit = async (data) => {
    // TODO: Call updateTicket API and navigate to detail
    console.log('Update ticket:', data);
  };

  if (loading) return <LoadingSkeleton variant="form" />;
  if (error) return <ErrorAlert message={error} onRetry={refetch} />;
  if (!ticket) return <ErrorAlert message="Ticket not found" />;

  return (
    <div className="edit-ticket-page">
      <BackLink to={`/tickets/${id}`} label="Back to Ticket" />
      <PageHeader title="Edit Ticket" />
      <p>Status: <StatusBadge status={ticket.status} /> (read-only)</p>
      <TicketForm
        mode="edit"
        initialValues={ticket}
        users={users}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/tickets/${id}`)}
      />
    </div>
  );
};

export default EditTicketPage;
