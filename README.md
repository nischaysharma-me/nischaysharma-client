# nischaysharma.com Client

The Next.js client for nischaysharma.com, including the public portfolio and content experience plus the authenticated writing and distribution studio.

## Current Features

- Public articles, documentation, books, and paginated short-form post feed.
- Admin article and post management with draft, published, and archived states.
- AI post draft generation with selectable tone and custom instructions.
- AI image generation for post covers and LinkedIn assets.
- LinkedIn text, image, and document/carousel composition for articles and posts.
- Per-slide images and bulk generation of missing carousel images.
- Admin Prompt Library for editable article, post, and LinkedIn generation templates.
- Responsive navigation, stack menu, modals, and admin workspaces.

## Important Routes

| Route | Purpose |
| --- | --- |
| `/posts` | Public short-form post feed |
| `/admin/posts` | Post management |
| `/admin/posts/create` | Manual and AI-assisted post creation |
| `/admin/posts/:id` | Post editor and image generation |
| `/admin/posts/:id/post/linkedin` | LinkedIn composer for a post |
| `/admin/articles/:id/post/linkedin` | LinkedIn composer for an article |
| `/admin/prompt-library` | Prompt defaults, overrides, history, preview, and reset |
| `/docs` | Documentation rendered from the server repository |

## Local Development

Requirements:

- Node.js and npm
- A running `nischaysharma-server`
- Firebase web credentials

Copy `.env.example` to `.env.local`, supply the Firebase values, and set `NEXT_PUBLIC_API_URL` to the server API. The server normally runs on port 3002 in this workspace, so a typical value is:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
```

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npx tsc --noEmit
npm run build
```

The backend documentation includes the Posts API, LinkedIn publishing formats, Prompt Library behavior, and operational setup notes.
