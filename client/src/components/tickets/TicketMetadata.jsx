import { formatDateTime } from '../../utils/format.js';

const TicketMetadata = ({ ticket }) => {
  return (
    <dl className="ticket-metadata">
      <dt>Description</dt>
      <dd>{ticket?.description}</dd>
      <dt>Created by</dt>
      <dd>{ticket?.createdBy?.name}</dd>
      <dt>Assigned to</dt>
      <dd>{ticket?.assignedTo?.name || 'Unassigned'}</dd>
      <dt>Created</dt>
      <dd>{formatDateTime(ticket?.createdAt)}</dd>
      <dt>Last updated</dt>
      <dd>{formatDateTime(ticket?.updatedAt)}</dd>
    </dl>
  );
};

export default TicketMetadata;
