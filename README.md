# AI Finance & Accounting App

<div align="center">

![AI Finance Banner](https://img.shields.io/badge/AI%20Finance-Modern%20Accounting-blue?style=for-the-badge)

**A modern, AI-powered finance and accounting platform with intelligent transaction categorization and anomaly detection**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-green?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🏦 Transaction Management
- **Add Transactions** - Record income and expenses with a clean, intuitive form
- **View All Transactions** - Browse, search, and filter your complete transaction history
- **Delete Transactions** - Remove unwanted entries with confirmation
- **Smart Filtering** - Filter by type (income/expense), category, and anomaly status

### 🤖 AI-Powered Features
- **Automatic Categorization** - AI analyzes transaction descriptions to predict categories
  - 10+ spending categories (Food & Dining, Transportation, Shopping, Entertainment, etc.)
  - Confidence scoring (0-100%) for each prediction
  - Keyword-based matching with intelligent scoring

- **Anomaly Detection** - Identify unusual transactions automatically
  - Amount-based threshold detection
  - Category-specific anomaly rules
  - Severity levels: Low, Medium, High
  - Visual warnings with severity indicators

### 📊 Dashboard & Analytics
- **Financial Overview** - Real-time stats for income, expenses, and balance
- **Category Breakdown** - Interactive pie chart showing spending by category
- **Monthly Trends** - Bar chart comparing income vs expenses over time
- **Performance Summary** - Best month, highest spend, and average monthly savings

### 🎨 Modern UI/UX
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Clean Interface** - Professional SaaS-style design with Tailwind CSS
- **Smooth Animations** - Hover effects, transitions, and loading states
- **Color-Coded Badges** - Visual indicators for transaction types and status

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14 | React framework with App Router |
| **React** | 18 | UI library |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 3 | Styling |
| **Recharts** | Latest | Charts and graphs |
| **Axios** | Latest | HTTP client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20 | Runtime environment |
| **Express.js** | 5 | Web framework |
| **Mongoose** | 9 | MongoDB ODM |
| **Express Validator** | Latest | Input validation |

### AI Service
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.x | AI/ML runtime |
| **FastAPI** | Latest | API framework |
| **Uvicorn** | Latest | ASGI server |

### Database
| Technology | Purpose |
|------------|---------|
| **MongoDB Atlas** | Cloud database |

---

## 📸 Screenshots

### Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  📊 Dashboard                                           │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┬──────────┬──────────┬──────────┐          │
│  │ Balance │  Income  │ Expenses │ Anomalies│          │
│  │ $1,800  │  $5,200  │  $3,100  │    2     │          │
│  └─────────┴──────────┴──────────┴──────────┘          │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │  Spending by     │  │  Monthly Overview│            │
│  │  Category 🥧     │  │  Income vs Exp   │            │
│  └──────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### Add Transaction with AI Analysis
```
┌─────────────────────────────────────────────────────────┐
│  ➕ Add Transaction                                     │
├─────────────────────────────────────────────────────────┤
│  [💸 Expense] [💰 Income]                              │
│                                                          │
│  Description: [Team Lunch at Restaurant]               │
│  Amount: [$150.00]          Date: [2026-03-27]         │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🤖 AI Analysis Result                           │   │
│  │ ─────────────────────────────────────────────── │   │
│  │ 📁 Category: [Food & Dining]                    │   │
│  │ ⚡ Confidence: ████████░░ 80%                   │   │
│  │ ✓ Transaction Normal                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  [Add Expense]                                          │
└─────────────────────────────────────────────────────────┘
```

### Transactions List
```
┌─────────────────────────────────────────────────────────┐
│  📄 Transactions                                        │
├─────────────────────────────────────────────────────────┤
│  [All] [Income] [Expense]  [Category▼] [Status▼] 🔍   │
├─────────────────────────────────────────────────────────┤
│  Transaction  │ Category │ Date  │ Amount  │ Status   │
├───────────────┼──────────┼───────┼─────────┼──────────┤
│  💼 Salary    │ Income   │ Mar 1 │ +$5,000 │ ✓ Normal │
│  🛒 Shopping  │ Shopping │ Mar 5 │ -$250   │ ✓ Normal │
│  🍕 Restaurant│ Food     │ Mar 7 │ -$150   │ ⚠️ Anomaly│
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **MongoDB Atlas** account - [Sign Up](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** package manager

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-finance-accounts-app.git
cd ai-finance-accounts-app
```

### 2. Install Backend Dependencies

```bash
# Install Node.js dependencies
npm install
```

### 3. Install Frontend Dependencies

```bash
# Navigate to web directory
cd web

# Install Next.js dependencies
npm install

# Return to root
cd ..
```

### 4. Install AI Service Dependencies

```bash
# Navigate to analysis-api directory
cd analysis-api

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Return to root
cd ..
```

### 5. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-finance

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# AI Analysis API Configuration
ANALYSIS_API_URL=http://127.0.0.1:8000
```

Create a `.env.local` file in the `web` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## ▶️ Running the Application

You need to run **three separate terminals** for the full application:

### Terminal 1: Backend Server (Node.js)

```bash
# From root directory
npm run dev
```

Server will start on: **http://localhost:5000**

### Terminal 2: AI Service (FastAPI)

```bash
# From root directory
cd analysis-api

# Activate virtual environment (if not already active)
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

AI API will start on: **http://127.0.0.1:8000**

### Terminal 3: Frontend (Next.js)

```bash
# From web directory
cd web
npm run dev
```

Frontend will start on: **http://localhost:3000**

---

## 🌐 API Endpoints

### Backend API (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/transactions` | Get all transactions |
| `GET` | `/api/transactions/:id` | Get single transaction |
| `POST` | `/api/transactions` | Create transaction (with AI analysis) |
| `PUT` | `/api/transactions/:id` | Update transaction |
| `DELETE` | `/api/transactions/:id` | Delete transaction |
| `GET` | `/api/transactions/categories` | Get category breakdown |
| `GET` | `/api/summary/financial` | Get financial summary |
| `GET` | `/api/summary/overview` | Get balance overview |
| `GET` | `/api/accounts` | Get all accounts |
| `POST` | `/api/accounts` | Create account |

### AI Analysis API (Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/analyze` | Analyze single transaction |
| `POST` | `/analyze/batch` | Analyze multiple transactions |
| `GET` | `/categories` | Get available categories |

---

## 📁 Project Structure

```
ai-finance-accounts-app/
├── analysis-api/              # Python FastAPI AI service
│   ├── main.py               # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── README.md             # AI service documentation
│
├── web/                       # Next.js frontend
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── dashboard/    # Dashboard page
│   │   │   ├── transactions/ # Transactions list page
│   │   │   ├── layout.tsx    # Root layout
│   │   │   └── page.tsx      # Add transaction page
│   │   ├── components/       # Reusable components
│   │   │   ├── Navbar.tsx    # Navigation bar
│   │   │   └── TransactionForm.tsx
│   │   └── app/globals.css   # Global styles
│   ├── package.json
│   └── README.md
│
├── config/                    # Backend configuration
│   └── database.js           # MongoDB connection
│
├── controllers/               # Backend controllers
│   ├── accountController.js
│   ├── transactionController.js
│   └── summaryController.js
│
├── models/                    # Mongoose models
│   ├── Account.js
│   └── Transaction.js
│
├── routes/                    # Express routes
│   ├── accountRoutes.js
│   ├── transactionRoutes.js
│   └── summaryRoutes.js
│
├── services/                  # Backend services
│   └── analysisService.js    # AI API client
│
├── .env                       # Environment variables
├── .env.example              # Environment template
├── server.js                 # Express server entry
├── package.json              # Backend dependencies
└── README.md                 # This file
```

---

## 🚀 Future Improvements

### Short Term
- [ ] **User Authentication** - JWT-based auth with login/signup
- [ ] **Budget Management** - Set and track monthly budgets per category
- [ ] **Export Functionality** - Export transactions to CSV/PDF
- [ ] **Recurring Transactions** - Auto-create recurring income/expenses
- [ ] **Dark Mode** - Toggle between light and dark themes

### Medium Term
- [ ] **Multi-Currency Support** - Handle multiple currencies with conversion
- [ ] **Bank Integration** - Connect to bank accounts via Plaid API
- [ ] **Mobile App** - React Native mobile application
- [ ] **Email Notifications** - Alerts for anomalies and budget limits
- [ ] **Advanced Filters** - Date range, amount range, custom tags

### Long Term
- [ ] **Machine Learning Model** - Train custom ML model for better categorization
- [ ] **Predictive Analytics** - Forecast future spending patterns
- [ ] **Financial Goals** - Set and track savings goals
- [ ] **Team Collaboration** - Shared accounts for businesses
- [ ] **API for Third Parties** - Public API for integrations

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **FastAPI Team** - For the excellent Python API framework
- **MongoDB** - For the flexible NoSQL database
- **Tailwind CSS** - For the utility-first CSS framework
- **Recharts** - For the beautiful chart components

---

## 📞 Support

If you have any questions or need help:

- **Open an Issue** - For bugs or feature requests
- **Discussions** - For general questions and community support
- **Email** - Contact the maintainers directly

---

<div align="center">

**Made with ❤️ using Next.js, Node.js, and FastAPI**

⭐ Star this repo if you find it helpful!

</div>
