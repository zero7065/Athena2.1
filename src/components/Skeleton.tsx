import React from 'react';
import { cn } from '../lib/utils';

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("glass p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] animate-pulse space-y-3", className)}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
      </div>
    </div>
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
  </div>
);

export const SkeletonLine: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse", className)} />
);

export const SkeletonAvatar: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0", className)} />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => (
  <div className={cn("space-y-2 animate-pulse", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-3 bg-slate-200 dark:bg-slate-700 rounded" style={{ width: `${90 - i * 15}%` }} />
    ))}
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/5" />
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12" />
      </div>
    ))}
  </div>
);

export const SkeletonChart: React.FC = () => (
  <div className="h-48 sm:h-56 flex items-end justify-around gap-2 px-4 animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-t-lg" style={{ height: `${30 + Math.random() * 60}%` }} />
    ))}
  </div>
);
