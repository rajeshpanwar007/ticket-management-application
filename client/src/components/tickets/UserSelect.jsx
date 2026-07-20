// TODO: Implement user select dropdown

const UserSelect = ({ label, users = [], value, onChange, allowEmpty = false }) => {
  return (
    <div className="user-select">
      <label className="user-select__label">{label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value || null)}>
        {allowEmpty && <option value="">Unassigned</option>}
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserSelect;
