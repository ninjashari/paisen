import React from "react"
import { Container } from "react-bootstrap"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Header from "./components/layout/Header"
import Homepage from "./pages/Homepage"

function App() {
  return (
    <Router>
      <Header />
      <Container>
        <Routes>
          <Route exact path="/" element={<Homepage />} />
          {/* <Route exact path="/animelist" Component={Animelist} />
        <Route exact path="/statistics" Component={Statistics} />
        <Route exact path="/search" Component={Search} />
        <Route exact path="/seasons" Component={Seasons} />
        <Route exact path="/authorized" Component={Authorized} /> */}
        </Routes>
      </Container>
    </Router>
  )
}

export default App
