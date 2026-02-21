import { Sparkles, Lightbulb, Search, Hammer } from 'lucide-react';

interface LoadingPlaceholderProps {
  message?: string;
}

function getIcon(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('searching') || lower.includes('fetching')) {
    return <Search className="h-4 w-4 text-blue-600 animate-pulse" />;
  }
  if (lower.includes('generating') || lower.includes('document')) {
    return <Hammer className="h-4 w-4 text-blue-600 animate-bounce" />;
  }
  if (lower.includes('thinking')) {
    return <Lightbulb className="h-4 w-4 text-blue-600 animate-pulse" />;
  }
  return <Sparkles className="h-4 w-4 text-blue-600 animate-spin" />;
}

export function LoadingPlaceholder({ message = 'Thinking...' }: LoadingPlaceholderProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        {getIcon(message)}
      </div>
      <div className="bg-muted px-4 py-3 rounded-lg rounded-tl-none min-w-[180px]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground loading-text">
            {message}
          </span>
          <span className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="shimmer-line h-3 w-32 rounded"></div>
          <div className="shimmer-line h-3 w-48 rounded"></div>
          <div className="shimmer-line h-3 w-40 rounded"></div>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .shimmer-line {
          background: linear-gradient(
            90deg,
            hsl(var(--muted)) 0%,
            hsl(var(--muted-foreground) / 0.2) 50%,
            hsl(var(--muted)) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        .loading-dots {
          display: inline-flex;
          gap: 2px;
        }
        .dot {
          width: 4px;
          height: 4px;
          background-color: hsl(var(--muted-foreground) / 0.6);
          border-radius: 50%;
          animation: wave 1.2s ease-in-out infinite;
        }
        .dot:nth-child(1) {
          animation-delay: 0s;
        }
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        .loading-text {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
