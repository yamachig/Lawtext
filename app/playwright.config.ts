import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testMatch: "test/**/*.spec.ts",
    outputDir: "playwright-results",
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    use: {
        baseURL: "http://127.0.0.1:8091",
        trace: "on-first-retry",
    },
    reporter: [["html", { host: "127.0.0.1" }]],
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
        },
        {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
        },
        {
            name: "Mobile Chrome",
            use: { ...devices["Pixel 5"] },
        },
        {
            name: "Mobile Safari",
            use: { ...devices["iPhone 12"] },
        },
    ],
    webServer: {
        command: "npx webpack serve --env DEV_SERVER=1 DEV_SERVER_PORT=8091 --mode development --color --config ./webpack-configs/client.ts",
        url: "http://127.0.0.1:8091",
        reuseExistingServer: !process.env.CI,
    },
});
