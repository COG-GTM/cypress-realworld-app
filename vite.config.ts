import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import istanbul from "vite-plugin-istanbul";

export default defineConfig(({ mode }) => {
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
      coverage: {
        provider: "v8",
        reportsDirectory: "coverage/unit",
        reporter: ["text-summary", "json", "json-summary", "lcov", "html"],
        include: ["backend/**/*.ts", "src/**/*.{ts,tsx}"],
        exclude: [
          "**/__tests__/**",
          "**/*.cy.tsx",
          "**/*.d.ts",
          "src/models/**",
          "src/aws-exports.js",
          "src/setup-tests.js",
        ],
        thresholds: {
          lines: 18,
          statements: 18,
          functions: 69,
          branches: 85,
          "backend/**/*.ts": {
            lines: 50,
            statements: 50,
            functions: 82,
            branches: 90,
          },
          "src/**/*.{ts,tsx}": {
            lines: 10,
            statements: 10,
            functions: 58,
            branches: 79,
          },
        },
      },
    },
  };
});
