import { useToastContext } from '../context/ToastContext.jsx';

const useToast = () => {
  const { toasts, showToast } = useToastContext();

  return {
    toasts,
    showToast,
    showSuccess: (message) => showToast(message, 'success'),
    showError: (message) => showToast(message, 'error'),
    showInfo: (message) => showToast(message, 'info'),
  };
};

export default useToast;
