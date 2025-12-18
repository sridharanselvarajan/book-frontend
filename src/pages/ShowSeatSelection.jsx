import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE;

function ShowSeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [locking, setLocking] = useState(false);
  const [lockError, setLockError] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // fetchSeats is used in multiple handlers and socket events, so define it
  // at component scope rather than inside useEffect.
  const fetchSeats = async () => {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/shows/${showId}/seats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load seats");
      }

      setShow(data.show);
      setSeats(data.seats || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();

    const socket = io(API_BASE, { withCredentials: true });
    socket.emit("joinShow", showId);

    socket.on("seatsLocked", (payload) => {
      if (payload?.showId === showId) fetchSeats();
    });

    socket.on("seatsClearedAfterPayment", (payload) => {
      if (payload?.showId === showId) fetchSeats();
    });

    socket.on("seatsBooked", (payload) => {
      if (payload?.showId === showId) fetchSeats();
    });

    return () => {
      socket.emit("leaveShow", showId);
      socket.disconnect();
    };
  }, [showId]);

  /* 🔥 MERGED: toggleSeat with SHAKE animation */
  const toggleSeat = (seat) => {
    if (seat.isLocked && !seat.lockedByUser) {
      const seatElement = document.querySelector(
        `[data-seat-id="${seat.seatId}"]`
      );
      if (seatElement) {
        seatElement.classList.add("shake");
        setTimeout(() => seatElement.classList.remove("shake"), 500);
      }
      return;
    }

    const id = seat.seatId;
    setSelectedSeats((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleLock = async () => {
    setLockError("");
    if (!selectedSeats.length) {
      setLockError("Select at least one seat to lock");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setLocking(true);
    try {
      const res = await fetch(`${API_BASE}/api/shows/${showId}/lock-seats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ seats: selectedSeats }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLockError(
          data.conflicts?.length
            ? `Seats locked by others: ${data.conflicts.join(", ")}`
            : data.message
        );
        return;
      }

      setSelectedSeats(data.lockedSeats || []);
    } catch (err) {
      setLockError(err.message);
    } finally {
      setLocking(false);
    }
  };

  const handleCreateBooking = async () => {
    setBookingError("");
    if (!selectedSeats.length) {
      setBookingError("Lock seats before creating booking");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setBookingLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          showId,
          movieId: show.movieId,
          seats: selectedSeats,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          const invalid = data.invalidSeats || [];
          setBookingError(
            invalid.length
              ? `Some seats were already booked: ${invalid.join(', ')}`
              : data.message || 'Some seats were already booked'
          );
          // Refresh seats to reflect the newly booked seats and remove them
          await fetchSeats();
          // Remove any now-occupied seats from the local selection
          setSelectedSeats((prev) => prev.filter((s) => !invalid.includes(s)));
          return;
        }

        setBookingError(data.message || "Failed to create booking");
        return;
      }

      navigate("/booking-summary", {
        state: { booking: data.booking, show, seats: selectedSeats },
      });
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const groupedByRow = seats.reduce((acc, seat) => {
    acc[seat.row] = acc[seat.row] || [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  if (loading) return <p>Loading seats...</p>;

  if (error) {
    return (
      <section className="card">
        <p className="auth-error">{error}</p>
        <Link to="/movies">← Back</Link>
      </section>
    );
  }

  return (
    <section className="card">
      <Link to="/movies">← Back</Link>

      {show && (
        <>
          <h2>
            {show.theatreName}
            {show.screen && ` • Screen ${show.screen}`}
          </h2>
          <p className="show-meta">
            {show.city} •{" "}
            {new Date(show.showTime).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p className="show-meta">Base price: ₹{show.basePrice}</p>
        </>
      )}

      <div className="seat-layout">
        {Object.keys(groupedByRow)
          .sort()
          .map((rowKey) => (
            <div key={rowKey} className="seat-row">
              <span className="seat-row-label">{rowKey}</span>
              {groupedByRow[rowKey]
                .sort((a, b) => a.number - b.number)
                .map((seat) => {
                  const isSelected = selectedSeats.includes(seat.seatId);
                  const classNames = ["seat"];
                  if (seat.isLocked && !seat.lockedByUser)
                    classNames.push("locked");
                  else if (isSelected) classNames.push("selected");

                  return (
                    <button
                      key={seat.seatId}
                      data-seat-id={seat.seatId}   
                      className={classNames.join(" ")}
                      onClick={() => toggleSeat(seat)}
                      disabled={seat.isLocked && !seat.lockedByUser}
                    >
                      {seat.number}
                    </button>
                  );
                })}
            </div>
          ))}
      </div>

      {lockError && <p className="auth-error">{lockError}</p>}
      {bookingError && <p className="auth-error">{bookingError}</p>}

      <div className="seat-actions">
        <button onClick={handleLock} disabled={locking}>
          {locking ? "Locking..." : "Lock Seats"}
        </button>
        <button onClick={handleCreateBooking} disabled={bookingLoading}>
          {bookingLoading ? "Creating..." : "Create Booking"}
        </button>
      </div>
    </section>
  );
}

export default ShowSeatSelection;
