/*
 * AcademiaIQ — Education RSS Widget
 *
 * Fetches curated education RSS feeds, parses them client-side,
 * and displays headlines with links. Falls back to cached/offline data.
 */

import { useState, useEffect, useMemo } from 'react';
import { Rss, ExternalLink, RefreshCw, Clock, Globe, Filter } from 'lucide-react';
import { EDU_RSS_FEEDS } from '../lib/edu-seeds';
import { cn } from '../lib/utils';
import { saveData } from '../lib/storage';

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

/**
 * Curated evergreen fallback content.
 * Live feeds depend on third-party proxies (rss2json / serverless) which are
 * frequently rate-limited or blocked. This guarantees the RSS section is
 * always useful instead of showing an empty state.
 */
type FallbackArticle = { title: string; link: string; description: string; daysAgo: number };

const FALLBACK_BY_CATEGORY: Record<string, FallbackArticle[]> = {
  'Higher Education': [
    { title: 'Inside Higher Ed — How universities are redesigning student support', link: 'https://www.insidehighered.com/', description: 'Inside Higher Ed covers admissions, finance, technology and student success across higher education.', daysAgo: 1 },
    { title: 'Chronicle of Higher Education — Teaching & learning trends', link: 'https://www.chronicle.com/', description: 'Independent news and analysis on colleges and universities worldwide.', daysAgo: 2 },
    { title: 'EDUCAUSE Review — Digital transformation on campus', link: 'https://www.educause.edu/', description: 'IT leadership and strategy shaping the modern university.', daysAgo: 3 },
    { title: 'Higher Ed Dive — Policy and operations briefing', link: 'https://www.highereddive.com/', description: 'Daily news and analysis for higher education leaders.', daysAgo: 4 },
  ],
  'IT in Education': [
    { title: 'Campus Technology — Classroom tech that works', link: 'https://campustechnology.com/', description: 'Practical technology strategy for campus IT teams.', daysAgo: 1 },
    { title: 'EDUCAUSE Review — Learning analytics in practice', link: 'https://www.educause.edu/', description: 'Turning student data into better learning outcomes.', daysAgo: 3 },
    { title: 'EdTech Magazine — Infrastructure & security', link: 'https://edtechmagazine.com/', description: 'Technology decisions for higher education institutions.', daysAgo: 5 },
  ],
  'World Universities': [
    { title: 'Times Higher Education — Global university rankings', link: 'https://www.timeshighereducation.com/', description: 'Rankings, sector news and analysis from around the world.', daysAgo: 1 },
    { title: 'University World News — International higher education', link: 'https://www.universityworldnews.com/', description: 'Global intelligence on universities and policy.', daysAgo: 2 },
    { title: 'QS World University Rankings — Methodology updates', link: 'https://www.topuniversities.com/', description: 'How global rankings are measured and what they mean.', daysAgo: 6 },
  ],
  'Global Policy': [
    { title: 'UNESCO — Education for sustainable development', link: 'https://www.unesco.org/en/education', description: 'Global education policy, access and quality initiatives.', daysAgo: 2 },
    { title: 'World Bank Education — Learning poverty brief', link: 'https://www.worldbank.org/en/topic/education', description: 'Data and policy on global learning outcomes.', daysAgo: 4 },
    { title: 'OECD Education — Skills outlook', link: 'https://www.oecd.org/education/', description: 'International comparisons of education systems.', daysAgo: 7 },
  ],
  'EdTech & Tools': [
    { title: 'eLearning Industry — Tools for active learning', link: 'https://elearningindustry.com/', description: 'Practical edtech tools and instructional design ideas.', daysAgo: 1 },
    { title: 'EdTech Magazine — AI in the classroom', link: 'https://edtechmagazine.com/', description: 'How institutions are adopting AI responsibly.', daysAgo: 3 },
    { title: 'Campus Technology — Assessment tools roundup', link: 'https://campustechnology.com/', description: 'New platforms for feedback and assessment.', daysAgo: 5 },
  ],
  'Teaching & Learning': [
    { title: 'Edutopia — Evidence-based teaching strategies', link: 'https://www.edutopia.org/', description: 'Classroom-tested practices that improve learning.', daysAgo: 1 },
    { title: 'TeachThought — Rethinking assessment', link: 'https://www.teachthought.com/', description: 'Innovation in curriculum, instruction and assessment.', daysAgo: 2 },
    { title: 'Faculty Focus — Active learning in large classes', link: 'https://www.facultyfocus.com/', description: 'Practical advice for college faculty.', daysAgo: 3 },
    { title: 'TED-Ed — Lessons worth sharing', link: 'https://ed.ted.com/', description: 'Short, animated lessons across every subject.', daysAgo: 4 },
  ],
  'Learning Science': [
    { title: 'The Learning Scientists — Six strategies for effective learning', link: 'https://www.learningscientists.org/', description: 'Research-backed study techniques: spacing, retrieval, interleaving.', daysAgo: 1 },
    { title: 'MindShift — How memory works', link: 'https://www.kqed.org/mindshift', description: 'The science of learning and how to apply it.', daysAgo: 3 },
    { title: 'ScienceDaily — Educational psychology research', link: 'https://www.sciencedaily.com/news/mind_brain/educational_psychology/', description: 'New findings in learning and cognition.', daysAgo: 5 },
  ],
  'K-12 & Policy': [
    { title: 'Education Week — Policy and practice', link: 'https://www.edweek.org/', description: 'K-12 news, policy and classroom practice.', daysAgo: 1 },
    { title: 'The Hechinger Report — Inequality and innovation', link: 'https://hechingerreport.org/', description: 'In-depth journalism on education equity.', daysAgo: 2 },
    { title: 'eSchool News — Edtech for schools', link: 'https://www.eschoolnews.com/', description: 'Technology insights for K-12 educators.', daysAgo: 4 },
  ],
  'Open & Online Learning': [
    { title: 'MIT OpenCourseWare — Free course materials', link: 'https://ocw.mit.edu/', description: 'Lecture notes, exams and videos from MIT courses.', daysAgo: 2 },
    { title: 'Khan Academy — Free world-class learning', link: 'https://www.khanacademy.org/', description: 'Practice exercises and instructional videos.', daysAgo: 3 },
    { title: 'Open Culture — Free courses and ebooks', link: 'https://www.openculture.com/', description: 'Curated free cultural and educational media.', daysAgo: 5 },
    { title: 'Coursera Blog — Skills for the future of work', link: 'https://blog.coursera.org/', description: 'Insights on online learning and credentials.', daysAgo: 6 },
  ],
};

function fallbackFor(feedId: string, category: string, feedTitle: string): RssItem[] {
  const list = FALLBACK_BY_CATEGORY[category] || FALLBACK_BY_CATEGORY['Higher Education'];
  const now = Date.now();
  return list.map((a, i) => ({
    id: `${feedId}-fallback-${i}`,
    feedTitle,
    category,
    title: a.title,
    link: a.link,
    description: a.description,
    pubDate: new Date(now - a.daysAgo * 86400000).toISOString(),
  }));
}

function mapItems(rawItems: any[], feedTitle: string, category: string): RssItem[] {
  return rawItems.map((item: any, i: number) => ({
    id: item.id || item.guid || item.link || `${feedTitle}-${i}`,
    feedTitle,
    category,
    title: item.title || 'Untitled',
    link: item.link || '',
    description: stripHtml(item.description || item.content || ''),
    pubDate: item.pubDate || item.isoDate || '',
  }));
}

function stripHtml(html: string): string {
  if (!html) return '';
  try {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
  } catch {
    return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

export default function EduRSS() {
  const [feedId, setFeedId] = useState<string>(EDU_RSS_FEEDS[0].id);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [items, setItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);

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

  const fetchFeed = async (feed: { id: string; url: string; title: string; category: string }) => {
    setLoading(true);
    setError(null);

    const sources: Array<() => Promise<RssItem[]>> = [
      // 1. Own serverless proxy (Vercel /api/rss) — most reliable, no key
      async () => {
        const res = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`);
        if (!res.ok) throw new Error('proxy');
        const data = await res.json();
        const raw = Array.isArray(data) ? data : (data.items || []);
        if (!raw.length) throw new Error('empty');
        return mapItems(raw, feed.title, feed.category);
      },
      // 2. Public RSS-to-JSON proxy (rate-limited, no key)
      async () => {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=20`);
        if (!res.ok) throw new Error('rss2json');
        const data = await res.json();
        if (data.status !== 'ok' || !Array.isArray(data.items)) throw new Error('rss2json-status');
        return mapItems(data.items, feed.title, feed.category);
      },
    ];

    try {
      let result: RssItem[] | null = null;
      for (const load of sources) {
        try {
          const items = await load();
          if (items && items.length) { result = items; break; }
        } catch { /* try next source */ }
      }

      if (result) {
        setItems(result);
        saveData(CACHE_KEY, { feedId: feed.id, items: result, fetchedAt: Date.now() });
        setLastFetch(Date.now());
      } else {
        // Guaranteed content: curated offline articles for this category
        const fallback = fallbackFor(feed.id, feed.category, feed.title);
        setItems(fallback);
        setLastFetch(Date.now());
        setError('Live feed unavailable — showing curated highlights.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const feed = EDU_RSS_FEEDS.find(f => f.id === feedId);
    if (feed) fetchFeed(feed);
  }, [feedId]);

  const refresh = () => {
    const feed = EDU_RSS_FEEDS.find(f => f.id === feedId);
    if (feed) fetchFeed(feed);
  };

  const activeFeed = EDU_RSS_FEEDS.find(f => f.id === feedId);

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 max-w-5xl mx-auto h-full overflow-y-auto">
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
      {error && items.length > 0 && (
        <div className="glass rounded-2xl px-4 py-2.5 flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
          <Globe size={14} className="shrink-0" /> {error}
        </div>
      )}
      {loading && items.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <RefreshCw size={32} className="mx-auto mb-3 animate-spin" />
          <p className="text-sm font-medium">Fetching latest headlines...</p>
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
              className="glass p-4 sm:p-5 rounded-[24px] flex flex-col gap-2 min-h-[200px] hover:shadow-xl hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Rss size={14} className="text-[#00843D]" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-[#00843D] transition-colors line-clamp-3">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
              )}
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