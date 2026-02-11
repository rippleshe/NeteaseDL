import express from 'express';
import axios from 'axios';
import { NeteaseProvider } from '../services/netease.js';

const router = express.Router();
const netease = new NeteaseProvider();

// POST /api/music/parse
router.post('/parse', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }

  try {
    const data = await netease.parse(url);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Parse error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to parse music info' });
  }
});

// POST /api/music/download
router.post('/download', async (req, res) => {
  const { id, quality } = req.body;
  
  if (!id) {
    return res.status(400).json({ success: false, error: 'ID is required' });
  }

  try {
    const data = await netease.getDownloadUrl(id, quality);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Download info error:', error);
    const msg = error.message || 'Failed to get download URL';
    if (msg.includes('Copyright') || msg.includes('VIP')) {
        return res.status(403).json({ success: false, error: msg });
    }
    res.status(500).json({ success: false, error: msg });
  }
});

// GET /api/music/proxy
router.get('/proxy', async (req, res) => {
  const url = req.query.url as string;

  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://music.163.com/'
      },
      timeout: 30000
    });

    const contentType = response.headers['content-type'];
    const contentLength = response.headers['content-length'];
    
    if (contentType) res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Failed to proxy file');
  }
});

export default router;
