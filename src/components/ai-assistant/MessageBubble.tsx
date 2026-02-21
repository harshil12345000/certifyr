import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/hooks/useChatSessions';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-primary/10' : 'bg-purple-100'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4 text-purple-600" />
        )}
      </div>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-muted rounded-tl-none'
        }`}
      >
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
      </div>
    </div>
  );
}
