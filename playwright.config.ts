import { defineConfig } from "@playwright/test"
export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: process.env.TEST_BASE_URL ?? "http://127.0.0.1:8443",
    browserName: "chromium",
    channel: "chrome",
    headless: true,
    trace: "retain-on-failure",
  },
  reporter: "list",
  webServer: process.env.TEST_BASE_URL
    ? undefined
    : {
        command:
          "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 8443",
        url: "http://127.0.0.1:8443",
        reuseExistingServer: true,
        timeout: 30000,
      },
})
