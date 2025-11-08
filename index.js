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

// Serve icon.png for favicon requests
app.get('/images/favicon.png', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const iconPath = path.join(__dirname, 'icon.png');
    if (fs.existsSync(iconPath)) {
      res.setHeader('Content-Type', 'image/png');
      res.sendFile(iconPath);
    } else {
      res.status(404).send('Icon not found');
    }
  } catch (error) {
    console.error('Error serving icon:', error);
    res.status(500).send('Error loading icon');
  }
});

// /hehe route - iframe the current thing minus the /hehe
app.use('/hehe', (req, res) => {
  // Get the full URL and remove /hehe from the path
  const originalPath = req.path || '/';
  const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';
  // Force HTTPS to avoid mixed content issues
  const protocol = 'https';
  const targetUrl = `${protocol}://${req.get('host')}${originalPath}${queryString ? '?' + queryString : ''}`;
  
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
            height: calc(100vh - 60px);
            border: none;
        }
        #game-time-display {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Arial', sans-serif;
            font-size: 18px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        #time-left {
            margin-left: 10px;
            color: #ffeb3b;
        }
        .loading {
            animation: pulse 1.5s ease-in-out infinite alternate;
        }
        @keyframes pulse {
            from { opacity: 0.6; }
            to { opacity: 1; }
        }
    </style>
</head>
<body>
    <div id="game-time-display">
        <span>Game Time Left:</span>
        <span id="time-left" class="loading">Loading...</span>
    </div>
    <iframe src="${targetUrl}" allowfullscreen onload="modifyIframeContent()"></iframe>
    <script>
        let currentToken = null;
        
        // Extract token from URL parameters
        function extractToken() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('token');
        }
        
        // Fetch game time left from API
        async function fetchGameTimeLeft() {
            try {
                if (!currentToken) {
                    currentToken = extractToken();
                    if (!currentToken) {
                        document.getElementById('time-left').textContent = 'No token found';
                        return;
                    }
                }
                
                const response = await fetch("https://api.prod.cloudmoonapp.com/phone/list?device_type=web&query_uuid=" + generateUUID() + "&device_id=f4af5b98-8ff4-4e67-98ff-774ac964ca03", {
                    headers: {
                        "accept": "*/*",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "content-type": "application/json",
                        "pragma": "no-cache",
                        "x-user-language": "en",
                        "x-user-locale": "US",
                        "x-user-token": currentToken,
                        "Referer": "https://cloud.mo.google-analytics.worldplus-intl.org/"
                    },
                    method: "GET"
                });
                
                const data = await response.json();
                
                if (data.code === 0 && data.data && data.data.list && data.data.list.length > 0) {
                    const timeLeft = data.data.list[0].time_left;
                    const timeLeftSec = data.data.list[0].time_left_sec;
                    
                    document.getElementById('time-left').textContent = timeLeft;
                    document.getElementById('time-left').classList.remove('loading');
                    
                    // Update countdown every second
                    updateCountdown(timeLeftSec);
                } else {
                    document.getElementById('time-left').textContent = 'No active session';
                    document.getElementById('time-left').classList.remove('loading');
                }
            } catch (error) {
                console.error('Error fetching game time:', error);
                document.getElementById('time-left').textContent = 'Error loading time';
                document.getElementById('time-left').classList.remove('loading');
            }
        }
        
        // Generate UUID for API request
        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        
        // Update countdown timer
        function updateCountdown(initialSeconds) {
            let seconds = initialSeconds;
            
            const countdownInterval = setInterval(() => {
                if (seconds <= 0) {
                    clearInterval(countdownInterval);
                    document.getElementById('time-left').textContent = 'Session expired';
                    return;
                }
                
                seconds--;
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;
                
                const timeString = hours > 0 ? 
                    \`\${hours}H \${minutes}M \${secs}S\` : 
                    \`\${minutes}M \${secs}S\`;
                
                document.getElementById('time-left').textContent = timeString;
            }, 1000);
        }
        
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
        
        // Initialize game time fetching
        fetchGameTimeLeft();
        
        // Refresh game time every 30 seconds
        setInterval(fetchGameTimeLeft, 30000);
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
