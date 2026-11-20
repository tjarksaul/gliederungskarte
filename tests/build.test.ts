import { describe, it, expect } from 'vitest'
import { execFileSync } from 'child_process'
import { mkdtempSync, readdirSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

const root = path.resolve(__dirname, '..')
const bin = (n: string) => path.join(root, 'node_modules', '.bin', n)

describe('build', () => {
  it('type-checks without errors', () => {
    execFileSync(bin('tsc'), ['--noEmit', '-p', root], { cwd: root, stdio: 'pipe' })
  }, 120_000)

  it('produces a production bundle and index.html', () => {
    const out = mkdtempSync(path.join(tmpdir(), 'karte-build-'))
    try {
      execFileSync(bin('webpack'), ['--config', 'webpack.config.prod.js', '--output-path', out], {
        cwd: root,
        stdio: 'pipe',
        env: { ...process.env, NODE_OPTIONS: '--openssl-legacy-provider', MAPBOX_API_KEY: 'test' },
      })
      const files = readdirSync(out)
      expect(files).toContain('index.html')
      expect(files.some(f => /^app\..*\.js$/.test(f))).toBe(true)
    } finally {
      rmSync(out, { recursive: true, force: true })
    }
  }, 300_000)
})
