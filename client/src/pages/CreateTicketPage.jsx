import { useNavigate } from 'react-router-dom';
import BackLink from '../components/common/BackLink.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx';
import ErrorAlert from '../components/common/ErrorAlert.jsx';
import TicketForm from '../components/tickets/TicketForm.jsx';
import { useUsers, useCreateTicket } from '../hooks/index.js';

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const { users, loading, error, refetch } = useUsers();
  const { mutate, loading: isSubmitting, error: submitError, fieldErrors } = useCreateTicket({
    onSuccess: (ticket) => navigate(`/tickets/${ticket._id}`),
  });

  const handleSubmit = async (data) => {
    await mutate(data);
  };

  if (loading) return <LoadingSkeleton variant="form" />;
  if (error) return <ErrorAlert message={error} onRetry={refetch} />;

  return (
    <div className="create-ticket-page">
      <BackLink to="/tickets" label="Back to Tickets" />
      <PageHeader title="Create Ticket" />
      {submitError && <ErrorAlert message={submitError} />}
      <TicketForm
        mode="create"
        users={users}
        errors={fieldErrors}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/tickets')}
      />
    </div>
  );
};

export default CreateTicketPage;
