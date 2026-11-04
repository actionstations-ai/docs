#!/usr/bin/env node
// Copies the documentation from the app repository into src/content/docs, so the guides are
// written once, next to the code they describe. By default it reads the latest release tag
// (v*), so the site documents what users can download; `--ref main` previews unreleased docs.
//
//   node scripts/sync-docs.mjs [--app ../actionstations] [--ref <tag|branch|sha>]
//
// For each page it: takes the first `# Heading` as the title, writes Starlight frontmatter
// (title, description, sidebar order, edit link), rewrites links between included documents to
// site URLs, links to other repository files to GitHub at the same ref, and copies images.
// The ref is checked out in a temporary git worktree so Git LFS images are real files.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PAGES, classifyUnknown } from './pages.mjs'
import { rewriteMarkdown, splitTitle, describe } from './markdown.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'src/content/docs')
const REPO = 'https://github.com/actionstations-ai/actionstations'
const GENERATED = ['guides', 'providers', 'live', 'reference', 'developers']

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? fallback : process.argv[i + 1]
}

const app = resolve(ROOT, arg('app', '../actionstations'))
const git = (...args) => execFileSync('git', ['-C', app, ...args], { encoding: 'utf8' }).trim()
const ref = arg('ref', undefined) ?? git('describe', '--tags', '--abbrev=0', '--match', 'v*', 'origin/main')
const sha = git('rev-parse', `${ref}^{commit}`)

// A detached worktree of the ref: LFS images are smudged on checkout, and the app's own working
// tree is never touched.
const tree = join(ROOT, '.sync-worktree')
if (existsSync(tree)) git('worktree', 'remove', '--force', tree)
git('worktree', 'add', '--detach', '--force', tree, sha)
try {
  execFileSync('git', ['-C', tree, 'lfs', 'pull', '--include', 'docs/**'], { stdio: 'ignore' })
} catch {
  console.warn('git lfs pull failed: images may be LFS pointers')
}

function listDocs() {
  const out = []
  const walk = (dir) => {
    for (const name of readdirSync(join(tree, dir))) {
      const rel = posix.join(dir, name)
      if (statSync(join(tree, rel)).isDirectory()) walk(rel)
      else if (rel.endsWith('.md')) out.push(rel)
    }
  }
  walk('docs')
  if (existsSync(join(tree, 'CONTRIBUTING.md'))) out.push('CONTRIBUTING.md')
  return out
}

// source path → { slug, section dir, order, label? }
const pages = new Map()
for (const src of listDocs()) {
  const page = PAGES[src] ?? classifyUnknown(src)
  if (!page) continue
  if (!PAGES[src] && page.warn) console.warn(`unmapped doc ${src} → ${page.slug} (add it to scripts/pages.mjs)`)
  pages.set(src, page)
}

for (const dir of GENERATED) rmSync(join(OUT, dir), { recursive: true, force: true })
rmSync(join(OUT, 'images'), { recursive: true, force: true })

const urlFor = (src) => `/${pages.get(src).slug.replace(/\/index$/, '')}/`
const images = new Set()

for (const [src, page] of pages) {
  const raw = readFileSync(join(tree, src), 'utf8')
  const { title, body } = splitTitle(raw, src)
  const outFile = join(OUT, `${page.slug}.md`)
  const rewritten = rewriteMarkdown(body, {
    from: src,
    resolveDoc: (target) => (pages.has(target) ? urlFor(target) : undefined),
    resolveImage: (target) => {
      if (!existsSync(join(tree, target))) return undefined
      images.add(target)
      return relative(dirname(outFile), join(OUT, 'images', target)).split('\\').join('/')
    },
    repoUrl: (target, isDir) => `${REPO}/${isDir(target) ? 'tree' : 'blob'}/${ref}/${target}`,
    isDir: (target) => existsSync(join(tree, target)) && statSync(join(tree, target)).isDirectory(),
  })
  const front = {
    title: page.title ?? title,
    description: describe(rewritten),
    editUrl: `${REPO}/edit/main/${src}`,
    sidebar: { order: page.order, ...(page.label ? { label: page.label } : {}) },
    ...(page.search === false ? { pagefind: false } : {}),
  }
  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, `---\n${yaml(front)}---\n\n${rewritten.trim()}\n`)
}

for (const img of images) {
  const dest = join(OUT, 'images', img)
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(join(tree, img), dest)
  if (readFileSync(dest).subarray(0, 40).toString().startsWith('version https://git-lfs')) {
    throw new Error(`${img} is a Git LFS pointer: run git lfs install in the app repository`)
  }
}

writeFileSync(join(OUT, 'sync.json'), JSON.stringify({ ref, sha, pages: pages.size, images: images.size }, null, 2) + '\n')
git('worktree', 'remove', '--force', tree)
console.log(`docs synced from ${ref} (${sha.slice(0, 8)}): ${pages.size} pages, ${images.size} images`)

/** Frontmatter as YAML: JSON strings are valid YAML scalars. */
function yaml(obj, indent = '') {
  return Object.entries(obj)
    .map(([k, v]) =>
      v && typeof v === 'object' ? `${indent}${k}:\n${yaml(v, indent + '  ')}` : `${indent}${k}: ${JSON.stringify(v)}\n`,
    )
    .join('')
}
