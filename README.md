# FinShield-AI 🛡️

> **Enterprise-grade AI-powered fraud detection and compliance platform**

A full-stack fintech application featuring a **transaction risk-scoring engine**, **anomaly detection pipeline**, **role-based compliance workflow**, and **AI-generated fraud investigation reports** via Gemini API.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **Auth & RBAC** | JWT authentication with 3 roles: Customer, Officer, Admin |
| ⚡ **Fraud Engine** | 6-rule risk-scoring system with velocity, amount, time, device checks |
| 🤖 **AI Investigator** | Gemini 1.5 Flash generates structured fraud investigation reports |
| 📊 **Live Dashboard** | Recharts visualizations — volume trends, risk distribution |
| 📋 **Audit Trail** | Immutable log of every system action with severity levels |
| 🎨 **Dark Fintech UI** | Bloomberg Terminal aesthetic — deep navy + electric blue |

---

## 🏗️ Architecture

```
FinShield-AI/
├── client/          # React + Vite + CSS
└── server/          # Express + MongoDB
```

## 🚀 Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/FinShield-AI.git
cd FinShield-AI
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm install
npm run seed    # Create demo users
npm run dev     # Start on port 5000
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev     # Start on port 5173
```

---

## 🔑 Environment Variables

```env
# server/.env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-gemini-key
CLIENT_URL=http://localhost:5173
```

```env
# client/.env (production)
VITE_API_BASE_URL=https://your-render-backend.com/api
```

---

## 👥 Demo Accounts

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@demo.com | demo1234 |
| Officer | officer@demo.com | demo1234 |
| Admin | admin@demo.com | demo1234 |

---

## 🧠 Fraud Engine Rules

| Rule | Score | Trigger |
|------|-------|---------|
| Extreme Amount | +50 | Amount > ₹1,00,000 |
| High Amount | +30 | Amount > ₹50,000 |
| Night Transfer | +10 | 00:00 – 05:00 |
| Velocity Breach | +25 | >3 transfers in 10 mins |
| New Device | +15 | Unrecognized device |
| Round Amount | +5 | Multiple of ₹10,000 |

- **Score ≥ 30** → Transaction `flagged` for compliance review
- **Score ≥ 70** → Transaction `blocked`, funds held

---

## 🤖 AI Investigation

Officers click **"Explain Fraud Risk"** on any flagged transaction. The system sends structured transaction data to **Gemini 1.5 Flash**, which returns a professional fraud investigation report including:

- Risk Summary
- Flagged Indicators
- Behavioral Analysis
- Recommended Action (APPROVE / ESCALATE / BLOCK)
- Confidence Level

---

## 🚀 Deployment

### Backend → Render
1. Connect GitHub repo
2. Set root directory to `server/`
3. Build command: `npm install`
4. Start command: `node src/server.js`
5. Add environment variables

### Frontend → Vercel
1. Connect GitHub repo
2. Set root directory to `client/`
3. Add `VITE_API_BASE_URL` = your Render URL
4. Deploy

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Vanilla CSS |
| Charts | Recharts |
| HTTP | Axios |
| Routing | React Router v6 |
| Backend | Express.js, Node.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| AI | Google Gemini 1.5 Flash |
| Icons | Lucide React |

---

## 📄 License

MIT — Built for fintech portfolio demonstration.
