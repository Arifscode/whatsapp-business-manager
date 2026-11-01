import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">👜</div>
        <h1 className="text-2xl font-bold text-brand-800">Business Manager</h1>
        <p className="text-brand-600 mt-1 text-sm">Your shop, organised</p>
      </div>

      <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Welcome back</h2>
        <div className="mb-4">
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="Enter your password"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={loading || !password}
          className="btn-primary w-full"
        >
          {loading ? 'Logging in…' : 'Log In'}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">
          Default password in dev mode: <code>admin</code>
        </p>
      </form>
    </div>
  );
}
