from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

app = FastAPI(
    title="Transaction Analysis API",
    description="Rule-based transaction category prediction and anomaly detection",
    version="1.0.0"
)


# Request/Response Models
class TransactionInput(BaseModel):
    description: str = Field(..., min_length=1, max_length=500, description="Transaction description")
    amount: float = Field(..., gt=0, description="Transaction amount")
    date: Optional[str] = Field(None, description="Transaction date (ISO8601)")


class CategoryPrediction(BaseModel):
    category: str
    confidence: float
    matched_keywords: list[str]


class AnomalyDetection(BaseModel):
    is_anomaly: bool
    reason: str
    severity: str  # low, medium, high


class AnalysisResponse(BaseModel):
    success: bool
    input: TransactionInput
    predicted_category: CategoryPrediction
    anomaly: AnomalyDetection
    timestamp: str


# Category Keywords Mapping
CATEGORY_KEYWORDS = {
    "Food & Dining": [
        "restaurant", "cafe", "coffee", "pizza", "burger", "sushi", "food", "delivery",
        "doordash", "ubereats", "grubhub", "mcdonald", "starbucks", "dining", "lunch",
        "dinner", "breakfast", "bakery", "grocery", "supermarket", "walmart", "target"
    ],
    "Transportation": [
        "uber", "lyft", "taxi", "gas", "fuel", "parking", "toll", "metro", "train",
        "bus", "airline", "flight", "hotel", "airbnb", "transport", "car", "rental"
    ],
    "Shopping": [
        "amazon", "ebay", "shop", "store", "mall", "clothing", "shoes", "electronics",
        "bestbuy", "apple", "samsung", "purchase", "order", "retail"
    ],
    "Entertainment": [
        "netflix", "spotify", "hulu", "disney", "movie", "cinema", "theater", "concert",
        "game", "steam", "playstation", "xbox", "entertainment", "subscription", "media"
    ],
    "Bills & Utilities": [
        "electric", "water", "gas", "internet", "phone", "mobile", "utility", "bill",
        "insurance", "loan", "mortgage", "rent", "lease", "payment"
    ],
    "Healthcare": [
        "pharmacy", "doctor", "hospital", "clinic", "medical", "health", "dental",
        "vision", "medicine", "cvs", "walgreens", "healthcare"
    ],
    "Income": [
        "salary", "paycheck", "deposit", "transfer", "refund", "income", "payment received",
        "freelance", "consulting", "commission", "bonus"
    ],
    "Fees & Charges": [
        "fee", "charge", "penalty", "late", "interest", "bank fee", "service charge",
        "atm", "withdrawal"
    ],
    "Education": [
        "school", "college", "university", "course", "tuition", "book", "textbook",
        "education", "learning", "udemy", "coursera"
    ],
    "Personal Care": [
        "salon", "barber", "spa", "gym", "fitness", "workout", "hair", "nail",
        "beauty", "personal", "care"
    ]
}

# Anomaly Thresholds (configurable)
ANOMALY_THRESHOLDS = {
    "low": 100,      # Normal range
    "medium": 500,   # Review recommended
    "high": 1000,    # Flag as anomaly
    "critical": 5000 # Critical anomaly
}


def predict_category(description: str) -> CategoryPrediction:
    """
    Predict category based on keyword matching in description.
    Uses simple rule-based logic with keyword frequency.
    """
    description_lower = description.lower()
    
    category_scores = {}
    matched_keywords_map = {}
    
    for category, keywords in CATEGORY_KEYWORDS.items():
        matched = []
        for keyword in keywords:
            if keyword in description_lower:
                matched.append(keyword)
        
        if matched:
            category_scores[category] = len(matched)
            matched_keywords_map[category] = matched
    
    if not category_scores:
        return CategoryPrediction(
            category="Uncategorized",
            confidence=0.0,
            matched_keywords=[]
        )
    
    # Get best matching category
    best_category = max(category_scores, key=category_scores.get)
    match_count = category_scores[best_category]

    # Calculate confidence based on match count with better scaling
    # 1 match = 60%, 2 matches = 80%, 3+ matches = 95%
    if match_count >= 3:
        confidence = 0.95
    elif match_count == 2:
        confidence = 0.80
    elif match_count == 1:
        confidence = 0.60
    else:
        confidence = 0.30

    return CategoryPrediction(
        category=best_category,
        confidence=round(confidence, 2),
        matched_keywords=matched_keywords_map[best_category]
    )


def detect_anomaly(amount: float, category: str) -> AnomalyDetection:
    """
    Detect if transaction amount is anomalous.
    Uses threshold-based rules and category-specific logic.
    """
    # Base thresholds
    if amount >= ANOMALY_THRESHOLDS["critical"]:
        return AnomalyDetection(
            is_anomaly=True,
            reason=f"Amount ${amount:.2f} exceeds critical threshold (${ANOMALY_THRESHOLDS['critical']})",
            severity="high"
        )
    
    if amount >= ANOMALY_THRESHOLDS["high"]:
        # Category-specific adjustments
        if category in ["Bills & Utilities", "Education", "Healthcare"]:
            # Higher thresholds expected for these categories
            return AnomalyDetection(
                is_anomaly=False,
                reason=f"Amount ${amount:.2f} is within expected range for {category}",
                severity="low"
            )
        
        return AnomalyDetection(
            is_anomaly=True,
            reason=f"Amount ${amount:.2f} exceeds high threshold (${ANOMALY_THRESHOLDS['high']})",
            severity="medium"
        )
    
    if amount >= ANOMALY_THRESHOLDS["medium"]:
        # Medium amounts - check for unusual patterns
        if category in ["Food & Dining", "Entertainment", "Shopping"]:
            return AnomalyDetection(
                is_anomaly=True,
                reason=f"Amount ${amount:.2f} is unusually high for {category}",
                severity="low"
            )
        
        return AnomalyDetection(
            is_anomaly=False,
            reason=f"Amount ${amount:.2f} is within normal range",
            severity="low"
        )
    
    # Low amounts - generally not anomalous
    return AnomalyDetection(
        is_anomaly=False,
        reason=f"Amount ${amount:.2f} is within normal range",
        severity="low"
    )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Transaction Analysis API",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_transaction(transaction: TransactionInput):
    """
    Analyze a transaction to predict category and detect anomalies.
    
    - **description**: Transaction description text
    - **amount**: Transaction amount (must be positive)
    - **date**: Optional transaction date
    """
    try:
        # Predict category
        predicted_category = predict_category(transaction.description)
        
        # Detect anomaly
        anomaly = detect_anomaly(transaction.amount, predicted_category.category)
        
        return AnalysisResponse(
            success=True,
            input=transaction,
            predicted_category=predicted_category,
            anomaly=anomaly,
            timestamp=datetime.utcnow().isoformat()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/batch")
async def analyze_batch_transactions(transactions: list[TransactionInput]):
    """
    Analyze multiple transactions in batch.
    """
    results = []
    
    for txn in transactions:
        predicted_category = predict_category(txn.description)
        anomaly = detect_anomaly(txn.amount, predicted_category.category)
        
        results.append({
            "input": txn,
            "predicted_category": predicted_category,
            "anomaly": anomaly
        })
    
    return {
        "success": True,
        "count": len(results),
        "anomalies_detected": sum(1 for r in results if r["anomaly"].is_anomaly),
        "results": results,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/categories")
async def get_categories():
    """Get all available categories and their keywords."""
    return {
        "success": True,
        "categories": CATEGORY_KEYWORDS,
        "thresholds": ANOMALY_THRESHOLDS
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
