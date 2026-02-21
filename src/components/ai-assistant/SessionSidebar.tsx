import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  updated_at: string;
}

interface SessionSidebarProps {
  sessions: Session[];
  currentSessionId?: string;
  loading: boolean;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, title: string) => void;
}

export function SessionSidebar({
  sessions,
  currentSessionId,
  loading,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
}: SessionSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (session: Session) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameSession(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <div className="h-full flex flex-col p-2">
      <Button
        variant="outline"
        size="sm"
        className="mb-2 w-full justify-start"
        onClick={onNewChat}
      >
        <Plus className="h-4 w-4 mr-2" />
        New Chat
      </Button>

      <div className="flex-1 overflow-y-auto space-y-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`group flex items-center gap-1 p-2 rounded-md cursor-pointer text-sm ${
              session.id === currentSessionId
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-accent'
            }`}
            onClick={() => {
              if (editingId !== session.id) {
                onSelectSession(session.id);
              }
            }}
          >
            {editingId === session.id ? (
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 px-1 py-0.5 text-sm border rounded"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveEdit();
                  }}
                  className="p-1 hover:text-green-500"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelEdit();
                  }}
                  className="p-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 truncate">{session.title}</span>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(session);
                    }}
                    className="p-1 hover:text-primary"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="p-1 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {loading && sessions.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-4">
          Loading...
        </div>
      )}
    </div>
  );
}
