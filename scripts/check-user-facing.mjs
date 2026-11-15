#!/usr/bin/env node
// Published pages must not talk about the development process. User pages: no ADR, spec or issue
// numbers, test files, source paths or developer commands. Developer pages may name source paths
// and commands, but no ADR, spec or issue numbers and no links into docs/adr/ or docs/specs/.
// Lists offenders; exits 1 with --strict. The app repository's CI enforces the same rules.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

export const INTERNAL = [
  [/\bADR-?\d{3,4}\b/, 'ADR number'],
  [/\b[Ss]pecs? \d{4}\b/, 'spec number'],
  [/(^|[\s([,])#\d{2,4}\b|\/(issues|pull)\/\d+/, 'issue number'],
  [/\b[\w/-]+\.(test|spec|live\.test)\.tsx?\b/, 'test file'],
  [/\bsrc\/(main|renderer|shared|player)\//, 'source path'],
  [/\bpnpm (exec|test|e2e|build:check|ci:local)\b/, 'developer command'],
  [/\b(adr|specs)\/\d{4}-/, 'ADR or spec file'],
]

export const DEVELOPER = INTERNAL.filter(([, what]) =>
  ['ADR number', 'spec number', 'issue number', 'ADR or spec file'].includes(what),
)

const DOCS = new URL('../src/content/docs/', import.meta.url).pathname
const files = []
const walk = (d, rules) =>
  readdirSync(d).forEach((n) => {
    const p = join(d, n)
    if (statSync(p).isDirectory()) n !== 'images' && walk(p, n === 'developers' ? DEVELOPER : rules)
    else if (p.endsWith('.md')) files.push([p, rules])
  })
walk(DOCS, INTERNAL)

let count = 0
for (const [file, rules] of files) {
  let fenced = false
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (/^\s*```/.test(line)) fenced = !fenced
      if (fenced || line.startsWith('editUrl:')) return
      for (const [re, what] of rules) {
        if (re.test(line)) {
          count++
          console.log(`${relative(DOCS, file)}:${i + 1}: ${what}: ${line.trim().slice(0, 100)}`)
          break
        }
      }
    })
}
console.log(`${files.length} published pages, ${count} internal references`)
if (count && process.argv.includes('--strict')) process.exit(1)
