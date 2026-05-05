'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Markdown } from '@tiptap/markdown';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Mermaid from './extensions/Mermaid';
import { MermaidDialog } from './MermaidDialog';
import { common, createLowlight } from 'lowlight';
import { marked } from 'marked';
import React, { useEffect, useState } from 'react';
import { usersService } from '@/services/users.service';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const [isRawMode, setIsRawMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(content);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMermaidDialogOpen, setIsMermaidDialogOpen] = useState(false);
  const [mermaidEditData, setMermaidEditData] = useState<{ code: string; pos?: number } | null>(null);

  const { user } = useStore();

  const editor = useEditor({
    extensions: [
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: '-',
        transformPastedText: true,
        transformCopiedText: true,
      }),
      StarterKit.configure({
        codeBlock: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Mermaid,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setRawHtml(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content',
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find(item => item.type.startsWith('image'));

        if (imageItem && user) {
          const file = imageItem.getAsFile();
          if (file) {
            handleImageUpload(file);
            return true;
          }
        }

        const text = event.clipboardData?.getData('text/plain');
        if (text) {
          // Check for markdown-like syntax
          const isMarkdown = (
            /^#\s/m.test(text) || 
            /\*\*.*\*\*/.test(text) || 
            /^---\s*$/m.test(text) || 
            /^- [^ ]/m.test(text) || 
            /^```/m.test(text) ||
            /\[.*\]\(.*\)/.test(text) ||
            /^\|.*\|$/m.test(text)
          );

          if (isMarkdown && editor) {
            // Convert markdown to HTML and insert it
            const html = marked.parse(text) as string;
            editor.commands.insertContent(html);
            return true;
          }
        }

        return false;
      },
      handleDrop: (view, event) => {
        const items = Array.from(event.dataTransfer?.items || []);
        const imageItem = items.find(item => item.type.startsWith('image'));

        if (imageItem && user) {
          const file = imageItem.getAsFile();
          if (file) {
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      }
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!user || !editor) return;

    try {
      const token = await user.getIdToken();
      toast.loading('Uploading image...', { id: 'upload-image' });
      
      const response = await usersService.uploadAsset(file, 'editor', token);
      
      if (response.success && response.url) {
        editor.chain().focus().setImage({ src: response.url }).run();
        toast.success('Image uploaded successfully', { id: 'upload-image' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image', { id: 'upload-image' });
    }
  };

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // Listen for Mermaid edit events from node views
  useEffect(() => {
    const handleMermaidEdit = (event: any) => {
      const { code, pos } = event.detail;
      setMermaidEditData({ code, pos });
      setIsMermaidDialogOpen(true);
    };

    window.addEventListener('edit-mermaid', handleMermaidEdit);
    return () => window.removeEventListener('edit-mermaid', handleMermaidEdit);
  }, []);

  if (!editor) {
    return null;
  }

  const toggleRawMode = () => {
    if (isRawMode) {
      // Switching from Raw to Visual
      editor.commands.setContent(rawHtml);
    } else {
      // Switching from Visual to Raw
      setRawHtml(editor.getHTML());
    }
    setIsRawMode(!isRawMode);
  };

  const handleRawChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawHtml(val);
    onChange(val);
  };

  const handleMermaidSave = (code: string) => {
    if (mermaidEditData && mermaidEditData.pos !== undefined) {
      // Update existing
      editor.chain().focus().command(({ tr }) => {
        tr.setNodeMarkup(mermaidEditData.pos!, undefined, { content: code });
        return true;
      }).run();
    } else {
      // Insert new
      (editor as any).chain().focus().setMermaid(code).run();
    }
    setMermaidEditData(null);
  };

  return (
    <div className={`editor-container ${isFullscreen ? 'editor-fullscreen' : ''}`}>
      <div className="editor-toolbar">
        {/* Basic Text Formatting */}
        <div className="editor-toolbar__group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
            type="button"
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
            type="button"
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'is-active' : ''}
            type="button"
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
            type="button"
            title="Strike"
          >
            <s>S</s>
          </button>
        </div>

        {/* Headings */}
        <div className="editor-toolbar__group">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()}
              className={editor.isActive('heading', { level }) ? 'is-active' : ''}
              type="button"
            >
              H{level}
            </button>
          ))}
        </div>

        {/* Alignment */}
        <div className="editor-toolbar__group">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
            type="button"
            title="Align Left"
          >
            <i className="ph ph-text-align-left" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
            type="button"
            title="Align Center"
          >
            <i className="ph ph-text-align-center" />
          </button>
        </div>

        {/* Lists & Media */}
        <div className="editor-toolbar__group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            type="button"
            title="Bullet List"
          >
            <i className="ph ph-list-bullets" />
          </button>
          <button
            onClick={() => {
              const url = prompt('Enter image URL');
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
            type="button"
            title="Insert Image"
          >
            <i className="ph ph-image" />
          </button>
          <button
            onClick={() => {
              const url = prompt('Enter URL');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            className={editor.isActive('link') ? 'is-active' : ''}
            type="button"
            title="Insert Link"
          >
            <i className="ph ph-link" />
          </button>
        </div>

        {/* Code & Source */}
        <div className="editor-toolbar__group" style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => {
              setMermaidEditData(null);
              setIsMermaidDialogOpen(true);
            }}
            className={editor.isActive('mermaid') ? 'is-active' : ''}
            type="button"
            title="Mermaid Diagram"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <i className="ph ph-tree-structure" />
            <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Mermaid</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'is-active' : ''}
            type="button"
            title="Code Block"
          >
            <i className="ph ph-code" />
          </button>
          <button
            onClick={toggleRawMode}
            className={isRawMode ? 'is-active' : ''}
            type="button"
            title="Source View"
            style={{ backgroundColor: isRawMode ? '#000' : '#eee', color: isRawMode ? '#fff' : '#000', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <i className="ph ph-brackets-curly" />
            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Source</span>
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={isFullscreen ? 'is-active' : ''}
            type="button"
            title="Toggle Fullscreen"
            style={{ backgroundColor: isFullscreen ? '#000' : '#eee', color: isFullscreen ? '#fff' : '#000', display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}
          >
            <i className={isFullscreen ? "ph ph-corners-in" : "ph ph-corners-out"} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{isFullscreen ? 'Exit' : 'Full'}</span>
          </button>
        </div>
      </div>

      <div className="editor-body">
        {isRawMode ? (
          <textarea
            className="tiptap-content tiptap-content--raw"
            value={rawHtml}
            onChange={handleRawChange}
            spellCheck={false}
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      <MermaidDialog
        isOpen={isMermaidDialogOpen}
        initialCode={mermaidEditData?.code}
        onClose={() => {
          setIsMermaidDialogOpen(false);
          setMermaidEditData(null);
        }}
        onSave={handleMermaidSave}
      />
    </div>
  );
};

export default TiptapEditor;
