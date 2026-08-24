import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

export default defineConfig(async ({ mode }) => {
  // dynamic import: vite-plugin-istanbul is ESM-only and this config is also
  // required from cypress.config.ts, which is loaded as CommonJS
  const { default: istanbul } = await import("vite-plugin-istanbul");
  const env = loadEnv(mode, process.cwd(), "VITE");
  return {
    // expose all vite "VITE_*" variables as process.env.VITE_* in the browser
    define: {
      "process.env": env,
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: "build",
      sourcemap: true,
    },
    plugins: [
      react(),
      eslint(),
      istanbul({
        cypress: true,
        requireEnv: true,
        exclude: ["node_modules", "cypress", "dist"],
        forceBuildInstrument: true,
      }),
    ],
    // to get aws amplify to work with vite
    resolve: {
      alias: [
        {
          find: "./runtimeConfig",
          replacement: "./runtimeConfig.browser", // ensures browser compatible version of AWS JS SDK is used
        },
      ],
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/setup-tests.js",
      exclude: ["node_modules", "cypress", "dist"],
      fileParallelism: false, // #1666: Run tests sequentially to avoid race conditions with shared database.json file.
    },
  };
});
