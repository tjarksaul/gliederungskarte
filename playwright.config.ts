import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3000',
    launchOptions: {
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    },
  },
  webServer: {
    command: 'npx webpack-dev-server --config ./webpack.config.js',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
    env: { NODE_OPTIONS: '--openssl-legacy-provider' },
  },
})
