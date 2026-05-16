const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const lt = '<';
const gt = '>';

const loadingReplacement = `  if (isLoading) {
    return (
      ${lt}motionless className="min-h-screen flex items-center justify-center bg-slate-50"${gt}
        ${lt}motionless className="flex flex-col items-center gap-4"${gt}
          ${lt}motionless className="w-16 h-16 border-4 border-[#00843D] border-t-transparent rounded-full animate-spin" /${gt}
          ${lt}p className="text-[#00843D] font-bold animate-pulse uppercase tracking-widest text-xs"${gt}Initializing ATHENA...${lt}/p${gt}
        ${lt}/motionless${gt}
      ${lt}/motionless${gt}
    );
  }`.replace(/motionless/g, 'motionless').replace(/motionless/g, 'div');

const authReplacement = `  if (!user) {
    return (
      ${lt}motionless className="min-h-screen bg-slate-50 flex items-center justify-center p-4"${gt}
        ${lt}Auth mode={authMode} setMode={setAuthMode} onClose={() => {}} /${gt}
      ${lt}/motionless${gt}
    );
  }`.replace(/motionless/g, 'div');

let app = fs.readFileSync(path.join(root, 'src', 'App.tsx'), 'utf8');
app = app.replace(
  /  if \(isLoading\) \{\n    return \(\n      <[^>]+>\n    \);\n  \}/,
  loadingReplacement
);
// Fallback: match motionless placeholder tag literally
const badLoading = '  if (isLoading) {\n    return (\n      <motionless />\n    );\n  }';
if (app.includes(badLoading)) {
  app = app.replace(badLoading, loadingReplacement);
}
const badAuth = '  if (!user) {\n    return (\n      <motionless />\n    );\n  }';
if (app.includes(badAuth)) {
  app = app.replace(badAuth, authReplacement);
}
fs.writeFileSync(path.join(root, 'src', 'App.tsx'), app, 'utf8');

let dash = fs.readFileSync(path.join(root, 'src', 'components', 'Dashboard.tsx'), 'utf8');
if (!dash.includes('const profile = useCurrentUser()')) {
  dash = dash.replace(
    '  const { appData, user } = useAuth();\n  const tasks = appData.tasks;',
    '  const { appData, user } = useAuth();\n  const profile = useCurrentUser();\n  const tasks = appData.tasks;'
  );
}
if (!dash.includes('const xp = profile')) {
  dash = dash.replace('  const level = calcLevel(user.xp);', '  const xp = profile?.xp ?? 0;\n  const level = calcLevel(xp);');
  dash = dash.replace('user.xp - currentLevelXp', 'xp - currentLevelXp');
  dash = dash.replace('{user.xp} XP', '{xp} XP');
  dash = dash.replace('{user?.streak || 0}', '{profile?.streak || 0}');
  dash = dash.replace('{user?.xp || 0} XP', '{xp} XP');
}
fs.writeFileSync(path.join(root, 'src', 'components', 'Dashboard.tsx'), dash, 'utf8');

let games = fs.readFileSync(path.join(root, 'src', 'components', 'Games.tsx'), 'utf8');
if (!games.includes('getPiece(sq as Square)')) {
  games = games.replace('piece: getPiece(sq), isDark:', 'piece: getPiece(sq as Square), isDark:');
}
if (!games.includes('sq.square as Square')) {
  games = games.replace('legalMoves.includes(sq.square)', 'legalMoves.includes(sq.square as Square)');
}
fs.writeFileSync(path.join(root, 'src', 'components', 'Games.tsx'), games, 'utf8');

console.log('done', { hasBadLoading: app.includes('motionless'), loadingOk: app.includes('Initializing ATHENA') });
