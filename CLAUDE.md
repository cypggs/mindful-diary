# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mindful Diary is a personal journaling application built with Next.js 14 (App Router), Supabase for backend, and Tailwind CSS. The app allows users to record diary entries with mood indicators and search through their journal history. It's deployed on Vercel with automatic deployments on push to main.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Lint code
npm run lint

# Deploy to Vercel (automatic on git push to main)
vercel --prod
```

## Environment Variables

Required in `.env.local` (never commit this file):

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

These must also be configured in Vercel for production deployments.

## Architecture

### Authentication Flow

1. **Entry Point** (`app/page.tsx`): Checks session state and redirects to `/dashboard` (authenticated) or `/login` (unauthenticated)
2. **Login/Signup** (`app/login/page.tsx` → `components/AuthForm.tsx`): Email/password authentication with Supabase Auth
3. **Email Verification** (`app/auth/callback/page.tsx`): Handles email confirmation callbacks from Supabase, includes error handling for expired links
4. **Protected Routes** (`app/dashboard/page.tsx`): Checks session in `useEffect`, redirects to `/login` if not authenticated

### Database Schema

Table: `diary_entries`
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `content` (text) - diary entry content
- `mood` (text) - one of: 'happy', 'calm', 'sad', 'excited', 'thoughtful', 'grateful', or null
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Important**: The table is named `diary_entries` (not `notes`). Row Level Security (RLS) is enabled - users can only access their own entries.

### Component Architecture

**Page Components** (`app/`):
- `page.tsx` - Root redirect handler
- `login/page.tsx` - Authentication page wrapper
- `dashboard/page.tsx` - Main app interface (state management, data fetching)
- `auth/callback/page.tsx` - Email verification handler with retry/error states

**Feature Components** (`components/`):
- `AuthForm.tsx` - Handles login/signup flow, email resend functionality
- `NoteEditor.tsx` - Diary entry creation with mood selection
- `NoteList.tsx` - Grid/list display of diary entries
- `NoteCard.tsx` - Individual diary entry card with delete functionality and timestamp display
- `SearchBar.tsx` - Search input for filtering entries

### Data Flow Pattern

1. `dashboard/page.tsx` manages global state (notes array, loading state, search query)
2. `fetchNotes()` function retrieves all entries for current user
3. `useMemo` for filtered notes based on search query
4. Child components receive `onSave`/`onUpdate`/`onDelete` callbacks to trigger `fetchNotes()`
5. Components directly call Supabase client for mutations (insert/delete)

### Supabase Client Setup

Single client instance in `lib/supabase.ts`:
- Created with `createClient()` using public env vars
- Safe for client-side use (RLS enforces security)
- Export `Note` type for type safety across components

### Styling Conventions

- **Framework**: Tailwind CSS with custom animations
- **Dark Mode**: Uses Tailwind's `dark:` variant (follows system preference)
- **Custom Animations** (defined in `tailwind.config.ts`):
  - `animate-fade-in` - smooth opacity transition
  - `animate-slide-up` - upward motion with fade
- **Text Overflow Handling**: Use `break-words overflow-wrap-anywhere` for long content (URLs, etc.)
- **Color Scheme**: Blue/indigo primary, gradient backgrounds

### Common Patterns

**Authentication Check**:
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  router.push('/login');
  return;
}
```

**Inserting Diary Entry**:
```typescript
const { data: { user } } = await supabase.auth.getUser();
const { error } = await supabase
  .from('diary_entries')
  .insert([{ user_id: user.id, content, mood }]);
```

**Mood Configuration**:
Moods are defined in `NoteEditor.tsx` with emoji mappings. The same mappings should be used in `NoteCard.tsx` for consistency.

## Important Implementation Notes

### Text Overflow Prevention
Long text (especially URLs) must use `break-words overflow-wrap-anywhere` CSS classes to prevent overflow from card boundaries. This is critical for maintaining UI integrity.

### Email Confirmation Flow
- Supabase sends confirmation emails on signup
- Callback URL must be `${window.location.origin}/auth/callback`
- Handle expired links gracefully in callback page
- Show "Resend Email" option after signup

### Timestamp Display
`NoteCard.tsx` displays both:
- Relative time (e.g., "2小时前", "昨天") in header
- Full timestamp (e.g., "2025/11/09 21:18:10") with calendar emoji
Use `toLocaleString('zh-CN', ...)` for consistent Chinese formatting

### Search Implementation
Search is client-side using `useMemo` in dashboard page. Filters notes by content (case-insensitive). This is acceptable for personal journaling apps with limited entries per user.

## Deployment

**Platform**: Vercel
**Team**: cypggs-projects
**Auto-deploy**: Enabled on `main` branch
**Domain**: `https://mindful-diary-9mtcencz1-cypggs-projects.vercel.app`
**GitHub**: `https://github.com/cypggs/mindful-diary`

When making changes:
1. Test locally with `npm run dev`
2. Verify build succeeds with `npm run build`
3. Commit and push to `main` branch
4. Vercel automatically deploys
5. Verify production deployment

## Internationalization

The app is Chinese-language focused:
- All UI text is in Chinese
- Use `lang="zh-CN"` in HTML
- Date/time formatting uses `'zh-CN'` locale
- Error messages and placeholders in Chinese

## Future Development Considerations

- Consider server-side search if entry count grows significantly
- Implement edit functionality for existing entries (currently only create/delete)
- Add export functionality (PDF, JSON)
- Consider implementing tags/categories beyond moods
- Add rich text editor for formatting
- Implement image attachments using Supabase Storage
