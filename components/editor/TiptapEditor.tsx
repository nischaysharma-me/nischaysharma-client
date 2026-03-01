'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import React, { useEffect, useState } from 'react';

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const [isRawMode, setIsRawMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default to use lowlight
      }),
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
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
      setRawHtml(content);
    }
  }, [content, editor]);

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

  return (
    <div className="editor-container">
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
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 10H3M21 6H3M21 14H3M17 18H3"/></svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 10H6M21 6H3M21 14H3M18 18H6"/></svg>
          </button>
        </div>

        {/* Lists & Media */}
        <div className="editor-toolbar__group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            type="button"
          >
            List
          </button>
          <button
            onClick={() => {
              const url = prompt('Enter image URL');
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
            type="button"
          >
            Img
          </button>
          <button
            onClick={() => {
              const url = prompt('Enter URL');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            className={editor.isActive('link') ? 'is-active' : ''}
            type="button"
          >
            Link
          </button>
        </div>

        {/* Code & Source */}
        <div className="editor-toolbar__group" style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'is-active' : ''}
            type="button"
          >
            Code
          </button>
          <button
            onClick={toggleRawMode}
            className={isRawMode ? 'is-active' : ''}
            type="button"
            style={{ backgroundColor: isRawMode ? '#000' : '#eee', color: isRawMode ? '#fff' : '#000' }}
          >
            Source
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
    </div>
  );
};

export default TiptapEditor;
