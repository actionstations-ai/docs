// Action Stations documentation, served by GitHub Pages at docs.actionstations.ai.
// Content comes from the app repository (scripts/sync-docs.mjs); only the home page lives here.
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

/** A sidebar group listing one content directory, in each page's sidebar order. */
const group = (label, directory, collapsed = false) => ({ label, collapsed, items: [{ autogenerate: { directory } }] })

export default defineConfig({
  site: 'https://docs.actionstations.ai',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Action Stations Docs',
      description:
        'Documentation for Action Stations: build tabletop exercises from your own plans, run them live, and debrief.',
      logo: { src: './src/assets/action-stations-logo.png', alt: 'Action Stations', replacesTitle: false },
      favicon: '/favicon-32.png',
      customCss: ['./src/styles/fonts.css', './src/styles/brand.css'],
      social: [
        { icon: 'github', label: 'Source on GitHub', href: 'https://github.com/actionstations-ai/actionstations' },
      ],
      lastUpdated: false,
      pagination: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      head: [
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
      ],
      sidebar: [
        group('Start here', 'guides/start'),
        group('Build an exercise', 'guides/build'),
        group('Run it live', 'live'),
        group('After the exercise', 'guides/after'),
        group('Models and providers', 'providers'),
        group('Customize', 'guides/customize'),
        group('Reference', 'reference'),
        {
          label: 'Developers',
          items: [
            { autogenerate: { directory: 'developers/overview' } },
            group('Architecture decisions', 'developers/adr', true),
            group('Feature specs', 'developers/specs', true),
          ],
        },
      ],
    }),
  ],
})
