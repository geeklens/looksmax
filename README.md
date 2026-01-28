# LooksMax - AI Face Rating Platform

LooksMax is a cyberpunk-themed web application that analyzes facial aesthetics using AI. Users can upload photos to receive detailed scores on various facial features (jawline, skin, symmetry, etc.) along with personalized recommendations.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS v4 (Cyberpunk Theme)
- **UI Components**: shadcn/ui
- **AI**: Pluggable architecture (Mock / OpenAI)

## ✨ Features

- **AI Analysis**: Instant scoring of facial features.
- **History**: Track your ratings over time.
- **Admin Dashboard**: Manage users and view all ratings.
- **Secure Auth**: Email/Password authentication with Supabase.
- **Cyberpunk UI**: Modern, square-edged, neon-aesthetic design.
- **Responsive**: Fully optimized for mobile and desktop.

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase Account

### 2. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
AI_MODE=mock # or 'openai'
```

### 3. Database Setup (Supabase)

Run the SQL script located in `supabase/schema.sql` in your Supabase SQL Editor. This will:

- Create `photos` and `ratings` tables.
- Enable Row Level Security (RLS).
- Set up Storage policies.

### 4. Auth Settings (Critical)

1.  Go to Supabase Dashboard -> Authentication -> Providers -> Email.
2.  **Disable "Confirm email"** for instant development login.
3.  If enabled, add `http://localhost:3000/auth/callback` to Redirect URLs.

### 5. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🦾 AI Logic

For a detailed explanation of how the face analysis works, see [ABOUT_AI.md](./ABOUT_AI.md).
