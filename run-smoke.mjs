import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const distDir = process.argv[2];
const assets = fs.readdirSync(path.join(distDir, 'assets'));
const jsFile = assets.find((f) => f.startsWith('index-') && f.endsWith('.js'));

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.localStorage = dom.window.localStorage;
globalThis.sessionStorage = dom.window.sessionStorage;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.MutationObserver = dom.window.MutationObserver;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame?.bind(dom.window) ?? ((cb) => setTimeout(cb, 0));
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame?.bind(dom.window) ?? clearTimeout;
globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({}) });
globalThis.IS_REACT_ACT_ENVIRONMENT = false;

// Polyfill browser APIs the app relies on (jsdom lacks these)
dom.window.matchMedia = dom.window.matchMedia || ((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() { return false; },
}));
globalThis.matchMedia = dom.window.matchMedia;
dom.window.scrollTo = dom.window.scrollTo || (() => {});
dom.window.Notification = dom.window.Notification || class { static permission = 'denied'; static requestPermission() { return Promise.resolve('denied'); } };
globalThis.Notification = dom.window.Notification;
dom.window.IntersectionObserver = dom.window.IntersectionObserver || class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
};
globalThis.IntersectionObserver = dom.window.IntersectionObserver;

const errors = [];
const origError = console.error;
console.error = (...args) => { errors.push(args.map(String).join(' ')); origError(...args); };

let crashed = false;
try {
  await import(pathToFileURL(path.resolve(distDir, 'assets', jsFile)).href);
  await new Promise((r) => setTimeout(r, 1200));
  const root = dom.window.document.getElementById('root');
  console.log('BUNDLE_EXECUTED_OK');
  console.log('ROOT_HTML_LENGTH=' + root.innerHTML.length);
  console.log('HAS_VISIBLE_TEXT=' + /[A-Za-z]{3,}/.test(root.textContent));
  console.log('SAMPLE_TEXT=' + root.textContent.replace(/\s+/g, ' ').trim().slice(0, 140));
} catch (e) {
  crashed = true;
  console.log('BUNDLE_CRASHED');
  console.log('ERROR=' + e.message);
  console.log('STACK=' + (e.stack || '').split('\n').slice(0, 5).join(' | '));
}

const activityCrash = errors.find((e) => e.includes("setting 'Activity'"));
console.log('ACTIVITY_CRASH=' + (activityCrash ? 'YES' : 'NO'));
process.exit(crashed ? 1 : 0);
