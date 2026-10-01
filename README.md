# House Price Predictor

A web app that predicts a property's price from details like location, BHK, area, floor and amenities. The user fills in a form, the React frontend sends the data to an Express API, the API asks a Python service running the trained ML model for a prediction, and the estimate comes back to the browser. Every prediction is stored in MongoDB and shown on a History page.

## How it works

```
React (Vite, :5173)  -->  Express API (:5000)  -->  Flask model service (:8000)
  form + history           validation + MongoDB        compressed model -> price
```

| Part | Folder | Stack | Responsibility |
|---|---|---|---|
| Frontend | `frontend/` | React, Tailwind CSS v4, Vite | Form, estimate card, history table |
| Backend | `backend/` | Node.js, Express, MongoDB (Mongoose) | Input validation, calls the model, saves history |
| Model service | `model-service/` | Python, Flask, scikit-learn | Prefers `model_compressed.joblib`, falls back to `Model.pkl` |

## Features

- Predict price from 18 property inputs, grouped into Location & Type, Size & Floors, and Features
- Estimate shown in Lakh or Crore, plus the implied price per sqft
- Server-side validation (numbers must be non-negative, current floor cannot exceed total floors)
- History page with search, backed by MongoDB
- Prediction history is best-effort: if MongoDB is down, predictions still work

## Project structure

```
house-price/
├── model-service/
│   ├── app.py              # Flask API: POST /predict
│   ├── requirements.txt
│   └── Model.pkl           # Trained model artifact
├── backend/
│   ├── server.js           # Express API: /api/predict, /api/history
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html
    ├── vite.config.js      # Tailwind plugin + /api proxy to :5000
    └── src/
        ├── App.jsx         # Sidebar layout and navigation
        ├── Predict.jsx     # Prediction form and estimate card
        ├── History.jsx     # Past predictions table
        ├── ui.jsx          # Icons and shared helpers
        └── index.css
```

## Prerequisites

- Python 3.9+
- Node.js 20+
- MongoDB (local install or a free MongoDB Atlas cluster)
- A trained model saved with `joblib` (see [Model requirements](#model-requirements))

## Setup

Run each part in its own terminal, in this order.

### 1. Model service (port 8000)

Place the trained model at `model-service/Model.pkl`. Optionally compress it with `python compress.py` before starting the service:

```bash
cd model-service
pip install -r requirements.txt
python app.py
```

Use the same scikit-learn version you trained with, otherwise loading the model may fail.

### 2. Backend (port 5000)

Make sure MongoDB is running, then:

```bash
cd backend
npm install
cp .env.example .env
npm start
```

### 3. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the backend, so no CORS setup is needed in development.

## Environment variables (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Express port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/houseprice` | MongoDB connection string (use your Atlas URI if hosted) |
| `MODEL_URL` | `http://127.0.0.1:8000/predict` | Address of the model service |

## API reference

### `POST /api/predict`

Request body (JSON):

```json
{
  "location": "Gurgaon",
  "Furnishing": "Furnished",
  "facing": "East",
  "Bathroom": 2,
  "Balcony": 1,
  "Ownership": "Freehold",
  "BHK": 3,
  "Property_Type": "Apartment",
  "Carpet_Area": 1200,
  "Super_Area": 1500,
  "Current_Floor": 4,
  "Total_Floors": 12,
  "Parking_Count": 1,
  "Parking_Type": "Covered",
  "overlooking_Garden_Park": true,
  "overlooking_Main_Road": false,
  "overlooking_Pool": false,
  "Has_Society": true
}
```

Success: `200 { "price": 8500000 }` (rupees)

Errors: `400 { "error": "..." }` for invalid input, `502 { "error": "..." }` if the model service fails or is unreachable.

### `GET /api/history`

Returns the 20 most recent predictions, newest first. Each item contains `input`, `price` and `createdAt`.

### `POST /predict` (model service)

Called by the backend only. Takes the same fields (booleans as `1`/`0`) and returns `{ "price": <number> }`.

Quick test without the frontend:

```bash
curl -X POST localhost:5000/api/predict -H 'Content-Type: application/json' \
  -d '{"location":"Gurgaon","Furnishing":"Furnished","facing":"East","Bathroom":2,"Balcony":1,"Ownership":"Freehold","BHK":3,"Property_Type":"Apartment","Carpet_Area":1200,"Super_Area":1500,"Current_Floor":4,"Total_Floors":12,"Parking_Count":1,"Parking_Type":"Covered","overlooking_Garden_Park":true,"overlooking_Main_Road":false,"overlooking_Pool":false,"Has_Society":true}'
```

## Model requirements

The code makes a few assumptions about your model. Adjust the matching place if any of them differs.

| Assumption | Where to change it |
|---|---|
| `Model.pkl` contains the fitted estimator and its one-hot feature names; a compressed copy is preferred when present | `model-service/app.py` |
| Input column names and order match `COLS` | `COLS` in `model-service/app.py` |
| Dropdown options equal the categories seen in training | `COLS` in `frontend/src/Predict.jsx` |
| Yes/no features were trained as `1`/`0` | `BOOL` handling in `backend/server.js` |
| The model outputs `Total_Price` in rupees | `inr()` in `frontend/src/ui.jsx` (divide differently if it outputs lakhs) |

`Total_Price`, `Price_per_sqft` and `Total_Price_in_Lakhs` are not inputs. They are the value being predicted or derived from it, so using them as features would leak the answer to the model.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "model service unreachable" | The model service is not running (step 1). |
| Error about missing or unknown columns | `COLS` in `app.py` does not match your training columns. |
| Error about an unknown category | A dropdown option in `Predict.jsx` was not in your training data. |
| Price is far too large or small | Your model likely outputs lakhs, not rupees. Change `inr()`. |
| History page is empty | MongoDB is not running or `MONGO_URI` is wrong. Predictions still work without it. |
| Model fails to load | scikit-learn version differs from the one used for training. |

## Production build

```bash
cd frontend && npm run build   # outputs static files to frontend/dist
```

Serve `dist/` from any static host and route `/api` to the Express server, since the Vite proxy only exists in development.
