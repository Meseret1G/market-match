import { useEffect, useState } from "react";
import axios from "axios";

export default function ProviderProfile() {
  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    phone: "",
    place: "",
    latitude: "",
    longitude: "",
  });
  const [message, setMessage] = useState("");

  // Fetch logged-in provider profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem("access_token");
      if (!token) {
        setMessage("No token found. Please login.");
        return;
      }

      try {
        const res = await axios.get("http://127.0.0.1:8000/api/providers/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setMessage("No profile found — create one below.");
        } else if (err.response?.status === 401) {
          setMessage("Unauthorized. Please login.");
        } else {
          setMessage("Error fetching profile.");
        }
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Search place name and get lat/lng
  const handlePlaceSearch = async () => {
    if (!profile.place) return;

    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: profile.place + ", Ethiopia",
          format: "json",
          limit: 1,
        },
      });

      if (res.data.length > 0) {
        const place = res.data[0];
        setProfile({
          ...profile,
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
        });
        setMessage(`Location found: ${place.display_name}`);
      } else {
        setMessage("Place not found in Ethiopia.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error searching place.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      setMessage("No token found. Please login.");
      return;
    }

    try {
      if (profile.id) {
        await axios.put(
          `http://127.0.0.1:8000/api/providers/${profile.id}/`,
          profile,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Profile updated successfully!");
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/providers/",
          profile,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Profile created successfully!");
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Provider Profile</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="display_name"
          value={profile.display_name}
          onChange={handleChange}
          placeholder="Display Name"
          required
        />
        <textarea
          name="bio"
          value={profile.bio}
          onChange={handleChange}
          placeholder="Bio"
        />
        <input
          type="text"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          placeholder="Phone"
        />

        {/* Place input */}
        <input
          type="text"
          name="place"
          value={profile.place}
          onChange={handleChange}
          placeholder="Enter place name in Ethiopia"
        />
        <button type="button" onClick={handlePlaceSearch}>
          Find Location
        </button>

        <p>
          Selected location:{" "}
          {profile.latitude && profile.longitude
            ? `${profile.latitude.toFixed(6)}, ${profile.longitude.toFixed(6)}`
            : "None"}
        </p>

        <button type="submit">
          {profile.id ? "Update Profile" : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
