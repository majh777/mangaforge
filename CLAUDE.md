# CLAUDE.md — MangaForge Build Instructions

## What You're Building
MangaForge — an AI-powered manga/comics creation SaaS platform. Read SPEC.md for the full specification.

## Phase 1 Priority: "The Spark"
Build the following IN ORDER, each must be production-quality:

### 1. Project Setup
- Next.js 15 (App Router) + React 19 + TypeScript strict
- Tailwind CSS 4 with the EXACT design tokens from SPEC.md §1.1
- Framer Motion 11+
- Zustand + TanStack Query
- All fonts loaded: Dela Gothic One, Outfit, DM Sans, Bangers, M PLUS Rounded 1c, JetBrains Mono
- Dark mode as default, light mode variant
- next-intl with English as default (i18n-ready structure)
- ESLint + Prettier configured

### 2. Landing Page — Must Be JAW-DROPPING
This is the first thing users see. It must be the most beautiful landing page they've ever seen for ANY product.
- Full-viewport hero with animated ink-brush logo reveal (Framer Motion)
- Floating ink particle effects (canvas or CSS)
- Parallax scroll sections showing:
  - "How it works" (3-step: Prompt → Forge → Read) with animated illustrations
  - Style showcase carousel (show all 16 comic styles with sample art)
  - Feature highlights with scroll-triggered reveals
  - Pricing tiers (Free/Starter/Pro/Unlimited)
  - "Start Creating" CTA with pulsing sakura-pink glow
- Screentone pattern SVG overlays at low opacity
- Responsive: stunning on mobile AND desktop
- Performance: Lighthouse ≥ 95

### 3. The Genesis Page (Create Flow)
- The prompt textarea with animated neon-cyan border, self-typing placeholder
- Style selector horizontal carousel with parallax tilt cards
- Advanced config collapsible panel (pages/chapter, panels/page, content rating, etc.)
- "Forge My Story" button with ink-splash click animation
- Route: /create

### 4. Synopsis Generation
- Integration with Google Gemini API (use gemini-2.5-flash as our "DeepSeek" stand-in for now)
- Or just use the GEMINI_API_KEY from environment
- 15-30s creation ritual animation (ink coalescing, brush stroke progress bar)
- Synopsis presentation on manuscript-page card
- Actions: Validate / Regenerate / Edit

### 5. Character Generation
- DeepSeek/Gemini generates character profiles
- NanoBanana 2 (Gemini 3.1 Flash Image) generates portraits via API
- Card-flip reveal animation
- Character cards with portraits, bios, role badges
- Relationship web visualization
- Edit/Regenerate/Upload reference actions

## Environment Variables Needed
```
GEMINI_API_KEY=<set in env>
GOOGLE_API_KEY=<set in env>
```

## Design System — CRITICAL
Use these EXACT values from the spec:
- Colors: ink-void #0A0A0F, ink-deep #14141F, sakura-pink #FF6B9D, neon-cyan #00F5FF, etc.
- Fonts: Dela Gothic One (display), Outfit (headings), DM Sans (body)
- Motion: spring physics, ink-drop ripples, brush-stroke underlines
- Atmosphere: screentone SVG overlays, gradient mesh backgrounds, floating particles
- The app must feel like navigating inside a manga universe

## Quality Bar
- 97% quality on EVERYTHING
- TypeScript strict, no `any`
- All components properly typed
- Responsive design (mobile-first)
- Accessibility: proper ARIA, keyboard nav
- Performance: lazy loading, code splitting, optimized images

## DO NOT
- Use placeholder "Lorem ipsum" text
- Use generic UI frameworks (no shadcn defaults without heavy customization)
- Skip animations — they are CORE to the experience
- Use boring grid layouts — asymmetric, dramatic compositions
- Forget dark mode as default
