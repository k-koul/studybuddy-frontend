import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import API from "../services/api"
import ReactMarkdown from "react-markdown"

function Chat() {

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState("")
  const [sessionLoading, setSessionLoading] = useState(false)
  const [renameLoading, setRenameLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [isFirstMessage, setIsFirstMessage] = useState(true)
  const [renamingId, setRenamingId] = useState(null)
  const [renameInput, setRenameInput] = useState("")
  const [sidebarError, setSidebarError] = useState("")
  const [chatError, setChatError] = useState("")

  const email = localStorage.getItem("email")

  useEffect(() => {
    initChat()
  }, [])

  const showSidebarError = (msg) => {
    setSidebarError(msg)
    setTimeout(() => setSidebarError(""), 3000)
  }

  const showChatError = (msg) => {
    setChatError(msg)
    setTimeout(() => setChatError(""), 3000)
  }

  const initChat = async () => {

    setPageLoading(true)
    setPageError("")

    try {

      const response = await API.get(
        `/chat/sessions?user_email=${encodeURIComponent(email)}`
      )

      const existingSessions = response.data.data
      setSessions(existingSessions)

      if (existingSessions.length > 0) {

        const latest = existingSessions[0]

        const msgResponse = await API.get(
          `/chat/messages?session_id=${latest.id}`
        )

        const msgs = msgResponse.data.data

        if (msgs.length === 0) {
          setCurrentSessionId(latest.id)
          setMessages([])
          setIsFirstMessage(true)
        } else {
          setCurrentSessionId(latest.id)
          setMessages(msgs)
          setIsFirstMessage(false)
        }

      } else {

        const newSession = await API.post(
          `/chat/session?user_email=${encodeURIComponent(email)}&title=New Chat`
        )

        setCurrentSessionId(newSession.data.data.session_id)
        setIsFirstMessage(true)
        setMessages([])

        const updated = await API.get(
          `/chat/sessions?user_email=${encodeURIComponent(email)}`
        )

        setSessions(updated.data.data)
      }

    } catch {
      setPageError("Failed to load chat. Please refresh the page.")
    } finally {
      setPageLoading(false)
    }
  }

  const loadSessions = async () => {

    try {

      const response = await API.get(
        `/chat/sessions?user_email=${encodeURIComponent(email)}`
      )

      setSessions(response.data.data)

    } catch {
      console.log("Could not load sessions")
    }
  }

  const startNewChat = async () => {

    if (isFirstMessage && currentSessionId) return

    if (sessions.length > 0) {
      const latest = sessions[0]
      if (latest.title === "New Chat") {
        setCurrentSessionId(latest.id)
        setMessages([])
        setIsFirstMessage(true)
        setRenamingId(null)
        return
      }
    }

    try {

      const response = await API.post(
        `/chat/session?user_email=${encodeURIComponent(email)}&title=New Chat`
      )

      setCurrentSessionId(response.data.data.session_id)
      setIsFirstMessage(true)
      setMessages([])
      loadSessions()

    } catch {
      showSidebarError("Could not start new chat.")
    }
  }

  const loadSession = async (sessionId) => {

    setSessionLoading(true)
    setChatError("")

    try {

      const response = await API.get(
        `/chat/messages?session_id=${sessionId}`
      )

      setCurrentSessionId(sessionId)
      setMessages(response.data.data)
      setIsFirstMessage(false)
      setRenamingId(null)

    } catch (err) {

      showChatError(
        err.response?.data?.error ||
        "Could not load conversation."
      )

    } finally {
      setSessionLoading(false)
    }
  }

  const deleteSession = async (sessionId) => {

    try {

      await API.delete(
        `/chat/session?session_id=${sessionId}&user_email=${encodeURIComponent(email)}`
      )

      if (currentSessionId === sessionId) {

        const response = await API.get(
          `/chat/sessions?user_email=${encodeURIComponent(email)}`
        )

        const remaining = response.data.data

        if (remaining.length > 0) {

          const latest = remaining[0]

          const msgResponse = await API.get(
            `/chat/messages?session_id=${latest.id}`
          )

          setCurrentSessionId(latest.id)
          setMessages(msgResponse.data.data)
          setIsFirstMessage(msgResponse.data.data.length === 0)
          setSessions(remaining)

        } else {

          const newSession = await API.post(
            `/chat/session?user_email=${encodeURIComponent(email)}&title=New Chat`
          )

          setCurrentSessionId(newSession.data.data.session_id)
          setMessages([])
          setIsFirstMessage(true)

          const updated = await API.get(
            `/chat/sessions?user_email=${encodeURIComponent(email)}`
          )

          setSessions(updated.data.data)
        }

      } else {
        loadSessions()
      }

    } catch {
      showSidebarError("Could not delete conversation.")
    }
  }

  const submitRename = async (sessionId) => {

    if (!renameInput.trim()) return

    setRenameLoading(true)

    try {

      await API.patch(
        `/chat/session/rename?session_id=${sessionId}&user_email=${encodeURIComponent(email)}&new_title=${encodeURIComponent(renameInput)}`
      )

      setRenamingId(null)
      setRenameInput("")
      loadSessions()

    } catch (err) {

      showSidebarError(
        err.response?.data?.error ||
        "Could not rename conversation."
      )

    } finally {
      setRenameLoading(false)
    }
  }

  const sendMessage = async () => {

    if (!input.trim()) return
    if (!currentSessionId) return

    const userMessage = { role: "user", text: input }
    setMessages((prev) => [...prev, userMessage])

    const messageText = input
    setInput("")
    setLoading(true)
    setChatError("")

    try {

      const response = await API.post(
        `/chat?message=${encodeURIComponent(messageText)}&user_email=${encodeURIComponent(email)}&session_id=${currentSessionId}&is_first=${isFirstMessage}`
      )

      const botMessage = {
        role: "bot",
        text: response.data.data.reply
      }

      setMessages((prev) => [...prev, botMessage])

      if (isFirstMessage) {
        setIsFirstMessage(false)
        loadSessions()
      }

    } catch (err) {

      const msg = err.response?.status === 429
        ? "Rate limit reached. Please wait a moment."
        : "Failed to get a response. Please try again."

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: msg }
      ])

    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage()
  }

  if (pageLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "24px",
        fontWeight: "bold"
      }}>
        Loading Chat...
      </div>
    )
  }

  if (pageError) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "16px"
      }}>
        <div style={{
          backgroundColor: "#f8d7da",
          color: "#842029",
          padding: "16px 24px",
          borderRadius: "10px",
          fontSize: "16px"
        }}>
          {pageError}
        </div>
        <button
          className="btn login-btn"
          onClick={initChat}
        >
          Retry
        </button>
      </div>
    )
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

      <div style={{
        display: "flex",
        gap: "16px",
        padding: "20px",
        height: "calc(100vh - 60px)"
      }}>

        {/* SIDEBAR */}
        <div className="login-card" style={{
          width: "260px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          overflowY: "auto"
        }}>

          <button
            className="btn login-btn w-100"
            onClick={startNewChat}
          >
            + New Chat
          </button>

          {sidebarError && (
            <div style={{
              backgroundColor: "#f8d7da",
              color: "#842029",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "13px"
            }}>
              {sidebarError}
            </div>
          )}

          <hr />

          {sessions.length === 0 && (
            <p style={{
              color: "#aaa",
              fontSize: "14px",
              textAlign: "center"
            }}>
              No conversations yet
            </p>
          )}

          {sessions.map((session) => (

            <div
              key={session.id}
              style={{
                backgroundColor: currentSessionId === session.id
                  ? "#d6d4d5"
                  : "transparent",
                borderRadius: "10px",
                padding: "8px 10px"
              }}
            >

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>

                <span
                  style={{
                    fontSize: "14px",
                    flex: 1,
                    cursor: "pointer",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                  onClick={() => loadSession(session.id)}
                >
                  {session.title}
                </span>

                <div style={{ display: "flex", gap: "4px" }}>

                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: "#666"
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setRenamingId(session.id)
                      setRenameInput(session.title)
                    }}
                  >
                    ✏️
                  </button>

                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: "#999"
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(session.id)
                    }}
                  >
                    x
                  </button>

                </div>

              </div>

              {renamingId === session.id && (

                <div style={{
                  display: "flex",
                  gap: "6px",
                  marginTop: "8px"
                }}>

                  <input
                    type="text"
                    className="form-control"
                    style={{ fontSize: "13px", padding: "4px 8px" }}
                    value={renameInput}
                    onChange={(e) => setRenameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitRename(session.id)
                    }}
                  />

                  <button
                    className="btn login-btn"
                    style={{ fontSize: "12px", padding: "4px 10px" }}
                    onClick={() => submitRename(session.id)}
                    disabled={renameLoading}
                  >
                    {renameLoading ? "Saving..." : "Save"}
                  </button>

                </div>
              )}

            </div>
          ))}

        </div>

        {/* CHAT AREA */}
        <div className="login-card" style={{
          flex: 1,
          padding: "20px",
          display: "flex",
          flexDirection: "column"
        }}>

          <h4 className="mb-3 fw-bold">Chat with AI</h4>

          {chatError && (
            <div style={{
              backgroundColor: "#f8d7da",
              color: "#842029",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "14px",
              marginBottom: "12px"
            }}>
              {chatError}
            </div>
          )}

          <div style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "16px",
            padding: "10px"
          }}>

            {sessionLoading && (
              <p style={{ textAlign: "center", color: "#666" }}>
                Loading conversation...
              </p>
            )}

            {messages.length === 0 && !sessionLoading && (
              <p style={{
                color: "#aaa",
                textAlign: "center",
                marginTop: "180px"
              }}>
                Ask me anything!
              </p>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.role === "user" ? "#020102" : "#d6d4d5",
                  color: msg.role === "user" ? "white" : "black",
                  padding: "10px 16px",
                  borderRadius: msg.role === "user"
                    ? "18px 18px 0 18px"
                    : "18px 18px 18px 0",
                  maxWidth: "75%",
                  fontSize: "15px"
                }}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}

            {loading && (
              <div style={{
                alignSelf: "flex-start",
                backgroundColor: "#d6d4d5",
                padding: "10px 16px",
                borderRadius: "18px 18px 18px 0",
                fontSize: "15px",
                color: "#666"
              }}>
                Typing...
              </div>
            )}

          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="btn login-btn"
              onClick={sendMessage}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Chat