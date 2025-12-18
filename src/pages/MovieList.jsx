import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      setError("");
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/movies`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load movies");
        }

        setMovies(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  /* 🔹 SKELETON LOADING */
  if (loading) {
    return (
      <section className="card">
        <h2>Now Showing</h2>
        <div className="movie-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="movie-card skeleton">
              <div className="skeleton-poster"></div>
              <div className="movie-info">
                <div className="skeleton-title"></div>
                <div className="skeleton-meta"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* 🔹 ERROR STATE */
  if (error) {
    return <p className="auth-error">{error}</p>;
  }

  /* 🔹 EMPTY STATE */
  if (!movies.length) {
    return <p>No movies available right now.</p>;
  }

  /* 🔹 NORMAL UI */
  return (
    <section className="card">
      <h2>Now Showing</h2>
      <div className="movie-grid">
        {movies.map((movie) => (
          <Link
            key={movie._id}
            to={`/movies/${movie._id}`}
            className="movie-card"
          >
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="movie-poster"
              />
            ) : (
              <div className="skeleton-poster"></div>
            )}

            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p className="movie-meta">
                {movie.language} • {movie.duration || "?"} mins
              </p>
              <p className="movie-genre">
                {(movie.genre || []).join(", ")}
              </p>
              {movie.rating != null && (
                <p className="movie-rating">⭐ {movie.rating}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default MovieList;
