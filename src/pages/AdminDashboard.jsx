import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Movie form state
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    genre: '',
    duration: '',
    language: '',
    releaseDate: '',
    rating: '',
    posterUrl: '',
  });
  const [submittingMovie, setSubmittingMovie] = useState(false);

  // Show form state
  const [showForm, setShowForm] = useState({
    movieId: '',
    theatreName: '',
    city: '',
    screen: '',
    showTime: '',
    totalSeats: '',
    basePrice: '',
  });
  const [submittingShow, setSubmittingShow] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchDashboard();
    fetchMovies();
    fetchShows();
  }, [navigate, token, user.role]);

  const fetchDashboard = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Admin access required');
        }
        throw new Error(data.message || 'Failed to load dashboard');
      }
      setStats(data.stats);
      setRecentBookings(data.recentBookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/movies`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setMovies(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    }
  };

  const fetchShows = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/shows`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setShows(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch shows:', err);
    }
  };

  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmittingMovie(true);

    try {
      const genreArray = movieForm.genre.split(',').map((g) => g.trim()).filter(Boolean);
      const movieData = {
        title: movieForm.title,
        description: movieForm.description,
        genre: genreArray,
        duration: movieForm.duration ? parseInt(movieForm.duration) : undefined,
        language: movieForm.language,
        releaseDate: movieForm.releaseDate ? new Date(movieForm.releaseDate).toISOString() : undefined,
        rating: movieForm.rating ? parseFloat(movieForm.rating) : undefined,
        posterUrl: movieForm.posterUrl,
      };

      const res = await fetch(`${API_BASE}/api/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(movieData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create movie');
      }

      setSuccess('Movie created successfully!');
      setMovieForm({
        title: '',
        description: '',
        genre: '',
        duration: '',
        language: '',
        releaseDate: '',
        rating: '',
        posterUrl: '',
      });
      fetchMovies();
      fetchDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingMovie(false);
    }
  };

  const handleShowSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmittingShow(true);

    try {
      const showData = {
        movieId: showForm.movieId,
        theatreName: showForm.theatreName,
        city: showForm.city,
        screen: showForm.screen,
        showTime: new Date(showForm.showTime).toISOString(),
        totalSeats: parseInt(showForm.totalSeats),
        basePrice: parseFloat(showForm.basePrice),
      };

      const res = await fetch(`${API_BASE}/api/shows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(showData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create show');
      }

      setSuccess('Show created successfully!');
      setShowForm({
        movieId: '',
        theatreName: '',
        city: '',
        screen: '',
        showTime: '',
        totalSeats: '',
        basePrice: '',
      });
      fetchShows();
      fetchDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingShow(false);
    }
  };

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error && !stats) {
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
      <h2>Admin Dashboard</h2>
      <Link to="/" className="link-button" style={{ marginBottom: '1rem' }}>
        ← Back to home
      </Link>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #333' }}>
        <button
          className={activeTab === 'dashboard' ? 'primary-button' : 'link-button'}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'movies' ? 'primary-button' : 'link-button'}
          onClick={() => setActiveTab('movies')}
        >
          Add Movie
        </button>
        <button
          className={activeTab === 'shows' ? 'primary-button' : 'link-button'}
          onClick={() => setActiveTab('shows')}
        >
          Add Show
        </button>
      </div>

      {error && <p className="auth-error">{error}</p>}
      {success && <p style={{ color: '#4caf50', marginBottom: '1rem' }}>{success}</p>}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div className="card">
                <h3>Movies</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalMovies}</p>
              </div>
              <div className="card">
                <h3>Shows</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalShows}</p>
              </div>
              <div className="card">
                <h3>Bookings</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalBookings}</p>
              </div>
              <div className="card">
                <h3>Users</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalUsers}</p>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <h3>Recent Bookings</h3>
            {recentBookings.length === 0 ? (
              <p>No bookings yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentBookings.map((booking) => (
                  <div key={booking._id} className="card" style={{ padding: '0.5rem' }}>
                    <p>
                      <strong>{booking.userId?.name}</strong> booked{' '}
                      {booking.movieId?.title} at {booking.showId?.theatreName} -{' '}
                      {booking.seats.length} seat(s) - ₹{booking.totalAmount} -{' '}
                      {booking.paymentStatus}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Movie Tab */}
      {activeTab === 'movies' && (
        <div>
          <h3>Add New Movie</h3>
          <form onSubmit={handleMovieSubmit} className="auth-form" style={{ maxWidth: '600px' }}>
            <label>
              Title *
              <input
                type="text"
                value={movieForm.title}
                onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={movieForm.description}
                onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                rows="3"
              />
            </label>
            <label>
              Genre (comma-separated)
              <input
                type="text"
                value={movieForm.genre}
                onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                placeholder="e.g., Action, Adventure, Sci-Fi"
              />
            </label>
            <label>
              Duration (minutes)
              <input
                type="number"
                value={movieForm.duration}
                onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                min="1"
              />
            </label>
            <label>
              Language
              <input
                type="text"
                value={movieForm.language}
                onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                placeholder="e.g., English, Hindi"
              />
            </label>
            <label>
              Release Date
              <input
                type="date"
                value={movieForm.releaseDate}
                onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
              />
            </label>
            <label>
              Rating (0-10)
              <input
                type="number"
                value={movieForm.rating}
                onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                min="0"
                max="10"
                step="0.1"
              />
            </label>
            <label>
              Poster URL
              <input
                type="url"
                value={movieForm.posterUrl}
                onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                placeholder="https://example.com/poster.jpg"
              />
            </label>
            <button type="submit" disabled={submittingMovie} className="primary-button">
              {submittingMovie ? 'Creating...' : 'Create Movie'}
            </button>
          </form>
        </div>
      )}

      {/* Add Show Tab */}
      {activeTab === 'shows' && (
        <div>
          <h3>Add New Show</h3>
          <form onSubmit={handleShowSubmit} className="auth-form" style={{ maxWidth: '600px' }}>
            <label>
              Movie *
              <select
                value={showForm.movieId}
                onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                required
              >
                <option value="">Select a movie</option>
                {movies
                  .filter((m) => m.isActive)
                  .map((movie) => (
                    <option key={movie._id} value={movie._id}>
                      {movie.title}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Theatre Name *
              <input
                type="text"
                value={showForm.theatreName}
                onChange={(e) => setShowForm({ ...showForm, theatreName: e.target.value })}
                required
                placeholder="e.g., PVR Cinemas"
              />
            </label>
            <label>
              City *
              <input
                type="text"
                value={showForm.city}
                onChange={(e) => setShowForm({ ...showForm, city: e.target.value })}
                required
                placeholder="e.g., Chennai"
              />
            </label>
            <label>
              Screen
              <input
                type="text"
                value={showForm.screen}
                onChange={(e) => setShowForm({ ...showForm, screen: e.target.value })}
                placeholder="e.g., Screen 1"
              />
            </label>
            <label>
              Show Time *
              <input
                type="datetime-local"
                value={showForm.showTime}
                onChange={(e) => setShowForm({ ...showForm, showTime: e.target.value })}
                required
              />
            </label>
            <label>
              Total Seats *
              <input
                type="number"
                value={showForm.totalSeats}
                onChange={(e) => setShowForm({ ...showForm, totalSeats: e.target.value })}
                required
                min="1"
              />
            </label>
            <label>
              Base Price (₹) *
              <input
                type="number"
                value={showForm.basePrice}
                onChange={(e) => setShowForm({ ...showForm, basePrice: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </label>
            <button type="submit" disabled={submittingShow} className="primary-button">
              {submittingShow ? 'Creating...' : 'Create Show'}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

export default AdminDashboard;

