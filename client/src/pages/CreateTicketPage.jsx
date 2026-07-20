import { useNavigate } from 'react-router-dom';
import BackLink from '../components/common/BackLink.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import TicketForm from '../components/tickets/TicketForm.jsx';
import useUsers from '../hooks/useUsers.js';

// TODO: Implement create ticket page

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const { users, loading } = useUsers();

  const handleSubmit = async (data) => {
    // TODO: Call createTicket API and navigate to detail
    console.log('Create ticket:', data);
  };

  return (
    <div className="create-ticket-page">
      <BackLink to="/tickets" label="Back to Tickets" />
      <PageHeader title="Create Ticket" />
      {!loading && (
        <TicketForm
          mode="create"
          users={users}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/tickets')}
        />
      )}
    </div>
  );
};

export default CreateTicketPage;
