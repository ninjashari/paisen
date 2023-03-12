import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Animelist from "./pages/Animelist"
import Home from "./pages/Home"
import Search from "./pages/Search"
import Seasons from "./pages/Seasons"
import Statistics from "./pages/Statistics"

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" Component={Home} />
        <Route exact path="/animelist" Component={Animelist} />
        <Route exact path="/statistics" Component={Statistics} />
        <Route exact path="/search" Component={Search} />
        <Route exact path="/seasons" Component={Seasons} />
      </Routes>
    </Router>
  )
}

export default App
