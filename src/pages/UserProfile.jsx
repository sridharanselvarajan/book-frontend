import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setError('');
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load profile');
        }
        setUser(data.user);
        setName(data.user.name || '');
        setPhone(data.user.phone || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      setUser(data.user);
      setEditing(false);
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error && !user) {
    return (
      <section className="card">
        <p className="auth-error">{error}</p>
        <Link to="/" className="link-button">
          ← Back to home
        </Link>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>My Profile</h2>
      <Link to="/" className="link-button">
        ← Back to home
      </Link>

      {user && (
        <div style={{ marginTop: '1rem' }}>
          {!editing ? (
            <>
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone || 'Not set'}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <button
                type="button"
                className="primary-button"
                onClick={() => setEditing(true)}
                style={{ marginTop: '1rem' }}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <>
              {error && <p className="auth-error">{error}</p>}
              <label>
                Name:
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                />
              </label>
              <label style={{ marginTop: '1rem', display: 'block' }}>
                Phone:
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                />
              </label>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setEditing(false);
                    setName(user.name || '');
                    setPhone(user.phone || '');
                    setError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default UserProfile;

