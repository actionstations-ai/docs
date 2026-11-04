// Pure Markdown transforms for scripts/sync-docs.mjs (tested in tests/markdown.test.mjs).
import { posix } from 'node:path'

const IMAGE = /\.(png|jpe?g|gif|webp|svg)$/i
const EXTERNAL = /^([a-z][a-z0-9+.-]*:|\/\/)/i

/** The first `# Heading` becomes the page title; it is removed from the body. */
export function splitTitle(markdown, where = 'document') {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const i = lines.findIndex((l) => /^#\s+\S/.test(l))
  if (i === -1 || lines.slice(0, i).some((l) => l.trim() !== '' && !l.startsWith('<!--'))) {
    throw new Error(`${where}: no top-level heading at the start`)
  }
  const title = lines[i]
    .replace(/^#\s+/, '')
    .replace(/`/g, '')
    .trim()
  const rest = lines.slice(i + 1)
  while (rest.length && rest[0].trim() === '') rest.shift()
  return { title, body: rest.join('\n') }
}

/** A plain-text description from the first paragraph, for search results and link previews. */
export function describe(markdown, max = 160) {
  const para = markdown
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(#|```|\||<|>|!\[|[-*] |\d+\. )/.test(p))
  if (!para) return ''
  const text = para
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

/**
 * Rewrites link and image targets outside code: documents on the site → their URL, images → a
 * copied file, other repository paths → GitHub at the synced ref, external links unchanged.
 */
export function rewriteMarkdown(markdown, ctx) {
  let fenced = false
  return markdown
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced
        return line
      }
      if (fenced) return line
      // Inline code is never rewritten, but a link may wrap it ([`file.md`](file.md)): code spans
      // become placeholders while the links on the line are rewritten.
      const spans = []
      const masked = line.replace(/`[^`]*`/g, (code) => `\u0000${spans.push(code) - 1}\u0000`)
      return rewriteSegment(masked, ctx).replace(/\u0000(\d+)\u0000/g, (_, i) => spans[Number(i)])
    })
    .join('\n')
}

function rewriteSegment(text, ctx) {
  return text
    .replace(/(!?)\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(\s+"[^"]*")?\s*\)/g, (m, bang, label, target, title = '') => {
      const url = resolveTarget(target, ctx, !!bang)
      return url === undefined ? m : `${bang}[${label}](${url}${title})`
    })
    .replace(/^(\s*\[[^\]]+\]:\s*)(\S+)/, (m, head, target) => {
      const url = resolveTarget(target, ctx, IMAGE.test(target))
      return url === undefined ? m : `${head}${url}`
    })
    .replace(/(<(?:img|a)\b[^>]*?\s(?:src|href)=")([^"]+)(")/g, (m, head, target, tail) => {
      const url = resolveTarget(target, ctx, /^<img/.test(head))
      return url === undefined ? m : `${head}${url}${tail}`
    })
}

/** The new target, or undefined to keep the original text. */
export function resolveTarget(target, ctx, isImage) {
  if (EXTERNAL.test(target) || target.startsWith('#') || target.startsWith('/')) return undefined
  const hash = target.indexOf('#')
  const path = hash === -1 ? target : target.slice(0, hash)
  const anchor = hash === -1 ? '' : target.slice(hash)
  const resolved = posix.normalize(posix.join(posix.dirname(ctx.from), decodeURI(path))).replace(/\/$/, '')
  if (resolved.startsWith('..')) return undefined
  if (isImage || IMAGE.test(resolved)) return ctx.resolveImage(resolved) ?? ctx.repoUrl(resolved, ctx.isDir)
  const doc = ctx.resolveDoc(resolved) ?? ctx.resolveDoc(`${resolved}/README.md`)
  if (doc) return `${doc}${anchor}`
  return `${ctx.repoUrl(resolved, ctx.isDir)}${anchor}`
}
