import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await API.get("listings/");
        setListings(res.data);
      } catch (err) {
        console.error("Failed to fetch listings:", err.response || err);
      }
    };
    fetchListings();
  }, []);

  const isProvider = sessionStorage.getItem("is_provider") === "true";
  const currentUsername = sessionStorage.getItem("username"); // store username at login

  const handleBookNow = (listingId) => {
    // Navigate to booking page for this listing
    navigate(`/bookings/${listingId}`);
  };

  return (
    <div>
      {isProvider && (
        <button onClick={() => navigate("/providers")}>Profile</button>
      )}

      <h2>Service Listings</h2>
      {listings.map((l) => (
        <div
          key={l.id}
          style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}
        >
          <h3>{l.title}</h3>
          <p>{l.description}</p>
          <p>Provider: {l.provider.display_name}</p>
          <p>Price: ${(l.price_cents / 100).toFixed(2)}</p>

          {/* Show "Book Now" only if the user is not the provider */}
          {!isProvider || l.provider.username !== currentUsername ? (
            <button onClick={() => handleBookNow(l.id)}>Book Now</button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
