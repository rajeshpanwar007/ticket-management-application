import { PRIORITY_LABELS } from '../../constants/ticketStatus.js';

// TODO: Implement priority badge styling

const PriorityBadge = ({ priority }) => {
  return (
    <span className={`priority-badge priority-badge--${priority}`}>
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
};

export default PriorityBadge;
