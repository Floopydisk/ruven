"use client"

export default function GlobalError() {
  return (
    <html>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
            backgroundColor: "#f9fafb",
          }}
        >
          <div style={{ maxWidth: "28rem", margin: "0 auto" }}>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: "#dc2626",
              }}
            >
              Application Error
            </h1>
            <p
              style={{
                marginBottom: "2rem",
                color: "#6b7280",
                lineHeight: "1.5",
              }}
            >
              A global error has occurred. Please refresh the page or try again later.
            </p>
            <div>
              <a
                href="/home"
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#2563eb",
                  color: "white",
                  borderRadius: "0.375rem",
                  textDecoration: "none",
                  marginRight: "0.5rem",
                }}
              >
                Return to Home
              </a>
              <button
                onClick={() => window.location.reload()}
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#6b7280",
                  color: "white",
                  borderRadius: "0.375rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
