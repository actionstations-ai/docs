import { test } from 'node:test'
import assert from 'node:assert/strict'
import { describe, rewriteMarkdown, splitTitle } from '../scripts/markdown.mjs'
import { classifyUnknown, PAGES } from '../scripts/pages.mjs'

const docs = new Map([
  ['docs/guides/prompts.md', '/guides/customize/prompts/'],
  ['docs/guides/providers/README.md', '/providers/'],
  ['docs/packs-format.md', '/reference/pack-format/'],
])
const ctx = (from) => ({
  from,
  resolveDoc: (p) => docs.get(p),
  resolveImage: (p) => (p.startsWith('docs/guides/images/') ? `../../images/${p}` : undefined),
  repoUrl: (p, isDir) => `https://github.com/x/y/${isDir(p) ? 'tree' : 'blob'}/v1/${p}`,
  isDir: (p) => !p.includes('.'),
})

test('the first heading is the title and leaves the body', () => {
  const { title, body } = splitTitle('# The `SimCell` assistant\n\nIntro text.\n\n## Part\n')
  assert.equal(title, 'The SimCell assistant')
  assert.equal(body, 'Intro text.\n\n## Part\n')
  assert.throws(() => splitTitle('Text first\n\n# Late'), /no top-level heading/)
})

test('links to included documents become site URLs, with their anchors', () => {
  const out = rewriteMarkdown('See [prompts](prompts.md#layers) and [setup](providers/README.md).', ctx('docs/guides/getting-started.md'))
  assert.equal(out, 'See [prompts](/guides/customize/prompts/#layers) and [setup](/providers/).')
  const dir = rewriteMarkdown('[providers](providers/)', ctx('docs/guides/x.md'))
  assert.equal(dir, '[providers](/providers/)')
  const up = rewriteMarkdown('[format](../packs-format.md)', ctx('docs/guides/packs.md'))
  assert.equal(up, '[format](/reference/pack-format/)')
})

test('other repository paths link to GitHub at the synced ref; external links stay', () => {
  const out = rewriteMarkdown(
    '[plans](../../reference/ncia/) [prompt](../../prompts/hotwash.md) [site](https://lmstudio.ai) [here](#example)',
    ctx('docs/guides/getting-started.md'),
  )
  assert.equal(
    out,
    '[plans](https://github.com/x/y/tree/v1/reference/ncia) [prompt](https://github.com/x/y/blob/v1/prompts/hotwash.md) [site](https://lmstudio.ai) [here](#example)',
  )
})

test('a link whose label is code is rewritten; the code itself is not', () => {
  const out = rewriteMarkdown('[`hotwash.md`](../../prompts/hotwash.md) and `[x](prompts.md)`', ctx('docs/guides/prompts.md'))
  assert.equal(out, '[`hotwash.md`](https://github.com/x/y/blob/v1/prompts/hotwash.md) and `[x](prompts.md)`')
})

test('images are copied; code is never rewritten', () => {
  const src = '![Shot](images/a.png "t")\n`[x](prompts.md)`\n```\n[y](prompts.md)\n```\n<img src="images/b.png" alt="">'
  const out = rewriteMarkdown(src, ctx('docs/guides/g.md'))
  assert.equal(
    out,
    '![Shot](../../images/docs/guides/images/a.png "t")\n`[x](prompts.md)`\n```\n[y](prompts.md)\n```\n<img src="../../images/docs/guides/images/b.png" alt="">',
  )
})

test('the description is the first prose paragraph, plain and short', () => {
  assert.equal(describe('Read [the guide](x.md) and `run` it.\n\nMore.'), 'Read the guide and run it.')
  assert.equal(describe('## Heading\n\n- list\n\nProse here.'), 'Prose here.')
  assert.ok(describe('word '.repeat(80)).length <= 160)
})

test('internal records stay off the site; a new guide is placed with a warning; slugs are unique', () => {
  assert.equal(classifyUnknown('docs/adr/0073-player-apps.md'), undefined)
  assert.equal(classifyUnknown('docs/specs/0446-mobile-player-apps.md'), undefined)
  assert.deepEqual(classifyUnknown('docs/guides/new-thing.md'), { slug: 'guides/build/new-thing', order: 50, warn: true })
  const slugs = Object.values(PAGES).map((p) => p.slug)
  assert.equal(new Set(slugs).size, slugs.length)
})
