export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/home" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Go to Home
          </a>
          <a href="/browse" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
            Browse Vendors
          </a>
        </div>
      </div>
    </div>
  )
}
