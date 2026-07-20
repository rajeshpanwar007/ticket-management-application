// TODO: Implement ticket metadata display

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
      <dd>{ticket?.createdAt}</dd>
      <dt>Last updated</dt>
      <dd>{ticket?.updatedAt}</dd>
    </dl>
  );
};

export default TicketMetadata;
