import { useEffect, useState } from "react";

export default function BookingList() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Replace with your backend URL
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/bookings/`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBookings((prev) => {
        const exists = prev.find((b) => b.id === data.id);
        if (exists) {
          // Update existing booking
          return prev.map((b) => (b.id === data.id ? data : b));
        } else {
          // Add new booking
          return [data, ...prev];
        }
      });
    };

    ws.onclose = () => console.log("WebSocket closed");

    return () => ws.close();
  }, []);

  return (
    <div>
      <h2>Bookings</h2>
      {bookings.length === 0 && <p>No bookings yet.</p>}
      {bookings.map((b) => (
        <div key={b.id} style={{ border: "1px solid gray", margin: "5px", padding: "5px" }}>
          <p>Listing: {b.listing.title}</p>
          <p>Customer: {b.customer.username}</p>
          <p>Status: {b.status}</p>
          <p>
            From: {new Date(b.start).toLocaleString()} To: {new Date(b.end).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
