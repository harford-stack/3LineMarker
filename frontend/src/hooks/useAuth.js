// frontend/src/hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

/**
 * 인증 관련 커스텀 훅
 * Redux store에서 인증 상태를 가져옴
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    logout: handleLogout,
  };
};

export default useAuth;

