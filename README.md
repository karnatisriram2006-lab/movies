## Movies — Vite + React

This repository is a Vite + React movie browsing app. The following instructions help you prepare the project for GitHub and deployment.

### Local development

Install and run dev server:

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

Production output goes into `dist/`.

### Deploy

Option A — GitHub Pages (workflow included):

- If serving from a repository subpath (https://<user>.github.io/<repo>/), set the build env `BASE_URL` to `/<repo>/` so Vite emits correct asset paths.
- The workflow `.github/workflows/deploy.yml` builds on pushes to `main` and publishes the `dist/` folder to GitHub Pages via `gh-pages`.

Option B — Vercel / Netlify:

- Connect the repo to Vercel or Netlify. Use build command `npm run build` and publish directory `dist` (Netlify) or let Vercel auto-detect.

### Notes

- `vite.config.js` uses `base: process.env.BASE_URL || '/'` — set `BASE_URL` at build time if deploying to a subpath.
- For GitHub Pages you don't need extra tokens; the action uses `GITHUB_TOKEN` automatically.

### API key (TMDB)

This project uses The Movie Database (TMDB) API. Do not commit your API key into source control.

1. Copy `.env.example` to `.env` at the project root:

```bash
cp .env.example .env
# then open .env and set VITE_TMDB_API_KEY
```

2. Add your TMDB API key to `.env`:

```
VITE_TMDB_API_KEY=your_real_api_key_here
```

Vite exposes env variables that start with `VITE_` to the client; `src/services/api.js` reads `import.meta.env.VITE_TMDB_API_KEY`.

3. For CI (GitHub Actions) set the API key as a repository secret (e.g. `VITE_TMDB_API_KEY`) and then expose it to the workflow as an env var when building, for example in `.github/workflows/deploy.yml` set:

```yaml
env:
	VITE_TMDB_API_KEY: ${{ secrets.VITE_TMDB_API_KEY }}
	BASE_URL: ${{ env.BASE_URL }}
```

That ensures the production build can access the API key without committing it to the repo.

### Useful commands

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview the production build locally

If you want, I can also create a GitHub Actions workflow that deploys to Netlify or a Vercel configuration file. Let me know which provider you prefer.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
