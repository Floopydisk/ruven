/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'images.unsplash.com', 'via.placeholder.com'],
    unoptimized: true,
  },
<<<<<<< HEAD
  serverExternalPackages: ['@neondatabase/serverless'],
=======
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  // Disable static optimization for problematic pages
  staticPageGenerationTimeout: 60,
>>>>>>> ddaf9c031a0eb2ae03ed7d3268aac66b4c199b7a
  // Add trailing slash to avoid issues with 404 handling
  trailingSlash: true,
};

export default nextConfig;
