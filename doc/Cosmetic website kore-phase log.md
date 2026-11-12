Cosmetic Website Korea – Phase Log
This is the single source of truth for the project's progress. At the end of every phase, a new section is added at the bottom. If a new chat is started, paste this document's link first so the full context can be rebuilt.
1. Stable project facts
Item
Value
Goal
Korean e-commerce demo site modeled on bellamaru.com; handed over to a Korean client with a business licence later
Local folder
D:\Cosmetic website korea\cosmetic-website
GitHub
https://github.com/faysalclaude/cosmetic-website (branches: main, dev)
Hosting
Vercel (auto deploy from GitHub)
Stack
Next.js 16.4.6 (App Router, Turbopack), React, TypeScript, Tailwind CSS v4, next-intl, Zustand, Framer Motion, Lenis, Supabase (planned), PortOne V2 (planned)
Languages
Korean default at /, English at /en. Code, comments and DB are English
Owner's language
Bangla (often typed in Latin letters). Replies are written in Bangla
Dev machine
Windows, PowerShell, VS Code, Node 24, Git 2.55
Payments
Bank transfer, Toss Pay, Kakao Pay, Naver Pay via PortOne test mode now; client's keys at handover
Business info
Demo placeholders in src/lib/site.ts; the client supplies the real licence data at handover
Brand colour
Rose #c2557a is an assumption. The real Bellamaru colours could not be read from the site. All colours live as tokens in src/app/globals.css so one edit re-themes the site
Working rules
• Next.js 16 uses src/proxy.ts (not middleware.ts).
• Files with brackets need -LiteralPath in PowerShell, for example src\app\[locale].
• JSX files must end in .tsx.
• Code goes into VS Code files. Only commands go into the terminal.
• At the end of each phase: commit on dev, push, then append that phase to this log.
2. Roadmap v2 (replaces the phase list in the first workflow document)
Phase
Content
Status
0
Setup: Next.js, i18n (ko/en), GitHub, Vercel
Done
1
Design tokens, header, footer, cart drawer, home page
Done
1.5
Smooth scroll, reveal animation, scroll-driven video engine
Delivered, kept for the optional AI-video add-on
2
Template Showcase engine and Studio prototype: photo, background removal, auto animation, preview, approve
In progress
3
Design v2: professional redesign with structure changes, brand colour care
Planned
4
Supabase, product catalogue, list and detail pages with showcase
Planned
5
Authentication, login logs, My Page
Planned
6
Checkout, orders, PortOne payments
Planned
7
Admin panel and the Studio wired to storage (upload, approve, publish)
Planned
8
Blog, static pages, SEO, QA, launch
Planned
Optional
AI image-to-video add-on (external API, admin approval before publish)
Planned
Risk: the full scope is larger than seven working days. If time runs short, cut in this order: AI video add-on, Blog CRUD, Naver Pay, email notifications.
3. Phase 0 – Setup (Done)
What was done
• Created the Next.js project with TypeScript, Tailwind, ESLint, App Router and the src directory.
• Installed next-intl, zustand, zod, react-hook-form, @hookform/resolvers, @supabase/supabase-js, @supabase/ssr, lucide-react, clsx, plus prettier and its Tailwind plugin.
• i18n: src/i18n/routing.ts, navigation.ts, request.ts; src/proxy.ts handles locale routing; Korean is the default with no prefix, English uses /en.
• src/messages/ko.json and en.json hold all visible text.
• LanguageSwitcher component in src/components/layout.
• Folder skeleton: components/{ui,home,product,cart,admin,layout}, lib, store, types, docs, supabase.
• .env.example, .prettierrc; first push to GitHub; Vercel connected.
Problems met and their fixes (useful for later)
• PowerShell mkdir does not accept several paths; New-Item -ItemType Directory was used.
• LanguageSwitcher.ts contained JSX; renamed to .tsx.
• The old src/app/layout.tsx and page.tsx had to be deleted so only [locale] versions remain.
• The Tailwind error Unknown at rule: @theme was caused by a misnamed PostCSS file (postcss,config.mjs with a comma). The correct file is postcss.config.mjs using @tailwindcss/postcss.
4. Phase 1 – Design system, layout and Home (Done)
What was done
• globals.css: Tailwind v4 @theme colour tokens (brand, brand-dark, brand-soft, cream, ink, muted, line), container-page utility, Korean word-break (keep-all).
• Data and helpers: src/types/index.ts (Product, BlogPost, Localized), src/lib/products.ts (three demo products and three blog posts), src/lib/utils.ts (loc, formatKRW), src/lib/site.ts (logo text, marketplaces, demo business info), src/lib/use-mounted.ts.
• Cart: src/store/cart.ts (Zustand with persistence, selectors for count and subtotal).
• Layout components: AnnouncementBar, Header (search, cart badge, login link, language switcher, mobile menu), Footer (links, business info, newsletter), NewsletterForm, CartDrawer.
• Product components: ProductVisual (SVG bottle placeholder), ProductCard.
• Home sections: HeroSlider, FeaturedProducts, WhereToBuy, BlogPreview.
• Route structure: src/app/[locale]/layout.tsx (html, fonts, i18n provider) and src/app/[locale]/(shop)/layout.tsx (announcement bar, header, footer, cart drawer) with (shop)/page.tsx as Home.
• Links to /product-list, /blog, /login, /cart-list and similar still return 404 until their phases.
Problem met: the shop layout code was pasted into [locale]/layout.tsx, causing a duplicate default export. The two layouts are different files.
5. Phase 1.5 – Motion foundation (Delivered)
What was delivered
• Pretendard variable font via CSS import; Noto Sans KR removed from the root layout.
• SmoothScroll (Lenis) mounted in the shop layout; respects reduced-motion.
• Reveal component (Framer Motion) used on the featured products.
• src/components/story/ScrollStory.tsx: a sticky section that scrubs an MP4 with scroll and fades text chapters; StorySection.tsx wires demo copy. It expects public/videos/demo-story.mp4.
Decision: the video scrub engine stays for the optional AI-video add-on. Phase 2 replaces it on the home page with the template showcase.
6. Phase 2 – Template Showcase and Studio prototype (In progress)
Requirement from the owner: an admin uploads one product photo. The system removes the background, builds a ready animation from a template, and the admin approves it before it appears on the site. The AI-video route is a later add-on.
Design decisions
• Background removal runs in the admin's browser using @imgly/background-removal. There is no server cost and no image leaves the device.
• Licence flag: that library is AGPL-3.0, with a commercial licence sold by IMG.LY. It is acceptable for the demo. Before the client goes live, either buy the commercial licence or swap the provider (for example a paid background-removal API). The code isolates this in src/lib/bg-removal.ts so the swap touches one file.
• The animation colours come from the product photo: the dominant colour is extracted and turned into a palette (accent, soft, deep).
• One ShowcaseStage drives the visuals from a progress value. On the storefront the value follows scroll. In the Studio preview it loops on a timer.
• Approval is stored in localStorage for now (prototype only). Phase 7 replaces this with Supabase storage, an approved flag, and admin-only access.
(This section is completed when the phase is finished.)