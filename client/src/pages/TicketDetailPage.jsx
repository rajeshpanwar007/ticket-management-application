import { useNavigate, useParams } from 'react-router-dom';
import BackLink from '../components/common/BackLink.jsx';
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx';
import ErrorAlert from '../components/common/ErrorAlert.jsx';
import TicketDetailHeader from '../components/tickets/TicketDetailHeader.jsx';
import TicketMetadata from '../components/tickets/TicketMetadata.jsx';
import StatusActions from '../components/tickets/StatusActions.jsx';
import CommentSection from '../components/comments/CommentSection.jsx';
import {
  useTicket,
  useUsers,
  useUpdateTicketStatus,
  useAddComment,
} from '../hooks/index.js';

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ticket, loading, error, refetch } = useTicket(id);
  const { users } = useUsers();

  const {
    mutate: updateStatus,
    loading: statusLoading,
    error: statusError,
    reset: resetStatusError,
  } = useUpdateTicketStatus({
    onSuccess: () => refetch(),
  });

  const {
    mutate: addComment,
    loading: commentLoading,
    error: commentError,
    reset: resetCommentError,
  } = useAddComment({
    onSuccess: () => refetch(),
  });

  const handleStatusTransition = async (status) => {
    resetStatusError();
    await updateStatus({ id, status });
  };

  const handleAddComment = async (data) => {
    resetCommentError();
    await addComment({ ticketId: id, payload: data });
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
        onDismissError={resetStatusError}
      />
      <CommentSection
        comments={ticket.comments || []}
        users={users}
        onAddComment={handleAddComment}
        isSubmitting={commentLoading}
        error={commentError}
      />
    </div>
  );
};

export default TicketDetailPage;
