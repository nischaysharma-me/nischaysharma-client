import { marked } from 'marked';
import hljs from 'highlight.js';

/**
 * Client-side Markdown Compiler
 * Converts markdown string to HTML with syntax highlighting
 */
export const compileMarkdown = async (markdown: string): Promise<string> => {
  const renderer = new marked.Renderer();
  
  // Configure marked for syntax highlighting
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  return marked.parse(markdown);
};

/**
 * Highlight all code blocks in an element
 */
export const highlightCode = (container: HTMLElement) => {
  container.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block as HTMLElement);
  });
};
