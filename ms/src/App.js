import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AnimelistContainer from "./pages/Animelist/Animelist"
import HomeContainer from "./pages/Home/Home"

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" Component={HomeContainer} />
        <Route exact path="/animelist" Component={AnimelistContainer} />
        <Route exact path="/statistics" Component={AnimelistContainer} />
        <Route exact path="/search" Component={AnimelistContainer} />
        <Route exact path="/seasons" Component={AnimelistContainer} />
      </Routes>
    </Router>
  )
}

export default App
