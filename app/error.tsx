export default function Error() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        textAlign: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
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
          Something went wrong
        </h1>
        <p
          style={{
            marginBottom: "2rem",
            color: "#6b7280",
            lineHeight: "1.5",
          }}
        >
          We're sorry, but an error occurred while processing your request.
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
            }}
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  )
}
