import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

function Register() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleRegister = async () => {

    if (!email || !password) {
      setError("Please fill all fields")
      setSuccess("")
      return
    }

    setError("")
    setSuccess("")
    setLoading(true)

    try {

      const response = await API.post(
        "/register",
        { email, password }
      )

      const data = response.data.data

      const message = data?.message || "Registration Successful"

      if (message.toLowerCase().includes("already")) {
        setError("This email is already registered. Please login.")
      } else {
        setSuccess("Account created successfully! Redirecting to login...")
        setTimeout(() => navigate("/login"), 1500)
      }

    } catch (err) {

      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Registration failed. Please try again."
      )

    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister()
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
              Create Account
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

            {success && (
              <div
                style={{
                  backgroundColor: "#d1e7dd",
                  color: "#0f5132",
                  padding: "10px",
                  borderRadius: "6px",
                  marginBottom: "15px",
                  fontSize: "14px"
                }}
              >
                {success}
              </div>
            )}

            <button
              className="btn login-btn w-100"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <button
              className="btn create-new-btn btn-link mt-4 w-100"
              onClick={() => navigate("/login")}
            >
              Already have an account?
            </button>

          </div>

        </div>

        <img
          src="/img1.png"
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

export default Register