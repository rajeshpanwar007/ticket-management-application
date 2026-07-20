import { useNavigate, useParams } from 'react-router-dom';
import BackLink from '../components/common/BackLink.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx';
import ErrorAlert from '../components/common/ErrorAlert.jsx';
import StatusBadge from '../components/tickets/StatusBadge.jsx';
import TicketForm from '../components/tickets/TicketForm.jsx';
import { useTicket, useUsers, useUpdateTicket } from '../hooks/index.js';

const EditTicketPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ticket, loading, error, refetch } = useTicket(id);
  const { users } = useUsers();
  const { mutate, loading: isSubmitting, error: submitError, fieldErrors } = useUpdateTicket({
    onSuccess: () => navigate(`/tickets/${id}`),
  });

  const handleSubmit = async (data) => {
    await mutate({ id, payload: data });
  };

  if (loading) return <LoadingSkeleton variant="form" />;
  if (error) return <ErrorAlert message={error} onRetry={refetch} />;
  if (!ticket) return <ErrorAlert message="Ticket not found" />;

  return (
    <div className="edit-ticket-page">
      <BackLink to={`/tickets/${id}`} label="Back to Ticket" />
      <PageHeader title="Edit Ticket" />
      <p className="edit-ticket-page__status">
        Status: <StatusBadge status={ticket.status} /> (read-only — use detail page to change status)
      </p>
      {submitError && <ErrorAlert message={submitError} />}
      <TicketForm
        mode="edit"
        initialValues={ticket}
        users={users}
        errors={fieldErrors}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/tickets/${id}`)}
      />
    </div>
  );
};

export default EditTicketPage;
