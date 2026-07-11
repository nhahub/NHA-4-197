# 🌱 GreenCycle — AI-Powered Environmental Intelligence Platform

GreenCycle combines a trained CO2 regression model, a computer-vision waste classifier, and three LLM-powered API services (chat, city simulation, vision analysis) behind a FastAPI backend and a Next.js frontend — helping people and cities turn environmental data into practical decisions.

> **Status:** Research/prototype stage. Two models are trained and validated (see [Models & Results](#-models--results)), and a working API + frontend exist — but they are currently **two separate tracks** that haven't been merged yet (see [Known Issues](#-known-issues--honest-limitations)). This README states that plainly rather than implying a finished production system.

---

## Table of Contents

- [Repository Structure](#-repository-structure)
- [Datasets](#-datasets)
- [Notebooks](#-notebooks)
- [Models & Results](#-models--results)
- [Backend / API](#-backend--api)
- [Frontend](#-frontend)
- [Deployment](#-deployment)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Documentation & Presentations](#-documentation--presentations)
- [Known Issues & Honest Limitations](#-known-issues--honest-limitations)
- [Roadmap](#-roadmap)
- [Team](#-team)

---

## 📁 Repository Structure

The files shared during development weren't in a folder structure, so here's the layout this README assumes when organizing them for GitHub. Rename/move files into this structure before pushing:

```
greencycle/
├── README.md
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example             # see Environment Variables — do NOT commit a real .env
│   ├── .gitignore
│   ├── Routes/
│   │   ├── __init__.py
│   │   ├── chatbot.py           # POST /api/chat
│   │   ├── city.py              # POST /api/simulate-city
│   │   ├── pollution.py         # POST /api/analyze-pollution
│   │   └── recycling.py         # POST /api/analyze-recycling
│   └── services/
│       ├── __init__.py
│       ├── chat_service.py
│       ├── city_service.py
│       ├── pollution_service.py
│       └── recycling_service.py
│
├── dashboards/
│   └── app.py                   # Streamlit "CO2 Model Comparison" prototype (standalone, not part of the API)
│
├── frontend/                    # Next.js 16 + TypeScript + Tailwind app (7 pages, wired to the 4 API endpoints)
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── types/
│
├── notebooks/
│   ├── co2_emissions/
│   │   ├── CO2_clean.ipynb      # ✅ authoritative cleaning notebook
│   │   ├── CO2_Cleaning.ipynb   # earlier draft — superseded, kept for history
│   │   ├── ML_Models.ipynb      # ✅ authoritative regression modeling notebook
│   │   └── ML_Modle.ipynb       # earlier draft — superseded, kept for history
│   ├── municipal_waste/
│   │   ├── data_cleaninig.ipynb           # plastic waste + city air/water cleaning
│   │   └── municipal_waste_analysis.ipynb # disposal methods, collection rates, correlations
│   ├── materials_recycling/
│   │   └── data_pre.ipynb       # materials recycling core dataset (EDA only, not yet modeled)
│   └── computer_vision/
│       └── waste_classifier_webcam.ipynb  # MobileNetV2 image classifier + webcam demo
│
├── data/
│   ├── raw/
│   │   ├── Cities1.csv
│   │   ├── municipal-waste-management-method.csv
│   │   ├── OECD_ENV_EPI_DSD_MUNW_DF_MUNW_1_0__A_MUNICIPAL_T.csv
│   │   ├── share-waste-collected.csv
│   │   └── 1260352_supportingfile_suppl__excel_seq1_v1.xlsx
│   └── processed/
│       ├── cleaned_data.csv       # plastic waste by country (107 rows × 13 cols)
│       ├── cleaned_data2.csv      # city air/water quality (3,446 rows)
│       └── co2_ml_ready.csv       # CO2 regression-ready dataset (12,225 rows × 33 cols)
│
├── models/                      # generated locally by running the notebooks — NOT uploaded as files, see note below
│   ├── best_model.pkl            # Ridge regressor (CO2 per capita)
│   ├── scaler.pkl
│   └── waste_model.pth           # MobileNetV2 classifier weights + class names
│
└── docs/
    ├── brand/
    │   └── greencycle_brand_board.png
    └── presentations/
        ├── GreenCycle_Presentation.pptx
        ├── GreenCycle_Technical_Review.pptx
        └── GreenCycle_Full_Technical_Review.pptx
```

**Do not commit these** (they were uploaded but are local Python virtual-environment artifacts, not project source):
`pyvenv.cfg`, `CACHEDIR.TAG`, and the uploaded `_gitignore` (its content is literally `*`, i.e. "ignore everything" — it's the auto-generated `.gitignore` from inside a `venv/` folder, not a real project `.gitignore`). A proper `.gitignore` is suggested in [Getting Started](#-getting-started).

---

## 📊 Datasets

| Dataset | Source | Size | Confidence |
|---|---|---|---|
| OWID CO2 & GHG Emissions | [ourworldindata.org/co2-and-greenhouse-gas-emissions](https://ourworldindata.org/co2-and-greenhouse-gas-emissions) (`owid-co2-data.csv`) | 12,225 rows × 33 cols, 163 countries, 1950–2024 | ✅ Well-known public dataset |
| Mismanaged Plastic Waste per Capita | [OWID: mismanaged-plastic-waste-per-capita](https://ourworldindata.org/grapher/mismanaged-plastic-waste-per-capita) | 107 rows × 13 cols | ✅ Confirmed — column name matches exactly (`mismanaged_plastic_waste_kg_person_day`) |
| Municipal Waste Management Methods | Possibly [Kaggle: warp-waste-recycling-plant-dataset](https://www.kaggle.com/datasets/parohod/warp-waste-recycling-plant-dataset) | 239 countries, 2020 + OECD generation trend (2015–2024) | ⚠️ Plausible, not confirmed — not named in the notebook |
| City Air & Water Quality | Filename only: `Cities1.csv` | 3,446 rows (cleaned), 176 countries | ⚠️ Source undocumented in the notebook |
| Materials Recycling Core | Filename only: `materials_recycling_core.csv` | 25,000 records, 74 cols (cleaned) | ⚠️ Source undocumented in the notebook |
| Waste Image Dataset | Possibly [Kaggle: garbage-classification-v2](https://www.kaggle.com/datasets/sumn2u/garbage-classification-v2) | 12,259 images, 10 classes | ⚠️ Likely match (classes align); code folder named `standardized_2569` |
| Global Plastic Waste (supplementary) | `1260352_supportingfile_suppl__excel_seq1_v1.xlsx` (Jambeck et al.–style data) | 5 rows sampled, country-level | ⚠️ Likely related to the plastic-waste dataset above, packaged separately |

✅ = confirmed by direct evidence (matching column names, well-known dataset). ⚠️ = real and used, but the notebooks don't name their exact source — flagged rather than guessed.

---

## 📓 Notebooks

| Notebook | Purpose | Key output |
|---|---|---|
| `CO2_clean.ipynb` | Cleans the raw OWID CO2 dataset: scopes to 163 real countries, fixes impossible negative values, caps outliers, tiered missing-value imputation, one-hot encoding | `co2_ml_ready.csv` |
| `ML_Models.ipynb` | Trains and compares 5 regression models to predict `co2_per_capita` | Best: **Ridge Regression, R² = 0.9902** (see caveat below) |
| `data_cleaninig.ipynb` | Cleans the plastic-waste-by-country dataset and the raw city dataset | `cleaned_data.csv`, `cleaned_data2.csv` |
| `municipal_waste_analysis.ipynb` | EDA across municipal waste methods, collection rates, OECD trends, and cross-dataset correlations with air/water quality | Key insight: open dumping (33.6%) is the dominant global disposal method; recycling rate correlates with air quality (r = +0.43) |
| `data_pre.ipynb` | Cleans and explores the materials recycling core dataset | EDA only — **not yet used to train a supervised model** |
| `waste_classifier_webcam.ipynb` | Trains a MobileNetV2 image classifier on 10 waste classes; includes a live OpenCV webcam demo | **87.89% validation accuracy** |

`CO2_Cleaning.ipynb` and `ML_Modle.ipynb` are earlier drafts, superseded by `CO2_clean.ipynb` and `ML_Models.ipynb` respectively — kept in the repo for history, but not the source of truth.

---

## 🤖 Models & Results

### CO2 Regression (`ML_Models.ipynb`)

| Model | R² | RMSE | MAE |
|---|---|---|---|
| **Ridge Regression** | **0.9902** | **0.6693** | 0.3401 |
| Gradient Boosting | 0.9262 | 1.8359 | 0.3982 |
| Random Forest | 0.8875 | 2.2663 | **0.1997** |
| XGBoost | 0.8807 | 2.3339 | 0.2562 |
| Linear Regression | 0.7178 | 3.5896 | 1.7693 |

⚠️ **Important caveat:** the feature set includes one-hot encoded `country` and `iso_code` columns. Since `co2_per_capita` is stable per country year to year, Ridge's very high R² likely reflects partial per-country memorization, not purely learning from the engineered numeric drivers. This is worth re-testing without country identity before treating 0.99 as ground truth. There's also a reproducibility gap: the notebook's own output (9,780 × 354 columns) doesn't match what its visible code would produce, suggesting cells were edited or re-run out of order.

### Waste Image Classifier (`waste_classifier_webcam.ipynb`)

- **Architecture:** MobileNetV2 (ImageNet-pretrained, transfer learning) — only architecture tested, chosen for practical CPU training
- **Training:** 10 epochs, Adam (lr=0.001), CrossEntropyLoss, batch size 32, no data augmentation, CPU only
- **Result:** training accuracy 75.6% → 93.2%; **validation accuracy 87.89%** (2,452 held-out images, 10 classes)
- **Known limitation:** a single-image sanity check in the notebook misclassified a metal item as "battery" (0.56 confidence) — included here transparently, not hidden

---

## 🔌 Backend / API

FastAPI app (`main.py`) with CORS open to all origins. **Important:** these endpoints call Groq-hosted LLMs directly — they do **not** currently serve the trained CO2/CV models above (see [Known Issues](#-known-issues--honest-limitations)).

| Method | Endpoint | Description | Backend model |
|---|---|---|---|
| `POST` | `/api/chat` | Eco AI Advisor chatbot | Groq `llama-3.3-70b-versatile` |
| `POST` | `/api/simulate-city` | City CO2/AQI narrative simulation from population, cars, factories, trees, energy usage | Groq `llama-3.3-70b-versatile` |
| `POST` | `/api/analyze-pollution` | Analyzes an uploaded photo for pollution type, severity, cause | Groq `llama-4-scout-17b-16e-instruct` (vision) |
| `POST` | `/api/analyze-recycling` | Analyzes an uploaded photo for material type and recyclability | Groq `llama-4-scout-17b-16e-instruct` (vision) |

All four return **unstructured text** (`{response}`, `{simulation}`, or `{analysis}`) — there is no confidence score or structured JSON in any response.

There's also a standalone **Streamlit dashboard** (`dashboards/app.py`, "CO2 Model Comparison") that trains and compares 5 regression models live from an uploaded CSV using `GridSearchCV` — note this uses a *different* modeling approach (with cross-validation/tuning) than `ML_Models.ipynb` (fixed hyperparameters, no tuning). The two aren't reconciled; treat them as separate prototypes.

---

## 💻 Frontend

A Next.js 16 (App Router) + TypeScript + Tailwind CSS application, built against the real API contracts above (not a generic assumed schema):

| Page | Route | Connects to |
|---|---|---|
| Landing | `/` | — |
| Dashboard | `/dashboard` | Links to all 3 tools |
| City Simulator | `/simulator` | `POST /api/simulate-city` |
| Vision Lab | `/vision` | `POST /api/analyze-pollution`, `POST /api/analyze-recycling` (tabbed) |
| AI Chatbot | `/chatbot` | `POST /api/chat` |
| About | `/about` | — |
| Contact | `/contact` | No backend endpoint exists yet — form is validated and ready, submission is a stub (`lib/api/contact.ts`) |

Brand colors used throughout: `#2E7D32` (deep green), `#66BB6A` (light green), `#4FC3F7` (sky blue). No vector logo file was supplied, only a reference brand board image — the logo is a recreated SVG (`components/brand/Logo.tsx`). No typeface was specified, so headings use a Poppins-first font stack and body text an Inter-first stack, both falling back to system fonts.

Verified to build and lint cleanly (`npm run build`, `npm run lint`).

---

## 🚢 Deployment

```
User → Frontend (Next.js) → API (FastAPI) → Docker Container → Groq LLM → Response
```

Confirmed from the provided `Dockerfile`:
- Base image: `python:3.11-slim`
- Installs `requirements.txt`, copies the app, runs `uvicorn main:app --host 0.0.0.0 --port 7860`

**Not yet connected:** the trained `best_model.pkl`/`scaler.pkl` (regression) and `waste_model.pth` (CV) are not loaded or served anywhere in the provided route files — the live API uses Groq's hosted LLMs for chat, simulation, and vision instead. No CI/CD pipeline was found alongside the Dockerfile.

---

## 🚀 Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env            # then fill in your real key — see below
uvicorn main:app --reload --port 7860
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local      # set NEXT_PUBLIC_API_BASE_URL=http://localhost:7860
npm run dev
```

Open http://localhost:3000.

### Streamlit dashboard (optional, standalone)

```bash
cd dashboards
pip install streamlit scikit-learn xgboost matplotlib pandas
streamlit run app.py
```

### Suggested `.gitignore` (backend)

```
venv/
__pycache__/
*.pyc
.env
*.pkl
*.pth
.DS_Store
```

---

## 🔑 Environment Variables

The backend needs a Groq API key. Create `backend/.env`:

```
GROQ_API_KEY=your_key_here
```

⚠️ **Two things to fix, found while reviewing the uploaded `.env`:**
1. **The variable name is wrong in the file that was shared.** It was named `GEMINI_API_KEY`, but every service file (`chat_service.py`, `city_service.py`, etc.) reads `os.getenv("GROQ_API_KEY")`. As uploaded, the `.env` wouldn't actually authenticate the app — rename the key to `GROQ_API_KEY`.
2. **A real, live-looking API key was included in that file and shared in this chat.** Treat it as compromised: **rotate/revoke it in the Groq console immediately** and generate a new one. Never commit a real `.env` file to GitHub — only commit `.env.example` with placeholder values, which is what this README's structure assumes.

---

## 📑 Documentation & Presentations

Three presentation decks were produced over the course of this project (`docs/presentations/`):
1. `GreenCycle_Presentation.pptx` — initial project overview deck
2. `GreenCycle_Technical_Review.pptx` — 15-slide technical review
3. `GreenCycle_Full_Technical_Review.pptx` — 25-slide expanded technical review (most complete; recommended for evaluation/grading use)

No standalone written report/documentation file beyond these decks was provided.

---

## ⚠️ Known Issues & Honest Limitations

- **Trained models aren't wired into the live API.** The deployed endpoints use Groq LLMs, not `best_model.pkl` or `waste_model.pth`. These are currently two separate tracks of work.
- **Possible leakage in the CO2 regression model.** One-hot encoded `country`/`iso_code` features may inflate Ridge's R² via per-country memorization.
- **A reproducibility gap in `ML_Models.ipynb`.** Its printed output (354 feature columns) can't be reproduced from its own visible code — likely stale or out-of-order cell execution.
- **No experiment tracking.** No MLflow, Weights & Biases, or similar tool exists anywhere in the provided files — only final model artifacts.
- **No automated tests.** No unit tests, API tests, or CI pipeline were found for the backend or frontend.
- **No data augmentation** was used for the image classifier, likely contributing to the ~5-point gap between training (93.2%) and validation (87.9%) accuracy.
- **The materials recycling dataset (25,000 records) is EDA-only** — not yet used to train a supervised recyclability/disposal-method model.
- **`app.py` (Streamlit) and `ML_Models.ipynb` use different, unreconciled modeling approaches** for the same CO2 prediction task.
- **No GitHub repository URL, standalone report, or CI/CD pipeline** was available at the time this README was written.

---

## 🗺 Roadmap

- [ ] Connect `best_model.pkl` and `waste_model.pth` to real `/predict`-style API routes
- [ ] Re-run CO2 regression without country-identity features to test for leakage
- [ ] Add cross-validation and hyperparameter tuning with a tracked experiment log (e.g. MLflow)
- [ ] Add data augmentation and a confusion matrix for the image classifier
- [ ] Train a supervised model on the materials recycling dataset
- [ ] Add authentication/rate-limiting to the API (CORS is currently open to all origins)
- [ ] Add a real `/api/contact` endpoint and wire up the frontend contact form
- [ ] Add automated tests and a CI/CD pipeline

---

## 👥 Team

- Ziad Omran
- Abdelrahman Kewan
- Mostafa Shalan
- Mahmoud Amer
- Sohila Ihab
- Shaza Beder
