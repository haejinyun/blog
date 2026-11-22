# blog(paori)

Haejin's personal blog about what I build and learn as a frontend developer.

## Development

```bash
pnpm install

pnpm dev        # dev server (localhost:3000)
pnpm build      # validate content, then export static files to out/
pnpm preview    # serve out/ locally
pnpm lint       # Biome + type check
pnpm test       # build, then run Playwright (build checks + e2e)
```

## Deployment (Vercel)

Deployed at **[paori.dev](https://paori.dev)**. Every push to `main` triggers a new deployment.

| Setting               | Value                                                                      |
| --------------------- | -------------------------------------------------------------------------- |
| Framework Preset      | Next.js (static export)                                                    |
| Build Command         | `pnpm build` (runs Velite before `next build`)                             |
| Output Directory      | default                                                                    |
| Environment Variables | `NEXT_PUBLIC_SITE_URL=https://paori.dev`, `ENABLE_EXPERIMENTAL_COREPACK=1` |

`NEXT_PUBLIC_SITE_URL` is used for canonical URLs, the sitemap, RSS, and OG images.
The domain is registered at Gabia and points to Vercel via A and CNAME records. `www` redirects to the apex domain.

## Tech Stack

- **Runtime**: Node.js 22+
- **Package Manager**: pnpm 12
- **Framework**: Next.js 16 (App Router, static export), React 19
- **Content**: Velite (Markdown/MDX)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 6
- **Lint/Format**: Biome
- **Test**: Playwright

## Author

Haejin Yun · [GitHub](https://github.com/haejinyun)

<details>
<summary>🦆</summary>

착한 사람은 포켓몬을 좋아해~

</details>
