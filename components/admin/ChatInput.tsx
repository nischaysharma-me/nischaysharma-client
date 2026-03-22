'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  sending: boolean;
}

export const ChatInput = ({ onSend, sending }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || sending) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className="threads-admin__input-container">
      <div className="threads-admin__input-wrapper">
        <textarea 
          ref={textareaRef}
          placeholder="Type your message..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
        />
        <button 
          type="button" 
          className="send-btn" 
          onClick={handleSend}
          disabled={!input.trim() || sending}
        >
          {sending ? (
            <i className="ph ph-spinner animate-spin" style={{ fontSize: '1rem' }} />
          ) : (
            <i className="ph ph-paper-plane-tilt" style={{ fontSize: '1.25rem' }} />
          )}
        </button>
      </div>
    </div>
  );
};
