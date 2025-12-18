import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import AdminDashboard from './pages/AdminDashboard.jsx';
import BookingHistory from './pages/BookingHistory.jsx';
import BookingSummary from './pages/BookingSummary.jsx';
import Login from './pages/Login.jsx';
import MovieDetails from './pages/MovieDetails.jsx';
import MovieList from './pages/MovieList.jsx';
import ShowSeatSelection from './pages/ShowSeatSelection.jsx';
import Signup from './pages/Signup.jsx';
import UserProfile from './pages/UserProfile.jsx';
import { ToastProvider } from './components/Toast';

function AppShell({ children }) {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1 className="app-title">
            <span className="logo-text">BookMyShow</span>
            <span className="logo-subtitle">PREMIERE</span>
          </h1>
        </div>
        <div className="app-header-right">
          {user ? (
            <>
              <span className="user-badge">👋 Hi, {user.name}</span>
              <Link to="/bookings" className="link-button header-btn">
                <span className="btn-icon">🎫</span> My Bookings
              </Link>
              <Link to="/profile" className="link-button header-btn">
                <span className="btn-icon">👤</span> Profile
              </Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="link-button header-btn admin-btn">
                  <span className="btn-icon">⚡</span> Admin
                </Link>
              )}
              <button className="link-button header-btn logout-btn" onClick={handleLogout}>
                <span className="btn-icon">🚪</span> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="link-button header-btn">
                <span className="btn-icon">🔑</span> Login
              </Link>
              <Link to="/signup" className="primary-button header-btn">
                <span className="btn-icon">✨</span> Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="app-main">{children}</main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">BookMyShow<span className="logo-premiere">PREMIERE</span></h3>
            <p className="footer-tagline">Experience cinema like never before. Premium bookings, exclusive shows, and unforgettable moments.</p>
            <div className="social-links">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">📸</a>
              <a href="#" className="social-link">▶️</a>
            </div>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <div className="footer-links">
              <Link to="/movies" className="footer-link">🎬 Movies</Link>
              <Link to="/bookings" className="footer-link">📋 My Bookings</Link>
              <Link to="/profile" className="footer-link">👤 My Account</Link>
              <Link to="/admin" className="footer-link">⚡ Admin Panel</Link>
            </div>
          </div>
          <div className="footer-section">
            <h3>Contact Us</h3>
            <div className="contact-info">
              <p className="contact-item">📧 support@bookmyshowpremiere.com</p>
              <p className="contact-item">📞 +1 (555) 123-4567</p>
              <p className="contact-item">📍 123 Cinema Street, Hollywood, CA</p>
            </div>
          </div>
          <div className="footer-section">
            <h3>Tech Stack</h3>
            <div className="tech-stack">
              <span className="tech-badge">⚛️ React</span>
              <span className="tech-badge">🚀 Node.js</span>
              <span className="tech-badge">🗄️ MongoDB</span>
              <span className="tech-badge">⚡ Redis</span>
              <span className="tech-badge">🎨 Tailwind</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 BookMyShow Premiere. Experience redefined. Built with ❤️ using MERN Stack & Redis for lightning-fast performance.</p>
        </div>
      </footer>
    </div>
  );
}

function Home() {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample featured movies data
  const sampleMovies = [
    { 
      id: 1, 
      title: "Avengers: Endgame", 
      genre: "Action/Sci-Fi", 
      rating: 4.9, 
      duration: "3h 2m",
      image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80",
      imdb: 8.4,
      language: "English",
      isTrending: true
    },
    { 
      id: 2, 
      title: "Inception", 
      genre: "Sci-Fi/Thriller", 
      rating: 4.8, 
      duration: "2h 28m",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      imdb: 8.8,
      language: "English",
      isTrending: true
    },
    { 
      id: 3, 
      title: "The Dark Knight", 
      genre: "Action/Crime", 
      rating: 4.9, 
      duration: "2h 32m",
      image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80",
      imdb: 9.0,
      language: "English",
      isTrending: false
    },
    { 
      id: 4, 
      title: "Interstellar", 
      genre: "Adventure/Drama", 
      rating: 4.7, 
      duration: "2h 49m",
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=800&q=80",
      imdb: 8.6,
      language: "English",
      isTrending: true
    },
    { 
      id: 5, 
      title: "Dune: Part Two", 
      genre: "Action/Adventure", 
      rating: 4.8, 
      duration: "2h 46m",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      imdb: 8.7,
      language: "English",
      isTrending: true
    },
    { 
      id: 6, 
      title: "Spider-Man: No Way Home", 
      genre: "Action/Adventure", 
      rating: 4.8, 
      duration: "2h 28m",
      image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80",
      imdb: 8.2,
      language: "English",
      isTrending: false
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFeaturedMovies(sampleMovies);
      setLoading(false);
    }, 500);
  }, []);

  const stats = [
    { label: "Movies Available", value: "250+", icon: "🎬" },
    { label: "Cities Covered", value: "50+", icon: "🌍" },
    { label: "Daily Bookings", value: "10K+", icon: "📈" },
    { label: "Happy Customers", value: "1M+", icon: "😊" }
  ];

  const features = [
    { 
      title: "Real-time Seat Locks", 
      description: "Powered by Redis for instant seat reservation and prevention of double bookings.",
      icon: "🔒"
    },
    { 
      title: "Lightning Fast", 
      description: "Ultra-fast booking experience with optimized performance and minimal loading times.",
      icon: "⚡"
    },
    { 
      title: "Secure Payments", 
      description: "Bank-level encryption and secure payment processing for worry-free transactions.",
      icon: "💳"
    },
    { 
      title: "Smart Recommendations", 
      description: "AI-powered movie suggestions based on your viewing history and preferences.",
      icon: "🎯"
    }
  ];

  const cities = ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "Seattle"];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="hero-badge">🎬 NOW SHOWING</div>
            <h1 className="hero-title">
              Experience <span className="gradient-text">Cinema Magic</span><br />
              Like Never Before
            </h1>
            <p className="hero-subtitle">
              Book tickets for the latest blockbusters, exclusive premieres, and special events in just a few clicks.
              Premium experience powered by cutting-edge technology.
            </p>
            <div className="hero-search">
              <input 
                type="text" 
                placeholder="Search for movies, events, or shows..." 
                className="search-input"
              />
              <button className="search-button">
                🔍 Search
              </button>
            </div>
            <div className="hero-buttons">
              <Link to="/movies" className="primary-button hero-button">
                <span className="btn-icon">🎟️</span> Book Tickets Now
              </Link>
              <Link to="/signup" className="secondary-button hero-button">
                <span className="btn-icon">✨</span> Get Premium Access
              </Link>
            </div>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="hero-stat">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="now-showing-section">
        <div className="section-container">
          <div className="section-header">
            <div className="header-left">
              <h2 className="section-title">
                <span className="title-highlight">🔥 Now</span> Showing
              </h2>
              <p className="section-subtitle">Blockbuster movies currently in theaters</p>
            </div>
            <Link to="/movies" className="view-all-link">
              View All Movies <span className="arrow">→</span>
            </Link>
          </div>
          
          {loading ? (
            <div className="loading-movies">
              <div className="loading-spinner"></div>
              <p>Loading movies...</p>
            </div>
          ) : (
            <>
              <div className="movies-grid">
                {featuredMovies.map((movie) => (
                  <div key={movie.id} className="movie-card featured-card">
                    <div className="movie-image-container">
                      <div 
                        className="movie-image" 
                        style={{ backgroundImage: `url(${movie.image})` }}
                      >
                        {movie.isTrending && (
                          <div className="trending-badge">🔥 Trending</div>
                        )}
                        <div className="movie-overlay">
                          <div className="overlay-content">
                            <span className="imdb-badge">IMDb {movie.imdb}</span>
                            <div className="movie-language">{movie.language}</div>
                          </div>
                        </div>
                      </div>
                      <div className="movie-rating-card">
                        <div className="rating-star">⭐</div>
                        <div className="rating-value">{movie.rating}/5</div>
                      </div>
                    </div>
                    <div className="movie-details">
                      <h3 className="movie-title">{movie.title}</h3>
                      <div className="movie-meta">
                        <span className="movie-genre">{movie.genre}</span>
                        <span className="movie-duration">{movie.duration}</span>
                      </div>
                      <div className="movie-actions">
                        <Link to={`/movies/${movie.id}`} className="movie-button details-btn">
                          <span className="btn-icon">ℹ️</span> Details
                        </Link>
                        <Link to={`/movies/${movie.id}`} className="movie-button book-btn">
                          <span className="btn-icon">🎟️</span> Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="browse-cities">
                <h3 className="cities-title">Available in major cities:</h3>
                <div className="cities-list">
                  {cities.map((city, index) => (
                    <span key={index} className="city-tag">
                      <span className="city-icon">📍</span> {city}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header center-header">
            <h2 className="section-title">
              Why Choose <span className="title-highlight">BookMyShow</span>?
            </h2>
            <p className="section-subtitle">Experience the future of movie booking with our premium features</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" data-aos="fade-up">
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">{feature.icon}</div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">→</div>
              </div>
            ))}
          </div>
          
          <div className="tech-showcase">
            <h3 className="tech-title">Powered by Cutting-Edge Technology</h3>
            <div className="tech-stack-showcase">
              <div className="tech-item">
                <div className="tech-icon">⚡</div>
                <div className="tech-name">Redis Cache</div>
                <div className="tech-desc">Real-time seat locking</div>
              </div>
              <div className="tech-item">
                <div className="tech-icon">🚀</div>
                <div className="tech-name">MERN Stack</div>
                <div className="tech-desc">Full-stack JavaScript</div>
              </div>
              <div className="tech-item">
                <div className="tech-icon">🔒</div>
                <div className="tech-name">JWT Auth</div>
                <div className="tech-desc">Secure authentication</div>
              </div>
              <div className="tech-item">
                <div className="tech-icon">⚛️</div>
                <div className="tech-name">React 18</div>
                <div className="tech-desc">Latest features</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-overlay">
          <div className="cta-content">
            <h2 className="cta-title">Ready for Your Next Movie Adventure?</h2>
            <p className="cta-subtitle">
              Join millions of movie lovers who trust BookMyShow for their entertainment needs. 
              From blockbuster premieres to exclusive screenings, we've got it all.
            </p>
            <div className="cta-buttons">
              <Link to="/signup" className="primary-button cta-button">
                <span className="btn-icon">🚀</span> Start Your Journey
              </Link>
              <Link to="/movies" className="secondary-button cta-button">
                <span className="btn-icon">🎬</span> Explore Movies
              </Link>
            </div>
            <div className="cta-stats">
              <div className="cta-stat">
                <div className="cta-stat-value">99.9%</div>
                <div className="cta-stat-label">Booking Success</div>
              </div>
              <div className="cta-stat">
                <div className="cta-stat-value">24/7</div>
                <div className="cta-stat-label">Customer Support</div>
              </div>
              <div className="cta-stat">
                <div className="cta-stat-value">Instant</div>
                <div className="cta-stat-label">Confirmation</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<MovieList />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/shows/:showId/seats" element={<ShowSeatSelection />} />
          <Route path="/booking-summary" element={<BookingSummary />} />
          <Route path="/bookings" element={<BookingHistory />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </AppShell>
    </ToastProvider>
  );
}

export default App;