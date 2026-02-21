import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/hooks/useChatSessions';

interface MessageBubbleProps {
  message: ChatMessage;
}

function formatText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>');
}

function formatMessage(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    
    if (trimmed === '') {
      elements.push(<br key={`br-${lineIndex}`} />);
      return;
    }

    // Handle unordered list items
    if (trimmed.match(/^[-*]\s/)) {
      const item = trimmed.replace(/^[-*]\s/, '');
      elements.push(
        <div key={`li-${lineIndex}`} className="flex gap-2 ml-2">
          <span className="text-blue-600">•</span>
          <span dangerouslySetInnerHTML={{ __html: formatText(item) }} />
        </div>
      );
      return;
    }

    // Handle ordered list items
    const orderedMatch = trimmed.match(/^(\d+)\.\s(.*)$/);
    if (orderedMatch) {
      elements.push(
        <div key={`li-${lineIndex}`} className="flex gap-2 ml-2">
          <span className="text-muted-foreground">{orderedMatch[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: formatText(orderedMatch[2]) }} />
        </div>
      );
      return;
    }

    // Handle GENERATE_DOCUMENT line - hide it from user view
    if (trimmed.includes('GENERATE_DOCUMENT:')) {
      return; // Don't show internal command to user
    }

    // Regular line with formatting
    elements.push(
      <span key={`span-${lineIndex}`} dangerouslySetInnerHTML={{ __html: formatText(trimmed) }} />
    );
    if (lineIndex < lines.length - 1) {
      elements.push(<br key={`br2-${lineIndex}`} />);
    }
  });

  return elements;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-primary/10' : 'bg-blue-100'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4 text-blue-600" />
        )}
      </div>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-muted rounded-tl-none'
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {formatMessage(message.content)}
        </div>
      </div>
    </div>
  );
}
