Cosmetic Website Korea – Workflow Document
Reference: bellamaru.com · UI language: Korean (default) + English · Deadline: 7 days · Status: Demo build (handover to Korean client later)
1. Project Overview
We are building an e-commerce website for a cosmetic brand, modeled closely on bellamaru.com in layout and design. The code, comments and database are in English. Visitors see the site in Korean by default and can switch to English. The site has user registration and login, a cart and checkout, and an admin panel where the admin can view orders and user login information.
This is a demo build. The Korean client holds the business licence. When we hand over, they will provide their licence details and their own payment accounts. Until then, everything runs in test or sandbox mode.
2. Scope
In scope
• Public pages: Home, Product List, Product Detail, Blog (list and detail), Contact, FAQ, Shop by Country, Terms, Privacy, Return and Refund
• Header with search, cart drawer, login, language switcher (KO / EN)
• Register, Login, Logout, Forgot password, My Page (profile, order history)
• Cart, Checkout, Order creation, Order status
• Payments: Bank Transfer (무통장입금), Toss Pay, Kakao Pay, Naver Pay, Card, all in sandbox mode
• Admin panel: Dashboard, Orders, Users, Login logs, Products, Blog posts
• SEO setup, GitHub repository, Vercel deployment
Out of scope (handover phase)
• Real payment keys and live merchant accounts
• Real business registration data (통신판매업 number, address, representative name)
• Real product photos and final legal text from the client
3. Tech Stack
Area
Choice
Reason
Framework
Next.js (App Router) + TypeScript
Best SEO, native Vercel support
Styling
Tailwind CSS
Fast to match the reference design
Fonts
Noto Sans KR (via next/font)
Korean text rendering
i18n
next-intl
Korean default at /, English at /en
Database
Supabase Postgres
Free tier, SQL, row-level security
Auth
Supabase Auth (email + password)
Sessions, password reset built in
Payments
PortOne V2 (포트원)
One integration for Toss, Kakao, Naver, cards, with test mode
Forms and validation
React Hook Form + Zod
Type-safe validation
State (cart)
Zustand with persistence
Simple cart drawer state
Hosting
GitHub then Vercel
Auto deploy on every push
Why PortOne? Toss Payments, KakaoPay and Naver Pay each have their own SDK and merchant onboarding. PortOne gives one API with a test mode for all of them, so the client only swaps keys at handover. Bank transfer is handled manually: the order is created as "Awaiting deposit" and the admin confirms it.
4. Repository and Local Setup
• Local folder: D:\Cosmetic website korea
• GitHub: https://github.com/faysalclaude/cosmetic-website
• Branches: main (production, deployed on Vercel), dev (integration), feature/<phase>-<name> (daily work)
• Commit format: type(scope): message, for example feat(cart): add cart drawer. Types: feat, fix, style, refactor, docs, chore
• Rule: one phase equals one feature branch, merged into dev, then main after review
5. Folder Structure
cosmetic-website/
├─ src/
│  ├─ app/
│  │  ├─ [locale]/
│  │  │  ├─ (shop)/
│  │  │  │  ├─ page.tsx                 # Home
│  │  │  │  ├─ product-list/
│  │  │  │  ├─ product/[slug]/
│  │  │  │  ├─ blog/ and blog/[slug]/
│  │  │  │  ├─ cart-list/
│  │  │  │  ├─ checkout/
│  │  │  │  └─ contact-us/, faq/, shop-by-country/
│  │  │  ├─ (legal)/ terms-and-services/, privacy-policy/, return-and-refund/
│  │  │  ├─ (auth)/ login/, register/, forgot-password/
│  │  │  ├─ my-page/
│  │  │  └─ admin/ (orders, users, login-logs, products, blog)
│  │  ├─ api/ (orders, payments/webhook, newsletter, contact)
│  │  ├─ sitemap.ts
│  │  └─ robots.ts
│  ├─ components/ (ui, layout, home, product, cart, admin)
│  ├─ lib/ (supabase, payments, seo, utils)
│  ├─ messages/ (ko.json, en.json)
│  ├─ store/ (cart store)
│  ├─ types/
│  └─ middleware.ts                      # locale and admin route protection
├─ public/
├─ supabase/ (migrations, seed.sql)
├─ docs/
└─ .env.local
The URLs follow the reference site (/product-list/, /cart-list/, /contact-us/ and so on) so the structure stays familiar.
6. Database Schema (Supabase Postgres)
Table
Key columns
profiles
id (= auth user id), full_name, phone, role (customer or admin), created_at
login_logs
id, user_id, email, ip_address, user_agent, success (bool), created_at
categories
id, slug, name_ko, name_en
products
id, slug, name_ko, name_en, short_desc_ko/en, description_ko/en, price_krw, discount_percent, stock, images (array), is_active
orders
id, order_no, user_id, status, payment_method, payment_status, subtotal, shipping_fee, total, recipient_name, phone, postcode, address1, address2, memo, created_at
order_items
id, order_id, product_id, name_snapshot, price_snapshot, quantity
blog_posts
id, slug, title_ko/en, excerpt_ko/en, content_ko/en, cover_image, published_at
contact_messages
id, name, email, message, created_at
newsletter_subscribers
id, email, created_at
Order status flow: pending → awaiting_deposit (bank transfer) or paid → preparing → shipped → delivered. Side states: cancelled, refunded.
Security: Row-level security is on for every table. Customers can read only their own profile and orders. Admins (role = admin) can read everything. Passwords are never stored by us; Supabase Auth handles them. The service-role key stays on the server only.
7. Internationalization (Korean and English)
• Code, variable names, comments and DB column names are in English.
• All visible text lives in messages/ko.json and messages/en.json. No hard-coded strings in components.
• Korean is the default locale (/); English uses the /en prefix.
• Product and blog content is stored in both languages in the database (name_ko, name_en).
• A language switcher sits in the header and keeps the user on the same page.
• Prices are shown in KRW (₩) in both languages.
8. Payment Strategy (Demo, then Live)
Method
Demo mode
At handover
Bank transfer (무통장입금)
Order saved as awaiting_deposit; bank details shown from config; admin confirms manually
Client enters real bank account
Toss Pay
PortOne test channel
Client's PortOne channel and Toss merchant keys
Kakao Pay
PortOne test channel
Client's merchant keys
Naver Pay
PortOne test channel
Client's merchant keys
Card
PortOne test channel
Client's PG contract
A payment webhook (/api/payments/webhook) verifies each payment on the server before the order becomes paid. The client never decides payment success.
9. Phase Plan (7 Days)
Phase 0 – Setup (Day 1, morning)
[ ] Install Node.js LTS, Git, VS Code
[ ] Create the Next.js + TypeScript + Tailwind project in D:\Cosmetic website korea
[ ] Connect the local repo to GitHub, push the first commit
[ ] Connect the repo to Vercel (auto deploy)
[ ] Configure next-intl (ko default, en) and a working language switcher
[ ] Set up the folder structure, ESLint, Prettier, .env.example
[ ] Done when: a Vercel URL opens and shows a Korean page, and /en shows English
Phase 1 – Design System and Home (Day 1 afternoon to Day 2)
[ ] Colors, typography, buttons, spacing tokens matched to the reference
[ ] Announcement bar, Header (logo, search, Blog, Products, cart, login), Footer
[ ] Home: hero slider (3 slides), Featured products, "Where to buy" section, Blog preview, Newsletter
[ ] Responsive layout (mobile first)
[ ] Done when: Home matches the reference on desktop and mobile in both languages
Phase 2 – Catalog and Cart (Day 3)
[ ] Supabase project, categories and products tables, seed data
[ ] Product List with search
[ ] Product Detail with image gallery, ingredients, add to cart
[ ] Cart drawer and /cart-list/ page (quantity, remove, totals)
[ ] Done when: a user can browse, search and fill the cart
Phase 3 – Authentication (Day 4)
[ ] Register, Login, Logout, Forgot password
[ ] Profile creation and role handling
[ ] Login logging (IP, user agent, success or failure) into login_logs
[ ] My Page: profile edit, order history
[ ] Route protection in middleware
[ ] Done when: every login attempt appears in login_logs, and My Page is protected
Phase 4 – Checkout and Orders (Day 5)
[ ] Checkout form with Korean address fields (postcode lookup via Daum Postcode)
[ ] Order creation with item snapshots
[ ] Bank transfer flow
[ ] PortOne sandbox for Toss, Kakao, Naver, card, plus webhook verification
[ ] Order confirmation page and email
[ ] Done when: a test order succeeds with each payment method
Phase 5 – Admin Panel (Day 6)
[ ] /admin with admin-only access
[ ] Dashboard (today's orders, revenue, new users)
[ ] Orders: list, filter, detail, change status, confirm bank deposit
[ ] Users: list and detail with login history
[ ] Login logs table with filters
[ ] Product CRUD and Blog CRUD
[ ] Done when: an admin can manage an order from creation to delivery
Phase 6 – Content, SEO, QA, Launch (Day 7)
[ ] Blog list and detail, Contact (saves to DB), FAQ, Shop by Country, legal pages
[ ] Full SEO checklist (section 10)
[ ] QA checklist (section 11)
[ ] Final production deploy on Vercel
[ ] README and handover notes
10. SEO Checklist
• Unique title and meta description per page, in Korean and English
• hreflang tags for ko, en and x-default; canonical URLs
• sitemap.xml and robots.txt generated by Next.js
• JSON-LD structured data: Organization, Product (price, availability), BreadcrumbList, BlogPosting
• Open Graph and Twitter cards with product images
• next/image with alt text, WebP, lazy loading
• Clean slugs, one h1 per page, semantic headings
• Core Web Vitals targets: LCP under 2.5s, CLS under 0.1
• Korea-specific: register the site in Naver Search Advisor and add the Naver verification meta tag; also Google Search Console
• Korean metadata: lang="ko", og:locale=ko_KR
• Admin and checkout pages set to noindex
11. QA Checklist
[ ] All pages render correctly in KO and EN, with no untranslated strings
[ ] Mobile (360px), tablet and desktop layouts
[ ] Register, login, logout, password reset
[ ] Non-admin users cannot open /admin (check directly by URL)
[ ] Cart persists after refresh; totals are correct
[ ] Order is created for every payment method; webhook updates the status
[ ] Login logs record both success and failure
[ ] Lighthouse score 90 or above (Performance, SEO, Best Practices)
[ ] No secrets committed to Git; .env.local is in .gitignore
12. Environment Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only
NEXT_PUBLIC_SITE_URL=
PORTONE_API_SECRET=               # server only
NEXT_PUBLIC_PORTONE_STORE_ID=
NEXT_PUBLIC_PORTONE_CHANNEL_KEYS=
BANK_NAME= / BANK_ACCOUNT= / BANK_HOLDER=   # demo values
These are set locally in .env.local and in the Vercel project settings. They are never committed.
13. Handover Checklist (when the Korean client takes over)
The client provides:
• Business registration details: company name, representative, address, 사업자등록번호, 통신판매업 신고번호
• Real bank account for transfers
• PortOne account, with Toss, Kakao, Naver and card channels contracted under their licence
• Real product photos, prices and final legal text
• Domain name
We then:
1. Swap the test keys for live keys in Vercel
2. Update the footer business information and the legal pages
3. Replace demo products with real products
4. Connect the custom domain, and register it with Naver Search Advisor and Google Search Console
5. Transfer the GitHub repo, and the Vercel and Supabase projects, to the client's accounts
6. Run one live low-value test order for each payment method
14. Risks and Notes
• 7 days is tight. If time runs short, the order of cuts is: Blog CRUD, then Naver Pay, then email notifications.
• Korean cosmetic advertising has rules (for example, claims such as "whitening" or "cures acne" need approved wording). The client should review the final product text.
• Supabase and Vercel free tiers are enough for the demo, not for production traffic.
• Reference-site images are not hot-linked. Placeholder or client-supplied images are used.