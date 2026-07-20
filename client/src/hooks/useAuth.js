import { useAuthContext } from '../context/AuthContext.jsx';

// TODO: Implement auth hook wrapper

const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
