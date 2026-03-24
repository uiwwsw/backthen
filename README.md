# BackThen

BackThen (`그해 오늘`) is a single-page archival newspaper front page built with Next.js App Router.

## Local setup

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open `http://localhost:3000`

## Environment

- `POSTGRES_URL`: optional PostgreSQL connection string
- `POSTGRES_SSL`: set to `true` when your provider requires SSL

## Lead image search

- Hero images are fetched from Wikimedia Commons search.
- No API key is required.
- When Commons does not return a match, the app falls back to the article's own image if one exists.

## Manual overrides

- Add curated fallback records to [lib/news/editorialOverrides.ts](/Users/uiwwsw/backthen/lib/news/editorialOverrides.ts) for dates that public newspaper endpoints do not expose.

## Font

Drop the licensed Chosun Ilbo-style font into `public/fonts/` and update the filename in `app/globals.css`.
