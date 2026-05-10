import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { init } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      init().then(() => navigate('/'));
    } else {
      navigate('/login');
    }
  }, []);

  return <div className="text-center py-8 text-gray-500">Signing you in…</div>;
}
