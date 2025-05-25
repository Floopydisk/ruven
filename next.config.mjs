/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  // Disable static optimization for problematic pages
  staticPageGenerationTimeout: 60,
  // Add trailing slash to avoid issues with 404 handling
  trailingSlash: true,
};

export default nextConfig;
