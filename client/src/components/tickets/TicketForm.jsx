import { useEffect, useMemo, useState } from 'react';
import FormField from '../common/FormField.jsx';
import FormActions from '../common/FormActions.jsx';
import FormErrorSummary from '../common/FormErrorSummary.jsx';
import PrioritySelector from './PrioritySelector.jsx';
import UserSelect from './UserSelect.jsx';
import { getEntityId } from '../../utils/entity.js';
import { validateTicketForm } from '../../utils/validation.js';

const TicketForm = ({
  mode = 'create',
  initialValues = {},
  users = [],
  errors: externalErrors = {},
  isSubmitting = false,
  onSubmit,
  onCancel,
}) => {
  const defaultCreatedBy = useMemo(
    () => users.find((user) => user.role === 'customer')?._id ?? users[0]?._id ?? '',
    [users],
  );

  const [values, setValues] = useState({
    title: initialValues.title ?? '',
    description: initialValues.description ?? '',
    priority: initialValues.priority ?? 'medium',
    createdBy: getEntityId(initialValues.createdBy) ?? defaultCreatedBy,
    assignedTo: getEntityId(initialValues.assignedTo),
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues({
      title: initialValues.title ?? '',
      description: initialValues.description ?? '',
      priority: initialValues.priority ?? 'medium',
      createdBy: getEntityId(initialValues.createdBy) ?? defaultCreatedBy,
      assignedTo: getEntityId(initialValues.assignedTo),
    });
  }, [initialValues, defaultCreatedBy]);

  const mergedErrors = { ...errors, ...externalErrors };

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateTicketForm(values, mode);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
      assignedTo: values.assignedTo || null,
    };

    if (mode === 'create') {
      payload.createdBy = values.createdBy;
    }

    await onSubmit?.(payload);
  };

  return (
    <form className="ticket-form" onSubmit={handleSubmit} noValidate>
      <FormErrorSummary errors={mergedErrors} />

      <FormField label="Title" name="title" required error={mergedErrors.title}>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={(event) => updateField('title', event.target.value)}
        />
      </FormField>

      <FormField label="Description" name="description" required error={mergedErrors.description}>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={values.description}
          onChange={(event) => updateField('description', event.target.value)}
        />
      </FormField>

      <FormField label="Priority" name="priority">
        <PrioritySelector
          value={values.priority}
          onChange={(priority) => updateField('priority', priority)}
        />
      </FormField>

      {mode === 'create' && (
        <UserSelect
          label="Created By"
          users={users}
          value={values.createdBy}
          onChange={(createdBy) => updateField('createdBy', createdBy)}
          error={mergedErrors.createdBy}
        />
      )}

      <UserSelect
        label="Assign To"
        users={users.filter((user) => ['agent', 'manager', 'admin'].includes(user.role))}
        value={values.assignedTo}
        onChange={(assignedTo) => updateField('assignedTo', assignedTo)}
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
