import FormField from '../common/FormField.jsx';
import FormActions from '../common/FormActions.jsx';
import FormErrorSummary from '../common/FormErrorSummary.jsx';
import PrioritySelector from './PrioritySelector.jsx';
import UserSelect from './UserSelect.jsx';

// TODO: Implement ticket form (create and edit modes)

const TicketForm = ({
  mode = 'create',
  initialValues = {},
  users = [],
  errors = {},
  isSubmitting = false,
  onSubmit,
  onCancel,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Collect form values and call onSubmit
    onSubmit?.({});
  };

  return (
    <form className="ticket-form" onSubmit={handleSubmit} noValidate>
      <FormErrorSummary errors={errors} />

      <FormField label="Title" name="title" required error={errors.title}>
        <input id="title" name="title" type="text" defaultValue={initialValues.title} />
      </FormField>

      <FormField label="Description" name="description" required error={errors.description}>
        <textarea id="description" name="description" defaultValue={initialValues.description} />
      </FormField>

      <FormField label="Priority" name="priority">
        <PrioritySelector value={initialValues.priority || 'medium'} onChange={() => {}} />
      </FormField>

      {mode === 'create' && (
        <UserSelect label="Created By" users={users} value={initialValues.createdBy} onChange={() => {}} />
      )}

      <UserSelect
        label="Assign To"
        users={users}
        value={initialValues.assignedTo}
        onChange={() => {}}
        allowEmpty
      />

      <FormActions
        onCancel={onCancel}
        submitLabel={mode === 'create' ? 'Create Ticket' : 'Save Changes'}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};

export default TicketForm;
