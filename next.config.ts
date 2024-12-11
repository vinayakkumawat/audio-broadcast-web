/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
        missing: [
          {
            type: 'cookie',
            key: 'auth-token'
          }
        ],
      },
    ];
  },
  // Optional: If you're using a custom domain
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Forwarded-Proto',
            value: 'https'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;