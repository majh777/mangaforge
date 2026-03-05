# MangaForge Full Frontend Redesign Brief

## REBRAND
The product is now called **InkForge** (MangaForge domain is taken).
- Update ALL references from "MangaForge" to "InkForge" throughout the codebase
- Tagline: "Where Stories Become Art" 
- Keep the manga/comic creation focus

## DESIGN VISION: Premium Web 3.0 Aesthetic

### Visual Identity
- **Dark theme** as primary (deep blacks #050507, rich charcoals #0D0D12)
- **Glassmorphism** everywhere: frosted glass cards, backdrop-blur, subtle transparency
- **Gradient accents**: Electric violet (#7C3AED) → Hot pink (#EC4899) → Cyan (#06B6D4) 
- **Mesh gradients** as background elements (like Linear, Vercel, Stripe)
- **Grain/noise texture** overlay for depth (subtle, 2-3% opacity)
- **Glow effects**: Soft neon glows on interactive elements, buttons pulse subtly
- **Typography**: Use the existing fonts but with much better hierarchy. Giant bold hero text, thin elegant body text
- **Micro-animations**: Everything should feel alive — hover states, scroll reveals, parallax layers
- **Cursor effects**: Custom cursor or subtle trail effect on landing page

### Landing Page (page.tsx) — COMPLETE REWRITE
1. **Hero section**: 
   - Full-viewport with animated mesh gradient background
   - Giant "InkForge" with animated gradient text
   - Subtitle with typewriter effect
   - CTA button with glow pulse
   - Floating 3D manga panels/cards that rotate on mouse move (parallax)
   - Live counter showing "X stories forged" with animated numbers
   
2. **How It Works** (4 steps with animated icons):
   - Glass cards with hover tilt effect (CSS perspective transform)
   - Step connector lines that animate on scroll
   - Each card has a subtle gradient border
   
3. **Style Showcase**: 
   - Horizontal scroll carousel with momentum
   - Each style card shows a sample panel with the style applied
   - Cards expand on hover showing details
   
4. **Features Grid**:
   - Bento grid layout (like Apple's product pages)
   - Mix of large and small cards
   - Some cards have animated illustrations
   - Glass effect with gradient borders
   
5. **Social Proof / Testimonials**:
   - Infinite horizontal scroll marquee
   - Avatar + quote + rating
   - Glass cards
   
6. **Pricing Section**:
   - 3-4 tier cards with glassmorphism
   - "Most Popular" badge with glow
   - Animated gradient borders on hover
   - Feature comparison with check/x marks
   
7. **Final CTA**:
   - Large gradient text
   - Animated background particles
   - Single prominent button

### Create Page (create/page.tsx) — PREMIUM UPGRADE
- Keep the flow but make it feel like a luxury experience
- Prompt textarea with glowing border on focus
- Style selector as premium glass cards in a grid (not basic carousel)
- Each style card should have a sample image, not just emoji
- Advanced settings in a sleek collapsible panel
- "Forge" button should be dramatic — large, glowing, animated

### Synopsis Page (create/synopsis/page.tsx)
- Keep the generation animation but make it more premium
- Use orbiting particles instead of simple spinning circles
- Result card should be a beautiful manuscript-style glass card
- Better typography for the synopsis text

### Characters Page (create/characters/page.tsx)
- Character cards with glassmorphism
- Portrait placeholders with gradient shimmer loading states
- Elegant grid layout

### Chapter Page (create/chapter/page.tsx)
- Page-by-page viewer with smooth transitions
- Panel zoom on click
- Dark mode optimized reader

### Navigation
- Floating glass navbar with blur
- Subtle border-bottom glow
- Logo with gradient
- User avatar/credits display
- Mobile: slide-in glass panel

### Settings/Store/Library/Chat Pages
- Consistent glass card design language
- Smooth page transitions
- Loading skeletons with shimmer effect

## TECHNICAL REQUIREMENTS
- Pure CSS animations where possible (avoid heavy JS animation libraries for perf)
- Use Framer Motion ONLY where CSS can't achieve the effect
- Tailwind CSS for all styling
- Mobile-responsive (mobile-first for key pages)
- Keep all existing API routes unchanged
- Keep the existing lib/ai.ts and lib/styles.ts mostly intact
- Maintain the same page routing structure
- All images/assets should use next/image when possible
- Target Lighthouse score > 90

## FILES TO MODIFY
- src/app/page.tsx (landing - FULL REWRITE)
- src/app/layout.tsx (update branding)
- src/app/globals.css (new design tokens, animations, glass effects)
- src/app/create/page.tsx (premium upgrade)
- src/app/create/synopsis/page.tsx (premium upgrade)
- src/app/create/characters/page.tsx (premium upgrade)
- src/app/create/chapter/page.tsx (premium upgrade)
- src/app/settings/page.tsx (rebrand + glass design)
- src/app/store/page.tsx (rebrand + glass design)
- src/app/library/page.tsx (rebrand + glass design)
- src/app/chat/page.tsx (rebrand + glass design)
- src/app/read/page.tsx (rebrand + glass design)
- src/components/navigation.tsx (glass navbar)
- src/components/providers.tsx (if needed)
- src/components/error-boundary.tsx (rebrand)
- Any new components needed

## REFERENCE SITES FOR INSPIRATION
- linear.app (glassmorphism, gradients, premium feel)
- vercel.com (dark theme, mesh gradients, clean typography)
- stripe.com (gradient cards, animations)
- midjourney.com (AI creative tool aesthetic)
- udio.com (AI creation platform)

## DO NOT CHANGE
- src/app/api/* (all API routes stay the same)
- src/lib/ai.ts (AI config stays)
- src/lib/styles.ts (style definitions stay)
- package.json dependencies (use what's already installed)
- Vercel deployment config
