import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {

    if (!email || !password) {
      setError("Please fill all fields")
      return
    }

    setError("")
    setLoading(true)

    try {

      const response = await API.post(
        "/login",
        { email, password }
      )

      const data = response.data.data

      if (data?.token) {

        localStorage.setItem("token", data.token)
        localStorage.setItem("email", email)
        navigate("/home")

      } else {

        setError(data?.message || "Login failed. Please try again.")
      }

    } catch (err) {

      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Login failed. Please check your credentials."
      )

    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin()
  }

  return (

    <div
      style={{
        backgroundImage: "url('/img3.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh"
      }}
    >

      <div
        className="login-page"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "stretch"
        }}
      >

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px"
          }}
        >

          <div
            style={{
              marginBottom: "60px",
              color: "black",
              fontSize: "40px",
              fontWeight: "bold",
              textAlign: "center",
              fontFamily: "Times New Roman"
            }}
          >
            <span
              style={{
                backgroundColor: "#7b7b7775",
                padding: "2px 6px",
                borderRadius: "4px"
              }}
            >
              Study Buddy
            </span>

            <br />
            <br />

            "Your buddy throughout
            <br />
            The Journey"
          </div>

          <div
            className="card shadow-lg p-4 login-card"
            style={{ width: "390px" }}
          >

            <h2
              className="text-center mb-5"
              style={{
                color: "#000001",
                fontWeight: "bold",
                fontFamily: "Times New Roman",
                fontSize: "40px"
              }}
            >
              Welcome Back
            </h2>

            <input
              type="email"
              className="form-control mb-4"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <input
              type="password"
              className="form-control mb-4"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {error && (
              <div
                style={{
                  backgroundColor: "#f8d7da",
                  color: "#842029",
                  padding: "10px",
                  borderRadius: "6px",
                  marginBottom: "15px",
                  fontSize: "14px"
                }}
              >
                {error}
              </div>
            )}

            <button
              className="btn login-btn w-100"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <button
              className="btn create-new-btn btn-link mt-4 w-100"
              onClick={() => navigate("/register")}
            >
              Create New Account
            </button>

          </div>

        </div>

        <img
          src="/img2.png"
          alt="Student studying"
          style={{
            width: "500px",
            height: "110vh"
          }}
        />

      </div>

    </div>
  )
}

export default Login