import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { forwardRatingToSheets } from './lib/forwardRatingToSheets.js'

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function ratingApiProxy(env) {
  return {
    name: 'rating-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path !== '/api/submit-rating') return next()

        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const sheetsUrl = env.GOOGLE_SHEETS_URL || env.VITE_GOOGLE_SHEETS_URL
        if (!sheetsUrl) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error:
                'Add GOOGLE_SHEETS_URL or VITE_GOOGLE_SHEETS_URL to .env and restart the dev server.',
            }),
          )
          return
        }

        try {
          const payload = await readRequestBody(req)
          const result = await forwardRatingToSheets(sheetsUrl, payload)
          res.setHeader('Content-Type', 'application/json')
          if (!result.ok) {
            res.statusCode = 502
            res.end(JSON.stringify({ error: result.error }))
            return
          }
          res.statusCode = 200
          res.end(JSON.stringify(result.data))
        } catch {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Could not process rating request.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), ratingApiProxy(env)],
    test: {
      environment: 'node',
    },
  }
})
