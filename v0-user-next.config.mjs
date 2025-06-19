/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Aumentar el tiempo de espera para las funciones serverless
  serverRuntimeConfig: {
    maxDuration: 60, // 60 segundos
  },
  // Asegurarse de que las API routes funcionen correctamente
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    externalResolver: true,
  },
};

export default nextConfig;
