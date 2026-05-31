import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { adminLogin, isAdminLoggedIn } from '../api/communityApi';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAdminLoggedIn()) {
    return <Navigate to="/community/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(password);
      navigate('/community/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="community-page community-page--narrow">
      <header className="community-page-header">
        <h1>Admin login</h1>
        <p className="community-page-desc">
          Review submitted articles and manage published community content.
        </p>
      </header>

      <form className="community-form" onSubmit={handleSubmit}>
        <label className="community-field">
          <span className="community-field-label">Password</span>
          <input
            type="password"
            className="community-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error && <p className="community-alert community-alert--error">{error}</p>}

        <button
          type="submit"
          className="community-btn community-btn--primary"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
