// Servidor estático del build de Vite (dist/) con fallback SPA.
const http = require('http')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, 'dist')
const PORT = Number(process.env.PORT || 8080)

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.map': 'application/json', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
}

function send(res, file, code = 200) {
  fs.readFile(file, (e, data) => {
    if (e) { res.writeHead(404); return res.end('not found') }
    res.writeHead(code, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' })
    res.end(data)
  })
}

http.createServer((req, res) => {
  const p = decodeURIComponent((req.url || '/').split('?')[0])
  const f = path.join(ROOT, p)
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden') }
  fs.stat(f, (e, st) => {
    if (!e && st.isFile()) return send(res, f)
    send(res, path.join(ROOT, 'index.html'))
  })
}).listen(PORT, '0.0.0.0', () => console.log('static SPA dist/ en :' + PORT))
