'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/services/conversations.service';

interface MessageItemProps {
  message: Message;
  isLast: boolean;
  sending: boolean;
  onImageClick: (url: string) => void;
}

export const MessageItem = ({ message, isLast, sending, onImageClick }: MessageItemProps) => {
  const renderContent = () => {
    if (message.role === 'assistant') {
      return (
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ node, ...props }) => (
              <img 
                {...props} 
                onClick={() => {
                  if (typeof props.src === 'string') {
                    onImageClick(props.src);
                  }
                }}
                className="chat-message__image"
                style={{ maxWidth: '30%', borderRadius: '0.5rem', display: 'block', margin: '1rem 0', cursor: 'zoom-in' }} 
              />
            )
          }}
        >
          {message.content || (sending && isLast ? '...' : '')}
        </ReactMarkdown>
      );
    }

    if (message.role === 'image') {
      if (message.content) {
        return (
          <img 
            src={message.content} 
            alt="AI Generated" 
            onClick={() => onImageClick(message.content)}
            style={{ maxWidth: '30%', borderRadius: '0.5rem', marginTop: '0.5rem', cursor: 'zoom-in' }} 
          />
        );
      }
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888' }}>
          <i className="ph ph-spinner animate-spin"></i>
          <span>Generating image...</span>
        </div>
      );
    }

    return message.content;
  };

  return (
    <div className={`threads-admin__message threads-admin__message--${message.role}`}>
      <div className="threads-admin__message-bubble">
        {renderContent()}
      </div>
      <div className="threads-admin__message-meta">
        {message.role === 'assistant' ? 'AI Assistant' : message.role === 'image' ? 'System' : 'You'}
      </div>
    </div>
  );
};
