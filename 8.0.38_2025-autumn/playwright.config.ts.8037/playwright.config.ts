import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1/imart/",
    locale: "ja-JP",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
});
