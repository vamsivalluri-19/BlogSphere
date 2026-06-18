import React from 'react';

export const BlogCardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden p-0 flex flex-col h-full animate-pulse border border-slate-200/40 dark:border-slate-800/40">
      <div className="aspect-video bg-slate-200 dark:bg-slate-800 w-full"></div>
      <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
        <div className="space-y-2">
          {/* Category & Date */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
          {/* Title */}
          <div className="h-5 w-5/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-5 w-2/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
          {/* Excerpt */}
          <div className="space-y-1.5 pt-2">
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BlogGridSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const PostDetailSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-4xl mx-auto py-4">
      {/* Category and Title */}
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
      <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
      
      {/* Author & Date */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="aspect-video w-full bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>

      {/* Text Blocks */}
      <div className="space-y-3 pt-4">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
    </div>
  );
};
