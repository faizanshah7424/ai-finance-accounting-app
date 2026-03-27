# Transaction Analysis API

FastAPI-based transaction analysis service with rule-based category prediction and anomaly detection.

## Features

- **Category Prediction**: Predicts transaction category based on keywords in description
- **Anomaly Detection**: Flags unusual transactions based on amount thresholds
- **Batch Processing**: Analyze multiple transactions at once

## Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Run the Server

```bash
# Development
uvicorn main:app --reload

# Production
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Health Check
```
GET /health
```

### Analyze Single Transaction
```
POST /analyze
Content-Type: application/json

{
  "description": "Starbucks coffee",
  "amount": 5.99
}
```

**Response:**
```json
{
  "success": true,
  "input": {
    "description": "Starbucks coffee",
    "amount": 5.99
  },
  "predicted_category": {
    "category": "Food & Dining",
    "confidence": 0.6,
    "matched_keywords": ["starbucks", "coffee"]
  },
  "anomaly": {
    "is_anomaly": false,
    "reason": "Amount $5.99 is within normal range",
    "severity": "low"
  },
  "timestamp": "2026-03-25T10:30:00.000Z"
}
```

### Analyze Batch Transactions
```
POST /analyze/batch
Content-Type: application/json

[
  {"description": "Netflix subscription", "amount": 15.99},
  {"description": "Amazon order", "amount": 250.00},
  {"description": "Unknown transfer", "amount": 5000.00}
]
```

### Get Categories
```
GET /categories
```

## Categories

| Category | Example Keywords |
|----------|------------------|
| Food & Dining | restaurant, cafe, coffee, pizza, grocery |
| Transportation | uber, lyft, gas, parking, flight |
| Shopping | amazon, ebay, shop, clothing, electronics |
| Entertainment | netflix, spotify, movie, game, concert |
| Bills & Utilities | electric, water, internet, insurance, rent |
| Healthcare | pharmacy, doctor, hospital, medical |
| Income | salary, paycheck, deposit, refund |
| Fees & Charges | fee, charge, penalty, interest |
| Education | school, university, course, tuition |
| Personal Care | salon, gym, fitness, beauty |

## Anomaly Thresholds

| Severity | Threshold | Action |
|----------|-----------|--------|
| Low | < $100 | Normal |
| Medium | $100 - $500 | Review recommended |
| High | $500 - $1000 | Flag as anomaly |
| Critical | > $1000 | Critical anomaly |

## Interactive Docs

Once running, access interactive API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
