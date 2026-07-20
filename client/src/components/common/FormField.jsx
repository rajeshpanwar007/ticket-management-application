// TODO: Implement form field wrapper

const FormField = ({ label, name, error, required, children }) => {
  return (
    <div className="form-field">
      <label htmlFor={name} className="form-field__label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
