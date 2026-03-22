# Refactoring & Component Abstraction Issues

## Phase 1: UI Component Library [COMPLETED] (GitHub Issue #42)
- [x] ISSUE-001: Implement `Button.tsx` (variants: primary, secondary, outline, ghost, danger, minimal; sizes: sm, md, lg, xl, full; loading state; icons)
- [x] ISSUE-002: Implement `Input.tsx` (labels, error messages, left/right icons, variants)
- [x] ISSUE-003: Implement `Label.tsx` (required indicator support)
- [x] ISSUE-004: Implement `Textarea.tsx` (styled textarea component)
- [x] ISSUE-005: Implement `Select.tsx` (standard dropdown component)
- [x] ISSUE-006: Implement `Badge.tsx` (status indicators for Published, Draft, Review)
- [x] ISSUE-007: Implement `Card.tsx` (Card, CardHeader, CardContent, CardFooter wrappers)
- [x] ISSUE-008: Implement `LoadingSpinner.tsx` (standardized loading indicator)
- [x] ISSUE-009: Implement `Checkbox.tsx` (custom styled checkbox)
- [x] ISSUE-010: Implement `Skeleton.tsx` (loading placeholders)

## Phase 2: Component Refactoring (Chunking) [IN-PROGRESS] (GitHub Issue #43)
- [x] ISSUE-011: Refactor `ArticlesClient.tsx` (extract `ArticleGeneratorForm`, `ArticleList`, `ArticleRow`)
- [x] ISSUE-012: Refactor `ChatInterface.tsx` (extract `MessageItem`, `ChatInput`)
- [ ] ISSUE-013: Refactor `TemplatesClient.tsx` (extract generator form and list/card components)
- [ ] ISSUE-014: Refactor `OrganizationClient.tsx` (split into Settings, Brand, and User sections)

## Phase 3: State Management Optimization [IN-PROGRESS] (GitHub Issue #44)
- [x] ISSUE-015: Create `useArticlesStore.ts` (centralize article fetching and publishing logic)
- [ ] ISSUE-016: Enhance `useTemplateStore.ts` (move data fetching and template management actions)
- [ ] ISSUE-017: Create `useOrgStore.ts` (centralize organization-wide state and configuration)

## Phase 4: Utilities & Core Logic [COMPLETED] (GitHub Issue #45)
- [x] ISSUE-018: Create `lib/utils.ts` (add `cn` helper and standard formatters)
- [x] ISSUE-019: Create `lib/auth.ts` (add `getAuthToken` and auth helper functions)

## Phase 5: Next.js & Layout Optimizations [PENDING] (GitHub Issue #46)
- [ ] ISSUE-020: Refactor `app/admin/layout.tsx` (modularize header and sidebar)
- [ ] ISSUE-021: Audit and implement granular `loading.tsx` across admin routes
