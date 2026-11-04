// Where each document of the app repository goes on the site. The sidebar groups follow the
// directories in astro.config.mjs; `order` sorts within a group; `title` overrides the document's
// own heading when that reads badly in a sidebar. Documents not listed here are placed by
// classifyUnknown(), so a new guide or ADR appears without editing this file.

const page = (slug, order, extra = {}) => ({ slug, order, ...extra })

export const PAGES = {
  // Start here
  'docs/guides/getting-started.md': page('guides/start/getting-started', 1),
  'docs/guides/methodology.md': page('guides/start/methodology', 2),

  // Build an exercise
  'docs/guides/grounding.md': page('guides/build/grounding', 1),
  'docs/guides/maps.md': page('guides/build/maps', 2),
  'docs/guides/hazard-data.md': page('guides/build/hazard-data', 3),
  'docs/guides/micro-drills.md': page('guides/build/micro-drills', 4),
  'docs/guides/regional-exercises.md': page('guides/build/regional-exercises', 5),
  'docs/guides/translation-and-accessibility.md': page('guides/build/translation-and-accessibility', 6),
  'docs/guides/packs.md': page('guides/build/packs', 7, { title: 'Packs' }),
  'docs/guides/privacy.md': page('guides/build/privacy', 8),

  // Run it live
  'docs/guides/live-play.md': page('live/player-page', 1),
  'docs/guides/live-simcell.md': page('live/simcell', 2),
  'docs/guides/self-hosted-server.md': page('live/self-hosted-server', 3),

  // After the exercise
  'docs/guides/facilitate.md': page('guides/after/hot-wash', 1),
  'docs/guides/program.md': page('guides/after/program', 2),
  'docs/guides/redlines.md': page('guides/after/redlines', 3),
  'docs/guides/eoc-platforms.md': page('guides/after/eoc-platforms', 4),

  // Models and providers
  'docs/guides/providers/README.md': page('providers/index', 1, { label: 'Overview' }),
  'docs/guides/providers/lm-studio.md': page('providers/lm-studio', 2),
  'docs/guides/providers/ollama.md': page('providers/ollama', 3),
  'docs/guides/providers/anthropic.md': page('providers/anthropic', 4),
  'docs/guides/providers/comfyui.md': page('providers/comfyui', 5),
  'docs/guides/providers/local-tts.md': page('providers/local-tts', 6),
  'docs/guides/model-profiles.md': page('providers/model-profiles', 7),
  'docs/guides/model-benchmark.md': page('providers/model-benchmark', 8),

  // Customize
  'docs/guides/prompts.md': page('guides/customize/prompts', 1, { title: 'Prompts' }),
  'docs/guides/templates.md': page('guides/customize/templates', 2, { title: 'Inject templates' }),

  // Reference
  'docs/03-INJECT-TAXONOMY.md': page('reference/inject-taxonomy', 1),
  'docs/04-TABLETOP-METHODOLOGY.md': page('reference/tabletop-methodology', 2),
  'docs/packs-format.md': page('reference/pack-format', 3),
  'docs/exercise-bundle-format.md': page('reference/exercise-bundle-format', 4),
  'docs/accessibility/ACR-508.md': page('reference/accessibility-conformance', 5),
  'docs/benchmarks/README.md': page('reference/model-benchmark-results', 6),

  // Developers
  'docs/02-ARCHITECTURE.md': page('developers/overview/architecture', 1),
  'docs/05-DATA-MODEL.md': page('developers/overview/data-model', 2),
  'docs/09-CODE-CONVENTIONS.md': page('developers/overview/code-conventions', 3),
  'CONTRIBUTING.md': page('developers/overview/contributing', 4),
  'docs/06-GITHUB-WORKFLOW.md': page('developers/overview/github-workflow', 5),
  'docs/RELEASING.md': page('developers/overview/releasing', 6),
  'docs/mobile/STORES.md': page('developers/overview/player-app-releases', 7),
  'docs/01-PRD.md': page('developers/overview/product-requirements', 8),
  'docs/08-ROADMAP.md': page('developers/overview/roadmap', 9),
  'docs/adr/README.md': page('developers/adr/index', 0, { label: 'About ADRs' }),
  'docs/specs/README.md': page('developers/specs/index', 0, { label: 'About specs' }),
}

/** ADRs, specs and new guides that are not listed above. Undefined = leave the file out. */
export function classifyUnknown(src) {
  const numbered = /\/(\d{4})-([\w-]+)\.md$/.exec(src)
  if (src.startsWith('docs/adr/') && numbered) {
    if (numbered[1] === '0000') return undefined // the template
    return { slug: `developers/adr/${numbered[1]}-${numbered[2].toLowerCase()}`, order: Number(numbered[1]) }
  }
  if (src.startsWith('docs/specs/') && numbered) {
    // Specs are long working documents: browsable, but kept out of search so guides rank first.
    return { slug: `developers/specs/${numbered[1]}-${numbered[2].toLowerCase()}`, order: Number(numbered[1]), search: false }
  }
  const guide = /^docs\/guides\/([\w-]+)\.md$/.exec(src)
  if (guide) return { slug: `guides/build/${guide[1]}`, order: 50, warn: true }
  return undefined
}
