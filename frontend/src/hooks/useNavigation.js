import { useNavigate } from 'react-router-dom';

export function useNavigation() {
  const navigate = useNavigate();

  const go = (path, options = {}) => {
    navigate(path, options);
  };

  const back = () => {
    navigate(-1);
  };

  const resetToRoleSelect = () => {
    navigate('/', { replace: true });
  };

  return { go, back, resetToRoleSelect };
}
