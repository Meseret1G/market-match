import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Listings from "./components/Listings";
import ProviderProfile from "./components/ProviderProfile";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/providers" element={<ProviderProfile />} />

      </Routes>
    </Router>
  );
}
