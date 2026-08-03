import { defineConfig } from '@playwright/test';

export default defineConfig({
	testMatch: '**/*.e2e.{ts,js}',
	// Fail rather than silently running a subset if a .only is committed.
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: 'http://localhost:4173'
	},
	webServer: {
		command: 'pnpm build && pnpm preview',
		port: 4173,
		// Locally, reuse a preview server that is already running; in CI always
		// start a fresh one.
		reuseExistingServer: !process.env.CI
	}
});
