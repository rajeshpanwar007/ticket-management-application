import { useNavigate, useParams } from 'react-router-dom';
import BackLink from '../components/common/BackLink.jsx';
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx';
import ErrorAlert from '../components/common/ErrorAlert.jsx';
import TicketDetailHeader from '../components/tickets/TicketDetailHeader.jsx';
import TicketMetadata from '../components/tickets/TicketMetadata.jsx';
import StatusActions from '../components/tickets/StatusActions.jsx';
import CommentSection from '../components/comments/CommentSection.jsx';
import useTicket from '../hooks/useTicket.js';
import useUsers from '../hooks/useUsers.js';
import { useState } from 'react';

// TODO: Implement ticket detail page

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ticket, loading, error, refetch } = useTicket(id);
  const { users } = useUsers();
  const [statusError, setStatusError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const handleStatusTransition = async (status) => {
    // TODO: Call updateTicketStatus API
    setStatusLoading(true);
    setStatusError(null);
    try {
      throw new Error('Not implemented: status transition');
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAddComment = async (data) => {
    // TODO: Call addComment API and refetch
    console.log('Add comment:', data);
  };

  if (loading) return <LoadingSkeleton variant="detail" />;
  if (error) return <ErrorAlert message={error} onRetry={refetch} />;
  if (!ticket) return <ErrorAlert message="Ticket not found" />;

  return (
    <div className="ticket-detail-page">
      <BackLink to="/tickets" label="Back to Tickets" />
      <TicketDetailHeader ticket={ticket} onEdit={() => navigate(`/tickets/${id}/edit`)} />
      <TicketMetadata ticket={ticket} />
      <StatusActions
        allowedNextStatuses={ticket.allowedNextStatuses || []}
        onTransition={handleStatusTransition}
        loading={statusLoading}
        error={statusError}
        onDismissError={() => setStatusError(null)}
      />
      <CommentSection
        comments={ticket.comments || []}
        users={users}
        onAddComment={handleAddComment}
      />
    </div>
  );
};

export default TicketDetailPage;
