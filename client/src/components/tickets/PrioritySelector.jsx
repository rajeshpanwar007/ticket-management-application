import { TICKET_PRIORITIES, PRIORITY_LABELS } from '../../constants/ticketStatus.js';

// TODO: Implement priority selector

const PrioritySelector = ({ value, onChange }) => {
  return (
    <div className="priority-selector">
      {TICKET_PRIORITIES.map((priority) => (
        <label key={priority} className="priority-selector__option">
          <input
            type="radio"
            name="priority"
            value={priority}
            checked={value === priority}
            onChange={() => onChange(priority)}
          />
          {PRIORITY_LABELS[priority]}
        </label>
      ))}
    </div>
  );
};

export default PrioritySelector;
