# BackThen

BackThen (`그해 오늘`) is a single-page archival newspaper front page built with Next.js App Router.

## Local setup

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open `http://localhost:3000`

## Build and checks

- `npm run build`: create the production build.
- `npm start`: serve the production build after building.
- `npm run lint`: run Next.js linting.
- `npm run typecheck`: check TypeScript without emitting files.

## Environment

- `POSTGRES_URL`: optional PostgreSQL connection string
- `POSTGRES_SSL`: set to `true` when your provider requires SSL

Keep database credentials in local environment variables, not in committed files.

## Lead image search

- Hero images are fetched from Wikimedia Commons search.
- No API key is required.
- When Commons does not return a match, the app falls back to the article's own image if one exists.

## Manual overrides

- Add curated fallback records to [lib/news/editorialOverrides.ts](lib/news/editorialOverrides.ts) for dates that public newspaper endpoints do not expose.

## Font

This project uses three local Chosun fonts from `public/fonts/`.
