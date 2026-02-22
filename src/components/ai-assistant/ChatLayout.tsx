import { useState } from 'react';
import { SessionSidebar } from './SessionSidebar';
import { ChatInterface } from './ChatInterface';
import { ChatMessage } from '@/hooks/useChatSessions';
import { EmployeeRecord } from '@/hooks/useEmployeeData';
import { Loader2 } from 'lucide-react';

interface ChatLayoutProps {
  sessions: { id: string; title: string; updated_at: string }[];
  currentSession: { id: string; title: string; messages: ChatMessage[] } | null;
  loading: boolean;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, title: string) => void;
  onSendMessage: (message: string) => Promise<void>;
  onDisambiguationSelect?: (match: { name: string; id: string; department: string }) => void;
  employeeData: EmployeeRecord[];
  contextCountry?: string;
  isGenerating?: boolean;
  isDocumentGeneration?: boolean;
  loadingMessage?: string;
  personInfoRecord?: Record<string, unknown>;
  personInfoTemplateName?: string;
  missingFields?: string[];
  collectedFields?: Record<string, string>;
  templateName?: string;
  onFieldChange?: (field: string, value: string) => void;
  onFieldSubmit?: () => void;
}

export function ChatLayout({
  sessions,
  currentSession,
  loading,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onSendMessage,
  onDisambiguationSelect,
  employeeData,
  contextCountry,
  isGenerating,
  isDocumentGeneration,
  loadingMessage,
  personInfoRecord,
  personInfoTemplateName,
  missingFields,
  collectedFields,
  templateName,
  onFieldChange,
  onFieldSubmit,
}: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] border rounded-lg overflow-hidden">
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-200 border-r bg-muted/20 flex-shrink-0 overflow-hidden`}
      >
        <SessionSidebar
          sessions={sessions}
          currentSessionId={currentSession?.id}
          loading={loading}
          onNewChat={onNewChat}
          onSelectSession={onSelectSession}
          onDeleteSession={onDeleteSession}
          onRenameSession={onRenameSession}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-2 border-b flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="ml-2 font-medium">
            {currentSession?.title || 'AI Assistant'}
          </span>
          {isGenerating && (
            <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <ChatInterface
          messages={currentSession?.messages || []}
          onSendMessage={onSendMessage}
          onDisambiguationSelect={onDisambiguationSelect}
          employeeDataCount={employeeData.length}
          contextCountry={contextCountry}
          isGenerating={isGenerating}
          isDocumentGeneration={isDocumentGeneration}
          loadingMessage={loadingMessage}
          loading={loading}
          personInfoRecord={personInfoRecord}
          personInfoTemplateName={personInfoTemplateName}
          missingFields={missingFields}
          collectedFields={collectedFields}
          templateName={templateName}
          onFieldChange={onFieldChange}
          onFieldSubmit={onFieldSubmit}
        />
      </div>
    </div>
  );
}
