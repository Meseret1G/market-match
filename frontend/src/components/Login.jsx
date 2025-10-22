import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("token/", formData);
      sessionStorage.setItem("access_token", res.data.access);
      sessionStorage.setItem("refresh_token", res.data.refresh);
sessionStorage.setItem("username", res.data.username);

      API.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;

      let isProvider = false;
    try {
      const profileRes = await API.get("providers/me/");
      if (profileRes.data) isProvider = true;
    } catch (err) {
      if (err.response?.status === 404) {
        isProvider = false;
      } else {
        console.error("Error checking provider profile:", err);
      }
    }

    sessionStorage.setItem("is_provider", isProvider);
      navigate("/listings");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
