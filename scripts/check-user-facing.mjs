#!/usr/bin/env node
// User-facing pages (everything but Developers) must not talk about the development process:
// no ADR, spec or issue numbers, test files, or source paths. Lists offenders; exits 1 with
// --strict. The app repository's CI enforces the same rule on docs/guides.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

export const INTERNAL = [
  [/\bADR-?\d{3,4}\b/, 'ADR number'],
  [/\b[Ss]pecs? \d{4}\b/, 'spec number'],
  [/(^|[\s(,])#\d{2,4}\b/, 'issue number'],
  [/\b[\w/-]+\.(test|spec|live\.test)\.tsx?\b/, 'test file'],
  [/\bsrc\/(main|renderer|shared|player)\//, 'source path'],
  [/\bpnpm (exec|test|e2e|build:check|ci:local)\b/, 'developer command'],
]

const DOCS = new URL('../src/content/docs/', import.meta.url).pathname
const files = []
const walk = (d) =>
  readdirSync(d).forEach((n) => {
    const p = join(d, n)
    if (statSync(p).isDirectory()) n !== 'developers' && n !== 'images' && walk(p)
    else if (p.endsWith('.md')) files.push(p)
  })
walk(DOCS)

let count = 0
for (const file of files) {
  let fenced = false
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (/^\s*```/.test(line)) fenced = !fenced
      if (fenced || line.startsWith('editUrl:')) return
      for (const [re, what] of INTERNAL) {
        if (re.test(line)) {
          count++
          console.log(`${relative(DOCS, file)}:${i + 1}: ${what}: ${line.trim().slice(0, 100)}`)
          break
        }
      }
    })
}
console.log(`${files.length} user-facing pages, ${count} internal references`)
if (count && process.argv.includes('--strict')) process.exit(1)
