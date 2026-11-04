#!/usr/bin/env node
// Every internal link, image and anchor in dist/ must resolve; no link may point at a .md file.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const DIST = new URL('../dist/', import.meta.url).pathname
const files = []
const walk = (d) => readdirSync(d).forEach((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : n.endsWith('.html') && files.push(join(d, n))))
walk(DIST)

const ids = new Map()
const idsOf = (file) => {
  if (!ids.has(file)) ids.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])))
  return ids.get(file)
}
const problems = []
for (const file of files) {
  const html = readFileSync(file, 'utf8')
  for (const [, attr, url] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    // External links (GitHub source files included) are not checked here.
    if (/^(https?:|mailto:|data:|#$)/.test(url)) continue
    if (/\.md(#|$)/.test(url)) problems.push(`${file.slice(DIST.length)}: links to markdown ${url}`)
    if (!url.startsWith('/') && !url.startsWith('#')) continue
    const [path, anchor] = url.split('#')
    let target = file
    if (path) {
      const clean = decodeURIComponent(path.split('?')[0])
      target = join(DIST, clean, clean.endsWith('/') ? 'index.html' : '')
      if (!existsSync(target)) {
        problems.push(`${file.slice(DIST.length)}: ${attr} ${url} not found`)
        continue
      }
    }
    if (anchor && target.endsWith('.html') && !idsOf(target).has(decodeURIComponent(anchor))) {
      problems.push(`${file.slice(DIST.length)}: anchor ${url} not found`)
    }
  }
}
for (const p of problems) console.log(p)
console.log(`${files.length} pages checked, ${problems.length} problems`)
process.exit(problems.length ? 1 : 0)
