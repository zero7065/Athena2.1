/*
 * AcademiaIQ — Education RSS Widget
 *
 * Fetches curated education RSS feeds, parses them client-side,
 * and displays headlines with links. Falls back to cached/offline data.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Rss, ExternalLink, RefreshCw, Calendar, Clock, Globe, Filter, BookOpen } from 'lucide-react';
import { EDU_RSS_FEEDS, EduRssFeed } from '../lib/edu-seeds';
import { cn } from '../lib/utils';
import { loadData, saveData } from '../lib/storage';

interface RssItem {
  id: string;
  feedTitle: string;
  category: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

const CACHE_KEY = 'rss';
const CACHE_TTL = 30 * 60 * 1000; // 30 min

export default function EduRSS() {
  const [feedId, setFeedId] = useState<string>(EDU_RSS_FEEDS[0].id);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [items, setItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const [customFeed, setCustomFeed] = useState('');

  const categories = useMemo(() => {
    return ['all', ...new Set(EDU_RSS_FEEDS.map(f => f.category))];
  }, []);

  const groupedFeeds = useMemo(() => {
    return categoryFilter === 'all' ? EDU_RSS_FEEDS : EDU_RSS_FEEDS.filter(f => f.category === categoryFilter);
  }, [categoryFilter]);

  // Keep selected feed valid under current category filter
  useEffect(() => {
    const valid = groupedFeeds.some(f => f.id === feedId);
    if (!valid && groupedFeeds.length > 0) setFeedId(groupedFeeds[0].id);
  }, [categoryFilter, groupedFeeds]);

  const fetchFeed = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      // Use RSS-to-JSON proxy for browser-based fetching
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=&count=20`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (data.status !== 'ok') throw new Error(data.message || 'Feed fetch failed');
      const mapped: RssItem[] = (data.items || []).slice(0, 20).map((item: any) => ({
        id: item.guid || item.link,
        feedTitle: data.feed?.title || '',
        category: data.feed?.category || 'Education',
        title: item.title || 'Untitled',
        link: item.link || '',
        description: stripHtml(item.description || item.content || ''),
        pubDate: item.pubDate || '',
      }));
      setItems(mapped);
      saveData(CACHE_KEY, { feedUrl: url, items: mapped, fetchedAt: Date.now() });
      setLastFetch(Date.now());
    } catch (e: any) {
      // Fall back to cache if available
      const cached = loadData(CACHE_KEY, null);
      if (cached && cached.items) {
        setItems(cached.items);
        setError('Showing cached data (offline).');
      } else {
        setError('Could not fetch feed. Check connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const feed = EDU_RSS_FEEDS.find(f => f.id === feedId);
    if (feed) fetchFeed(feed.url);
  }, [feedId]);

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const refresh = () => {
    const feed = EDU_RSS_FEEDS.find(f => f.id === feedId);
    if (feed) fetchFeed(feed.url);
  };

  const activeFeed = EDU_RSS_FEEDS.find(f => f.id === feedId);

  return (
    <div className="space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Rss size={24} className="text-[#00843D]" /> Education RSS
          </h2>
          <p className="text-sm text-slate-500">Curated education news and industry updates.</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all min-h-[44px]"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      {/* Category filter */}
      <div className="glass rounded-3xl p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter size={12} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categories</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[11px] font-bold transition-all',
                categoryFilter === cat
                  ? 'bg-[#00843D] text-white shadow-md shadow-[#00843D]/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-[#00843D]/10 hover:text-[#00843D]'
              )}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed selector */}
      <div className="glass rounded-3xl p-3 sm:p-4">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Select Feed ({groupedFeeds.length})</label>
        <select
          value={feedId}
          onChange={e => setFeedId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-sm"
        >
          {['all', ...categories.slice(1)].map(cat => (
            cat === 'all'
              ? <optgroup key="all" label="All Feeds">
                  {EDU_RSS_FEEDS.map(f => (
                    <option key={f.id} value={f.id}>{f.title} — {f.category}</option>
                  ))}
                </optgroup>
              : <optgroup key={cat} label={cat}>
                  {EDU_RSS_FEEDS.filter(f => f.category === cat).map(f => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </optgroup>
          ))}
        </select>
        {activeFeed && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">{activeFeed.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00843D]/10 text-[#00843D] font-bold uppercase tracking-wider">{activeFeed.category}</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider">{activeFeed.language}</span>
            </div>
          </div>
        )}
      </div>

      {/* Items list */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <RefreshCw size={32} className="mx-auto mb-3 animate-spin" />
          <p className="text-sm font-medium">Fetching latest headlines...</p>
        </div>
      ) : error ? (
        <div className="glass p-6 text-center rounded-3xl">
          <Globe size={32} className="mx-auto mb-3 text-amber-400" />
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass p-6 text-center rounded-3xl">
          <Rss size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">No items in this feed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map(item => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass p-4 sm:p-5 rounded-[24px] flex flex-col gap-2 min-h-[200px] hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Rss size={14} className="text-[#00843D]" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.feedTitle}</span>
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-[#00843D] transition-colors line-clamp-3">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-auto">
                {item.pubDate && (
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {new Date(item.pubDate).toLocaleDateString()}
                  </span>
                )}
                <ExternalLink size={12} className="ml-auto" />
              </div>
            </a>
          ))}
        </div>
      )}
      {lastFetch && !error && (
        <p className="text-center text-[10px] text-slate-400 mt-2">
          Last fetched {new Date(lastFetch).toLocaleTimeString()} · Items: {items.length}
        </p>
      )}
    </div>
  );
}