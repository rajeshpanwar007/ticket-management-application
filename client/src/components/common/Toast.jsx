import { useToastContext } from '../../context/ToastContext.jsx';

// TODO: Implement toast notification display

const Toast = () => {
  const { toasts } = useToastContext();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default Toast;
