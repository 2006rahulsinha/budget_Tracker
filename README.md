# Budget Tracker

A full-stack personal finance application with AI-powered spending insights and ML-based budget predictions.

---

## Features

- **Expense Tracking** — Log and categorise daily expenses with a clean, intuitive interface
- **Budget Predictions** — Prophet-powered ML model predicts next month's spending per category
- **AI Spending Analysis** — Groq (Llama 3.3 70B) generates detailed monthly financial reports
- **Interactive Charts** — Bar, Line, Area, Pie, and Radar charts with month-level filtering
- **Pagination & Search** — Browse all transactions with category badges and color coding
- **Rate Limiting** — Per-user API rate limiting via Upstash Redis
- **Authentication** — Supabase Auth with protected routes

---

## Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework |
| TypeScript | Language |
| Tailwind CSS | Styling |
| shadcn/ui | Component library |
| Recharts | Data visualisation |
| Supabase JS | Auth + DB client |

### Backend
| Tool | Purpose |
|---|---|
| FastAPI | Python API server |
| Prophet | Time-series budget forecasting |
| Groq API (Llama 3.3) | AI spending insights |
| Supabase | PostgreSQL database + Auth |
| Upstash Redis | Rate limiting |

### Infrastructure
| Tool | Purpose |
|---|---|
| Vercel | Next.js hosting |
| Railway | Python API hosting |
| Supabase | Database hosting |

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         User (Browser)                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js App (Vercel)                         │
│                                                                 │
│   ┌─────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│   │  Dashboard  │    │ /api/predict │    │  /api/insights   │  │
│   │   (React)   │───▶│   (Route)    │    │    (Route)       │  │
│   └─────────────┘    └──────┬───────┘    └────────┬─────────┘  │
│                             │                     │             │
└─────────────────────────────┼─────────────────────┼─────────────┘
                              │                     │
              ┌───────────────┘                     │
              │                                     │
              ▼                                     ▼
┌─────────────────────────┐         ┌───────────────────────────┐
│   Supabase (Database)   │         │   Upstash Redis           │
│                         │         │                           │
│  • User auth            │         │  • Rate limit per user    │
│  • Expense records      │         │  • 5 requests / hour      │
│  • Categories           │         └───────────────────────────┘
└────────────┬────────────┘
             │ expenses
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Python API (Railway)                          │
│                                                                 │
│   ┌─────────────────────────┐   ┌─────────────────────────┐    │
│   │     POST /predict       │   │     POST /insights      │    │
│   │                         │   │                         │    │
│   │  1. Receive expenses    │   │  1. Receive expenses    │    │
│   │  2. Group by category   │   │  2. Build summary       │    │
│   │  3. Train Prophet model │   │  3. Send to Groq LLM   │    │
│   │  4. Predict next month  │   │  4. Return analysis     │    │
│   │  5. Return + confidence │   │                         │    │
│   └─────────────────────────┘   └──────────┬──────────────┘    │
│                                            │                    │
└────────────────────────────────────────────┼────────────────────┘
                                             │
                                             ▼
                                ┌────────────────────────┐
                                │     Groq API           │
                                │   Llama 3.3 70B        │
                                │                        │
                                │  Generates structured  │
                                │  financial report      │
                                └────────────────────────┘
```

### Prediction Flow
```
User opens dashboard
       │
       ├──▶ Fetch all expenses from Supabase
       │
       ├──▶ Send to /predict (Python)
       │         │
       │         ├── Group expenses by category
       │         ├── Aggregate to monthly totals
       │         ├── Train one Prophet model per category
       │         └── Predict next month + confidence range
       │
       └──▶ Display per-category forecast cards
```

### Insights Flow
```
User clicks "Monthly Review"
       │
       ├──▶ Check rate limit (Upstash Redis)
       │         └── Block if > 5 requests / hour
       │
       ├──▶ Fetch all expenses from Supabase
       │
       ├──▶ Build spending summary (category + % change)
       │
       ├──▶ Send to Groq (Llama 3.3 70B)
       │         └── Prompt: overview, breakdown,
       │                     concerns, recommendations
       │
       └──▶ Render structured report in drawer
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key
- An [Upstash](https://upstash.com) Redis database

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/budget-tracker.git
cd budget-tracker
```

### 2. Install Next.js dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ML_API_URL=http://localhost:8000
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### 4. Install Python dependencies
```bash
cd ml-service
pip install -r requirements.txt
```

### 5. Configure Python environment
Create a `.env` file inside `ml-service`:
```bash
GROQ_API_KEY=your-groq-api-key
```

### 6. Run the development servers

**Terminal 1 — Next.js:**
```bash
npm run dev
```

**Terminal 2 — Python API:**
```bash
cd ml-service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Visit `http://localhost:3000`

---

## Project Structure

```
budget-tracker/
├── app/
│   ├── api/
│   │   ├── predict/            # Budget prediction endpoint
│   │   ├── insights/           # AI insights endpoint
│   │   └── test/               # Railway connectivity check
│   ├── dashboard/              # Main dashboard page
│   ├── expenses/               # Expense management page
│   └── budgets/                # Budget overview page
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── InsightsDrawer.tsx      # AI insights slide-out panel
│   └── AppSidebar.tsx          # Navigation sidebar
├── hooks/
│   └── usePrediction.ts        # Prediction data hook
├── lib/
│   ├── supabase.ts             # Supabase client
│   └── ratelimit.ts            # Upstash rate limiter
└── ml-service/                 # Python FastAPI service
    ├── main.py                 # API routes + ML + LLM logic
    ├── requirements.txt
    └── Procfile                # Railway deployment config
```

---

## API Reference

### `POST /predict`
Trains a Prophet model on the provided expenses and returns next month's predicted spend per category.

**Request:**
```json
[
  { "amount": 1200, "date": "2024-07-01", "category_id": "uuid" }
]
```

**Response:**
```json
{
  "category-uuid": {
    "predicted": 1268.50,
    "lower": 1150.00,
    "upper": 1387.00,
    "month": "2025-01"
  }
}
```

### `POST /insights`
Builds a spending summary and sends it to Groq for AI analysis.

**Response:**
```json
{
  "insights": "1. Overview: ...\n2. Category Breakdown: ..."
}
```

---

## Deployment

### Vercel (Next.js)
```bash
npm install -g vercel
vercel
```

Add all environment variables in Vercel Dashboard → Settings → Environment Variables.

### Railway (Python API)
1. Push to GitHub
2. Create a new Railway project → Deploy from GitHub
3. Set root directory to `ml-service`
4. Add `GROQ_API_KEY` as an environment variable
5. Railway auto-detects the `Procfile` and deploys

Update `ML_API_URL` in Vercel to your Railway public domain.

---

## License

MIT
