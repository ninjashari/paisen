import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AnimelistContainer from "./pages/Animelist/Animelist"
import HomeContainer from "./pages/Home/Home"
import SearchContainer from "./pages/Search/Search"
import SeasonsContainer from "./pages/Seasons/Seasons"
import StatisticsContainer from "./pages/Statistics/Statistics"

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" Component={HomeContainer} />
        <Route exact path="/animelist" Component={AnimelistContainer} />
        <Route exact path="/statistics" Component={StatisticsContainer} />
        <Route exact path="/search" Component={SearchContainer} />
        <Route exact path="/seasons" Component={SeasonsContainer} />
      </Routes>
    </Router>
  )
}

export default App
