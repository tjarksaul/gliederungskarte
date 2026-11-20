import { defineConfig } from 'vitest/config'
import path from 'path'

const src = (dir: string) => path.resolve(import.meta.dirname, 'src', dir)

export default defineConfig({
  resolve: {
    alias: [
      { find: /^(config|utils|dtos|map|json)(\/.*)?$/, replacement: src('$1') + '$2' },
    ],
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
})
