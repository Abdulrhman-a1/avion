import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { forwardRatingToSheets } from './lib/forwardRatingToSheets.js'
import { handleCommunityRequest } from './lib/handleCommunityRequest.js'

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

function sendJson(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
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
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }

        const sheetsUrl = env.GOOGLE_SHEETS_URL || env.VITE_GOOGLE_SHEETS_URL
        if (!sheetsUrl) {
          sendJson(res, 503, {
            error:
              'Add GOOGLE_SHEETS_URL or VITE_GOOGLE_SHEETS_URL to .env and restart the dev server.',
          })
          return
        }

        try {
          const payload = await readRequestBody(req)
          const result = await forwardRatingToSheets(sheetsUrl, payload)
          if (!result.ok) {
            sendJson(res, 502, { error: result.error })
            return
          }
          sendJson(res, 200, result.data)
        } catch {
          sendJson(res, 500, { error: 'Could not process rating request.' })
        }
      })
    },
  }
}

function uploadProxy() {
  return {
    name: 'upload-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split('?')[0] !== '/api/upload') return next()
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return }
        if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return }

        try {
          const body = await readRequestBody(req)
          const { base64, filename, mimetype } = body
          if (!base64 || !filename) { sendJson(res, 400, { error: 'Missing base64 or filename' }); return }

          const buffer = Buffer.from(base64, 'base64')
          const blob = new Blob([buffer], { type: mimetype || 'application/octet-stream' })

          const form = new FormData()
          form.append('reqtype', 'fileupload')
          form.append('fileToUpload', blob, filename)

          const catRes = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
          const url = (await catRes.text()).trim()

          if (!url.startsWith('https://')) {
            sendJson(res, 502, { error: 'Unexpected response from file host: ' + url })
            return
          }
          sendJson(res, 200, { url })
        } catch (err) {
          sendJson(res, 500, { error: err.message || 'Upload failed' })
        }
      })
    },
  }
}

function communityApiProxy(env) {
  return {
    name: 'community-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const [path, search = ''] = (req.url || '').split('?')
        if (path !== '/api/community') return next()

        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        const params = new URLSearchParams(search)
        const query = Object.fromEntries(params.entries())
        const action = query.action || 'health'

        try {
          let body = null
          if (req.method === 'POST') {
            body = await readRequestBody(req)
          }

          const resolvedAction = body?.action || action
          const adminPassword = env.ADMIN_PASSWORD || env.VITE_ADMIN_PASSWORD
          if (adminPassword) process.env.ADMIN_PASSWORD = adminPassword
          if (env.GOOGLE_COMMUNITY_SHEETS_URL) {
            process.env.GOOGLE_COMMUNITY_SHEETS_URL = env.GOOGLE_COMMUNITY_SHEETS_URL
          }
          if (env.VITE_GOOGLE_COMMUNITY_SHEETS_URL) {
            process.env.VITE_GOOGLE_COMMUNITY_SHEETS_URL = env.VITE_GOOGLE_COMMUNITY_SHEETS_URL
          }

          const adminToken =
            req.headers['x-admin-token'] ||
            body?.adminToken ||
            query.adminToken ||
            ''

          const result = await handleCommunityRequest({
            method: req.method,
            action: resolvedAction,
            query,
            body,
            adminToken,
            env,
          })

          if (!result.ok) {
            sendJson(res, result.status || 502, {
              success: false,
              error: result.error,
            })
            return
          }
          sendJson(res, 200, result.data)
        } catch {
          sendJson(res, 500, { error: 'Could not process community request.' })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), ratingApiProxy(env), communityApiProxy(env), uploadProxy()],
    test: {
      environment: 'node',
    },
  }
})
