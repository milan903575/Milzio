# Milzio — AI-Powered E-Commerce Platform

Milzio is a full-stack e-commerce platform built from scratch with a conversational AI shopping assistant powered by Groq API. It features a clean layered backend architecture, custom frontend integration, and an intelligent chat experience built directly into the shopping flow.



***

## Live Demo

**[milzio.vercel.app](https://milzio.vercel.app)**

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend API | Render |
| Database | Neon (PostgreSQL) |
| Image Storage | Cloudinary |

***

## System Architecture

This high-level architecture diagram shows how Milzio’s frontend, backend, database, and external services interact.

<img width="700" alt="Image" src="https://github.com/user-attachments/assets/ffbfb2f4-daf4-4aa7-9022-39450c49691b" />

## Features

- Product listing with ratings, discounts, and images
- Add to cart with quantity management
- Checkout with order creation and payment via Razorpay
- Order history with item details and product images
- User authentication with JWT (register, login, protected routes)
- Role-based authorization (customer, admin)
- AI chat assistant (Milzio AI) with three intelligent modes — powered by Groq (llama3) with real-time SSE streaming
- Persistent chat history per user session
- Responsive frontend built with vanilla JavaScript
- APIs tested with Postman

***

## Milzio AI — Chat Modes

The AI assistant is built around three distinct modes, each serving a different user intent:

### General Mode
Conversational assistant for general queries — no product data involved. Users can ask cooking instructions, ingredient ideas, lifestyle questions, or anything they would normally search the internet for. Since Milzio already has the products, the assistant can suggest what to buy without the user leaving the platform.

> *Example: "What do I need to make a salad?" — the assistant answers from knowledge and can tie recommendations back to available products.*

### Search Mode
Users can search for products and compare them side by side. The assistant retrieves actual product data and presents it in a structured, comparable way — useful when a user is deciding between options.

> *Example: "Compare the top (brand or category) protein powders available" — returns real product data with a clear comparison.*

### Analyze Mode
Deep analysis of a specific product. The assistant pulls the full product details and gives a thorough summary — ingredients, use cases, value for money, and a recommendation.

> *Example: "Analyze this product (product name)" — gives a detailed breakdown based on actual product data.*

***

## Tech Stack

### Backend
- **Runtime** — Node.js
- **Framework** — Express.js
- **Database** — PostgreSQL (hosted on Neon)
- **Auth** — JWT + bcrypt
- **Payment** — Razorpay
- **Image Storage** — Cloudinary
- **AI** — Groq API (llama-3.1-8b-instant) with SSE streaming
- **Logging** — Morgan
- **API Testing** — Postman

### Frontend
- **Language** — Vanilla JavaScript (ES Modules)

### Deployment
- **Backend** — Render
- **Frontend** — Vercel
- **Database** — Neon
- **Images** — Cloudinary

***

## Project Structure

```
milzio/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── authz.middleware.js
│   │   │   └── logger.middleware.js
│   │   ├── modules/
│   │   │   ├── ai/
│   │   │   │   ├── ai.controller.js
│   │   │   │   ├── ai.service.js
│   │   │   │   ├── ai.repository.js
│   │   │   │   └── ai.routes.js
│   │   │   ├── carts/
│   │   │   │   ├── cart.controller.js
│   │   │   │   ├── cart.service.js
│   │   │   │   ├── cart.repository.js
│   │   │   │   └── cart.routes.js
│   │   │   ├── orders/
│   │   │   │   ├── order.controller.js
│   │   │   │   ├── order.service.js
│   │   │   │   ├── order.repository.js
│   │   │   │   └── order.routes.js
│   │   │   ├── payments/
│   │   │   │   ├── payment.controller.js
│   │   │   │   ├── payment.service.js
│   │   │   │   ├── payment.repository.js
│   │   │   │   └── payment.routes.js
│   │   │   ├── products/
│   │   │   │   ├── product.controller.js
│   │   │   │   ├── product.service.js
│   │   │   │   ├── product.repository.js
│   │   │   │   └── product.routes.js
│   │   │   └── users/
│   │   │       ├── user.controller.js
│   │   │       ├── user.service.js
│   │   │       ├── user.repository.js
│   │   │       └── user.routes.js
│   │   └── router.js
│   ├── logs/
│   ├── .env.example
│   └── app.js
└── frontend/
    ├── data/
    │   ├── cart.js
    │   ├── deliveryOptions.js
    │   └── products.js
    ├── scripts/
    │   ├── checkout/
    │   │   ├── checkoutHeader.js
    │   │   ├── orderSummary.js
    │   │   └── paymentSummary.js
    │   ├── utils/
    │   │   ├── config.js
    │   │   └── money.js
    │   ├── authentication.js
    │   ├── chat.js
    │   ├── checkout.js
    │   ├── home.js
    │   ├── orders.js
    │   └── profile.js
    ├── styles/
    │   ├── pages/
    │   │   ├── authentication.css
    │   │   ├── chat.css
    │   │   ├── checkout.css
    │   │   ├── home.css
    │   │   ├── orders.css
    │   │   ├── profile.css
    │   │   └── tracking.css
    │   └── shared/
    │       ├── general.css
    │       └── site-header.css
    ├── authentication.html
    ├── checkout.html
    ├── home.html
    ├── orders.html
    ├── profile.html
    └── tracking.html
```

***

## Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL database (local or Neon)
- Groq API key — [console.groq.com](https://console.groq.com)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file using the provided `.env.example`:

```env
PORT=3000
DATABASE_URL=your_postgres_connection_string
JWT_KEY=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> **Note:** AI chat requires a valid Groq API key. The assistant runs on llama3 via Groq and streams responses using SSE.

Start the server:

```bash
npm start
```

### Frontend

```bash
cd frontend
npx serve . -p 5500
```

Open `http://localhost:5500`

***

## Architecture Notes

- Backend built entirely from scratch following a **controller → service → repository** layered pattern
- Each feature is isolated as an independent module
- Standardized API responses and centralized error handling for reliable frontend integration.
- Separate **auth** and **authz** middleware — authentication and authorization handled independently
- Payments follow a two-step flow: app order creation → Razorpay gateway order → signature verification
- AI streaming uses **Server-Sent Events (SSE)** for real-time token delivery
- JWT authentication protects all private routes including AI chat
- Images stored and served via Cloudinary
- Frontend UI designed with AI assistance, all interactivity and API integration built manually in vanilla JavaScript

***

## In Development

- RAG integration — full product and order context injected into AI responses across all chat modes
- Vendor and supplier roles
- API caching for user data

***

## Screenshots

<img width="1918" height="1078" alt="Image" src="https://github.com/user-attachments/assets/734bfcbe-ea7c-485d-b50d-839b1988ce9a" />

***

## Contact

**Milan**
[milan903575@gmail.com](mailto:milan903575@gmail.com)
