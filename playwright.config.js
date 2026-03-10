import { defineConfig } from '@playwright/test';

export default defineConfig({
    testMatch: 'scripts/*.spec.js',
    timeout: 120_000,
    use: {
        baseURL: process.env.BASE_URL ?? 'https://tidy-5ad72.web.app',
        headless: true,
        viewport: { width: 1280, height: 800 },
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    workers: 1,
    reporter: 'line',
});
