import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function BookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setError('');
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`${API_BASE}/api/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load bookings');
        }
        setBookings(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to cancel booking');
        return;
      }
      // Refresh bookings
      const refreshed = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const refreshedData = await refreshed.json();
      if (refreshed.ok) {
        setBookings(refreshedData.data || []);
      }
    } catch (err) {
      alert('Error cancelling booking: ' + err.message);
    }
  };

  if (loading) {
    return <p>Loading bookings...</p>;
  }

  if (error) {
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
      <h2>My Bookings</h2>
      <Link to="/" className="link-button">
        ← Back to home
      </Link>

      {bookings.length === 0 ? (
        <p style={{ marginTop: '1rem' }}>No bookings yet. <Link to="/movies">Browse movies</Link> to get started!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {bookings.map((booking) => (
            <div key={booking._id} className="card">
              <h3>{booking.movieId?.title || 'Unknown Movie'}</h3>
              <p>
                <strong>Theatre:</strong> {booking.showId?.theatreName} •{' '}
                {booking.showId?.city}
              </p>
              <p>
                <strong>Show Time:</strong>{' '}
                {booking.showId?.showTime
                  ? new Date(booking.showId.showTime).toLocaleString()
                  : 'N/A'}
              </p>
              <p>
                <strong>Seats:</strong> {booking.seats.join(', ')}
              </p>
              <p>
                <strong>Amount:</strong> ₹{booking.totalAmount}
              </p>
              <p>
                <strong>Status:</strong> {booking.bookingStatus} • Payment:{' '}
                {booking.paymentStatus}
              </p>
              {booking.bookingStatus !== 'CANCELLED' &&
                booking.paymentStatus !== 'SUCCESS' && (
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => handleCancel(booking._id)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Cancel Booking
                  </button>
                )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default BookingHistory;

