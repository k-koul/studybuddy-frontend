import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

function Home() {

  const navigate = useNavigate()

  return (

    <div style={{
      backgroundImage: "url('/img3.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100vh"
    }}>

      <Navbar />

      <div className="container-fluid mt-4 px-5">

        <div className="text-center mb-4">
          <h1 className="display-3 fw-bold text-dark">
            Study Buddy
          </h1>
          <p className="lead mt-2">
            <b>Upload PDFs, ask questions and get AI powered answers instantly.</b>
          </p>
          <button
            className="btn btn-learning btn-lg mt-2"
            onClick={() => navigate("/study-buddy")}
          >
            Start Learning
          </button>
        </div>

        {/* Two column layout */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "40px" }}>

          {/* LEFT: stacked cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>

            <div className="login-card card shadow">
              <div className="card-body">
                <h4>Upload PDFs</h4>
                <p>Upload notes, books and study material for AI analysis.</p>
              </div>
            </div>

            <div className="login-card card shadow">
              <div className="card-body">
                <h4>AI Answers</h4>
                <p>Ask questions and get instant intelligent responses.</p>
              </div>
            </div>

            <div className="login-card card shadow">
              <div className="card-body">
                <h4>Smart Learning</h4>
                <p>Learn faster using your own documents and AI.</p>
              </div>
            </div>

          </div>

          {/* RIGHT: image */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <img
              src="/img4.png"
              alt="Student studying"
              style={{
                width: "650px",
                height: "auto",
                marginTop: "-3px"
              }}
            />
          </div>

        </div>

      </div>

    </div>
  )
}

export default Home