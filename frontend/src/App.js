import React from "react"
import { Container } from "react-bootstrap"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Header from "./components/layout/Header"
import Animelist from "./pages/AnimeList"
import Homepage from "./pages/Homepage"
import OAuth from "./pages/OAuth"
import Search from "./pages/Search"
import Seasons from "./pages/Seasons"
import Statistics from "./pages/Statistics"

function App() {
  return (
    <Router>
      <Header />
      <Container>
        <Routes>
          <Route exact path="/" Component={Homepage} />
          <Route exact path="/animelist" Component={Animelist} />
          <Route exact path="/statistics" Component={Statistics} />
          <Route exact path="/search" Component={Search} />
          <Route exact path="/seasons" Component={Seasons} />
          <Route exact path="/oauth" Component={OAuth} />
        </Routes>
      </Container>
    </Router>
  )
}

export default App
