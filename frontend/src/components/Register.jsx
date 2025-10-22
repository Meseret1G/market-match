import React, { useState } from "react";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    is_provider: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Success:", response.data);
sessionStorage.setItem("access_token", response.data.access);
sessionStorage.setItem("refresh_token", response.data.refresh);
    sessionStorage.setItem("is_provider", formData.is_provider);
sessionStorage.setItem("username", response.data.username);


    window.location.href = "/listings";
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      <label>
        Provider?
        <input
          type="checkbox"
          name="is_provider"
          checked={formData.is_provider}
          onChange={handleChange}
        />
      </label>
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
