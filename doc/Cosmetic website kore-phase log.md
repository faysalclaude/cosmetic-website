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
Done
3
Design v2: professional redesign with structure changes, brand colour care (Done in Phase 3)
Planned
4
Supabase, product catalogue, list and detail pages with showcase (Done)
Planned
5
Authentication, admin role, login logs, My Page, admin shell with Users and Login logs (Done)
Planned
6
Admin product management on the website (forms, image upload, Studio wired, approve); no Supabase dashboard use
Planned
7
Checkout, orders, PortOne payments
Planned
8
Admin orders view, blog, static pages, SEO, QA, launch
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
6. Phase 2 – Template Showcase and Studio prototype (Done)
Requirement from the owner: an admin uploads one product photo. The system removes the background, builds a ready animation from a template, and the admin approves it before it appears on the site. The AI-video route is a later add-on.
Design decisions
• Background removal runs in the admin's browser using @imgly/background-removal. There is no server cost and no image leaves the device.
• Licence flag: that library is AGPL-3.0, with a commercial licence sold by IMG.LY. It is acceptable for the demo. Before the client goes live, either buy the commercial licence or swap the provider (for example a paid background-removal API). The code isolates this in src/lib/bg-removal.ts so the swap touches one file.
• The animation colours come from the product photo: the dominant colour is extracted and turned into a palette (accent, soft, deep).
• One ShowcaseStage drives the visuals from a progress value. On the storefront the value follows scroll. In the Studio preview it loops on a timer.
• Approval is stored in localStorage for now (prototype only). Phase 7 replaces this with Supabase storage, an approved flag, and admin-only access.
Status: Done. The owner tested it and pushed it to GitHub.
What was built
• src/lib/bg-removal.ts has two modes. Studio mode is our own code: it takes the background colour from the four corners, flood-fills from the border, softens the edge and crops. It needs no AI, no API and no licence. AI mode uses @imgly/background-removal for complex backgrounds (AGPL, see the licence flag above).
• src/lib/palette.ts extracts the product's dominant colour and derives accent, soft and deep.
• src/lib/showcase-store.ts keeps approved showcases in localStorage (prototype only, newest five, roughly 5 MB limit).
• src/components/showcase/: ShowcaseStage (glow, ripple rings, particles, floating product, chapters, final button, all driven by one progress value), ScrollShowcase (storefront, scroll-driven), PreviewShowcase (Studio, timer-driven), HomeShowcase, copy.ts (default Korean and English chapter text).
• /studio page: upload, Studio or AI mode, tolerance slider with live re-run, checkerboard preview, detected colours, product name, approve button. It has no login yet.
• Home page now uses HomeShowcase. ScrollStory and StorySection (video scrub) are kept but unused, for the optional AI-video add-on.
• Brand colours were measured from a Bellamaru screenshot and set as tokens: logo #a40c4c, accent #e81c68, button #e4305c, top bar #202428, soft pink #fcf0f4. The announcement bar is now dark and the logo is serif with wide letter spacing.
• Product List v2 at /product-list: category filter with counts, price range, sort, search chip (?q=), discount badges, wishlist heart, mobile filter toggle, empty state. Suspense wraps useSearchParams.
• Product type gained category (skinCare, hairCare, makeup) and area (localized, for example Face or Eyes). New src/store/wishlist.ts. ProductCard was redesigned. A ProductList block was added to both message files.
Problems met
• npm install failed with ERESOLVE because @imgly/background-removal@1.7.0 needs exactly onnxruntime-web@1.21.0.
• Module not found: framer-motion appeared because the Phase 1.5 install had not stuck. Fix: npm install framer-motion lenis.
Known limits
• Studio mode can cut away white parts of a white product shot on a white background; use the slider or AI mode.
• Approvals live in one browser only, and /studio is open to everyone, until Phase 7.
• Products are still hard-coded in src/lib/products.ts, so nobody can edit them without changing code. Phases 4 and 7 fix this (section 8).
7. Phase 3 – Design v2 and Product Detail (Done)
• Product Detail page /product/[slug] with gallery, price, discount, add to cart, ingredients and its own showcase section.
• Header with a two-row premium layout like the reference (centered logo, search row) and a floating cart tab on the right edge.
• Cart page /cart-list, and a pass over spacing, typography and motion across all pages.
• Brand rule: keep the raspberry and pink palette above; change structure freely.
Status: Done. The owner tested it and pushed it to GitHub.
What was built
• Product Detail page at src/app/[locale]/(shop)/product/[slug]/page.tsx with ProductDetailView: price and discount, highlights, how-to-use and shipping accordions, quantity picker, wishlist, trust strip, the product's own ScrollShowcase, related products.
• SEO on the detail page: generateStaticParams, generateMetadata (title, description, canonical, hreflang alternates, Open Graph) and Product JSON-LD with KRW price. The root layout got metadataBase and a title template.
• Header rebuilt in two rows like the reference: a large centred logo row (desktop) plus a sticky navigation row. Header returns a fragment on purpose so the nav row can stick.
• FloatingCartTab on the right edge, mounted in the shop layout.
• Cart page /cart-list (CartView) with line items, summary, and a free-shipping progress bar.
• siteConfig.shipping (demo: fee 3,000 KRW, free over 50,000 KRW) and shippingFor() in src/lib/utils.ts. The cart store add(product, qty) now accepts a quantity.
• Demo copy for highlights and how-to-use lived in src/lib/product-details.ts; Phase 4 moves it into the database.
• New message blocks: Product and CartPage (Korean and English).
Open items: /checkout, /login, /blog and the legal pages still return 404 until their phases.
8. Requirement: admin manages products without code (built in Phases 4 and 7)
The admin must be able to add, edit and remove products from the admin panel, with no code changes.
• Product fields: name (Korean and English), short and long description (both languages), category, area, price, compare-at price (discount is calculated), stock, active or hidden, New badge, slug.
• Images: upload several images per product to Supabase Storage; choose the main image; reorder.
• Showcase: the Studio becomes part of the product form: upload photo, background removal, colour detection, preview, then Approve. Only approved showcases are public.
• Categories: stored in a table, editable by the admin.
• Technical change this needs: move products from src/lib/products.ts into Supabase tables; ProductCard, the list, the detail page and the home page read from the database; admin-only routes use the admin role and row-level security.
• Translation: the admin types both Korean and English. Automatic translation would need an external service, so it is not included.
9. Phase 4 – Supabase and product catalogue (Done)
Goal: products come from a database instead of src/lib/products.ts, so the admin can later edit them (section 8).
Decisions
• Supabase project in the Seoul region (ap-northeast-2), free plan.
• Public read uses a cookie-less supabase-js client (src/lib/supabase/public.ts) so pages can be statically generated. Pages use export const revalidate = 60, so a database edit appears on the site within about a minute.
• Tables: categories, products (Korean and English columns, highlights arrays, how-to-use, price, compare_at, stock, tint, accent, is_new, is_active, sort_order), product_images, product_showcases (with an is_approved flag). A product-images storage bucket (public read).
• Row-level security is on for every table. Anonymous visitors can read only active products, their images, and approved showcases. There are no write policies yet, so only the Supabase dashboard or the service key can write. Admin write policies come with the profiles.role column in Phase 5 and the admin panel in Phase 7.
• Data layer: src/lib/data/products.ts (getProducts, getProductBySlug, getProductSlugs, wrapped in React cache) maps rows to the existing Product type, which gained images, highlights, howToUse and an optional showcase.
• ProductVisual now accepts a real image (next/image); next.config.ts allows *.supabase.co storage URLs.
• Cart and wishlist localStorage keys were bumped to -v2 because product ids changed from p1 style to UUIDs.
• The category list in the filter UI is still the three fixed ids (skinCare, hairCare, makeup); admin-editable categories arrive in Phase 7.
• Secrets: only the project URL and the publishable (anon) key go in .env.local and in Vercel. The service or secret key never goes into a NEXT_PUBLIC_ variable.
Status: Done. The owner tested it: the site reads products from Supabase and a price edit shows on the site.
What was built
• Supabase project in Seoul; tables categories, products, product_images, product_showcases; RLS (public read of active and approved rows only); product-images storage bucket; seed data for the three demo products.
• src/lib/supabase/public.ts (cookie-less read client, with a guard that rejects a dashboard link used as the URL), src/lib/data/products.ts (getProducts, getProductBySlug).
• Product type extended; ProductVisual renders real images; Home, Product List and Product Detail read from the database with revalidate = 60.
• Cart and wishlist storage keys bumped to -v2; src/lib/product-details.ts removed; products.ts keeps only the blog demo data.
Problems met
• Missing files (Reveal.tsx, supabase/public.ts, SmoothScroll.tsx) were found with a PowerShell existence check.
• The site received Supabase's dashboard HTML because NEXT_PUBLIC_SUPABASE_URL held the browser dashboard link. The correct value is https://<project-ref>.supabase.co. Vercel needs the same value, followed by a redeploy.
Owner requirement (important): the admin must never use the Supabase dashboard. Editing happens on a page of the website itself, and the site saves the input automatically. Table Editor is used only by the developer for testing.
10. Roadmap change after Phase 4
Because of the requirement above, admin product management moves earlier: Phase 5 is authentication plus admin role plus an admin shell; Phase 6 is the admin product manager on the website; Phase 7 is checkout, orders and payments; Phase 8 adds the admin orders view, blog, SEO, QA and launch. Section 8 describes the product manager requirements; it is now built in Phase 6.
11. Phase 5 – Authentication, admin role and admin shell (Done)
Goal: register, log in, log out, reset password, My Page, an admin role, and an admin area at /admin where the admin sees users and login information.
Decisions
• Supabase Auth with @supabase/ssr. src/proxy.ts now chains the next-intl middleware and a Supabase session refresh (only when an sb- cookie exists).
• A profiles table (id, email, full_name, phone, role) filled by a trigger on signup. RLS: a user reads and edits only their own row; an admin reads all. Column privileges let users update only full_name and phone, so nobody can promote themselves.
• An is_admin() security-definer function is used in policies.
• A login_logs table (user, email, success, reason, IP, user agent). Logs are written by server actions with the service-role (secret) key, which exists only in server code and in Vercel variables without the NEXT_PUBLIC_ prefix. Only admins can read the logs.
• Login and register are server actions, so the IP and device are captured on the server. After success the client does a full page load so the header shows the new state.
• The header learns the login state in the browser (useAuthUser), so storefront pages stay statically generated.
• Admin access is verified in the admin layout and again inside every admin page, because layouts are not re-run on soft navigation.
• Password-reset and signup emails return through /api/auth/callback, kept under /api so the locale middleware ignores it.
• Email confirmation is off for the demo. Turn it on, with Korean email templates, before the client goes live.
• The first admin is created by registering normally, then running one SQL update on the profile row.
Status: Done. The owner registered an account, promoted it to admin, and confirmed that the admin area shows users, product count and login attempts.
What was built
• Supabase clients: src/lib/supabase/browser.ts, server.ts (cookies), admin.ts (secret key, server-only).
• src/proxy.ts chains next-intl and the Supabase session refresh.
• src/lib/auth.ts (getCurrentProfile, requireAdmin), src/lib/validation/auth.ts (zod, error codes), src/lib/format.ts (Seoul time), src/lib/use-auth-user.ts (header state).
• src/lib/actions/auth.ts: loginAction (writes a login_logs row for success and failure, with IP and device), registerAction, forgotPasswordAction, updateProfileAction. src/app/api/auth/callback/route.ts handles email links.
• UI in src/components/auth/: AuthCard, Field, LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm, ProfileForm, LogoutButton, UserMenu (mounted in the header).
• Pages /login, /register, /forgot-password, /reset-password, /my-page (all noindex).
• Admin shell under src/app/[locale]/admin/: layout with sidebar (AdminNav), Dashboard (users, products, 24-hour login counts), Users, Login logs. Admin is checked in the layout and again in each page.
• Tables profiles and login_logs, the handle_new_user trigger, the is_admin() function, and column-level privileges (users can change only name and phone).
Problems met
• The auth.ts code was pasted into src/lib/utils.ts, so client components pulled in next/headers and the build failed. Fix: restore utils.ts (loc, formatKRW, shippingFor), create auth.ts separately, and scan imports with Select-String for supabase/server, supabase/admin, server-only.
• Missing SUPABASE_SERVICE_ROLE_KEY: the value is the Secret key (sb_secret_...) under Project Settings, API Keys. It goes in .env.local and in Vercel, never with a NEXT_PUBLIC_ prefix, and the dev server must be restarted.
• The first admin was created by registering, then running an SQL insert ... on conflict do update set role = 'admin' on the profile.
Notes
• Admin nav shows Products and Orders as "soon" until Phases 6 and 7.
• Vercel also needs SUPABASE_SERVICE_ROLE_KEY. Email confirmation is still off (demo).
12. Phase 6 – Admin Product Manager on the website (In progress)
Goal: the admin adds, edits, hides and deletes products, uploads images and publishes the Studio animation from pages of the website. The Supabase dashboard is never used by the admin.
Delivered in two parts
• 6A: /admin/products list (hide or show, edit, delete), /admin/products/new and /admin/products/[id] forms with all text fields in Korean and English, category, price, compare-at price, stock, colours, NEW badge, visibility and sort order.
• 6B: image upload (several per product, main image, reorder, delete) and the Studio inside the product page: photo, background removal, colour detection, preview, approve or unpublish.
Decisions
• All writes are server actions that first call assertAdmin() (throws unless the caller is an admin), validate with zod, then write with the secret-key client. Validation messages are plain English because the admin UI is English.
• After every save the actions call revalidatePath("/", "layout"), so the storefront updates immediately instead of waiting for the 60-second cache.
• The slug is set on creation (suggested from the English name) and locked afterwards, because it is the public URL.
• Highlights are typed one per line. The database enforces compare_at >= price; the form shows a friendly message.
• Images (6B) go straight from the browser to Supabase Storage through signed upload URLs created by an admin-only server action. This avoids server request size limits. Images are shrunk in the browser first.
• Orders will keep a snapshot of the product name and price and a nullable product reference, so deleting a product never breaks old orders (Phase 7).
• The admin Orders page stays a placeholder until Phase 7, because orders do not exist before checkout.
(This section is completed when the phase is finished.)