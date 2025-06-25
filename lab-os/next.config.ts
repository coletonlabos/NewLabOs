/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // We'll handle type errors during development
    ignoreBuildErrors: false,
  },
}

export default nextConfig
