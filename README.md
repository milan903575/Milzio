
# Milzio — AI-Powered E-Commerce Platform

Milzio is a full-stack e-commerce platform built from scratch with a
conversational AI shopping assistant powered by a locally running LLM.
Designed with clean architecture, layered features, and a focus on
real-world backend patterns.

---

## System Architecture

![Architecture](https://github.com/user-attachments/assets/196a02b0-c9e4-44de-bf88-b144c025edb4)


---

## Features

### Currently Available
- Product listing with ratings, discounts and images
- Add to cart with quantity management (localStorage)
- User authentication with JWT (register, login, protected routes)
- Role-based authorization (customer, admin)
- AI chat assistant (Milzio AI) — streaming responses via SSE using Ollama llama3.2
- Persistent chat history per user session
- Responsive frontend built with vanilla JavaScript

### In Development
- Cart backend integration — currently managed via localStorage
- Order management with full backend integration — mock data in place
- Order tracking with backend integration — mock data in place
- RAG integration — AI answers based on actual product and order data
- Vendor and supplier roles
- Payment gateway integration
- API caching for user data
- Load testing and performance benchmarking

---

## Tech Stack

### Backend
- **Runtime** — Node.js
- **Framework** — Express.js
- **Database** — better-sqlite3 *(migrating to SQL Server)*
- **Auth** — JWT + bcrypt
- **AI** — Ollama (llama3.2) with SSE streaming
- **Logging** — Morgan

### Frontend
- **Language** — Vanilla JavaScript (ES Modules)

---

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
│   ├── .env
│   └── app.js
└── frontend/
├── data/
│   ├── cart.js
│   ├── deliveryOptions.js
│   ├── orders.js
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

---

## Local Setup

### Prerequisites
- Node.js v18+
- [Ollama](https://ollama.com) installed

```bash
ollama pull llama3.2
ollama run llama3.2
```


### Backend

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=3000
JWT_KEY=your_secret_key
OLLAMA_API=http://localhost:11434/api/chat
```

Start server:

```bash
npm start
```


### Frontend

```bash
cd frontend
npx serve . -p 5500
```

Open `http://localhost:5500`

---

## Architecture Notes

- Backend built entirely from scratch following a **controller → service → repository** layered pattern
- Each feature is isolated as an independent module
- Separate **auth** and **authz** middleware — authentication and authorization handled independently
- AI streaming uses **Server-Sent Events (SSE)** for real-time token delivery
- JWT authentication protects all private routes including AI chat
- Frontend UI designed with AI assistance, all interactivity and API integration built manually in vanilla JavaScript

---

## Screenshots

<img width="1914" height="944" alt="Home-Page" src="https://github.com/user-attachments/assets/fe5acce9-702f-4f0c-b214-ae076a71533b" />


---

## Contact

**Milan**
milan903575@gmail.com
