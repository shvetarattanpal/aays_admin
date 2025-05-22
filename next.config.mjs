/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose", 
  },
  reactStrictMode: true, 

  images: {
    remotePatterns: [
      {
        protocol: "https", 
        hostname: "res.cloudinary.com", 
        pathname: "/**",
      },
    ],
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      punycode: false,
    };
    return config;
  },
};

export default nextConfig;