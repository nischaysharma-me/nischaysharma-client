import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
});

const MermaidComponent = ({ node, getPos }: any) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      const content = node.attrs.content;
      if (!content) {
        setSvg('');
        return;
      }

      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        const { svg } = await mermaid.render(id, content);
        setSvg(svg);
        setError(null);
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setError('Invalid Mermaid syntax');
        setSvg('');
      }
    };

    renderDiagram();
  }, [node.attrs.content]);

  const handleClick = () => {
    // Emit global event to be caught by TiptapEditor
    const event = new CustomEvent('edit-mermaid', {
      detail: {
        code: node.attrs.content,
        pos: getPos(),
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <NodeViewWrapper className="mermaid-wrapper" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="mermaid-preview" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '0.5rem', minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {error ? (
          <div style={{ color: '#dc3545', fontSize: '0.8rem', fontFamily: 'monospace' }}>{error}</div>
        ) : svg ? (
          <div 
            className="mermaid-svg"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>Click to add Mermaid diagram</div>
        )}
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#adb5bd', marginTop: '-0.25rem' }}>
        (Click to edit diagram)
      </div>
    </NodeViewWrapper>
  );
};

export default Node.create({
  name: 'mermaid',
  group: 'block',
  atom: true, // Treat as a single unit
  
  addAttributes() {
    return {
      content: {
        default: 'graph TD\n  A --> B',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        getAttrs: node => (node as HTMLElement).classList.contains('mermaid') && {
          content: (node as HTMLElement).textContent,
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['pre', mergeAttributes(HTMLAttributes, { class: 'mermaid' }), node.attrs.content];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidComponent);
  },

  addCommands() {
    return {
      setMermaid: (content?: string) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { content: content || 'graph TD\n  A --> B' },
        });
      },
    };
  },
});
