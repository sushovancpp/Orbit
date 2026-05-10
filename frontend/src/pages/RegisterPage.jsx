// RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Create account</h2>
      <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} required />
      <input className="input" placeholder="Username" value={form.username} onChange={set('username')} required />
      <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
      <input className="input" type="password" placeholder="Password (min 8 chars)" minLength={8} value={form.password} onChange={set('password')} required />
      <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
      <p className="text-center text-sm text-gray-500">
        Have an account? <Link to="/login" className="text-orbit-600 font-medium">Sign in</Link>
      </p>
    </form>
  );
}
