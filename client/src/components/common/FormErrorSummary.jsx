// TODO: Implement form error summary

const FormErrorSummary = ({ errors }) => {
  const messages = Object.values(errors || {}).filter(Boolean);
  if (messages.length === 0) return null;

  return (
    <div className="form-error-summary" role="alert">
      <ul>
        {messages.map((msg) => (
          <li key={msg}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default FormErrorSummary;
