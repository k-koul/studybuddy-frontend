import { Link, useNavigate, useLocation } from "react-router-dom"

function Navbar() {

  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("email")
    navigate("/login")
  }

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">

        <Link
          className="navbar-brand fw-bold"
          to="/home"
        >
          Study Buddy
        </Link>

        <div>

          {location.pathname !== "/home" && (
            <Link
              className="btn btn-outline-light me-2"
              to="/home"
            >
              Home
            </Link>
          )}

          {location.pathname !== "/home" &&
           location.pathname !== "/study-buddy" && (
            <Link
              className="btn btn-outline-light me-2"
              to="/study-buddy"
            >
              Study Buddy
            </Link>
          )}

          {location.pathname !== "/chat" && (
            <Link
              className="btn btn-outline-light me-2"
              to="/chat"
            >
              Chat
            </Link>
          )}

          <button
            className="btn btn-danger"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>
    </nav>
  )
}

export default Navbar