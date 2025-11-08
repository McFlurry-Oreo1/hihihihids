const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 4000;

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Override CloudMoon app.js with modified version
app.get('/run-site/js/app.js', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const modifiedAppJs = fs.readFileSync(path.join(__dirname, 'raw-app.js'), 'utf8');
    res.setHeader('Content-Type', 'application/javascript');
    res.send(modifiedAppJs);
  } catch (error) {
    console.error('Error serving modified app.js:', error);
    res.status(500).send('// Error loading modified app.js');
  }
});

// /hehe route - iframe the current thing minus the /hehe
app.use('/hehe', (req, res) => {
  // Get the full URL and remove /hehe from the path
  const originalPath = req.path || '/';
  const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';
  const targetUrl = `${req.protocol}://${req.get('host')}${originalPath}${queryString ? '?' + queryString : ''}`;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iframe View</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        iframe {
            width: 100%;
            height: 100vh;
            border: none;
        }
    </style>
</head>
<body>
    <iframe src="${targetUrl}" allowfullscreen onload="modifyIframeContent()"></iframe>
    <script>
        function modifyIframeContent() {
            try {
                const iframe = document.querySelector('iframe');
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                // Wait a bit for the iframe content to fully load
                setTimeout(() => {
                    const targetElement = iframeDoc.querySelector("body > div > main > div > div:nth-child(2) > div > main > div:nth-child(3) > h3");
                    if (targetElement) {
                        targetElement.textContent = 'fo';
                    }
                }, 1000);
            } catch (error) {
                console.log('Cannot modify iframe content due to CORS restrictions:', error);
            }
        }
    </script>
</body>
</html>`;
  
  res.send(html);
});

// Proxy all requests to cloudmoonapp.pages.dev
app.use('/', createProxyMiddleware({
  target: 'https://cloudmoonapp.pages.dev/',
  changeOrigin: true,
  ws: true,
  followRedirects: true,
  onProxyReq: (proxyReq, req, res) => {
    // Preserve original headers for OAuth
    console.log(`[Proxy] ${req.method} ${req.url} -> https://cloudmoonapp.pages.dev/${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Allow cookies and credentials - don't modify domain in production
    const setCookieHeaders = proxyRes.headers['set-cookie'];
    if (setCookieHeaders && process.env.NODE_ENV !== 'production') {
      proxyRes.headers['set-cookie'] = setCookieHeaders.map(cookie => {
        return cookie.replace(/Domain=cloudmoonapp\.pages\.dev/gi, `Domain=localhost`);
      });
    }

    // Inject CSS to hide everything except #cloud-game-area on specific page
    if (req.url === '/cloud-games/clash-royale-cloud-online.html' && 
        proxyRes.headers['content-type']?.includes('text/html')) {
      
      const originalWrite = res.write;
      const originalEnd = res.end;
      let body = '';

      // Remove content-length header since we're modifying the response
      delete proxyRes.headers['content-length'];

      res.write = function(chunk) {
        body += chunk.toString();
      };

      res.end = function(chunk) {
        if (chunk) {
          body += chunk.toString();
        }

        // Inject CSS to hide everything except #cloud-game-area
        const styleTag = `
          <style>
            body > *:not(#cloud-game-area) {
              display: none !important;
            }
            #cloud-game-area {
              display: block !important;
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              z-index: 9999 !important;
            }
          </style>
        `;

        // Insert the style tag before </head> or at the beginning of <body>
        if (body.includes('</head>')) {
          body = body.replace('</head>', `${styleTag}</head>`);
        } else if (body.includes('<body')) {
          body = body.replace('<body', `${styleTag}<body`);
        } else {
          body = styleTag + body;
        }

        res.write = originalWrite;
        res.end = originalEnd;
        res.end(body);
      };
    }
  },
  onError: (err, req, res) => {
    console.error('[Proxy Error]', err);
    res.status(500).json({ error: 'Proxy error occurred' });
  },
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Proxying all requests to https://cloudmoonapp.pages.dev`);
});
