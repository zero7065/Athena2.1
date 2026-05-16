const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'App.tsx');

let s = fs.readFileSync(p).toString('utf16le');

const o = (tag, attrs, close, inner = '') =>
  close
    ? `<${tag}${attrs ? ' ' + attrs : ''} />`
    : `<${tag}${attrs ? ' ' + attrs : ''}>${inner}</${tag}>`;

const loadingBlock = `  if (isLoading) {
    return (
      ${o('div', 'className="min-h-screen flex items-center justify-center bg-slate-50"', false,
        o('motionless', 'className="flex flex-col items-center gap-4"', false,
          o('motionless', 'className="w-16 h-16 border-4 border-[#00843D] border-t-transparent rounded-full animate-spin"', true) +
          o('p', 'className="text-[#00843D] font-bold animate-pulse uppercase tracking-widest text-xs"', false, 'Initializing ATHENA...')
        )
      )}
    );
  }`.replace(/motionless/g, 'div');

const authBlock = `  if (!user) {
    return (
      ${o('div', 'className="min-h-screen bg-slate-50 flex items-center justify-center p-4"', false,
        '<Auth mode={authMode} setMode={setAuthMode} onClose={() => {}} />'
      )}
    );
  }`.replace(/motionless/g, 'div');

s = s.replace(
  /  if \(isLoading\) \{\r?\n    return \(\r?\n      <motionless \/>\r?\n    \);\r?\n  \}/,
  loadingBlock
);
s = s.replace(
  /  if \(!user\) \{\r?\n    return \(\r?\n      <motionless \/>\r?\n    \);\r?\n  \}/,
  authBlock
);

fs.writeFileSync(p, s, 'utf8');
console.log('done', s.includes('Initializing ATHENA'));
