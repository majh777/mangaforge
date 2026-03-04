# MANGAFORGE — Full-Stack AI Manga Creation Platform

## Master Build Specification v2.0

-----

## 0. PREAMBLE & PHILOSOPHY

You are building MangaForge — a next-generation AI-powered manga and comics creation platform that transcends anything currently available. This is not a toy demo. This is a production-grade, visually breathtaking, commercially viable SaaS platform where users create, read, buy, and sell AI-generated manga, comics, manhwa, manhua, webtoons, and graphic novels.

Core Philosophy:

- Every pixel must be intentional. The platform itself should feel like opening a beautifully crafted manga volume.
- The UX must feel like magic — complex AI orchestration hidden behind effortless simplicity.
- The platform is a living creative universe, not a static tool. Characters breathe, stories evolve, and the community thrives.
- Performance is non-negotiable. Perceived speed through brilliant loading states, progressive rendering, and anticipatory UI.
- The reader must be unable to stop. Every chapter must end with the user *needing* to know what happens next. The platform is engineered for compulsive engagement — not through manipulative dark patterns, but through genuinely irresistible storytelling. The hidden arc engine plants hooks, cliffhangers, revelations, and emotional gut-punches at chapter boundaries with the precision of a master serialist.
- Credits flow naturally, never abruptly. Every action that consumes credits does so transparently but smoothly. The 50% markup over platform costs is maintained invisibly.

-----

## 1. VISUAL IDENTITY & DESIGN SYSTEM

### 1.1 Aesthetic Direction

Theme: "Ink & Light" — A fusion of traditional manga craftsmanship with futuristic luminescence.

Color System:
```css
/* Dark Mode (Primary) */
--ink-void: #0A0A0F;
--ink-deep: #14141F;
--ink-wash: #1E1E2E;
--ink-mid: #2A2A3E;
--ink-light: #8888AA;
--paper-warm: #F5F0E8;
--paper-pure: #FFFFFF;
--sakura-pink: #FF6B9D;
--sakura-soft: #FF8DB5;
--neon-cyan: #00F5FF;
--neon-cyan-glow: rgba(0,245,255,0.15);
--gold-premium: #FFD700;
--manga-red: #E63946;
--forest-green: #2ECC71;

/* Light Mode */
--light-bg: #FAF8F5;
--light-surface: #FFFFFF;
--light-border: #E8E4DE;
--light-text: #1A1A2E;
--light-muted: #7A7A8E;
```

Typography:
- Display / Logo: "Dela Gothic One" paired with custom wordmark
- Headings: "Outfit" (alt: "Space Grotesk" / "Sora")
- Body: "DM Sans"
- Manga Dialogue: "Bangers" (Western), "M PLUS Rounded 1c" (manga), "Patrick Hand" (indie)
- Monospace: "JetBrains Mono"
- Dynamic font swap based on comic style

Motion & Animation:
- Page transitions: CSS 3D page-turn animations
- Loading: Animated ink-brush strokes, manga speed-lines, chibi characters
- Micro-interactions: Ink-drop button ripples, parallax hover, brush-stroke underlines
- Generation progress: "Creation ritual" — ink splashes coalescing, shōnen power-up sequence
- Framer Motion for orchestrated animations, spring physics
- Scroll-triggered reveals via Intersection Observer
- Horizontal swipe (mobile) / scroll (desktop) with snap points for chapter reading

Spatial Design:
- Generous whitespace
- Glassmorphism cards with ink-wash borders
- Layered depth: floating ink particles, gradient meshes, foreground interactives
- Asymmetric grid layouts for store/library (hero-sized featured cards)

Background & Atmosphere:
- Subtle animated SVG screentone overlays (low opacity, parallax scroll)
- Morphing gradient mesh backgrounds
- Floating particles (ink droplets, cherry blossoms) — CSS-only or lightweight canvas
- Per-style atmospheric themes (Shōnen → reds/oranges, Josei → pastels)

-----

## 2. APPLICATION ARCHITECTURE

### 2.1 Tech Stack

Frontend:
- Next.js 15+ (App Router) + React 19+
- Tailwind CSS 4+ with custom design tokens + CSS Modules
- Framer Motion 11+ / GSAP for scroll animations
- Zustand (global state) + TanStack Query (server state)
- Socket.io for live generation progress, chat, collab
- Three.js (optional 3D book-flip), Canvas API (particles)
- next-intl with RTL support, dynamic font loading per locale

Backend:
- Node.js 22+ / Bun
- tRPC or GraphQL (Pothos + Yoga)
- PostgreSQL 16+ (Supabase/Neon), Redis (caching, rate limiting, queues)
- Cloudflare R2 / AWS S3 for images/exports
- BullMQ for AI generation job queues
- Clerk or NextAuth.js v5 (OAuth: Google, Apple, Discord, X + email + magic links)
- Stripe (subscriptions + credits) + Stripe Connect (creator payouts)

AI Integration Layer:
- Dedicated edge functions for AI orchestration
- Circuit breaker pattern (fallback on provider down)
- Priority queues (subscribers first)
- Semantic similarity caching for similar prompts
- Real-time cost tracking per user with budget enforcement

### 2.2 AI Model Routing

| Function | Primary Model | Fallback | Notes |
|---|---|---|---|
| Story/plot architecture | DeepSeek V3.2 | Claude Sonnet 4.5 | JSON schema enforcement |
| Character bios/personality | DeepSeek V3.2 | Claude Sonnet 4.5 | 10-model psych framework |
| Dialogue & narration | DeepSeek V3.2 | — | Genre-matched style |
| Panel layout & composition | DeepSeek V3.2 | — | Narrative → visual direction |
| Character chat (SFW) | DeepSeek V3.2 | — | Smart context compaction |
| Character chat (NSFW-flagged) | Grok 4.1 Fast | — | Content-policy routing |
| **All image generation** | **NanoBanana 2** | Stable Diffusion 3.5 | Style-specific prompts per genre |
| Translation | DeepSeek V3.2 | Google Translate API | |
| Content moderation | OpenAI Moderation API | Custom classifier | Pre-screen all I/O |

### 2.3 Database Schema (Core Entities)

```
Users
├── id, email, username, display_name, avatar_url
├── locale, subscription_tier (free|starter|pro|unlimited)
├── credit_balance (atomic ops only)
├── created_at, updated_at
│
├── Library → Projects
│   ├── title, synopsis, genre, comic_style
│   ├── language, status (draft|published|archived)
│   ├── overarching_arc (JSON, HIDDEN)
│   ├── arc_structure (JSON: arcs→volumes→chapters)
│   ├── pages_per_chapter, panels_per_page
│   │
│   ├── Characters
│   │   ├── name, role, bio_short, bio_full
│   │   ├── personality_matrix (JSON, 10-model)
│   │   ├── visual_description, reference_images[]
│   │   ├── memory_log, relationships[]
│   │
│   ├── Chapters
│   │   ├── chapter_number, volume_number, arc_number
│   │   ├── title, summary, narrative_script
│   │   ├── status (generating|draft|final|published)
│   │   │
│   │   └── Pages
│   │       ├── page_number, panel_layout (JSON)
│   │       ├── panels[] (JSON), image_url
│   │       ├── image_variants[], status
│   │
│   └── ChatSessions (per character)
│
├── Store Listings
│   ├── project_id, listing_type, price_credits
│   ├── preview_pages, featured, rating, sales_count
│
└── Transactions
    ├── type, amount_credits, amount_usd
    ├── commission_rate (0.30), creator_payout
```

-----

## 3. USER FLOW — COMPLETE CREATION PIPELINE

### 3.0 Onboarding

1. Splash: Full-viewport ink-brush animation → logo → dissolve to app (3-4s, skippable)
2. Language selection (FIRST interactive element):
   - Cards with native script + English subtitle
   - Languages: EN, 日本語, 한국어, 中文(S), 中文(T), FR, ES, PT, DE, IT, العربية, हिन्दी, Bahasa ID, Tiếng Việt, ไทย, Русский
   - Persistent globe switcher in top nav
   - Language detection cascade: explicit dropdown > prompt language > auto-detect > fallback EN
3. Quick tutorial: 4-panel manga strip explaining MangaForge (meta, dismissible)

### 3.1 The Genesis Page (Creation Prompt)

A) Prompt Input (Hero):
- Large textarea with --neon-cyan animated glow on focus
- Self-typing placeholder cycling through inspirational examples (localized)
- Voice input option
- Rich multi-paragraph support

B) Style Selector ("Choose Your Canvas"):
- Horizontal carousel of visual cards with parallax tilt hover
- Ink-splash selection animation + atmospheric theme shift

Supported Styles (16 total):
| Style | Reading Dir | Pages/Ch | Panels/Page |
|---|---|---|---|
| Shōnen Manga | RTL | 18-22 | 5-7 |
| Shōjo Manga | RTL | 16-20 | 4-6 |
| Seinen Manga | RTL | 20-24 | 5-8 |
| Josei Manga | RTL | 16-20 | 4-6 |
| Kodomomuke | RTL | 12-16 | 4-5 |
| Korean Manhwa | Vertical | 60-80 panels | 1-2 |
| Chinese Manhua | LTR | 20-30 | 4-6 |
| Webtoon (Generic) | Vertical | 50-70 panels | 1-2 |
| American Superhero | LTR | 20-24 | 5-7 |
| American Indie | LTR | 22-28 | 4-6 |
| Franco-Belgian BD | LTR | 44-48 | 8-12 |
| Noir / Crime | LTR | 20-24 | 4-6 |
| 4-Koma / Chibi Gag | TTB | 8-12 strips | 4 fixed |
| Horror Manga | RTL | 18-24 | 5-8 |
| Watercolor / Painterly | LTR | 16-24 | 3-5 |
| Pixel Art / Retro | LTR | 16-20 | 4-6 |

C) Advanced Config (collapsible):
- Pages/chapter, panels/page, chapters/volume, target total chapters
- Content rating (G/PG/PG-13/R/Mature)
- Art detail (Standard/High/Ultra)
- Color mode (Full/Grayscale/B&W/Duotone)
- Reading direction override

D) "Forge My Story" button:
- Pulsing sakura-pink glow
- Click: ink splash eruption → prompt dissolves into particles → loading state

### 3.2 Synopsis Generation ("The Blueprint")

Backend (parallel):
1. Synopsis: title (+ alternatives), logline, genre tags, 3-5 para synopsis, tone/themes, setting
2. HIDDEN overarching arc: full story bible, arc structure, plot points/twists, character trajectories, foreshadowing seeds, chapter-end hook map, revelation schedule, emotional rhythm map

UX:
- 15-30s creation ritual animation (3 stages + progress brush stroke + rotating tips + mini-game)
- Synopsis on "manuscript page" card with dramatic reveal
- Actions: Validate / Regenerate / Edit / Adjust Prompt

### 3.3 Character Generation ("The Cast")

Backend:
- Per character: name, role, age, physical desc, bios, personality matrix (10 models), visual prompt, voice/speech patterns, relationships, arc trajectory (hidden)
- NanoBanana 2 generates portraits per style

UX:
- Card-flip reveal animation
- Character cards: portrait (60%), name, role badge, bios
- Interactive relationship web (D3.js)
- Actions: Edit bio, Regenerate image (4 variants), Upload reference, Regenerate character, Add/Remove
- Must have ≥1 protagonist + 1 other to proceed

### 3.4 Chapter Generation ("The Forge")

Backend pipeline:
1. Narrative script (DeepSeek) → page-by-page JSON with panels, dialogue, SFX, narration
2. Panel prompt engineering → NB2-optimized prompts per panel
3. Page generation (NB2) → ONE PAGE AT A TIME, sequential, streamed to user
4. Text overlay → programmatic speech bubble rendering (not AI text)

UX:
- Chapter canvas with placeholder silhouettes
- Real-time page-by-page reveal with creation ritual per page
- Progress: "Page 3 of 18 generating…"
- Scroll up to review while generating continues
- Waiting entertainment: Doodle pad, Story recap, Character trivia, Character chat, Achievements, Gen stats, Ambient soundscapes, Mini-games
- Post-gen: Read mode, Regenerate chapter/page (4 variants), Remix style, Translate, Export (PDF/CBZ/PNG)
- Volume/arc boundary celebrations

### 3.5 The Narrative Hook Engine ("One More Chapter")

#### Hook Taxonomy (10 types):
1. The Cliffhanger — action frozen mid-beat
2. The Revelation — truth bomb in final panel
3. The Arrival — new threat appears
4. The Question — unanswerable question posed
5. The Emotional Gut-Punch — devastating emotional moment
6. The Escalation — stakes multiply massively
7. The Promise — character vows with consequences
8. The Inversion — everything flipped
9. The Forbidden Door — threshold about to be crossed, chapter ends
10. The Mirror — echoes early scene with devastating new context

Escalation rules:
- Ch 1-3: Light hooks (Question, Promise, Arrival)
- Mid-arc: Cliffhangers, Revelations, Gut-Punches
- Arc-end: Escalation or Inversion
- Volume-end: Combined hooks (Revelation + Cliffhanger)
- Never same hook twice in a row

#### End-of-Chapter UX:
1. Final page lingers (3-5s) with slow zoom, UI fades, audio shifts
2. Black beat (1-2s) — processing pause
3. Hook Amplifier Panel:
   - "Chapter N Complete" badge
   - Tease line (AI-generated, cryptic, tantalizing)
   - Character reaction vignettes (2-3 portraits + in-character quotes)
   - "Forge Chapter N+1" button (pulsing sakura glow, credit cost shown)
   - Low credits: amber warning
   - No credits: inline purchase flow (never dead end)
   - Secondary: Re-read, Chat with character, Share, View character updates

-----

## 4. ADDITIONAL PLATFORM FEATURES (v2.0 EXPANSION)

### 4.1 The Store & Marketplace

- Browse/search/filter published works by genre, style, rating, popularity
- Creator storefronts with analytics dashboard
- Revenue split: 70% creator / 30% platform
- Featured/trending algorithms based on engagement metrics
- Preview system: first N pages free, paywall after
- Bundle pricing for volumes/complete series
- Gift credits system
- Wishlist + notifications for new chapters from followed creators

### 4.2 Social & Community

- User profiles with reading history, favorites, created works
- Follow creators, get notifications on new chapters
- Comments on chapters (threaded, with spoiler tags)
- Reactions on individual pages/panels (emoji reactions positioned on the page)
- Reading clubs / group reads with synchronized chapter unlocks
- Creator collaboration: invite co-creators to a project (shared editing)
- Community challenges: weekly prompt contests, style jams

### 4.3 The Library

- Personal collection of all created + purchased works
- Beautiful bookshelf UI (3D optional) with spine/cover display
- Sort/filter by genre, status, reading progress
- "Continue Reading" hero section
- Import/export library data
- Offline reading mode (PWA with cached pages)

### 4.4 Character Chat System (§6 reference)

- Talk to any character from any project
- 10-model personality matrix ensures consistent, deep characterization:
  1. Big Five (OCEAN)
  2. MBTI type
  3. Enneagram
  4. Attachment style
  5. Love language
  6. Defense mechanisms
  7. Moral alignment (D&D grid)
  8. Maslow hierarchy position
  9. Shadow archetype (Jung)
  10. Communication style
- Context-aware: character knows the story events up to the reader's current chapter
- Memory compaction for long conversations
- Voice synthesis option (future: per-character voice)
- Chat history persists across sessions
- "In-character" vs "meta" mode (talk to the character vs talk about the character)

### 4.5 Advanced Creator Tools

- Panel editor: drag-and-drop panel layout designer
- Dialogue editor: rewrite/rephrase speech bubbles with live preview
- Style mixer: blend two styles (e.g., 70% Seinen + 30% Noir)
- Consistency checker: AI reviews character appearance consistency across pages
- Pacing analyzer: visualizes chapter pacing (dialogue density, action ratio, emotional beats)
- Cover generator: dedicated cover/title page generator with typography
- Print-ready export with proper bleed, trim marks, CMYK conversion

### 4.6 Analytics & Insights (Creators)

- Read completion rates per chapter
- Drop-off points (which page do readers stop?)
- Engagement heatmaps (which panels get most reactions)
- Revenue tracking with projections
- Audience demographics
- A/B testing: generate two versions of a chapter ending, measure which drives more "next chapter" clicks

### 4.7 API & Integrations

- Public API for programmatic manga generation
- Webhook support for generation completion
- Discord bot: generate manga pages directly in Discord
- Telegram bot: same for Telegram
- WordPress plugin: embed manga reader
- Export to Kindle Direct Publishing format
- Export to Tapas/Webtoon submission format

### 4.8 Subscription Tiers

| Tier | Price | Credits/mo | Features |
|---|---|---|---|
| Free | $0 | 20 | 1 project, watermarked, no store |
| Starter | $9.99/mo | 100 | 3 projects, no watermark, store access |
| Pro | $24.99/mo | 300 | Unlimited projects, priority queue, all styles, analytics |
| Unlimited | $49.99/mo | 1000 | Everything + API access, white-label export, bulk generation |

Credit costs:
- Synopsis generation: 1 credit
- Character generation (4 variants): 2 credits
- Chapter (20 pages): 8 credits
- Page regeneration: 1 credit
- Style remix (full chapter): 6 credits
- Translation: 2 credits
- Character chat: 0.1 credits/message

### 4.9 Engagement Reinforcement Systems (§3.5.3)

A) **The Story Pulse** (persistent bottom-right widget):
- Current chapter position: "Chapter 4 of ~12 — Act II: Rising Storm"
- Arc progress bar with named milestones
- Vague next-event hint: "Next major event in ~2 chapters"
- Creates progression pull — user sees they're building toward something

B) **Character Status Board** (library/dashboard):
- Per-character dynamic one-liners updated after each chapter:
  - "[Protagonist]: Recovering from battle. Trust shaken."
  - "[Ally]: Hiding something important. Growing distant."
  - "[Antagonist]: Plans accelerating. Confidence rising."
- Makes characters feel alive between sessions

C) **Return Notifications** (PWA push + email):
- After 24h+ inactivity mid-arc:
  - Push: "[Character] is waiting. The story isn't over yet."
  - Email: Final panel + tease line + "Continue Creating" CTA
- Always dynamically generated from actual story context, never generic

D) **Streak & Momentum Tracking**:
- Creation Streak (🔥 x N days)
- Binge Milestone (3+ chapters/session → celebration + 5 bonus credits)
- Story Milestones at narrative inflection points (end of Act I, midpoint twist, climax)

E) **"Previously On…" Recaps**:
- On return after any gap: 3-5 panel visual summary of last chapter
- Ends with the cliffhanger moment to re-ignite emotional state
- Auto-generated by AI from chapter summary, dismissible

F) **Social Proof & Discovery**:
- "🌟 X creators are writing [genre] manga right now"
- "Your story is N chapters — top X% of MangaForge creators!"

### 4.10 Credit Depletion — The Soft Upsell (§3.5.4)

**NEVER a hard wall.** When credits are insufficient:
1. Button shifts to gold, text becomes "Forge Chapter N+1 — Get Credits"
2. Inline panel slides in (NOT a modal/popup) showing:
   - Current balance + cost of next chapter
   - The tease line (keep emotional pressure warm)
   - Quick-buy options:
     - "⚡ 10 credits — $1.99" (just enough for this chapter + a little extra)
     - "⚡ 50 credits — $7.99" (best value for a binge session)
     - "Upgrade to Pro — $24.99/mo for 300 credits" (if on Free/Starter)
   - One-click Stripe Checkout (saved payment method if returning user)
3. After purchase: auto-resume generation with zero navigation. The story continues seamlessly.

-----

## 5. DEPLOYMENT & INFRASTRUCTURE

- Vercel for frontend (edge functions, ISR)
- Railway or Fly.io for backend services
- Supabase for PostgreSQL + auth + realtime
- Cloudflare R2 for image storage (cheaper than S3)
- Redis Cloud for caching/queues
- Stripe for payments
- Sentry for error tracking
- PostHog for analytics
- GitHub Actions for CI/CD

-----

## 6. MVP BUILD ORDER

Phase 1 — "The Spark" (Week 1-2):
1. Project scaffolding (Next.js 15 + Tailwind + design system)
2. Landing page with full visual identity
3. Auth system (Clerk)
4. The Genesis Page (prompt + style selector)
5. Synopsis generation (DeepSeek integration)
6. Character generation (DeepSeek + NB2 portraits)

Phase 2 — "The Flame" (Week 3-4):
7. Chapter generation pipeline (DeepSeek + NB2 page-by-page)
8. Chapter reader (style-appropriate reading modes)
9. Text overlay system (programmatic speech bubbles)
10. Hook engine (end-of-chapter experience)
11. Library system

Phase 3 — "The Inferno" (Week 5-6):
12. Credit system + Stripe integration
13. Store/marketplace
14. Character chat
15. Export system (PDF/CBZ)
16. Social features (follows, comments, reactions)

Phase 4 — "The Universe" (Week 7-8):
17. Advanced creator tools
18. Analytics
19. API
20. Mobile optimization
21. Performance tuning + launch prep

-----

## 7. QUALITY BAR

- 97% quality standard on EVERYTHING
- Adversarial testing at all levels
- Lighthouse score ≥ 95 on all metrics
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Accessibility: WCAG 2.1 AA minimum
- i18n: All UI strings externalized, RTL tested
- Security: OWASP Top 10 mitigated, rate limiting, input sanitization
- Load testing: Handle 1000 concurrent generation jobs

-----

*Built by Palabre.ai — Where Stories Come Alive*
