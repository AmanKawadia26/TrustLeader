import { defineConfig } from "vite";
import type { ServerResponse } from "http";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 5173;
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT: ${rawPort}`);
}

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  esbuild: {
    legalComments: "none",
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false,
    // Main chunk (~580kB) includes React + router + charts; acceptable for MVP; silences Rollup noise on Vercel.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (
          /sourcemap|Can't resolve original location/i.test(String(warning.message ?? ""))
        ) {
          return;
        }
        defaultHandler(warning);
      },
    },
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET ?? "http://127.0.0.1:8080",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("error", (_err, _req, res) => {
            const r = res as ServerResponse;
            if (r.headersSent) return;
            r.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
            r.end(
              JSON.stringify({
                error: "service_unavailable",
                message:
                  "API server is not reachable. Start the Go backend on port 8080 with DATABASE_URL set.",
              }),
            );
          });
        },
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
