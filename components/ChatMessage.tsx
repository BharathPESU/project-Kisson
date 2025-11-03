import React from 'react';
import { Message } from '../types';
import { UserIcon, KisanAI_Icon } from '../constants';

interface ChatMessageProps {
  message: Message;
}

const ChatMessageContent: React.FC<{ content: string }> = ({ content }) => {
  // A simple regex to find code blocks and leave other text as is.
  const parts = content.split(/(\`\`\`[\s\S]*?\`\`\`)/g);

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Extracts language and code from the block
          const codeBlock = part.replace(/```[a-z]*\n/, '').replace(/```/, '');
          return (
            <pre key={index} className="bg-gray-800/10 p-3 rounded-md my-2 overflow-x-auto text-sm text-gray-800">
              <code className="text-gray-800">{codeBlock.trim()}</code>
            </pre>
          );
        }
        // Use pre-wrap to respect newlines in the regular text parts
        return <span className="text-gray-700" key={index} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
      })}
    </div>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white rounded-br-none'
    : 'bg-white text-gray-700 rounded-bl-none shadow-sm border border-gray-200';
  const alignmentClasses = isUser ? 'justify-end' : 'justify-start';
  const avatar = isUser ? <UserIcon /> : <KisanAI_Icon className="h-6 w-6 text-green-600" />;
  const avatarContainerClasses = isUser ? 'ml-3' : 'mr-3';
  const messageContainerClasses = isUser ? 'flex-row-reverse' : 'flex-row';

  return (
    <div className={`flex items-start my-4 ${alignmentClasses}`}>
      <div className={`flex ${messageContainerClasses} max-w-2xl`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600' : 'bg-green-100'} ${avatarContainerClasses}`}>
          {avatar}
        </div>
        <div className={`px-4 py-3 rounded-xl ${bubbleClasses}`}>
          {/* For user messages, we don't need the complex markdown parser */}
          {isUser ? <div className="text-white" style={{whiteSpace: 'pre-wrap'}}>{message.content}</div> : <ChatMessageContent content={message.content} />}
        </div>
      </div>
    </div>
  );
};