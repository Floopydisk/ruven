export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>404 - Page Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f9fafb;
            color: #111827;
          }
        `}</style>
      </head>
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "28rem", margin: "0 auto" }}>
            <h1
              style={{
                fontSize: "6rem",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                color: "#1f2937",
              }}
            >
              404
            </h1>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "#374151",
              }}
            >
              Page Not Found
            </h2>
            <p
              style={{
                marginBottom: "2rem",
                color: "#6b7280",
                lineHeight: "1.5",
              }}
            >
              The page you are looking for doesn't exist or has been moved.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
              <a
                href="/home"
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#2563eb",
                  color: "white",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  fontWeight: "500",
                  transition: "background-color 0.2s",
                }}
              >
                Go to Home
              </a>
              <a
                href="/browse"
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  color: "#374151",
                  fontWeight: "500",
                  transition: "background-color 0.2s",
                }}
              >
                Browse Vendors
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
