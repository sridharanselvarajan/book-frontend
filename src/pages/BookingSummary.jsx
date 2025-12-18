import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function BookingSummary() {
  const location = useLocation();
  const state = location.state || {};
  const { booking: initialBooking, show, movie, seats } = state;
  const [booking, setBooking] = useState(initialBooking);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!booking) {
    return (
      <section className="card">
        <p>No booking data found.</p>
        <Link to="/movies" className="primary-button">
          Browse Movies
        </Link>
      </section>
    );
  }

  const handleMockPayment = async (status) => {
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to pay');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payments/mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          bookingId: booking._id,
          status,
          method: 'CARD',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Payment failed');
        return;
      }
      setBooking(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>Booking Summary</h2>
      <p>Booking ID: {booking._id}</p>
      {movie && <p>Movie: {movie.title}</p>}
      {show && (
        <>
          <p>
            Theatre: {show.theatreName} {show.screen ? `• Screen ${show.screen}` : ''}
          </p>
          <p>
            City: {show.city} •{' '}
            {new Date(show.showTime).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </>
      )}
      <p>Seats: {(seats || []).join(', ')}</p>
      <p>Total Amount: ₹{booking.totalAmount}</p>
      <p>Status: {booking.bookingStatus}</p>
      <p>Payment Status: {booking.paymentStatus}</p>

      {error && <p className="auth-error">{error}</p>}

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          className="primary-button"
          onClick={() => handleMockPayment('SUCCESS')}
          disabled={loading || booking.paymentStatus === 'SUCCESS'}
        >
          {loading ? 'Processing...' : 'Simulate Payment Success'}
        </button>
        <button
          type="button"
          className="link-button"
          onClick={() => handleMockPayment('FAILED')}
          disabled={loading || booking.paymentStatus === 'SUCCESS'}
        >
          Simulate Payment Failure
        </button>
      </div>

      <Link to="/movies" className="primary-button">
        Book More
      </Link>
    </section>
  );
}

export default BookingSummary;


