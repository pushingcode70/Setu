import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar"
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
          {/* <Route path="/work" element={<Work />} />
          <Route path="/hire" element={<Hire />} /> */}
          
        </Routes>
      </main>
    </Router>

    </>
  )
}

export default App
