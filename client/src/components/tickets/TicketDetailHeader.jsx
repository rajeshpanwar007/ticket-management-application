import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';

// TODO: Implement ticket detail header

const TicketDetailHeader = ({ ticket, onEdit }) => {
  return (
    <div className="ticket-detail-header">
      <h1 className="ticket-detail-header__title">{ticket?.title}</h1>
      <div className="ticket-detail-header__badges">
        <StatusBadge status={ticket?.status} />
        <PriorityBadge priority={ticket?.priority} />
      </div>
      {onEdit && (
        <button type="button" onClick={onEdit} className="ticket-detail-header__edit">
          Edit
        </button>
      )}
    </div>
  );
};

export default TicketDetailHeader;
