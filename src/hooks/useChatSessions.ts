import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatSession {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface UseChatSessionsReturn {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  loading: boolean;
  error: string | null;
  createSession: () => Promise<ChatSession>;
  loadSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateTitle: (sessionId: string, title: string) => Promise<void>;
  addMessage: (message: ChatMessage) => Promise<ChatMessage[]>;
  clearError: () => void;
}

export function useChatSessions(userId: string | undefined, organizationId: string | null): UseChatSessionsReturn {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  // Ref always holds the latest currentSession value, avoiding stale closures in addMessage
  const currentSessionRef = useRef<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const isCreatingSessionRef = useRef(false);

  const clearError = useCallback(() => setError(null), []);

  // Helper: set currentSession and keep ref in sync
  const setSession = useCallback((session: ChatSession | null | ((prev: ChatSession | null) => ChatSession | null)) => {
    setCurrentSession(prev => {
      const next = typeof session === 'function' ? session(prev) : session;
      currentSessionRef.current = next;
      return next;
    });
  }, []);

  const loadSessions = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('ai_chat_sessions' as 'announcements')
        .select('*')
        .eq('organization_id', organizationId)
        .order('updated_at', { ascending: false }) as unknown as { data: ChatSession[] | null; error: Error | null };

      if (fetchError) throw fetchError;
      setSessions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const createSession = useCallback(async (): Promise<ChatSession> => {
    if (!organizationId || !userId) {
      throw new Error('Organization or user not found');
    }

    const newSession: Omit<ChatSession, 'id' | 'created_at' | 'updated_at'> = {
      organization_id: organizationId,
      user_id: userId,
      title: 'New Chat',
      messages: [],
    };

    const { data, error: insertError } = await supabase
      .from('ai_chat_sessions' as 'announcements')
      .insert(newSession as never)
      .select()
      .single() as unknown as { data: ChatSession; error: Error | null };

    if (insertError) throw insertError;

    setSessions(prev => [data, ...prev]);
    setSession(data);
    return data;
  }, [organizationId, userId, setSession]);

  const loadSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('ai_chat_sessions' as 'announcements')
        .select('*')
        .eq('id', sessionId)
        .single() as unknown as { data: ChatSession; error: Error | null };

      if (fetchError) throw fetchError;
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const deleteSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('ai_chat_sessions' as 'announcements')
        .delete()
        .eq('id', sessionId) as unknown as { error: Error | null };

      if (deleteError) throw deleteError;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionRef.current?.id === sessionId) {
        setSession(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const updateTitle = useCallback(async (sessionId: string, title: string) => {
    try {
      const { error: updateError } = await supabase
        .from('ai_chat_sessions' as 'announcements')
        .update({ title, updated_at: new Date().toISOString() } as never)
        .eq('id', sessionId) as unknown as { error: Error | null };

      if (updateError) throw updateError;

      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title } : s
      ));
      
      if (currentSessionRef.current?.id === sessionId) {
        setSession(prev => prev ? { ...prev, title } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update title');
    }
  }, [setSession]);

  const addMessage = useCallback(async (message: ChatMessage): Promise<ChatMessage[]> => {
    // Always read from ref to get the latest session (avoids stale closure)
    let activeSession = currentSessionRef.current;
    
    if (!activeSession) {
      if (isCreatingSessionRef.current) {
        await new Promise(r => setTimeout(r, 500));
        return addMessage(message);
      }

      if (!organizationId || !userId) {
        throw new Error('Organization or user not found');
      }

      isCreatingSessionRef.current = true;
      setIsCreatingSession(true);
      try {
        const newSession: Omit<ChatSession, 'id' | 'created_at' | 'updated_at'> = {
          organization_id: organizationId,
          user_id: userId,
          title: 'New Chat',
          messages: [],
        };

        const { data, error: insertError } = await supabase
          .from('ai_chat_sessions' as 'announcements')
          .insert(newSession as never)
          .select()
          .single() as unknown as { data: ChatSession; error: Error | null };

        if (insertError) throw insertError;

        activeSession = data;
        setSessions(prev => [data, ...prev]);
        setSession(data);
      } finally {
        isCreatingSessionRef.current = false;
        setIsCreatingSession(false);
      }
    }

    // Build updated messages on top of the latest known session
    const updatedMessages = [...activeSession.messages, message];

    const { error: updateError } = await supabase
      .from('ai_chat_sessions' as 'announcements')
      .update({ 
        messages: updatedMessages, 
        updated_at: new Date().toISOString() 
      } as never)
      .eq('id', activeSession.id) as unknown as { error: Error | null };

    if (updateError) {
      console.error('Failed to save message:', updateError);
    }

    const updatedSession = { ...activeSession, messages: updatedMessages };
    setSession(updatedSession);
    setSessions(prev => prev.map(s => 
      s.id === activeSession!.id ? updatedSession : s
    ));
    
    return updatedMessages;
  }, [organizationId, userId, setSession]);

  return {
    sessions,
    currentSession,
    loading,
    error,
    createSession,
    loadSession,
    deleteSession,
    updateTitle,
    addMessage,
    clearError,
  };
}
