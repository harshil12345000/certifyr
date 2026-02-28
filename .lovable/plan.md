

# Make Certifyr Legal Library AI-Agent Accessible

## The Problem
Right now the legal library is just a browsable web UI -- no better than Google for an AI agent or developer trying to programmatically access legal document metadata. There's no structured API, no machine-readable endpoints, and the existing `llms.txt` doesn't mention the library.

## What We'll Build

### 1. Public JSON API Edge Function (`library-api`)
A new edge function that returns **structured JSON** (not HTML) so AI agents, MCP clients, and developers can query the library programmatically.

**Endpoints (via query params):**
- `?action=list` -- paginated list of all documents with filters (country, domain, authority, search)
- `?action=get&slug=gst-reg-01` -- full document detail with fields, attachments, dependencies
- `?action=search&q=tax+registration+india` -- semantic search across documents
- `?action=schema` -- returns the API schema itself (self-documenting)

Response format: Clean JSON with consistent structure, pagination metadata, and CORS headers for cross-origin access.

### 2. Update `llms.txt` with Library Context
Rewrite `public/llms.txt` to include:
- Description of the Legal Library and its purpose
- The API endpoint URL and available actions
- Example queries an LLM can make
- Schema of the document data model

### 3. Add `/.well-known/ai-plugin.json` Style Manifest
Create `public/.well-known/ai-plugin.json` -- a discoverable manifest file that AI agents (ChatGPT plugins, custom agents) can use to understand and connect to the library API.

### 4. OpenAPI Spec
Create `public/openapi.yaml` -- a standard OpenAPI 3.0 spec describing the library API so any tool (Postman, AI agents, code generators) can auto-discover it.

## Technical Details

### New Edge Function: `supabase/functions/library-api/index.ts`

```text
GET /library-api?action=list&country=India&domain=Tax&page=1&limit=20
GET /library-api?action=get&slug=gst-reg-01  
GET /library-api?action=search&q=business+license
GET /library-api?action=schema
```

- Uses service role key to read `library_documents`, `library_fields`, `library_attachments`, `library_dependencies`
- Returns JSON with `Content-Type: application/json`
- `verify_jwt = false` (public API)
- CORS enabled for all origins
- Rate-limited by Supabase's built-in limits

### Updated `public/llms.txt`
Will describe the library, its API, example queries, and data model so LLMs that fetch `llms.txt` can understand how to use the library.

### New `public/.well-known/ai-plugin.json`
Standard AI plugin manifest pointing to the OpenAPI spec and describing the service.

### New `public/openapi.yaml`
OpenAPI 3.0 spec documenting all library API endpoints, parameters, and response schemas.

### Config Changes
Add `library-api` to `supabase/config.toml` with `verify_jwt = false`.

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/library-api/index.ts` | Create -- JSON API |
| `supabase/config.toml` | Edit -- add library-api function |
| `public/llms.txt` | Edit -- add library documentation |
| `public/.well-known/ai-plugin.json` | Create -- AI agent manifest |
| `public/openapi.yaml` | Create -- API spec |

## Why This Matters
- **AI agents** (ChatGPT, Claude, custom bots) can query your library via the JSON API
- **Developers** can build integrations using the OpenAPI spec
- **LLMs** that read `llms.txt` will know the library exists and how to query it
- **SEO bots** already see the HTML version; now AI agents get structured data too
- This makes Certifyr's library a **data source**, not just a webpage -- fundamentally different from Google

