import "dotenv/config";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL,
    },
    setupFiles: [
      // "./tests/migrate-test.ts", // for migrate the test base before running the tests
      "./tests/setup.ts",
    ],
    fileParallelism: false,
    include: [
      "tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    globals: true,
    environment: "node",
  },
  plugins: [tsconfigPaths()],
});
