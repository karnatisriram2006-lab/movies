import { defineConfig, loadEnv } from 'vite'
import process from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'tmdb-local-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            // Use /tmdb-proxy to avoid conflict with the static api/ directory
            if (!req.url.startsWith('/tmdb-proxy')) return next();
            try {
              const urlObj = new URL(req.url, `http://localhost`);
              const apiPath = urlObj.searchParams.get('path');
              if (!apiPath) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing path parameter' }));
                return;
              }
              const apiKey = env.TMDB_API_KEY;
              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'TMDB_API_KEY is not configured. Add it to the local .env file.' }));
                return;
              }
              const tmdbUrl = new URL(`https://api.themoviedb.org/3${apiPath}`);
              tmdbUrl.searchParams.set('api_key', apiKey);
              urlObj.searchParams.forEach((value, key) => {
                if (key !== 'path') tmdbUrl.searchParams.set(key, value);
              });

              const response = await fetch(tmdbUrl.toString());
              const data = await response.json();
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.statusCode = response.status;
              res.end(JSON.stringify(data));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        }
      }
    ],
  }
})
