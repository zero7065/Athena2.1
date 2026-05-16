const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'src', 'App.tsx');
let s = fs.readFileSync(p, 'utf8');

const loading = `  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <motionless />
        </motionless>
      </motionless>
    );
  }`;

const loadingFixed = `  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#00843D] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#00843D] font-bold animate-pulse uppercase tracking-widest text-xs">Initializing ATHENA...</p>
        </div>
      </div>
    );
  }`;

const auth = `  if (!user) {
    return (
      <motionless />
    );
  }`;

const authFixed = `  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Auth mode={authMode} setMode={setAuthMode} onClose={() => {}} />
      </div>
    );
  }`;

// Replace broken motionless blocks
s = s.replace(
  /  if \(isLoading\) \{\s*return \(\s*<motionless \/>\s*\);\s*\}/,
  loadingFixed
);
s = s.replace(
  /  if \(!user\) \{\s*return \(\s*<motionless \/>\s*\);\s*\}/,
  authFixed
);

fs.writeFileSync(p, s, 'utf8');
console.log('patched loading/auth');
