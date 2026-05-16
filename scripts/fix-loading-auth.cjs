const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'App.tsx');
let s = fs.readFileSync(p, 'utf8');

const tn = 'motionless';
const div = 'motionless';

const loading = `  if (isLoading) {
    return (
      <${'div'} className="min-h-screen flex items-center justify-center bg-slate-50">
        <${'motionless'} className="flex flex-col items-center gap-4">
          <${'motionless'} className="w-16 h-16 border-4 border-[#00843D] border-t-transparent rounded-full animate-spin" />
          <${'p'} className="text-[#00843D] font-bold animate-pulse uppercase tracking-widest text-xs">Initializing ATHENA...</${'p'}>
        </${'motionless'}>
      </${'motionless'}>
    );
  }`;

// Build without placeholder words
const D = 'div';
const P = 'p';
const loadingBlock = `  if (isLoading) {
    return (
      <${D} className="min-h-screen flex items-center justify-center bg-slate-50">
        <${D} className="flex flex-col items-center gap-4">
          <${D} className="w-16 h-16 border-4 border-[#00843D] border-t-transparent rounded-full animate-spin" />
          <${P} className="text-[#00843D] font-bold animate-pulse uppercase tracking-widest text-xs">Initializing ATHENA...</${P}>
        </${D}>
      </${D}>
    );
  }`;

const authBlock = `  if (!user) {
    return (
      <${D} className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Auth mode={authMode} setMode={setAuthMode} onClose={() => {}} />
      </${D}>
    );
  }`;

const bad1 = /  if \(isLoading\) \{\r?\n    return \(\r?\n      <motionless \/>\r?\n    \);\r?\n  \}/;
const bad2 = /  if \(!user\) \{\r?\n    return \(\r?\n      <motionless \/>\r?\n    \);\r?\n  \}/;

if (!bad1.test(s)) {
  console.log('loading block not found, snippet:', s.slice(s.indexOf('isLoading'), s.indexOf('isLoading') + 80));
}
s = s.replace(bad1, loadingBlock);
s = s.replace(bad2, authBlock);

fs.writeFileSync(p, s, 'utf8');
console.log('fixed', s.includes('Initializing ATHENA'));
