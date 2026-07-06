import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Coincide con MAX_PHOTO_SIZE_BYTES (lib/supabase/storage.ts): sin
      // esto, Next.js rechaza por defecto cualquier Server Action de más
      // de 1MB, bloqueando la subida de fotos reales antes de que nuestra
      // propia validación llegue a ejecutarse.
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
    ],
  },
};

export default nextConfig;
