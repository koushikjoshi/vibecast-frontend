import type { NextConfig } from "next";

// The Coolify-hosted FastAPI backend only speaks plain HTTP on sslip.io.
// The Vercel frontend is HTTPS, which means the browser refuses to load
// any HTTP subresource (fetch, EventSource, etc.) as mixed content.
//
// We fix it by proxying through the Vercel edge: the browser talks to
// our own origin over HTTPS, and Vercel forwards server-side to the
// HTTP backend. Streaming / SSE passes through transparently.
const backendOrigin =
  process.env.BACKEND_ORIGIN ??
  "http://qxr4o0g0lkn52an3aao0g2vb.187.127.153.253.sslip.io";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
