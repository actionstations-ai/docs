// Where each document of the app repository goes on the site. The sidebar groups follow the
// directories in astro.config.mjs; `order` sorts within a group; `title` overrides the document's
// own heading when that reads badly in a sidebar. The site is for people who use and extend the
// app: internal process records (ADRs, feature specs, roadmap, release checklists) stay in the
// repository. A new guide that is not listed here is placed by classifyUnknown().

const page = (slug, order, extra = {}) => ({ slug, order, ...extra })

export const PAGES = {
  // Start here
  'docs/guides/getting-started.md': page('guides/start/getting-started', 1),
  'docs/guides/methodology.md': page('guides/start/methodology', 2),
  'docs/guides/classroom.md': page('guides/start/classroom', 3),
  'docs/guides/classroom-instructor-guide.md': page('guides/start/classroom-instructor-guide', 4),

  // Build an exercise
  'docs/guides/grounding.md': page('guides/build/grounding', 1),
  'docs/guides/case-data.md': page('guides/build/case-data', 2),
  'docs/guides/maps.md': page('guides/build/maps', 3),
  'docs/guides/hazard-data.md': page('guides/build/hazard-data', 4),
  'docs/guides/evaluation-metrics.md': page('guides/build/evaluation-metrics', 5),
  'docs/guides/micro-drills.md': page('guides/build/micro-drills', 6),
  'docs/guides/regional-exercises.md': page('guides/build/regional-exercises', 7),
  'docs/guides/translation-and-accessibility.md': page('guides/build/translation-and-accessibility', 8),
  'docs/guides/packs.md': page('guides/build/packs', 9, { title: 'Packs' }),
  'docs/guides/privacy.md': page('guides/build/privacy', 10),

  // Fields: the toolkits overview, then each field's guide in title order
  'docs/guides/toolkits.md': page('guides/fields/toolkits', 1, { label: 'How toolkits work' }),
  'docs/guides/ai-incidents.md': page('guides/fields/ai-incidents', 2),
  'docs/guides/animal-disease.md': page('guides/fields/animal-disease', 3),
  'docs/guides/construction.md': page('guides/fields/construction', 4),
  'docs/guides/earth-sciences.md': page('guides/fields/earth-sciences', 5),
  'docs/guides/ems-fire.md': page('guides/fields/ems-fire', 6),
  'docs/guides/environmental-response.md': page('guides/fields/environmental-response', 7),
  'docs/guides/prep-exercises.md': page('guides/fields/prep-exercises', 8),
  'docs/guides/epidemiology.md': page('guides/fields/epidemiology', 9),
  'docs/guides/flooding.md': page('guides/fields/flooding', 10),
  'docs/guides/governance.md': page('guides/fields/governance', 11),
  'docs/guides/health-informatics.md': page('guides/fields/health-informatics', 12),
  'docs/guides/hospitality.md': page('guides/fields/hospitality', 13),
  'docs/guides/human-services.md': page('guides/fields/human-services', 14),
  'docs/guides/humanitarian.md': page('guides/fields/humanitarian', 15),
  'docs/guides/justice.md': page('guides/fields/justice', 16),
  'docs/guides/media-environment.md': page('guides/fields/media-environment', 17),
  'docs/guides/nursing.md': page('guides/fields/nursing', 18),
  'docs/guides/pharmacy.md': page('guides/fields/pharmacy', 19),
  'docs/guides/research-labs.md': page('guides/fields/research-labs', 20),
  'docs/guides/space-weather.md': page('guides/fields/space-weather', 21),
  'docs/guides/supply-chain.md': page('guides/fields/supply-chain', 22),
  'docs/guides/weather.md': page('guides/fields/weather', 23),
  'docs/guides/wildfire.md': page('guides/fields/wildfire', 24),

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
  'docs/guides/providers/openai.md': page('providers/openai', 7),
  'docs/guides/providers/gemini.md': page('providers/gemini', 8),
  'docs/guides/providers/hosted-services.md': page('providers/hosted-services', 9),
  'docs/guides/providers/elevenlabs.md': page('providers/elevenlabs', 10),
  'docs/guides/providers/cloud-video.md': page('providers/cloud-video', 11),
  'docs/guides/model-profiles.md': page('providers/model-profiles', 12),
  'docs/guides/model-benchmark.md': page('providers/model-benchmark', 13),

  // Customize
  'docs/guides/prompts.md': page('guides/customize/prompts', 1, { title: 'Prompts' }),
  'docs/guides/templates.md': page('developers/overview/inject-templates', 4, { title: 'Writing inject templates' }),

  // Reference
  'docs/03-INJECT-TAXONOMY.md': page('reference/inject-taxonomy', 1),
  'docs/04-TABLETOP-METHODOLOGY.md': page('reference/tabletop-methodology', 2),
  'docs/packs-format.md': page('reference/pack-format', 3),
  'docs/exercise-bundle-format.md': page('reference/exercise-bundle-format', 4),
  'docs/accessibility/ACR-508.md': page('reference/accessibility-conformance', 5),

  // Developers
  'docs/02-ARCHITECTURE.md': page('developers/overview/architecture', 1),
  'docs/05-DATA-MODEL.md': page('developers/overview/data-model', 2),
  'docs/09-CODE-CONVENTIONS.md': page('developers/overview/code-conventions', 3),
  'CONTRIBUTING.md': page('developers/overview/contributing', 5),
}

/** A new guide that is not listed above (with a warning); anything else stays off the site. */
export function classifyUnknown(src) {
  const guide = /^docs\/guides\/([\w-]+)\.md$/.exec(src)
  if (guide) return { slug: `guides/build/${guide[1]}`, order: 50, warn: true }
  const provider = /^docs\/guides\/providers\/([\w-]+)\.md$/.exec(src)
  if (provider) return { slug: `providers/${provider[1]}`, order: 50, warn: true }
  return undefined
}
