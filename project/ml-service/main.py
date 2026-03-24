from fastapi import FastAPI,Body
from pydantic import BaseModel
from typing import List
import pandas as pd
from sklearn.linear_model import LinearRegression
from typing import List
app = FastAPI()

class Expense(BaseModel):
    amount: float
    date: str
    category_id: str
@app.get("/predict")
def predict_get():
    return {"prediction":42}
@app.post("/predict")

def predict(expenses: List[Expense] = Body(...)):
    if len(expenses) < 5:
        return {"error": "Not enough data"}

    df = pd.DataFrame([dict(e) for e in expenses])

    # Convert date
    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.to_period("M")

    results = {}

    # Train model per category
    for category in df["category_id"].unique():
        cat_df = df[df["category_id"] == category]

        monthly = (
            cat_df.groupby("month")["amount"]
            .sum()
            .reset_index()
        )

        monthly["month_index"] = range(len(monthly))

        X = monthly[["month_index"]]
        y = monthly["amount"]

        if len(X) < 2:
            results[category] = float(y.iloc[-1])
            continue

        model = LinearRegression()
        model.fit(X, y)

        next_month = [[len(monthly)]]
        prediction = model.predict(next_month)[0]

        results[category] = round(float(prediction), 2)
        print(results)
    return results