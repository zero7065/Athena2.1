/**
 * AcademiaIQ RSS Routes
 * Proxy for education RSS feeds
 */

import express from 'express';
import db from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get RSS feed items (protected)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      // Return default feeds if no URL specified
      const defaultFeeds = [
        { title: 'EdSurge', category: 'Higher Education', url: 'https://www.edsurge.com/rss' },
        { title: 'Inside Higher Ed', category: 'Higher Education', url: 'https://www.insidehighered.com/rss' },
        { title: 'Edutopia', category: 'Teaching & Learning', url: 'https://www.edutopia.org/rss.xml' },
        { title: 'UNESCO Education', category: 'Global Policy', url: 'https://www.unesco.org/en/education/rss' },
        { title: 'eLearning Industry', category: 'EdTech & Tools', url: 'https://elearningindustry.com/feed' },
      ];
      return res.json({ feeds: defaultFeeds });
    }

    // Fetch RSS via rss2json proxy
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=20`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch RSS feed' });
    }

    const data = await response.json();
    const items = (data.items || []).map((item, idx) => ({
      id: `${url}:${idx}`,
      title: item.title || 'Untitled',
      link: item.link || '',
      description: item.description || '',
      pubDate: item.pubDate || '',
      feedTitle: data.feed?.title || 'Unknown Feed',
    }));

    res.json({ items, feed: data.feed || {} });
  } catch (err) {
    console.error('RSS error:', err);
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
});

export default router;
