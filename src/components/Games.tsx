import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Chess } from 'chess.js';
import { Trophy, RotateCcw, CheckCircle2, AlertCircle, ChevronLeft, Brain, Grid3X3, Image as ImageIcon, Gamepad2, Star, Clock, Zap, Share2, Palette, Copy, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { safeGroq } from '../lib/groq';
import CBTExam from './CBTExam';

/* ===== Chess Game ===== */
const PIECE_SET: Record<string, Record<string, { char: string; label: string }>> = {
  standard: {
    wk: { char: '\u2654', label: 'White King' }, wq: { char: '\u2655', label: 'White Queen' },
    wr: { char: '\u2656', label: 'White Rook' }, wb: { char: '\u2657', label: 'White Bishop' },
    wn: { char: '\u2658', label: 'White Knight' }, wp: { char: '\u2659', label: 'White Pawn' },
    bk: { char: '\u265A', label: 'Black King' }, bq: { char: '\u265B', label: 'Black Queen' },
    br: { char: '\u265C', label: 'Black Rook' }, bb: { char: '\u265D', label: 'Black Bishop' },
    bn: { char: '\u265E', label: 'Black Knight' }, bp: { char: '\u265F', label: 'Black Pawn' },
  },
};

const ChessGame: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [playMode, setPlayMode] = useState<'ai' | 'friend'>('ai');
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [boardTheme, setBoardTheme] = useState<'green' | 'blue' | 'brown'>('green');
  const [pieceStyle, setPieceStyle] = useState<'standard'>('standard');
  const { addUserXp, appData, updateAppData } = useAuth();

  const themeColors = {
    green: { dark: 'bg-emerald-700', light: 'bg-emerald-50' },
    blue: { dark: 'bg-blue-700', light: 'bg-blue-50' },
    brown: { dark: 'bg-amber-800', light: 'bg-amber-50' },
  };

  const getPiece = (square: string): { char: string; label: string; color: 'w' | 'b' } | null => {
    const piece = game.get(square);
    if (!piece) return null;
    const key = piece.color + piece.type;
    const p = PIECE_SET[pieceStyle][key];
    return p ? { char: p.char, label: p.label, color: piece.color } : null;
  };

  const board = useMemo(() => {
    const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return rows.map(r => cols.map(c => {
      const sq = c + r;
      return { square: sq, piece: getPiece(sq), isDark: (rows.indexOf(r) + cols.indexOf(c)) % 2 === 1 };
    }));
  }, [game, pieceStyle]);

  const findBestMove = useCallback((g: Chess) => {
    const moves = g.moves({ verbose: true });
    if (moves.length === 0) return null;
    const capVal: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    const pieceVal: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
    let bestMove = moves[0];
    let bestScore = -99999;
    for (const m of moves) {
      const g2 = new Chess(g.fen());
      g2.move(m.san);
      let score = 0;
      if (m.captured) score += capVal[m.captured] || 0;
      if (g2.isCheckmate()) score += 10000;
      if (g2.isCheck()) score += 50;
      if (m.promotion) score += 800;
      const board = g2.board();
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const sq = board[r][c];
        if (!sq) continue;
        const val = pieceVal[sq.type] || 0;
        if (sq.color === 'b') score += val + (sq.type === 'p' ? [0,50,20,10,5,0,-5,0][r] : 0);
        else score -= val + (sq.type === 'p' ? -[0,50,20,10,5,0,-5,0][7-r] : 0);
      }
      if (score > bestScore) { bestScore = score; bestMove = m; }
    }
    return bestMove;
  }, []);

  const makeAMove = useCallback((from: string, to: string) => {
    try {
      const g = new Chess(game.fen());
      const result = g.move({ from, to, promotion: 'q' });
      if (!result) return null;
      setGame(g);
      setSelectedSquare(null);
      setLegalMoves([]);
      if (g.isGameOver()) {
        let msg = '';
        if (g.isCheckmate()) msg = `Checkmate! ${g.turn() === 'w' ? 'Black' : 'White'} wins!`;
        else if (g.isStalemate()) msg = 'Stalemate - Draw!';
        else if (g.isDraw()) msg = 'Draw!';
        else if (g.isThreefoldRepetition()) msg = 'Draw by repetition!';
        else if (g.isInsufficientMaterial()) msg = 'Draw - insufficient material!';
        setGameOver(msg);
        if (g.isCheckmate()) {
          addUserXp(100);
          updateAppData(prev => ({ ...prev, gameScores: { ...prev.gameScores, chess: prev.gameScores.chess + 1 } }));
        }
      }
      return result;
    } catch { return null; }
  }, [game, addUserXp, updateAppData]);

  useEffect(() => {
    if (playMode === 'ai' && game.turn() === 'b' && !game.isGameOver()) {
      const timer = setTimeout(() => {
        try {
          const g = new Chess(game.fen());
          const move = findBestMove(g);
          if (move) makeAMove(move.from, move.to);
          else {
            const legal = game.moves();
            if (legal.length > 0) {
              const parts = legal[Math.floor(Math.random() * legal.length)];
              if (parts.length >= 4) makeAMove(parts.slice(0, 2), parts.slice(2, 4));
            }
          }
        } catch { /* fallback: random legal move */ }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [game, playMode, findBestMove, makeAMove]);
  /* If AI mode and it's black's turn, also try on next idle */
  useEffect(() => {
    if (playMode === 'ai' && game.turn() === 'b' && !game.isGameOver()) {
      const id = requestIdleCallback(() => {
        const legal = game.moves();
        if (legal.length > 0) {
          const parts = legal[Math.floor(Math.random() * legal.length)];
          if (parts.length >= 4) makeAMove(parts.slice(0, 2), parts.slice(2, 4));
        }
      }, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
  }, [game, playMode, makeAMove]);

  const handleSquareClick = useCallback((square: string) => {
    if (game.isGameOver()) return;
    if (playMode === 'ai' && game.turn() === 'b') return;
    const piece = game.get(square);
    if (selectedSquare) {
      if (legalMoves.includes(square)) { makeAMove(selectedSquare, square); return; }
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        setLegalMoves(game.moves({ square, verbose: true }).map(m => m.to));
        return;
      }
      setSelectedSquare(null); setLegalMoves([]); return;
    }
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setLegalMoves(game.moves({ square, verbose: true }).map(m => m.to));
    }
  }, [game, selectedSquare, legalMoves, playMode, makeAMove]);

  const newGame = useCallback(() => {
    setGame(new Chess()); setSelectedSquare(null); setLegalMoves([]); setGameOver(null);
  }, []);

  const shareGame = () => {
    const pgn = game.pgn();
    const fen = game.fen();
    const text = `ATHENA Chess Game\n\nPGN: ${pgn}\n\nFEN: ${fen}\n\nPlayed on ATHENA - PLASU Edition`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      prompt('Copy this game data:', text);
    });
  };

  const colors = themeColors[boardTheme];

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-wrap justify-center gap-2 p-1.5 glass-strong rounded-2xl">
        <button onClick={() => { setPlayMode('ai'); newGame(); }}
          className={cn("px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[44px]", playMode === 'ai' ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-100")}> {'\u{1F916}'} AI</button>
        <button onClick={() => { setPlayMode('friend'); newGame(); }}
          className={cn("px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[44px]", playMode === 'friend' ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-100")}> {'\u{1F465}'} Friend</button>
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 self-center mx-1" />
        {(['green', 'blue', 'brown'] as const).map(t => (
          <button key={t} onClick={() => setBoardTheme(t)}
            className={cn("w-7 h-7 rounded-lg border-2 transition-all", boardTheme === t ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-transparent opacity-60 hover:opacity-100',
              t === 'green' ? 'bg-emerald-600' : t === 'blue' ? 'bg-blue-600' : 'bg-amber-700')} title={`${t} board`} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
        <div className="glass-strong p-2 sm:p-3 rounded-2xl sm:rounded-3xl w-full max-w-[420px] mx-auto">
          <div className="grid grid-cols-8 border-2 border-slate-400/50 dark:border-slate-600/50 rounded-lg overflow-hidden shadow-inner">
            {board.flat().map(sq => {
              const isSelected = selectedSquare === sq.square;
              const isLegal = legalMoves.includes(sq.square);
              return (
                <button key={sq.square} onClick={() => handleSquareClick(sq.square)}
                  className={cn(
                    "aspect-square flex items-center justify-center transition-colors relative select-none",
                    sq.isDark ? colors.dark : colors.light,
                    isSelected && "ring-2 ring-yellow-400 ring-inset z-10",
                    isLegal && "cursor-pointer"
                  )}
                  aria-label={sq.piece ? `${sq.piece.label} on ${sq.square}` : `${sq.square}`}>
                  {sq.piece && (
                    <span className={cn(
                      "select-none drop-shadow-md",
                      "text-[clamp(1.1rem,4.5vw,2.6rem)]",
                      sq.piece.color === 'w' ? 'text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]' : 'text-gray-900 [text-shadow:0_1px_2px_rgba(255,255,255,0.4)]'
                    )}>
                      {sq.piece.char}
                    </span>
                  )}
                  {isLegal && <div className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary/60 z-20 shadow-md" />}
                  {game.isCheck() && selectedSquare && game.get(selectedSquare)?.type === 'k' && (
                    <div className="absolute inset-0 border-2 border-red-500 rounded-sm animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
            <span className="font-bold flex items-center gap-2">
              {game.turn() === 'w' ? '\u26AA' : '\u26AB'}
              {game.turn() === 'w' ? "White's turn" : "Black's turn"}
              {game.turn() === 'b' && playMode === 'ai' && !game.isGameOver() && '\u2728'}
            </span>
            <span>{'\u{1F4DC}'} Move {game.moveNumber()}</span>
          </div>
        </div>

        <div className="glass-strong p-4 sm:p-5 md:p-6 rounded-[24px] sm:rounded-[40px] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{game.turn() === 'w' ? '\u26AA' : '\u26AB'}</span>
              <h3 className="text-sm sm:text-base font-bold">Game Status</h3>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowShare(!showShare)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all min-w-[36px] min-h-[36px] flex items-center justify-center" title="Share game">
                {'\u{1F4E4}'} <Share2 size={14} className="text-slate-400 ml-1" />
              </button>
            </div>
          </div>

          {showShare && (
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{'\u{1F517}'} Share Game</p>
              <button onClick={shareGame} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-emerald-700 transition-all min-h-[44px]">
                {copied ? <>{'\u2705'} Copied!</> : <>{'\u{1F4CB}'} Copy PGN &amp; FEN</>}
              </button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 p-2.5 sm:p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">\u26AA White</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">{game.turn() === 'w' ? '\u25CF Active' : '\u25CB'}</p>
              </div>
              <div className="flex-1 p-2.5 sm:p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">\u26AB Black</p>
                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">{game.turn() === 'b' ? '\u25CF Active' : '\u25CB'}</p>
              </div>
            </div>
              <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{'\u{1F4DC}'} Moves</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">{game.pgn() || 'Game just started ' + '\u{1F3B2}'}</p>
              </div>
          </div>

          {game.isCheck() && !game.isCheckmate() && (
            <div className="p-2.5 rounded-xl bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold flex items-center gap-2 text-xs sm:text-sm">
              {'\u26A0\uFE0F'} Check!
            </div>
          )}

          {gameOver && (
            <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-[#00843D]/10 to-emerald-500/10 backdrop-blur-sm border border-[#00843D]/20 text-center space-y-1">
              <span className="text-3xl">{game.isCheckmate() ? '\u{1F3C6}' : '\u{1F91D}'}</span>
              <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">{gameOver}</p>
              <p className="text-[10px] text-slate-500">+100 XP {'\u2728'}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={newGame} className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm min-h-[44px]">
              {'\u{1F504}'} New Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== Sudoku ===== */
const DIFFICULTIES = { easy: 30, medium: 40, hard: 50 };

const SudokuGame: React.FC = () => {
  const { addUserXp, appData, updateAppData } = useAuth();
  const [board, setBoard] = useState<number[][]>([]);
  const [initial, setInitial] = useState<boolean[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);

  const solveCount = useCallback((brd: number[][], limit: number = 2): number => {
    let count = 0;
    const solve = (b: number[][]): boolean => {
      if (count >= limit) return true;
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
        if (b[r][c] === 0) {
          for (let v = 1; v <= 9; v++) {
            let valid = true;
            for (let i = 0; i < 9; i++) { if (b[r][i] === v || b[i][c] === v) { valid = false; break; } }
            if (valid) {
              const sr = Math.floor(r / 3) * 3, sc = Math.floor(c / 3) * 3;
              for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { if (b[sr + i][sc + j] === v) { valid = false; break; } }
              if (!valid) break;
            }
            if (valid) {
              b[r][c] = v;
              if (solve(b)) return true;
              b[r][c] = 0;
            }
          }
          return false;
        }
      }
      count++;
      return count >= limit;
    };
    const copy = brd.map(row => [...row]);
    solve(copy);
    return count;
  }, []);

  const generatePuzzle = useCallback((diff: 'easy' | 'medium' | 'hard') => {
    const b = Array.from({ length: 9 }, () => Array(9).fill(0));
    const isValid = (brd: number[][], r: number, c: number, v: number) => {
      for (let i = 0; i < 9; i++) { if (brd[r][i] === v || brd[i][c] === v) return false; }
      const sr = Math.floor(r / 3) * 3, sc = Math.floor(c / 3) * 3;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { if (brd[sr + i][sc + j] === v) return false; }
      return true;
    };
    const solve = (brd: number[][]): boolean => {
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
        if (brd[r][c] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const v of nums) { if (isValid(brd, r, c, v)) { brd[r][c] = v; if (solve(brd)) return true; brd[r][c] = 0; } }
          return false;
        }
      }
      return true;
    };
    solve(b);
    const puzzle = b.map(row => [...row]);
    const mask = Array.from({ length: 9 }, () => Array(9).fill(true));
    const cells: [number, number][] = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) cells.push([r, c]);
    cells.sort(() => Math.random() - 0.5);
    let removed = 0;
    const target = DIFFICULTIES[diff] || 40;
    for (const [r, c] of cells) {
      if (removed >= target) break;
      const backup = puzzle[r][c];
      puzzle[r][c] = 0;
      mask[r][c] = false;
      if (solveCount(puzzle) === 1) {
        removed++;
      } else {
        puzzle[r][c] = backup;
        mask[r][c] = true;
      }
    }
    setBoard(puzzle);
    setInitial(mask.map(row => row.map(v => v)));
    setSelected(null);
    setConflicts(new Set());
    setCompleted(false);
  }, [solveCount]);

  useEffect(() => { generatePuzzle(difficulty); }, [difficulty, generatePuzzle]);

  const findConflicts = useCallback((brd: number[][]) => {
    const c = new Set<string>();
    for (let r = 0; r < 9; r++) {
      for (let val = 1; val <= 9; val++) {
        const pos: number[] = [];
        for (let c2 = 0; c2 < 9; c2++) { if (brd[r][c2] === val) pos.push(c2); }
        if (pos.length > 1) pos.forEach(p => c.add(`${r}-${p}`));
      }
    }
    for (let c2 = 0; c2 < 9; c2++) {
      for (let val = 1; val <= 9; val++) {
        const pos: number[] = [];
        for (let r = 0; r < 9; r++) { if (brd[r][c2] === val) pos.push(r); }
        if (pos.length > 1) pos.forEach(p => c.add(`${p}-${c2}`));
      }
    }
    for (let br = 0; br < 3; br++) for (let bc = 0; bc < 3; bc++) {
      for (let val = 1; val <= 9; val++) {
        const pos: [number, number][] = [];
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
          const r = br * 3 + i, c2 = bc * 3 + j;
          if (brd[r][c2] === val) pos.push([r, c2]);
        }
        if (pos.length > 1) pos.forEach(([r2, c2]) => c.add(`${r2}-${c2}`));
      }
    }
    return c;
  }, []);

  useEffect(() => {
    setConflicts(findConflicts(board));
    const allFilled = board.every(row => row.every(v => v !== 0));
    if (allFilled && conflicts.size === 0 && board.some(row => row.some(v => v !== 0))) {
      setCompleted(true);
      addUserXp(80);
      updateAppData(prev => ({ ...prev, gameScores: { ...prev.gameScores, sudoku: prev.gameScores.sudoku + 1 } }));
    }
  }, [board, findConflicts, addUserXp, updateAppData]);

  const handleInput = (val: number) => {
    if (!selected || completed) return;
    const [r, c] = selected;
    if (initial[r][c]) return;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = val;
    setBoard(newBoard);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) handleInput(num);
    if (e.key === 'Backspace' || e.key === 'Delete') handleInput(0);
    if (e.key === 'ArrowUp' && selected) setSelected([Math.max(0, selected[0] - 1), selected[1]]);
    if (e.key === 'ArrowDown' && selected) setSelected([Math.min(8, selected[0] + 1), selected[1]]);
    if (e.key === 'ArrowLeft' && selected) setSelected([selected[0], Math.max(0, selected[1] - 1)]);
    if (e.key === 'ArrowRight' && selected) setSelected([selected[0], Math.min(8, selected[1] + 1)]);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="flex gap-2 p-1 glass rounded-2xl">
        {(['easy', 'medium', 'hard'] as const).map(d => (
          <button key={d} onClick={() => setDifficulty(d)}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px]", difficulty === d ? "bg-primary text-white shadow-md" : "text-slate-500")}>
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-9 border-2 border-slate-800 rounded-lg overflow-hidden shadow-2xl bg-slate-800 w-full max-w-[360px]">
        {board.map((row, r) => row.map((val, c) => {
          const isConflict = conflicts.has(`${r}-${c}`);
          return (
            <button key={`${r}-${c}`} onClick={() => setSelected([r, c])}
              className={cn(
                "aspect-square flex items-center justify-center text-sm sm:text-base font-bold transition-all",
                (r % 3 === 2 && r !== 8) && "border-b-2 border-b-slate-800",
                (c % 3 === 2 && c !== 8) && "border-r-2 border-r-slate-800",
                selected?.[0] === r && selected?.[1] === c ? "bg-primary text-white" :
                isConflict ? "bg-red-100 dark:bg-red-900/40 text-red-600" :
                initial[r][c] ? "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200" :
                "bg-white dark:bg-slate-900 text-primary"
              )}>
              {val !== 0 ? val : ''}
            </button>
          );
        }))}
      </div>

      <div className="grid grid-cols-5 gap-2 w-full max-w-[360px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
          <button key={n} onClick={() => handleInput(n)}
            className="aspect-square glass rounded-xl font-bold text-base sm:text-lg hover:bg-primary hover:text-white transition-all flex items-center justify-center min-h-[44px]">
            {n === 0 ? '\u232B' : n}
          </button>
        ))}
      </div>

      {completed && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center w-full">
          <CheckCircle2 size={28} className="mx-auto text-primary mb-1" />
          <p className="font-bold text-slate-800 dark:text-white">Puzzle Solved!</p>
          <p className="text-xs text-slate-500">+75 XP earned!</p>
        </div>
      )}

      <button onClick={() => generatePuzzle(difficulty)}
        className="w-full btn-secondary flex items-center justify-center gap-2 py-3 text-sm min-h-[44px]">
        <RotateCcw size={16} /> New Puzzle
      </button>
    </div>
  );
};

/* ===== Memory Match ===== */
const MemoryMatch: React.FC = () => {
  const icons = ['\uD83C\uDF4E', '\uD83C\uDF4C', '\uD83C\uDF47', '\uD83C\uDF53', '\uD83C\uDF52', '\uD83C\uDF4D', '\uD83E\uDD5D', '\uD83C\uDF49', '\uD83E\uDD51', '\uD83E\uDD65', '\uD83C\uDF4B', '\uD83C\uDF4A', '\uD83C\uDF51', '\uD83C\uDF50', '\uD83E\uDD6D', '\uD83E\uDD6D'];
  const [cards, setCards] = useState<{ id: number; icon: string; flipped: boolean; matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addUserXp, appData, updateAppData } = useAuth();

  const initGame = useCallback(() => {
    const deck = [...icons.slice(0, 8), ...icons.slice(0, 8)]
      .sort(() => Math.random() - 0.5)
      .map((icon, i) => ({ id: i, icon, flipped: false, matched: false }));
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setCompleted(false);
    setStartTime(Date.now());
    setElapsed(0);
    setIsProcessing(false);
  }, []);

  useEffect(() => initGame(), [initGame]);

  useEffect(() => {
    if (startTime > 0 && !completed) {
      const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, completed]);

  useEffect(() => {
    if (completed || matched === 0 || matched !== cards.length / 2) return;
    if (matched === cards.length / 2 && cards.length > 0 && !completed) {
      setCompleted(true);
      addUserXp(75);
      updateAppData(prev => ({ ...prev, gameScores: { ...prev.gameScores, memory: prev.gameScores.memory + 1 } }));
    }
  }, [matched, cards.length, completed, addUserXp, updateAppData]);

  const handleFlip = (id: number) => {
    if (isProcessing || cards[id].flipped || cards[id].matched || completed) return;
    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      setMoves(m => m + 1);
      const first = newFlipped[0], second = newFlipped[1];
      if (cards[first].icon === cards[second].icon) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setMatched(m => m + 1);
        setFlipped([]);
        setIsProcessing(false);
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setFlipped([]);
          setIsProcessing(false);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-2xl mx-auto">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">
        <span>Moves: {moves}</span>
        <span>Matched: {matched}/{cards.length / 2}</span>
        <span className="flex items-center gap-1"><Clock size={16} /> {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-3 w-full max-w-[400px]">
        {cards.map(card => (
          <button key={card.id} onClick={() => handleFlip(card.id)}
            className={cn(
              "aspect-square rounded-lg sm:rounded-xl text-xl sm:text-2xl md:text-3xl flex items-center justify-center transition-all duration-300 shadow-sm min-h-[60px]",
              card.flipped || card.matched ? "bg-white dark:bg-slate-800 rotate-0 border border-slate-200 dark:border-slate-700" :
              "bg-primary text-transparent border border-primary/30",
              card.matched && "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700"
            )}>
            {card.flipped || card.matched ? card.icon : ''}
          </button>
        ))}
      </div>

      {completed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-primary/10 border border-primary/20 text-center w-full max-w-[400px]">
          <CheckCircle2 size={32} className="mx-auto text-primary mb-1" />
          <p className="font-bold text-slate-800 dark:text-white text-base sm:text-lg">All Matched!</p>
          <p className="text-xs sm:text-sm text-slate-500">{moves} moves in {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} +50 XP</p>
        </div>
      )}

      <button onClick={initGame}
        className="btn-secondary flex items-center justify-center gap-2 py-3 px-6 sm:px-8 text-sm min-h-[44px]">
        <RotateCcw size={16} /> New Game
      </button>
    </div>
  );
};

/* ===== AI Art Guesser ===== */
const BASE_CHALLENGES = [
  { img: "https://picsum.photos/seed/art1/400/400", prompt: "A futuristic library in space with floating books", options: ["Cyberpunk Library", "Space Library", "Floating Books", "Digital Knowledge"], answer: 1 },
  { img: "https://picsum.photos/seed/art2/400/400", prompt: "A robotic owl studying ancient scrolls", options: ["Mechanical Owl", "Scholar Robot", "Ancient Tech", "Wise Machine"], answer: 0 },
  { img: "https://picsum.photos/seed/art3/400/400", prompt: "A neon-lit university campus at night", options: ["Cyber University", "Neon Campus", "Future School", "Night Academy"], answer: 1 },
  { img: "https://picsum.photos/seed/art4/400/400", prompt: "An AI painting a portrait of a philosopher", options: ["Digital Artist", "AI Painter", "Robot Artist", "Thinking Machine"], answer: 1 },
  { img: "https://picsum.photos/seed/art5/400/400", prompt: "A holographic globe showing PLASU campus", options: ["Digital PLASU", "Hologram Campus", "Future University", "Virtual PLASU"], answer: 1 },
];

const THEME_ADJECTIVES = ['futuristic', 'neon-lit', 'steampunk', 'cyberpunk', 'minimalist', 'surreal', 'vaporwave', 'biopunk', 'retro', 'ethereal'];
const THEME_SUBJECTS = ['library', 'owl', 'campus', 'robot', 'painting', 'globe', 'city', 'forest', 'ocean', 'mountain'];

async function generateChallenge(seed: number): Promise<typeof BASE_CHALLENGES[0] | null> {
  const adj = THEME_ADJECTIVES[seed % THEME_ADJECTIVES.length];
  const subj = THEME_SUBJECTS[(seed + 3) % THEME_SUBJECTS.length];
  const prompt = `A ${adj} ${subj} at PLASU university`;
  const wrong1 = `The ${adj} ${subj}`;
  const wrong2 = `${adj.charAt(0).toUpperCase() + adj.slice(1)} Vision`;
  const wrong3 = `Digital ${subj.charAt(0).toUpperCase() + subj.slice(1)}`;
  const correct = `${adj.charAt(0).toUpperCase() + adj.slice(1)} ${subj.charAt(0).toUpperCase() + subj.slice(1)}`;

  const result = await safeGroq(
    'You are a creative AI art generator. Return exactly 4 multiple-choice options for an AI-generated artwork. The first option should be the correct title matching the prompt. Return ONLY a JSON array of 4 strings. Example: ["Sunset Overdrive","Dark Horizon","Neon Dreams","Pixel Dawn"]',
    `Generate 4 creative multiple-choice art titles for this image prompt: "${prompt}". The correct answer should match the prompt's theme.`,
    'mixtral-8x7b-32768',
    JSON.stringify([correct, wrong1, wrong2, wrong3]),
  );

  try {
    const parsed = JSON.parse(result);
    if (Array.isArray(parsed) && parsed.length === 4) {
      return { img: `https://picsum.photos/seed/art${Date.now()}/400/400`, prompt, options: parsed, answer: 0 };
    }
  } catch {}
  return { img: `https://picsum.photos/seed/art${seed}/400/400`, prompt, options: [correct, wrong1, wrong2, wrong3], answer: 0 };
}

const AIArtGuesser: React.FC = () => {
  const { addUserXp, appData, updateAppData } = useAuth();
  const [challenges, setChallenges] = useState<typeof BASE_CHALLENGES>(BASE_CHALLENGES);
  const [generating, setGenerating] = useState(false);

  const [current, setCurrent] = useState(0);
  const [guessed, setGuessed] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  const loadHint = useCallback(async () => {
    if (hint || hintLoading) return;
    setHintLoading(true);
    const result = await safeGroq(
      'You are an art history assistant. Give a one-sentence cryptic hint about the artwork or style described. Never say the title or answer directly.',
      `Artwork prompt: "${challenges[current].prompt}". The options are: ${challenges[current].options.join(', ')}. Give a cryptic hint that helps identify the correct choice without revealing it.`,
      'gemma2-9b-it',
      'This artwork was generated from a prompt about its visual style and setting.',
    );
    setHint(result);
    setHintLoading(false);
  }, [current, hint, hintLoading, challenges]);

  const handleGuess = (idx: number) => {
    if (guessed !== null) return;
    setGuessed(idx);
    const correct = idx === challenges[current].answer;
    if (correct) {
      setScore(s => s + 100 + streak * 10);
      setStreak(s => s + 1);
      addUserXp(60);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (current + 1 >= challenges.length) {
      setCompleted(true);
      if (score > 0) {
        updateAppData(prev => ({ ...prev, gameScores: { ...prev.gameScores, artGuesser: prev.gameScores.artGuesser + 1 } }));
      }
      return;
    }
    setCurrent(c => c + 1);
    setGuessed(null);
    setHint(null);
  };

  const restart = async () => {
    setCurrent(0);
    setGuessed(null);
    setScore(0);
    setStreak(0);
    setCompleted(false);
    setImgError(false);
    setHint(null);
    setHintLoading(false);
    setGenerating(true);
    const fresh: typeof BASE_CHALLENGES = [];
    for (let i = 0; i < 5; i++) {
      const c = await generateChallenge(Date.now() + i);
      if (c) fresh.push(c);
    }
    if (fresh.length === 5) setChallenges(fresh);
    setGenerating(false);
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
        <div className="glass p-8 rounded-[40px] text-center space-y-4">
          <Trophy size={48} className="mx-auto text-primary" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Game Complete!</h2>
          <p className="text-lg font-bold text-primary">Final Score: {score}</p>
          <p className="text-sm text-slate-500">Total XP earned: {Math.floor(score / 2)}</p>
          <button onClick={restart} disabled={generating}
            className="btn-primary mt-4 w-full flex items-center justify-center gap-2 min-h-[48px]">
            {generating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : 'Play Again'}
          </button>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
        <div className="glass p-12 rounded-[40px] text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-primary mx-auto" />
          <p className="text-lg font-bold text-slate-800 dark:text-white">Generating New Challenges...</p>
          <p className="text-sm text-slate-500">ATHENA is creating fresh art for you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-2xl mx-auto">
      <div className="flex gap-4 sm:gap-8 text-sm sm:text-base font-bold">
        <span className="text-primary">Score: {score}</span>
        <span className="text-orange-500">Streak: {streak} {'\uD83D\uDD25'}</span>
        <span className="text-slate-400">{current + 1}/{challenges.length}</span>
      </div>

      <div className="glass p-2 sm:p-3 rounded-[24px] sm:rounded-3xl shadow-xl overflow-hidden w-full max-w-sm">
        {imgError ? (
          <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-sm">
            <div className="text-center p-4">
              <ImageIcon size={40} className="mx-auto mb-2 opacity-50" />
              <p>Image unavailable</p>
              <p className="text-[10px] mt-1">Proceeding with guess</p>
            </div>
          </div>
        ) : (
          <img src={challenges[current].img} alt="AI Art" className="rounded-xl w-full aspect-square object-cover"
            onError={() => setImgError(true)} referrerPolicy="no-referrer" width="400" height="400" />
        )}
      </div>

      <div className="w-full space-y-3 max-w-sm">
        <h3 className="text-center font-bold text-slate-500 uppercase tracking-widest text-[10px] sm:text-xs">Which prompt created this image?</h3>
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          {challenges[current].options.map((opt, idx) => (
            <button key={idx} onClick={() => handleGuess(idx)} disabled={guessed !== null}
              className={cn(
                "p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold transition-all border-2 text-xs sm:text-sm min-h-[44px]",
                guessed === idx
                  ? (idx === challenges[current].answer ? "bg-emerald-500 text-white border-emerald-500" : "bg-red-500 text-white border-red-500")
                  : guessed !== null && idx === challenges[current].answer
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300"
              )}>
              {opt}
            </button>
          ))}
        </div>

        {guessed === null && (
          <div className="flex justify-center">
            <button onClick={loadHint} disabled={hintLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-500 hover:text-primary hover:border-primary transition-all min-h-[44px]">
              {hintLoading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
              {hintLoading ? 'Thinking...' : hint ? 'Another Hint' : 'Get AI Hint'}
            </button>
          </div>
        )}

        {hint && guessed === null && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 max-w-sm w-full text-center">
            <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">AI Hint</p>
            <p className="text-xs text-amber-800 dark:text-amber-200 italic">"{hint}"</p>
          </div>
        )}
      </div>

      {guessed !== null && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center w-full max-w-sm">
          <p className="text-[10px] font-bold text-primary uppercase mb-1">Real Prompt</p>
          <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 italic">"{challenges[current].prompt}"</p>
          <button onClick={next}
            className="mt-3 text-primary font-bold text-sm hover:underline min-h-[44px]">
            {current + 1 >= challenges.length ? 'See Results' : 'Next Challenge'}
          </button>
        </div>
      )}
    </div>
  );
};

/* ===== Main Games Component ===== */
const Games: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const { appData } = useAuth();

  const games = [
    { id: 'chess', title: 'Chess AI', icon: Trophy, color: 'text-slate-800', desc: 'Challenge the ATHENA engine.' },
    { id: 'memory', title: 'Memory Match', icon: Brain, color: 'text-emerald-500', desc: 'Sharpen your visual recall.' },
    { id: 'sudoku', title: 'Sudoku', icon: Grid3X3, color: 'text-blue-500', desc: 'Classic logic puzzles.' },
    { id: 'art', title: 'AI Art Guesser', icon: ImageIcon, color: 'text-purple-500', desc: 'Decode generative prompts.' },
    { id: 'cbt', title: 'CBT Exam', icon: BookOpen, color: 'text-orange-500', desc: 'JAMB-style practice tests.' },
  ];

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col overflow-y-auto">
      <header className="flex items-center gap-3">
        {activeGame && (
          <button onClick={() => setActiveGame(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ChevronLeft size={22} />
          </button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            {activeGame ? games.find(g => g.id === activeGame)?.title : 'Games Center'}
          </h1>
          <p className="text-sm text-slate-500">Boost your focus and cognitive skills.</p>
        </div>
      </header>

      {!activeGame ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {games.map(g => (
            <button key={g.id} onClick={() => setActiveGame(g.id)}
              className="glass p-5 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[32px] flex flex-col items-center text-center gap-3 sm:gap-4 hover:translate-y-[-5px] transition-all group min-h-[180px]">
              <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm", g.color)}>
                <g.icon size={28} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">{g.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500">{g.desc}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-start justify-center w-full pt-4">
          {activeGame === 'chess' && <ChessGame />}
          {activeGame === 'memory' && <MemoryMatch />}
          {activeGame === 'art' && <AIArtGuesser />}
          {activeGame === 'sudoku' && <SudokuGame />}
          {activeGame === 'cbt' && <CBTExam />}
        </div>
      )}
    </div>
  );
};

export default Games;
