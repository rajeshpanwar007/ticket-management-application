// TODO: Implement user select dropdown

const UserSelect = ({ label, users = [], value, onChange, allowEmpty = false, error }) => {
  return (
    <div className="user-select">
      <label className="user-select__label" htmlFor={label}>{label}</label>
      <select
        id={label}
        value={value || ''}
        onChange={(event) => onChange(event.target.value || null)}
      >
        {allowEmpty && <option value="">Unassigned</option>}
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name} ({user.role})
          </option>
        ))}
      </select>
      {error && <p className="form-field__error" role="alert">{error}</p>}
    </div>
  );
};

export default UserSelect;
