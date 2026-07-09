# GreenCycle

An AI-powered environmental platform: recycling and pollution photo analysis,
a city-level carbon simulator, and a chat assistant — served by a FastAPI
backend and a Next.js frontend.

## What's actually wired up

| Module | Page | Backend route | Model |
|---|---|---|---|
| Recycling Scan | `/recycling` | `POST /api/analyze-recycling` | Groq vision-language model (`meta-llama/llama-4-scout-17b-16e-instruct`) |
| Pollution Scan | `/pollution` | `POST /api/analyze-pollution` | Same vision-language model |
| City Simulator | `/city` | `POST /api/simulate-city` | Fixed emissions formulas + Groq text model (`llama-3.3-70b-versatile`) |
| Eco Advisor | `/chatbot` | `POST /api/chat` | Same text model, Markdown stripped for plain-text chat |

**About the notebooks:** `ML_Models.ipynb` (CO2-per-capita regression, best
result Ridge Regression R²=0.99) and `waste_classifier_webcam.ipynb`
(MobileNetV2 waste classifier, 87.89% validation accuracy, 10 classes) are
real, working training notebooks — but neither `best_model.pkl` nor
`waste_model.pth` was included in the project files, and the original
`main.py` never imported or served them. So this build does **not** invent
an endpoint for them; it wires the frontend to the four routes that
actually exist. The Dashboard page states this plainly instead of quietly
pretending those two modules are live. If you export `best_model.pkl` /
`waste_model.pth` from the notebooks, see "Adding the trained models" below
to wire them in for real.

## ⚠️ Before you do anything else: rotate your Groq key

The `_env` file you uploaded contained a live Groq API key in plain text
(under the variable name `GEMINI_API_KEY`, though the key format is a Groq
key). That file is not used anywhere in this build — I generated a fresh
`.env.example` with a placeholder instead — but if that key has ever been
committed to a repo, shared, or uploaded anywhere, **revoke it and generate
a new one** at https://console.groq.com/keys before deploying.

## Project structure

```
GreenCycle/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── requirements.txt
│   ├── .env.example             # copy to .env and fill in GROQ_API_KEY
│   ├── Dockerfile
│   ├── Routes/                  # thin HTTP layer: validation + error handling
│   │   ├── chatbot.py
│   │   ├── city.py
│   │   ├── pollution.py
│   │   └── recycling.py
│   └── services/                # business logic + Groq calls
│       ├── config.py            # shared env loading + Groq client
│       ├── chat_service.py
│       ├── city_service.py
│       ├── pollution_service.py
│       └── recycling_service.py
└── frontend/
    ├── src/
    │   ├── app/                 # Next.js App Router pages
    │   │   ├── page.tsx         # Landing
    │   │   ├── dashboard/
    │   │   ├── recycling/
    │   │   ├── pollution/
    │   │   ├── city/
    │   │   └── chatbot/
    │   ├── components/          # Navbar, Footer, UploadBox, cards, etc.
    │   ├── lib/api.ts            # fetch wrapper for the backend
    │   └── types/
    ├── package.json
    └── .env.local.example        # copy to .env.local, set NEXT_PUBLIC_API_URL
```

## Requirements

- Python 3.11+ (3.14 also works, but 3.11 matches the provided Dockerfile)
- Node.js 18.18+ (Node 20 LTS recommended)
- A Groq API key: https://console.groq.com/keys

## Install

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# now edit .env and paste your real GROQ_API_KEY
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local
# defaults to http://localhost:8000 — only change this if your backend runs elsewhere
```

## Run (start the backend first)

**1. Backend** (from `backend/`):
```bash
uvicorn main:app --reload --port 8000
```
Confirm it's up: open http://localhost:8000 — you should see
`{"message": "Eco AI API is running!"}`. Interactive API docs are at
http://localhost:8000/docs.

**2. Frontend** (from `frontend/`, in a second terminal):
```bash
npm run dev
```
Open http://localhost:3000.

## Manually testing each feature

- **Recycling Scan** (`/recycling`): upload a photo of any single object
  (a bottle, a can, a piece of cardboard). You should get a material type,
  recycling code, and disposal guidance within a few seconds.
- **Pollution Scan** (`/pollution`): upload a photo of an outdoor scene.
  You should get a pollution type, severity level, and cause.
- **City Simulator** (`/city`): the form is pre-filled with example numbers
  — just click "Run simulation". Try zeroing out `factories` and `cars` to
  see the projection change.
- **Eco Advisor** (`/chatbot`): send "What's the difference between PET and
  HDPE plastic?" and confirm you get a plain-text reply with no Markdown
  asterisks or headers.
- **Error handling**: try uploading a `.txt` file to either scan page — you
  should get a clear "Unsupported file type" message, not a crash. Stop the
  backend and try any action — you should get "Couldn't reach the service…"
  instead of a blank screen.

## Troubleshooting

**Port already in use (8000 or 3000)**
```bash
# backend on a different port
uvicorn main:app --reload --port 8001
# then update NEXT_PUBLIC_API_URL in frontend/.env.local to match
```

**CORS errors in the browser console**
`main.py` allows all origins by default (`FRONTEND_ORIGIN=*` in `.env`),
which is fine for local dev. If you set `FRONTEND_ORIGIN` to a specific
URL for production, make sure it exactly matches the frontend's deployed
URL (including `https://` and no trailing slash).

**"GROQ_API_KEY is missing or invalid" / 503 errors**
Your `backend/.env` either doesn't exist or the key wasn't pasted in.
Confirm the file is named exactly `.env` (not `.env.example`) and sits in
`backend/`, then restart uvicorn (env vars are only read on startup).

**"Couldn't reach the service" on every page**
The backend isn't running, or `NEXT_PUBLIC_API_URL` doesn't match where
it's running. Check `frontend/.env.local`, then restart `npm run dev`
(Next.js only reads `.env.local` at startup).

**Missing dependencies**
Backend: re-run `pip install -r requirements.txt` inside the activated
virtual environment. Frontend: delete `node_modules` and `package-lock.json`,
then run `npm install` again.

**Model loading / analysis errors from Groq**
These come back as a clear error banner in the UI (not a crash) with
Groq's own error message — usually an invalid key, a rate limit, or an
unsupported image format. Check the terminal running `uvicorn` for the
full traceback.

## Adding the trained notebook models (optional, real integration)

To actually serve `waste_model.pth` (MobileNetV2) or `best_model.pkl`
(CO2 regression) instead of the Groq vision model:

1. Export the artifacts from the notebooks (`torch.save(...)` /
   `joblib.dump(...)` cells already exist — just run them and copy the
   output files into `backend/models/`).
2. Add `torch` + `torchvision` (for the classifier) or `scikit-learn` +
   `xgboost` (for the regressor) to `requirements.txt`.
3. Add a new service (e.g. `services/waste_classifier_service.py`) that
   loads the checkpoint once at import time and exposes a `predict(image_bytes)`
   function, mirroring `pollution_service.py`'s structure.
4. Register a new route (e.g. `Routes/classify_waste.py`) and include it
   in `main.py`, the same way the four existing routers are included.
5. Point a frontend page at the new route using the existing
   `analyzeRecycling`-style pattern in `src/lib/api.ts`.

I didn't do this by default since the trained weight files weren't part of
the upload — happy to wire it in if you export and share them.
