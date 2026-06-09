import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import API from "../services/api"
import ReactMarkdown from "react-markdown"

function StudyBuddy() {

  const [file, setFile] = useState(null)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [history, setHistory] = useState([])
  const [uploading, setUploading] = useState(false)
  const [asking, setAsking] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState("")
  const [uploadError, setUploadError] = useState("")
  const [askError, setAskError] = useState("")
  const [historyError, setHistoryError] = useState("")

  const email = localStorage.getItem("email")

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {

    try {

      const response = await API.get(
        `/rag/history?user_email=${encodeURIComponent(email)}`
      )

      setHistory(response.data.data)

    } catch {
      console.log("Could not load history")
    }
  }

  const uploadPDF = async () => {

    if (!file) {
      setUploadError("Please select a PDF file first.")
      setUploadSuccess("")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    setUploading(true)
    setUploadError("")
    setUploadSuccess("")

    try {

      await API.post("/upload-pdf", formData)

      setUploadSuccess("PDF uploaded successfully! You can now ask questions.")
      setFile(null)

    } catch (err) {

      setUploadError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Upload failed. Please try again."
      )

    } finally {
      setUploading(false)
    }
  }

  const askQuestion = async () => {

    if (!question.trim()) {
      setAskError("Please enter a question.")
      return
    }

    setAsking(true)
    setAskError("")
    setAnswer("")

    try {

      const response = await API.post(
        `/ask?query=${encodeURIComponent(question)}&user_email=${encodeURIComponent(email)}`
      )

      setAnswer(response.data.data.answer)
      loadHistory()

    } catch (err) {

      setAskError(
        err.response?.status === 400
          ? "Please upload a PDF before asking questions."
          : err.response?.status === 429
          ? "Rate limit reached. Please wait a moment."
          : err.response?.data?.error ||
            err.response?.data?.detail ||
            "Failed to get an answer. Please try again."
      )

    } finally {
      setAsking(false)
    }
  }

  const deleteHistory = async (entryId) => {

    setHistoryError("")

    try {

      await API.delete(
        `/rag/history?entry_id=${entryId}&user_email=${encodeURIComponent(email)}`
      )

      loadHistory()

    } catch {
      setHistoryError("Could not delete entry. Please try again.")
      setTimeout(() => setHistoryError(""), 3000)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") askQuestion()
  }

  return (

    <div style={{
      backgroundImage: "url('/img3.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100vh"
    }}>

      <Navbar />

      <div className="container-fluid mt-4 px-4">

        <div style={{
          display: "flex",
          gap: "20px",
          alignItems: "flex-start"
        }}>

          {/* LEFT: upload + ask */}
          <div className="login-card card shadow-lg p-4" style={{ flex: 1 }}>

            <h2 className="mb-4 text-dark">
              Start by uploading your PDF and then ask questions related to it.
            </h2>

            <h5>Upload PDF</h5>

            <input
              type="file"
              accept=".pdf"
              className="form-control"
              onChange={(e) => {
                setFile(e.target.files[0])
                setUploadError("")
                setUploadSuccess("")
              }}
            />

            {uploadError && (
              <div style={{
                backgroundColor: "#f8d7da",
                color: "#842029",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                marginTop: "10px"
              }}>
                {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div style={{
                backgroundColor: "#d1e7dd",
                color: "#0f5132",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                marginTop: "10px"
              }}>
                {uploadSuccess}
              </div>
            )}

            <button
              className="btn btn-success mt-3"
              onClick={uploadPDF}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload PDF"}
            </button>

            <hr />

            <h5>Ask a Question</h5>

            <input
              type="text"
              className="form-control"
              placeholder="Ask anything from your document..."
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value)
                setAskError("")
              }}
              onKeyDown={handleKeyDown}
            />

            {askError && (
              <div style={{
                backgroundColor: "#f8d7da",
                color: "#842029",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                marginTop: "10px"
              }}>
                {askError}
              </div>
            )}

            <button
              className="btn btn-primary mt-3"
              onClick={askQuestion}
              disabled={asking}
            >
              {asking ? "Thinking..." : "Ask AI"}
            </button>

            <div className="mt-4">

              <h5>Answer</h5>

              <div className="alert alert-secondary text-start">
                {asking ? (
                  <p>Thinking...</p>
                ) : answer ? (
                  <ReactMarkdown>{answer}</ReactMarkdown>
                ) : (
                  "Your answer will appear here"
                )}
              </div>

            </div>

          </div>

          {/* RIGHT: past history */}
          <div className="login-card card shadow-lg p-4" style={{
            width: "380px",
            maxHeight: "85vh",
            overflowY: "auto"
          }}>

            <h5 className="fw-bold mb-3">Past Questions</h5>

            {historyError && (
              <div style={{
                backgroundColor: "#f8d7da",
                color: "#842029",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "10px"
              }}>
                {historyError}
              </div>
            )}

            {history.length === 0 && (
              <p style={{ color: "#aaa", fontSize: "14px" }}>
                No history yet. Ask a question to see it here.
              </p>
            )}

            {history.map((entry) => (

              <div
                key={entry.id}
                style={{
                  borderBottom: "1px solid #ccc",
                  paddingBottom: "12px",
                  marginBottom: "12px"
                }}
              >

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "8px"
                }}>

                  <p style={{
                    fontWeight: "bold",
                    marginBottom: "4px",
                    fontSize: "14px",
                    flex: 1,
                    wordBreak: "break-word"
                  }}>
                    Q: {entry.question}
                  </p>

                  <button
                    style={{
                      background: "#999",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "12px",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    onClick={() => deleteHistory(entry.id)}
                  >
                    x
                  </button>

                </div>

                <div
                  className="alert alert-secondary text-start mt-1"
                  style={{ fontSize: "13px" }}
                >
                  <ReactMarkdown>{entry.answer}</ReactMarkdown>
                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  )
}

export default StudyBuddy