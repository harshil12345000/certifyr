# Inline Document Editor -- Custom Text and Styling for All Documents

## Overview

Add a lightweight "edit mode" to the document preview that lets organizations add custom text, rephrase existing content, and apply basic styling -- all without touching the underlying template code or layout structure. Think of it like a simple annotation layer on top of the rendered document.

## How It Works

When viewing a document preview, users see a **Pencil icon** button. Clicking it activates edit mode, which:

1. Makes the document body `contentEditable`
2. Shows a compact floating toolbar (pinned above the document) with minimal formatting options
3. Any changes are saved as a `customContent` field inside the existing `form_data` JSONB -- no database schema changes needed

When edit mode is off, the custom HTML is rendered on top of / merged with the base template output. The base layout components remain completely untouched.

## User Experience

```text
Preview Tab (normal)
 [Download PDF]  [Print]  [Save History] [Pencil icon]
  +--------------------------------------------+
  |  Rendered document (read-only view)        |
  +--------------------------------------------+

Preview Tab (edit mode active)
  [Save Edits]  B  I  U  |  Font  |  Size  |  Color (10 swatches)
  +--------------------------------------------+
  |  Document content is now editable          |
  |  User can click anywhere to type,          |
  |  select text and apply formatting,         |
  |  add new paragraphs at the end, etc.       |
  +--------------------------------------------+
```

### Toolbar Options (Minimal)

- **Bold** / **Italic** / **Underline** -- toggle buttons
- **Font family** -- dropdown with 5 options: Default, Arial, Times New Roman, Georgia
- **Font size** -- dropdown: 8px, 10px, 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px
- **Text color** -- 10 preset color swatches (black, dark gray, red, blue, green, orange, purple, brown, pink, navy)

For pencil icon use "pencil_line" lucide icon.

### Key Behaviors

- Clicking the Pencil icon toggles edit mode on
- Clicking "Save Edits" or clicking outside, saves and exits edit mode
- Formatting only applies to selected text (does not affect other content)
- Users can type new text inline, add paragraphs, delete text
- All changes persist via the existing Save Document button into `form_data.customContent`
- When loading from history, `customContent` is restored
- PDF/Print export captures the edited content since it uses the rendered DOM

## Technical Details

### No Database Changes

The `form_data` JSONB column already stores arbitrary data. We add a `customContent` key:

```json
{
  "fullName": "John Doe",
  "parentName": "Richard Roe",
  "customContent": "<div>...edited HTML snapshot of the document body...</div>"
}
```

### Files to Create


| File                                               | Purpose                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/components/templates/DocumentEditToolbar.tsx` | Floating toolbar with Bold/Italic/Underline, font, size, color controls |


### Files to Modify


| File                                                     | Change                                                                                                                                                                  |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/DocumentDetail.tsx`                           | Add edit mode state, Pencil button, wrap preview in editable container, capture edited HTML into formData                                                               |
| `src/components/templates/DynamicPreview.tsx`            | Accept optional `contentEditable` and `customContent` props; when `customContent` exists and not editing, render the saved HTML snapshot instead of the template output |
| `src/components/templates/layouts/CertificateLayout.tsx` | No changes -- base templates stay untouched                                                                                                                             |
| `src/components/templates/layouts/LetterLayout.tsx`      | No changes                                                                                                                                                              |
| `src/components/templates/layouts/AgreementLayout.tsx`   | No changes                                                                                                                                                              |
| `src/components/templates/layouts/TranscriptLayout.tsx`  | No changes                                                                                                                                                              |


### Implementation Approach

**1. `DocumentEditToolbar.tsx` (new component)**

A compact toolbar rendered above the document preview when edit mode is active:

- Uses `document.execCommand()` for formatting (Bold, Italic, Underline, fontSize, foreColor, fontName)
- 10 color swatches rendered as small circles
- Font and size as small `<select>` dropdowns
- Close button (X icon) to exit edit mode

**2. `DocumentDetail.tsx` changes**

- Add `isEditing` state and `editedHtml` state
- Add Pencil icon button in the action bar
- When entering edit mode: capture the current rendered HTML from `previewRef`, set `contentEditable="true"` on the preview container
- When exiting edit mode: read `innerHTML` from the container, store in `formData.customContent`, set `contentEditable="false"`
- The Save Document button already saves `formData` -- so `customContent` persists automatically
- When loading from history with `customContent`, the preview renders the saved snapshot

**3. `DynamicPreview.tsx` changes**

- Accept optional `customContent` prop
- If `customContent` is provided (and not in edit mode), render it via `dangerouslySetInnerHTML` (sanitized with DOMPurify) instead of the template layout
- If no `customContent`, render normally via layout components

**4. Edit mode flow**

```text
User clicks Pencil
  --> isEditing = true
  --> Preview container gets contentEditable="true"
  --> Toolbar appears
  --> User edits text, applies formatting
  --> User clicks Close or Save
  --> innerHTML captured --> stored as formData.customContent
  --> contentEditable removed
  --> Next render uses customContent snapshot
```

### Security

- All user-generated HTML is sanitized through DOMPurify before rendering (already used in the codebase)
- `customContent` is stored in JSONB, never executed server-side
- No new database tables or columns -- no migration needed
- No RLS changes needed

### What Does NOT Change

- Template layout components (Certificate, Letter, Agreement, Transcript) -- completely untouched
- Form fields and form data structure -- only a new optional key added
- PDF/Print export -- works automatically since it captures the rendered DOM
- Document save/load flow -- uses existing `form_data` JSONB
- Employee portal preview -- unaffected (edit mode only available on the main DocumentDetail page)