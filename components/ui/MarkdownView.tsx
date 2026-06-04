'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

import rehypeRaw from 'rehype-raw';

const MarkdownView = ({ content, className }: MarkdownViewProps) => {
  if (!content) return null;

  return (
    <div className={`markdown-view ${className || ''}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownView;
