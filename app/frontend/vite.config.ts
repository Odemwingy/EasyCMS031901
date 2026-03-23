import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, new URL(".", import.meta.url).pathname, "VITE_");
  const port = Number(env.VITE_PORT || 5173);
  const apiBaseUrl = env.VITE_API_BASE_URL;
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "";
  const canUseBaseAsProxyTarget = typeof apiBaseUrl === "string" && /^https?:\/\//.test(apiBaseUrl);
  const proxyTarget = apiProxyTarget || (canUseBaseAsProxyTarget ? apiBaseUrl : "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
      },
    },
    server: {
      host: "0.0.0.0",
      port,
      strictPort: true,
      proxy: proxyTarget
        ? {
            "/api": {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
  };
});
