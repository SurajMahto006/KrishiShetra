const express = require('express');
const router = express.Router();
const http = require('http');
const https = require('https');
const { URL } = require('url');

const getAiBaseUrl = () => {
  return (process.env.AI_QUALITY_API_URL || 'http://localhost:8001').replace(/\/+$/, '');
};

/**
 * Forward POST /api/quality/analyze to AI service
 */
router.post('/analyze', (req, res) => {
  try {
    const aiBase = getAiBaseUrl();
    const targetUrl = new URL(`${aiBase}/api/quality/analyze`);
    const client = targetUrl.protocol === 'https:' ? https : http;

    const headers = {};
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'];
    }
    if (req.headers['content-length']) {
      headers['content-length'] = req.headers['content-length'];
    }
    if (req.headers['authorization']) {
      headers['authorization'] = req.headers['authorization'];
    }

    const options = {
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: targetUrl.pathname + (targetUrl.search || ''),
      method: 'POST',
      headers: headers,
      timeout: 135000
    };

    const proxyReq = client.request(options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        res.setHeader(key, value);
      }
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.warn('[AI Quality Proxy] Error forwarding request to AI service:', err.message);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          status: 'AI_UNAVAILABLE',
          message: 'Photo assessment is temporarily unavailable.'
        });
      }
    });

    proxyReq.on('timeout', () => {
      console.warn('[AI Quality Proxy] Request to AI service timed out.');
      proxyReq.destroy();
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          status: 'AI_UNAVAILABLE',
          message: 'Photo assessment is temporarily unavailable.'
        });
      }
    });

    req.pipe(proxyReq);
  } catch (err) {
    console.error('[AI Quality Proxy] Unexpected error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        status: 'AI_UNAVAILABLE',
        message: 'Photo assessment is temporarily unavailable.'
      });
    }
  }
});

/**
 * Forward GET /api/quality/annotated/:id to AI service
 */
router.get('/annotated/:id', (req, res) => {
  try {
    const aiBase = getAiBaseUrl();
    const imageId = req.params.id;
    const targetUrl = new URL(`${aiBase}/api/quality/annotated/${encodeURIComponent(imageId)}`);
    const client = targetUrl.protocol === 'https:' ? https : http;

    const options = {
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: targetUrl.pathname,
      method: 'GET',
      timeout: 15000
    };

    const proxyReq = client.request(options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        res.setHeader(key, value);
      }
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.warn('[AI Quality Proxy] Error fetching annotated image:', err.message);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          message: 'Annotated image unavailable.'
        });
      }
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: 'Request timed out.'
        });
      }
    });

    proxyReq.end();
  } catch (err) {
    console.error('[AI Quality Proxy] Unexpected error on image fetch:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve annotated image.'
      });
    }
  }
});

/**
 * Forward GET /api/quality/health to AI service
 */
router.get('/health', (req, res) => {
  try {
    const aiBase = getAiBaseUrl();
    const targetUrl = new URL(`${aiBase}/api/quality/health`);
    const client = targetUrl.protocol === 'https:' ? https : http;

    const options = {
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: targetUrl.pathname,
      method: 'GET',
      timeout: 5000
    };

    const proxyReq = client.request(options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        res.setHeader(key, value);
      }
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          status: 'AI_UNAVAILABLE',
          message: 'AI quality service is currently unreachable.'
        });
      }
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          status: 'AI_UNAVAILABLE',
          message: 'AI quality service health check timed out.'
        });
      }
    });

    proxyReq.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        status: 'AI_UNAVAILABLE',
        message: 'Failed to check AI health.'
      });
    }
  }
});

module.exports = router;
