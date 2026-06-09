import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import StudyBuddy from "./pages/StudyBuddy"
import Chat from "./pages/Chat"

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/study-buddy"
          element={<StudyBuddy />}
        />

        <Route
          path="/chat"
          element={<Chat />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App