

# Organization-Aware Document Filtering and Dropdown Improvements

## Part 1: Dropdown Inputs for Organization Overview

Replace the plain text `<Input>` fields for "Organization Type" and "Organization Size" on the Organization Overview page (`src/pages/Admin.tsx`) with `<Select>` dropdowns, using the exact same options from onboarding:

**Organization Types:** Corporate, Startup, Law Agency, Educational Institute, Other

**Organization Sizes:** 1-10, 10-50, 50-100, 100-1000, 1000-10000, 10000+

---

## Part 2: Document Availability by Organization Type

Here is the proposed document restriction matrix. The key insight: **Educational Institutes** deal with both students AND employees, so they get everything. **Corporates, Startups, and Law Agencies** only have employees -- no student-specific documents.

### All Organization Types (Universal Documents)
| # | Document | Reason |
|---|----------|--------|
| 1 | Bonafide Certificate | Universal (but "Person Type" options vary -- see Part 3) |
| 2 | Character Certificate | Applicable to any individual |
| 3 | Experience Certificate | All orgs have employees |
| 4 | Income Certificate | All orgs have employees |
| 5 | Maternity Leave Application | All orgs have employees |
| 6 | Offer Letter | All orgs hire people |
| 7 | NOC for Visa | All orgs may sponsor travel |
| 8 | Bank Account Verification | All orgs verify employee bank details |
| 9 | Address Proof Certificate | Universal legal document |
| 10 | NDA | All orgs handle confidential info |
| 11 | Employment Agreement | All orgs hire people |
| 12 | Embassy Attestation | Universal travel document |
| 13 | Embassy Attestation Letter | Universal travel document |

### Educational Institute ONLY
| # | Document | Reason |
|---|----------|--------|
| 14 | Transfer Certificate | Student-only (class, roll number, admission number) |
| 15 | Academic Transcript | Student-only (CGPA, semester, grades) |
| 16 | Completion Certificate | Student/course-only (course title, grade, father/mother name) |

### Corporate, Startup, Law Agency ONLY (NOT Educational Institute)
| # | Document | Reason |
|---|----------|--------|
| 17 | Articles of Incorporation | Corporate formation, not relevant to schools |
| 18 | Corporate Bylaws | Corporate governance, not relevant to schools |
| 19 | Founders' Agreement | Startup/corporate founders, not relevant to schools |
| 20 | Stock Purchase Agreement | Share transactions, not relevant to schools |

### "Other" Organization Type
Gets access to ALL 20 documents (no restrictions).

---

## Part 3: Dynamic "Person Type" Field Filtering

For documents with a "Person Type" selector (currently Bonafide Certificate):
- **Educational Institute / Other**: Show both "Student" and "Employee" options
- **Corporate / Startup / Law Agency**: Show only "Employee" (remove "Student" option)

---

## Technical Implementation

### Files to modify:

1. **`src/config/documentConfigs.ts`**
   - Add an `allowedOrgTypes` property to the `DocumentConfig` interface
   - Tag each config with which org types can access it
   - For universal docs, leave `allowedOrgTypes` undefined (means all)
   - Transfer Certificate, Academic Transcript, Completion Certificate: `["Educational Institute", "Other"]`
   - Articles of Incorporation, Corporate Bylaws, Founders' Agreement, Stock Purchase Agreement: `["Corporate", "Startup", "Law Agency", "Other"]`

2. **`src/pages/Admin.tsx`**
   - Replace Organization Type `<Input>` with `<Select>` dropdown using the same `organizationTypes` array from onboarding
   - Replace Organization Size `<Input>` with `<Select>` dropdown using the same `organizationSizes` array from onboarding
   - Update `handleInputChange` to support select value changes for these fields

3. **`src/pages/NewDocuments.tsx`** (or wherever document list is rendered)
   - Filter `documentConfigs` based on the user's `organizationType` from their profile
   - If `allowedOrgTypes` is defined, only show the document if the user's org type is in the list

4. **`src/components/templates/DynamicForm.tsx`** (or equivalent)
   - For the Bonafide "Person Type" field: dynamically filter options based on org type
   - If org type is not "Educational Institute" or "Other", remove the "Student" option

5. **Shared constants file** (extract to `src/lib/defaults.ts` or similar)
   - Export `organizationTypes` and `organizationSizes` arrays so both onboarding and admin pages import from one source

