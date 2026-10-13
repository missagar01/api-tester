import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'po-api-proxy',
        configureServer(server) {
          server.middlewares.use('/api/dispatch-po', (req, res, next) => {
            if (req.method === 'POST') {
              let body = ''
              req.on('data', chunk => { body += chunk })
              req.on('end', async () => {
                const targetUrl = env.VITE_API_URL || 'https://iboss.sagargroup.co/ords/sagardashboard/po/purchaseorders/'
                const apiKey = env.VITE_API_KEY || ''
                const headerName = env.VITE_API_KEY_HEADER || 'x-api-key'

                try {
                  const headers = { 'Content-Type': 'application/json' }
                  if (apiKey) {
                    headers[headerName] = apiKey
                  }

                  const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers,
                    body
                  })

                  const responseData = await response.text()
                  res.statusCode = response.status
                  res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
                  res.end(responseData || JSON.stringify({ message: 'Order submitted successfully', status: response.status }))
                } catch (err) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: err.message }))
                }
              })
              return
            }
            next()
          })
        }
      }
    ],
  }
})
