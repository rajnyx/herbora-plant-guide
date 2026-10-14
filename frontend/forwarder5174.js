import http from 'http';
import net from 'net';

const TARGET_PORT = 5173;
const BACKEND_PORT = 5000;
const PROXY_PORT = 5174;

const server = http.createServer((req, res) => {
  const isApi = req.url && req.url.startsWith('/api');
  const targetPort = isApi ? BACKEND_PORT : TARGET_PORT;

  const options = {
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${targetPort}` }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: `Server on port ${targetPort} is currently connecting...`,
      targetPort 
    }));
  });

  req.pipe(proxyReq, { end: true });
});

// Handle WebSocket upgrades (Vite HMR)
server.on('upgrade', (req, clientSocket, head) => {
  const targetSocket = net.connect(TARGET_PORT, '127.0.0.1', () => {
    targetSocket.write(
      `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n` +
      Object.entries(req.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\r\n') +
      '\r\n\r\n'
    );
    targetSocket.write(head);
    targetSocket.pipe(clientSocket);
    clientSocket.pipe(targetSocket);
  });

  targetSocket.on('error', () => {
    clientSocket.destroy();
  });
  clientSocket.on('error', () => {
    targetSocket.destroy();
  });
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`Port ${PROXY_PORT} forwarder actively mirroring to port ${TARGET_PORT}`);
});
