// TODO: Implement error alert component

const ErrorAlert = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="error-alert" role="alert" aria-live="polite">
      <p className="error-alert__message">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="error-alert__retry">
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
