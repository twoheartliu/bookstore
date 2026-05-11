<div align="center">
  <h1>二心的旧书架</h1>
  <h3>Twoheart's Moving Sale</h3>

  [English](README.md) | [简体中文](README.zh.md)
</div>

A minimalist charity book sale for the [nofan.xyz](https://nofan.xyz) fediverse instance. All proceeds fund server hosting and bandwidth.

---

## Tech Stack

React 19 · TypeScript · Express · Vite · Tailwind CSS v4 · Motion

## Features

- Browse books by category (CS, Literature, Humanities, Finance, Philosophy)
- Shopping cart with 5-minute lock mechanism to prevent race conditions
- Federated checkout: fill in shipping info, generate a DM link to @twoheart on your fediverse instance
- Fully bilingual (Chinese / English)
- Live fundraising progress bar
- Resilient book cover image loading with proxy fallback
- Mastodon instance domain autocomplete

## Prerequisites

Node.js

## Run Locally

```bash
npm install
cp .env.example .env.local   # Edit .env.local with your GEMINI_API_KEY
npm run dev
```

Server starts at `http://localhost:3000`.

## Production Build

```bash
npm run build
npm run preview
```

## Data Source

Book inventory is served via [api.nofan.xyz](https://api.nofan.xyz/api/books), backed by a GitHub Gist with server-side caching.

## License

Apache-2.0 · [@twoheart@nofan.xyz](https://nofan.xyz/@twoheart)
