# Fast&Up Inspired Ecommerce

Production-grade sports nutrition ecommerce app built with Next.js App Router, Tailwind CSS, Zustand, NextAuth, MongoDB/Mongoose API routes and an OpenAI-powered shopping/support assistant.

## Features

- Responsive Fast&Up-inspired UI: home, product listing, detail, cart, checkout, dashboard, auth and footer.
<<<<<<< HEAD
- Dynamic product APIs with category, tag, price and search filtering, sorting and pagination.
=======
- Dynamic product APIs with category, tag, price and search filtering plus sorting.
>>>>>>> fd0b9a8 (feat: initialize Next.js storefront project with authentication, product catalog, and AI chat integration)
- MongoDB-backed products, users and orders with local seed fallback for quick demos.
- Zustand cart with localStorage persistence and real-time totals.
- NextAuth credentials login/signup. Demo login: `demo@fastup.dev` / `Demo@1234`.
- Checkout order creation with backend price calculation.
- Floating AI chatbot using the OpenAI Responses API and live product, FAQ and order context.
<<<<<<< HEAD
- Basic API hardening with payload validation, safer error responses and in-memory rate limits.
=======
>>>>>>> fd0b9a8 (feat: initialize Next.js storefront project with authentication, product catalog, and AI chat integration)

## Environment

Copy `.env.example` into `.env.local` and set:

```bash
MONGODB_URI=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
```

If `MONGODB_URI` is missing, the app uses seeded in-memory data. If `OPENAI_API_KEY` is missing, the chat UI loads but the API reports that the LLM key is not configured.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```
