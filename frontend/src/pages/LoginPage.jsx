import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Sign in</h2>
      <input className="input" type="email" placeholder="Email" value={form.email}
        onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
      <input className="input" type="password" placeholder="Password" value={form.password}
        onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <div className="flex gap-2">
        <a href="/api/auth/google" className="flex-1 btn-outline text-center text-sm">Google</a>
        <a href="/api/auth/github" className="flex-1 btn-outline text-center text-sm">GitHub</a>
      </div>
      <p className="text-center text-sm text-gray-500">
        No account? <Link to="/register" className="text-orbit-600 font-medium">Register</Link>
      </p>
    </form>
  );
}
