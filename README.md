# Action Stations documentation

The source of [docs.actionstations.ai](https://docs.actionstations.ai): a [Starlight](https://starlight.astro.build) site built from the documentation in the [app repository](https://github.com/actionstations-ai/actionstations).

The guides, reference pages, ADRs and specs are written once, in the app repository's `docs/` folder and `CONTRIBUTING.md`. `scripts/sync-docs.mjs` copies them here at build time from the latest release tag, so the site documents what users can download. Only the home page (`src/content/docs/index.mdx`), the theme and the page map live in this repository. To change a guide, edit it in the app repository; the **Edit page** link on every page goes there.

## Commands

Needs Node.js 22 and pnpm 10, and the app repository checked out next to this one (`../actionstations`, with Git LFS for the screenshots).

```sh
pnpm install
pnpm dev                    # sync from the latest release tag, then serve on localhost:4321
node scripts/sync-docs.mjs --ref main    # preview unreleased docs from main
pnpm build                  # sync and build to dist/
node scripts/check-links.mjs            # every internal link, image and anchor in dist/ resolves
pnpm test                   # the sync's Markdown transforms
pnpm run deploy             # tests, sync, build, link check, then publish to gh-pages
```

`pnpm run deploy` (not `pnpm deploy`, which is a pnpm command) runs `scripts/deploy.sh`. `REF=main` deploys another ref; `DRY_RUN=1` prepares the commit without pushing.

## Where pages go

`scripts/pages.mjs` maps each source document to a site path and a sidebar order; the sidebar groups are in `astro.config.mjs`. ADRs and specs are placed by number automatically, and a new guide that is not in the map appears under **Build an exercise** with a warning from the sync. Links between documents become site links; links to other repository files go to GitHub at the synced tag.

## Hosting

GitHub Pages serves the `gh-pages` branch at `docs.actionstations.ai` (DNS: `CNAME docs → actionstations-ai.github.io`). Search is [Pagefind](https://pagefind.app), built into the static site: no search service and no tracking. Fonts are self-hosted under the SIL Open Font License (`public/fonts/`).
