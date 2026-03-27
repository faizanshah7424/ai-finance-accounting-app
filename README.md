# AI Finance & Accounting API

A production-ready finance & accounting platform with:
- **Node.js Express API** - Main backend for accounts, transactions, and summaries
- **Python FastAPI Analysis** - Transaction analysis with category prediction and anomaly detection
- **Next.js Web App** - Modern React frontend with TypeScript and Tailwind CSS

## Features

### Node.js Backend
- ✅ Express.js server with security middleware (Helmet, CORS)
- ✅ MongoDB connection with Mongoose
- ✅ RESTful API structure
- ✅ Input validation with express-validator
- ✅ Error handling middleware
- ✅ Request logging (Morgan)
- ✅ Environment configuration

### Python Analysis API
- ✅ Rule-based category prediction
- ✅ Anomaly detection
- ✅ Batch processing support

### Next.js Frontend
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ App Router architecture
- ✅ Clean, responsive UI

## Project Structure

```
ai-finance-accounts-app/
├── analysis-api/         # Python FastAPI analysis service
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
├── web/                  # Next.js frontend application
│   ├── src/
│   │   ├── app/
│   │   └── components/
│   ├── package.json
│   └── README.md
├── config/
│   └── database.js       # MongoDB connection
├── controllers/
│   ├── accountController.js
│   ├── transactionController.js
│   ├── summaryController.js
│   └── aiTransactionController.js
├── services/
│   └── analysisService.js # FastAPI client service
├── middleware/
├── models/
│   ├── Account.js        # Account model
│   └── Transaction.js    # Transaction model
├── routes/
│   ├── accountRoutes.js
│   ├── transactionRoutes.js
│   └── summaryRoutes.js
├── .env                  # Environment variables
├── .env.example          # Environment template
├── server.js             # Main entry point
└── package.json
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI
```

3. Start MongoDB (if running locally)

4. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts` | Get all accounts |
| GET | `/api/v1/accounts/:id` | Get single account |
| GET | `/api/v1/accounts/summary` | Get account summary |
| POST | `/api/v1/accounts` | Create account |
| PUT | `/api/v1/accounts/:id` | Update account |
| DELETE | `/api/v1/accounts/:id` | Delete account |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/transactions` | Get all transactions |
| GET | `/api/v1/transactions/:id` | Get single transaction |
| GET | `/api/v1/transactions/categories` | Get categories summary |
| POST | `/api/v1/transactions` | Add transaction |
| PUT | `/api/v1/transactions/:id` | Update transaction |
| DELETE | `/api/v1/transactions/:id` | Delete transaction |

### Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/summary/financial` | Get total income, expense, balance |
| GET | `/api/v1/summary/overview` | Get balance overview with percentages |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | Required |
| CORS_ORIGIN | CORS allowed origin | * |

## Example Request

```bash
# Create an account
curl -X POST http://localhost:3000/api/v1/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Cash Account",
    "accountType": "asset",
    "accountNumber": "ACC001",
    "balance": 10000,
    "currency": "USD"
  }'

# Add a transaction
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "type": "expense",
    "category": "Office Supplies",
    "date": "2026-03-25",
    "description": "Bought office stationery"
  }'

# Get financial summary
curl http://localhost:3000/api/v1/summary/financial

# Get financial summary with date range
curl "http://localhost:3000/api/v1/summary/financial?startDate=2026-01-01&endDate=2026-03-31"
```

## Python Analysis API

### Analyze Transaction

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Starbucks coffee downtown",
    "amount": 5.99
  }'
```

**Response:**
```json
{
  "success": true,
  "predicted_category": {
    "category": "Food & Dining",
    "confidence": 0.6,
    "matched_keywords": ["starbucks", "coffee"]
  },
  "anomaly": {
    "is_anomaly": false,
    "reason": "Amount $5.99 is within normal range",
    "severity": "low"
  }
}
```

### Batch Analysis

```bash
curl -X POST http://localhost:8000/analyze/batch \
  -H "Content-Type: application/json" \
  -d '[
    {"description": "Netflix subscription", "amount": 15.99},
    {"description": "Large wire transfer", "amount": 5000.00}
  ]'
```

### Run Analysis API

```bash
cd analysis-api
pip install -r requirements.txt
uvicorn main:app --reload
```

Access docs at: http://localhost:8000/docs

## Next.js Frontend

### Install Dependencies

```bash
cd web
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Add Transaction Page

Navigate to the home page to access the "Add Transaction" form with:
- Description input
- Amount input (with $ prefix)
- Date picker
- Submit button

## License

ISC
