import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  transpilePackages: ['swagger-ui-react', 'swagger-client', 'react-syntax-highlighter'],

};

export default nextConfig;
