# CDN Configuration for NexusLab
# Use Cloudflare, AWS CloudFront, or DigitalOcean Spaces CDN

## Cloudflare (Recommended for most cases)

1. Create a Cloudflare account and add your domain
2. Go to Caching > Configuration
3. Set Browser Cache TTL to 1 hour
4. Enable Auto Minify for HTML, CSS, JS
5. Add Page Rules:
   - `*/assets/*` - Cache level: Cache Everything, TTL: 1 month
   - `*/images/*` - Cache level: Cache Everything, TTL: 1 week
   - `*/api/*` - Bypass cache

## AWS CloudFront

```json
{
  "CachePolicyConfig": {
    "Name": "NexusLab-Assets",
    "MinTTL": 86400,
    "MaxTTL": 2592000,
    "DefaultTTL": 86400,
    "ParametersInCacheKeyAndForwardedToOrigin": {
      "HeadersConfig": {
        "HeaderBehavior": "Whitelist",
        "Headers": ["Accept", "Accept-Language", "Origin"]
      },
      "QueryStringsConfig": {
        "QueryStrings": ["page", "limit", "category"]
      }
    }
  }
}
```

## DigitalOcean Spaces CDN

1. Create a Space in DigitalOcean
2. Enable CDN and add custom subdomain
3. Configure cache rules for static assets

## Nginx Cache Headers (Alternative)

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

location ~* \.(html|json|api)$ {
    expires -1;
    add_header Cache-Control "no-store";
}
```

## Vite CDN Configuration (frontend-client/vite.config.js)

```javascript
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['lucide-react', '@headlessui/react'],
          'query': ['@tanstack/react-query'],
        }
      }
    }
  }
})
```