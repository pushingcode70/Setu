import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar"
import Hire from "./Pages/Hire"
import Profile from "./Pages/Profile"
import Work from "./Pages/Work"
import Home from "./Pages/Home"
import './App.css'


function App() {
  

  return (
    <>
      <Router>
      <Navbar name="Setu" />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/hire" element={<Hire />} />
          
        </Routes>
      </main>
    </Router>

    </>
  )
}

export default App
