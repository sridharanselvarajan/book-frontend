import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shows, setShows] = useState([]);
  const [city, setCity] = useState('');
  const [loadingShows, setLoadingShows] = useState(false);
  const [showsError, setShowsError] = useState('');

  useEffect(() => {
    const fetchMovie = async () => {
      setError('');
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/movies/${id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load movie');
        }
        setMovie(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  useEffect(() => {
    const fetchShows = async () => {
      setShowsError('');
      setLoadingShows(true);
      try {
        const params = city ? `?city=${encodeURIComponent(city)}` : '';
        const res = await fetch(`${API_BASE}/api/shows/${id}${params}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load shows');
        }
        setShows(data.data || []);
      } catch (err) {
        setShowsError(err.message);
      } finally {
        setLoadingShows(false);
      }
    };

    fetchShows();
  }, [id, city]);

  if (loading) {
    return <p>Loading movie...</p>;
  }

  if (error) {
    return <p className="auth-error">{error}</p>;
  }

  if (!movie) {
    return <p>Movie not found.</p>;
  }

  return (
    <section className="card movie-details">
      <Link to="/movies" className="link-button">
        ← Back to movies
      </Link>

      <div className="movie-details-layout">
        {movie.posterUrl && (
          <img src={movie.posterUrl} alt={movie.title} className="movie-details-poster" />
        )}
        <div>
          <h2>{movie.title}</h2>
          <p className="movie-meta">
            {movie.language} • {movie.duration || '?'} mins
          </p>
          <p className="movie-genre">{(movie.genre || []).join(', ')}</p>
          {movie.rating != null && <p className="movie-rating">⭐ {movie.rating}</p>}
          <p className="movie-description">{movie.description}</p>
          {movie.releaseDate && (
            <p className="movie-meta">
              Release date: {new Date(movie.releaseDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="movie-details-footer">
        <h3>Show Timings</h3>
        <div className="shows-filter">
          <label>
            City filter:{' '}
            <input
              type="text"
              placeholder="e.g., Chennai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </label>
        </div>

        {loadingShows ? (
          <p>Loading shows...</p>
        ) : showsError ? (
          <p className="auth-error">{showsError}</p>
        ) : !shows.length ? (
          <p>No shows available for this movie in this city.</p>
        ) : (
          <div className="shows-list">
            {shows.map((show) => (
              <div key={show._id} className="show-card">
                <h4>
                  {show.theatreName} {show.screen ? `• Screen ${show.screen}` : ''}
                </h4>
                <p className="show-meta">
                  {show.city} •{' '}
                  {new Date(show.showTime).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <p className="show-meta">Base price: ₹{show.basePrice}</p>
                <Link to={`/shows/${show._id}/seats`} className="primary-button">
                  Select Seats
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MovieDetails;


