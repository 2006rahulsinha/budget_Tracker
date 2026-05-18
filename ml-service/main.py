from fastapi import FastAPI, Body
from pydantic import BaseModel
from typing import List
import pandas as pd
from prophet import Prophet
import requests as req
import google.generativeai as genai
import os
from dotenv import load_dotenv
from groq import Groq
from fastapi.middleware.cors import CORSMiddleware
load_dotenv()  
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://budget-tracker-eight-lemon.vercel.app/login"],
    allow_methods=["*"],
    allow_headers=["*"],
)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
CATEGORY_MAP = {
    "113225e0-523b-4f3c-af5e-3b1bfc17b202": "Shopping",
    "3e320471-accc-4b94-b4e6-1a2d853d51a1": "Entertainment",
    "9d500dc7-0fc5-47b5-bf3b-1d5f57982793": "Transport",
    "a4615ed1-a622-4ba1-9527-99a2f99ece5b": "Misc",
    "dfe79feb-8e63-4016-9994-706f81570549": "Food",
    "f3bccc52-435d-4fec-bb68-8ce687e665eb": "Bills"
}
class Expense(BaseModel):
    amount: float
    date: str
    category_id: str

@app.get("/predict")
def predict_get():
    return {"prediction": 42}

@app.post("/predict")
def predict(expenses: List[Expense] = Body(...)):
    if len(expenses) < 5:
        return {"error": "Not enough data"}

    df = pd.DataFrame([dict(e) for e in expenses])

    # Convert and floor to month start (Prophet needs this)
    df["date"] = pd.to_datetime(df["date"])
    df["ds"] = df["date"].dt.to_period("M").dt.to_timestamp()  # e.g. 2024-01-01

    results = {}

    for category in df["category_id"].unique():
        cat_df = df[df["category_id"] == category]

        # Aggregate to monthly
        monthly = (
            cat_df.groupby("ds")["amount"]
            .sum()
            .reset_index()
            .rename(columns={"amount": "y"})
        )

        # Need at least 2 months for Prophet
        if len(monthly) < 2:
            results[category] = round(float(monthly["y"].iloc[-1]), 2)
            continue

        # Train Prophet
        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=False,
            daily_seasonality=False,
            seasonality_mode="additive"
        )
        model.fit(monthly)

        # Predict 1 month ahead
        future = model.make_future_dataframe(periods=1, freq="MS")
        forecast = model.predict(future)

        next_month_pred = forecast.iloc[-1]["yhat"]

        results[category] = {
            "predicted": round(max(float(next_month_pred), 0), 2),
            "lower":     round(max(float(forecast.iloc[-1]["yhat_lower"]), 0), 2),
            "upper":     round(float(forecast.iloc[-1]["yhat_upper"]), 2),
            "month":     forecast.iloc[-1]["ds"].strftime("%Y-%m")
        }

    return results
@app.post("/insights")
def get_insights(expenses: List[Expense] = Body(...)):
    df = pd.DataFrame([dict(e) for e in expenses])
    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.to_period("M")

    # ← swap UUIDs for readable names
    df["category"] = df["category_id"].map(CATEGORY_MAP).fillna("Other")

    summary_lines = []
    for category in df["category"].unique():  # ← use "category_id" not "category"
        cat_df = df[df["category"] == category]
        monthly = cat_df.groupby("month")["amount"].sum()
        if len(monthly) >= 2:
            last  = monthly.iloc[-1]
            prev  = monthly.iloc[-2]
            delta = ((last - prev) / prev) * 100
            summary_lines.append(
                f"{category}: ₹{last:.0f} last month, {delta:+.1f}% vs previous month"
            )

    summary = "\n".join(summary_lines)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a professional personal finance advisor writing a monthly spending report. Be analytical, specific, and actionable. Use clear structured paragraphs."
            },
            {
                "role": "user",
                "content": f"""Write a detailed monthly spending analysis based on this data:

    {summary}

    Structure your response as follows:
    1. Overview — a 2-3 sentence summary of overall spending health
    2. Category Breakdown — analyse each category individually, noting trends
    3. Areas of Concern — flag anything that needs attention
    4. Positive Trends — highlight what the user is doing well
    5. Recommendations — 3 specific, actionable steps to improve next month

    Be specific with numbers. Write in a professional but approachable tone."""
            }
        ],
        max_tokens=1024,
    )

    return { "insights": response.choices[0].message.content }