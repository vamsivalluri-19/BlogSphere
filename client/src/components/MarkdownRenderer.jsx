import React from 'react';

const parseMarkdown = (markdown) => {
  if (!markdown) return '';

  let html = markdown
    // Escape HTML tags to prevent XSS (allowing markdown structures only)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (```lang code ```)
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const lines = code.trim().split('\n');
    const firstLine = lines[0];
    const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
    const lang = hasLang ? firstLine : '';
    const actualCode = hasLang ? lines.slice(1).join('\n') : code.trim();
    
    return `<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-4 text-sm font-mono border border-slate-800"><code>${actualCode}</code></pre>`;
  });

  // Headers (# H1 to ###### H6)
  html = html
    .replace(/^###### (.*?)$/gm, '<h6 class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">$1</h6>')
    .replace(/^##### (.*?)$/gm, '<h5 class="text-sm font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">$1</h5>')
    .replace(/^#### (.*?)$/gm, '<h4 class="text-base font-bold text-slate-900 dark:text-white mt-5 mb-2">$1</h4>')
    .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3 border-b border-slate-100 dark:border-slate-800 pb-1.5">$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4">$1</h1>');

  // Blockquotes (> quote)
  html = html.replace(/^&gt;\s!(.*?)$/gm, '<blockquote class="border-l-4 border-brand-500 bg-brand-500/5 px-4 py-2 my-4 rounded-r-lg italic text-slate-700 dark:text-slate-200">$1</blockquote>')
             .replace(/^&gt;\s(.*?)$/gm, '<blockquote class="border-l-4 border-slate-300 dark:border-slate-700 bg-slate-100/30 dark:bg-slate-900/30 px-4 py-2 my-4 rounded-r-lg italic text-slate-700 dark:text-slate-200">$1</blockquote>');

  // Images (![alt](url))
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
    // If it's a relative uploads path, prepend the backend URL
    const fullUrl = url.startsWith('/uploads') ? `http://localhost:5000${url}` : url;
    return `<img src="${fullUrl}" alt="${alt}" class="rounded-xl max-h-96 mx-auto my-5 object-cover shadow-md" />`;
  });

  // Links ([text](url))
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
    const fullUrl = url.startsWith('/uploads') ? `http://localhost:5000${url}` : url;
    return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="text-brand-500 hover:underline font-medium">${text}</a>`;
  });

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // Unordered Lists (- item or * item)
  html = html.replace(/^[-*]\s(.*)$/gm, '<li class="list-disc ml-5 mb-1">$1</li>');

  // Ordered Lists (1. item)
  html = html.replace(/^\d+\.\s(.*)$/gm, '<li class="list-decimal ml-5 mb-1">$1</li>');

  // Group <li> tags into <ul> or <ol>
  // Simple grouping using a trick: wrap adjacent list items
  html = html.replace(/(<li class="list-disc[\s\S]*?<\/li>)/g, '<ul class="my-3 space-y-1">$1</ul>');
  html = html.replace(/(<li class="list-decimal[\s\S]*?<\/li>)/g, '<ol class="my-3 space-y-1">$1</ol>');
  
  // Clean up nested list wraps
  html = html.replace(/<\/ul>\s*<ul class="my-3 space-y-1">/g, '');
  html = html.replace(/<\/ol>\s*<ol class="my-3 space-y-1">/g, '');

  // Line breaks to paragraph tags
  const paragraphs = html.split('\n\n');
  html = paragraphs
    .map((p) => {
      p = p.trim();
      if (!p) return '';
      // Don't wrap list items, blockquotes, or headings in paragraph tags
      if (
        p.startsWith('<h') ||
        p.startsWith('<ul') ||
        p.startsWith('<ol') ||
        p.startsWith('<pre') ||
        p.startsWith('<block') ||
        p.startsWith('<img')
      ) {
        return p;
      }
      return `<p class="mb-4 leading-relaxed text-slate-800 dark:text-slate-200">${p}</p>`;
    })
    .join('\n');

  return html;
};

const MarkdownRenderer = ({ content }) => {
  const htmlContent = parseMarkdown(content);
  return (
    <div
      className="markdown-body text-slate-800 dark:text-slate-200"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;
export { parseMarkdown };
