# AI Assistant -- Complete Overhaul

## Summary

Fix all critical bugs (disappearing messages, duplicate chats, accuracy issues) and upgrade the AI Assistant to be production-grade: accurate data fetching, proper chat UX, smart loading states, MCQ disambiguation, AI-generated titles, and polished UI.

---

## Issues Identified and Fixes

### 1. Build Error Fix (dodo-webhook)

The `Uint8Array` to `ArrayBuffer` cast in `supabase/functions/dodo-webhook/index.ts` line 67 needs `as unknown as ArrayBuffer` instead of direct cast.

### 2. Replace All Bot Icons with Sparkles

**Files**: `ChatInterface.tsx`, `MessageBubble.tsx`, `LoadingPlaceholder.tsx`, `AIAssistant.tsx`

Replace every `Bot` import and usage with `Sparkles` from lucide-react. This includes the sidebar icon, message bubble avatars, and the employee data banner.

### 3. Messages Disappearing -- Root Cause and Fix

**Root cause**: In `AIAssistant.tsx`, `handleSendMessage` calls `addMessage()` only for the assistant response -- the user message is never persisted to state or DB. The `ChatInterface` clears input and calls `onSendMessage`, but the user message never gets added to the session.

**Fix**: In `handleSendMessage`, call `await addMessage(userMessage)` FIRST before calling the AI, so the user message appears immediately. Then call `addMessage(assistantMessage)` for the response.

### 4. Duplicate Chat Sessions

**Root cause**: The `useEffect` on line 61-69 of `AIAssistant.tsx` auto-creates a session when `sessions.length === 0`. Meanwhile, `addMessage` in `useChatSessions.ts` also creates a session if `currentSession` is null. This race condition creates two sessions.

**Fix**: Remove the auto-create logic from the useEffect. Instead, let `addMessage` handle session creation lazily (it already does). Only auto-load the first existing session if there is one.

### 5. AI-Generated Chat Titles (4 words via AI)

**Current**: Title is set to first 4 words of user message.

**Fix**: After receiving the AI's first response in a new chat, make a lightweight secondary AI call (using the same Groq/Sarvam API) with a simple prompt: "Generate a 4-5 word title for this conversation: [user message]". Use the result to update the session title. Example: "Bonafide for Emma Williams".

### 6. Move AI Calls to Edge Function (Security Fix)

**Critical**: API keys (`VITE_GROQ_API_KEY`, `VITE_SARVAM_API_KEY`) are currently exposed in client-side `.env` variables. This violates the project's security rules.

**Fix**: Create a new edge function `supabase/functions/ai-chat/index.ts` that:

- Receives messages + employeeData + orgInfo from the client
- Builds the system prompt server-side
- Calls Groq/Sarvam with the keys stored as Supabase secrets
- Returns the response

Move `VITE_GROQ_API_KEY` and `VITE_SARVAM_API_KEY` to Supabase secrets as `GROQ_API_KEY` and `SARVAM_API_KEY`. Update `groq-client.ts` to call the edge function instead of directly calling external APIs.

### 7. Data Accuracy -- Precise Employee Lookup

**Problem**: The current approach dumps up to 20 employee records into the system prompt and relies on the LLM to find the right one. This causes hallucination and mixing of records.

**Fix**: Instead of sending all employee data in the system prompt:

1. When the user mentions a name, do a **server-side exact lookup** in the edge function
2. The edge function queries `organization_data_records` for the matching name
3. If exactly 1 match: include ONLY that record in the prompt
4. If multiple matches: return a special `DISAMBIGUATE` response with the list of matching names
5. If 0 matches: tell the user no record was found

This eliminates hallucination because the LLM only sees the ONE correct record.

### 8. MCQ Disambiguation Card

When multiple employees match (e.g., 4 "Emma"s), render a selection card in the chat UI.

**New component**: `DisambiguationCard.tsx` -- renders radio-button style cards for each match (showing name, employee ID, department). When user selects one, it sends a follow-up message like "I'm referring to Emma Williams (ID: EMP-042)".

**MessageBubble update**: Detect `DISAMBIGUATE:` prefix in assistant messages and render the `DisambiguationCard` component instead of text.

### 9. Loading/Thinking States

**Fix `isGenerating` prop**: Currently `AIAssistant.tsx` passes `isDocumentGeneration` as `isGenerating` to `ChatLayout`. This means the loading state only shows during document navigation, not during AI thinking.

**Fix**: Pass the actual `isGenerating` state (which is `true` from when the user sends until the AI responds). Add a secondary `isDocumentGeneration` prop for the "Generating document..." message variant.

**Loading messages progression (Shimmering and Wave animation**:

- "Thinking..." (default while waiting for AI) -- Use lightbulb icon
- "Searching records..." (when name lookup is happening) -- Use Loading spinner icon
- "Generating document..." (when navigating to document page) -- Use hammer icon

### 10. Known/Missing Information UI (Green/Yellow Cards)

The current `MessageBubble.tsx` already has `FieldCard` components with green/yellow styling. The parsing logic needs improvement:

- Exclude organization/admin fields (signatory name, org name, etc.) from the "Known Information" card -- only show employee/student data
- Ensure the AI prompt instructs it to format Known/Missing sections with markdown headers `### Known Information` and `### Missing Information` in proper format and styling

### 11. Date Format DD/MM/YYYY and Gender Lowercase

Already partially implemented in the system prompt. Reinforce in the edge function prompt and in the `parseGenerationResponse` normalizer.

### 12. Organization/Admin Data Exclusion from Known Info

Update the system prompt to explicitly say: "In your Known Information section, only list employee/student-specific fields (name, gender, parent name, course, department, designation, dates). Do NOT list organization name, signatory name, signatory designation, place, email, or phone -- these are already known."

---

## Technical Plan -- Files to Create/Modify

### New Files


| File                                                 | Purpose                                                                                |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `supabase/functions/ai-chat/index.ts`                | Edge function for AI calls -- keeps API keys server-side, does precise employee lookup |
| `src/components/ai-assistant/DisambiguationCard.tsx` | MCQ selection card for multiple employee matches                                       |


### Modified Files


| File                                                 | Changes                                                                                                                                                                                                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/functions/dodo-webhook/index.ts`           | Fix `Uint8Array` cast: `secretBytes as unknown as ArrayBuffer`                                                                                                                                                                                     |
| `src/lib/groq-client.ts`                             | Rewrite `sendChatMessage` to call the `ai-chat` edge function instead of direct API calls. Remove client-side API key usage. Keep `parseGenerationResponse` and helper functions.                                                                  |
| `src/pages/AIAssistant.tsx`                          | (1) Replace `Bot` with `Sparkles`. (2) Add user message via `addMessage` before AI call. (3) Pass both `isGenerating` and `isDocumentGeneration`. (4) Remove auto-create session useEffect race. (5) Add AI title generation after first response. |
| `src/hooks/useChatSessions.ts`                       | Fix `addMessage` to not create duplicate sessions. Remove the auto-title logic from `addMessage` (title will be set by AI call in `AIAssistant.tsx`).                                                                                              |
| `src/components/ai-assistant/ChatInterface.tsx`      | Replace `Bot` with `Sparkles`. Accept separate `isThinking` and `isGeneratingDoc` props for different loading messages.                                                                                                                            |
| `src/components/ai-assistant/ChatLayout.tsx`         | Pass through new loading state props.                                                                                                                                                                                                              |
| `src/components/ai-assistant/MessageBubble.tsx`      | (1) Replace `Bot` with `Sparkles`. (2) Add disambiguation card rendering. (3) Improve field parsing to exclude org/admin fields.                                                                                                                   |
| `src/components/ai-assistant/LoadingPlaceholder.tsx` | Accept dynamic message prop (already does), ensure shimmer is visible.                                                                                                                                                                             |
| `src/components/ai-assistant/SessionSidebar.tsx`     | No icon changes needed (no Bot icon here).                                                                                                                                                                                                         |


### Edge Function: `ai-chat/index.ts` Design

```text
POST /ai-chat
Body: { messages, orgInfo, contextCountry, issueDate, organizationId, searchName? }

1. Auth check (get user from JWT)
2. If searchName provided:
   a. Query organization_data_records for organizationId
   b. Parse JSON records, fuzzy-match by name
   c. If 1 match: attach ONLY that record to system prompt
   d. If multiple: return { type: "disambiguate", matches: [...] }
   e. If 0: return { type: "no_match" }
3. Build system prompt with single employee record (not all 20)
4. Call Sarvam/Groq API with server-side keys
5. Return AI response
```

### Message Flow (Fixed)

```text
User types "Create bonafide for Emma"
  --> addMessage(userMessage) -- user msg appears immediately
  --> setIsGenerating(true) -- "Thinking..." shimmer shows
  --> Call ai-chat edge function with searchName="Emma"
  --> Edge function finds 1 match: returns AI response with precise data
  --> addMessage(assistantMessage) -- response appears
  --> If GENERATE_DOCUMENT detected: setIsDocumentGeneration(true), navigate
  --> Generate 3-word title via secondary AI call, update session title
```

### Secrets to Add

- `GROQ_API_KEY` (move from VITE_GROQ_API_KEY)
- `SARVAM_API_KEY` (move from VITE_SARVAM_API_KEY)

The client-side `VITE_*` keys should be removed from `.env` after migration.

---

## Priority Order

1. Implement precise employee lookup in edge function
2. Fix build error (dodo-webhook cast)
3. Fix message disappearing (add user message to session)
4. Fix duplicate chat creation (remove race condition)
5. Replace Bot icons with Sparkles everywhere
6. Fix loading state pass-through (isGenerating vs isDocumentGeneration)
7. Create ai-chat edge function and migrate API calls server-side
8. Add disambiguation card for multiple matches
9. AI-generated 4/5-word chat titles
10. Refine system prompt (exclude org data from Known Info, enforce formats)