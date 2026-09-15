/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Backend'dagi /uploads/avatars/... rasmlarini next/image orqali ko'rsatish uchun.
    // Production'da BACKEND_HOST'ni haqiqiy domenga o'zgartiring.
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '**', pathname: '/uploads/**' },
    ],
  },
};

module.exports = nextConfig;
