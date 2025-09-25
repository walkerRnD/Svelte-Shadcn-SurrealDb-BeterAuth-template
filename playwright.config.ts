import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		// Prebuild and use preview server; .env.test is loaded by server.config at runtime via NODE_ENV=test
		command: 'npm run build && npm run preview:test',
		port: 5173,
		reuseExistingServer: false
	},
	testDir: 'e2e'
});
