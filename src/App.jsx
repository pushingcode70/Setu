import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import Hire from "./Pages/Hire";
import Work from "./Pages/Work";
import Profile from "./Pages/Profile";   // ← add

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hire" element={<Hire />} />
        <Route path="/work" element={<Work />} />
        <Route path="/profile" element={<Profile />} />   {/* ← add */}
      </Routes>
    </>
  );
}