"use client"

export default function GlobalError({ error }) {
  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Something went wrong</h1>
            <p>We're sorry, but an error occurred while processing your request.</p>
            <div style={{ marginTop: "2rem" }}>
              <a
                href="/home"
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#2563eb",
                  color: "white",
                  borderRadius: "0.25rem",
                  textDecoration: "none",
                }}
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
