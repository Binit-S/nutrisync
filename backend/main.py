import os, json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlalchemy
from google.cloud.sql.connector import Connector
import vertexai
from vertexai.generative_models import GenerativeModel

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

vertexai.init(project=os.environ["PROJECT_ID"], location="us-central1")
model = GenerativeModel("gemini-2.5-flash")

connector = Connector()

def get_conn():
    return connector.connect(
        os.environ["CLOUD_SQL_CONNECTION_NAME"],
        "pg8000",
        user="postgres",
        password=os.environ["DB_PASS"],
        db="postgres"
    )

pool = sqlalchemy.create_engine("postgresql+pg8000://", creator=get_conn)

with pool.connect() as conn:
    conn.execute(sqlalchemy.text("CREATE TABLE IF NOT EXISTS queries (id SERIAL PRIMARY KEY, user_email TEXT, deficiency TEXT, response TEXT)"))
    conn.commit()

class QueryRequest(BaseModel):
    deficiency: str
    user_email: str

@app.post("/api/consult")
async def consult(req: QueryRequest):
    try:
        prompt = f"You are a clinical dietitian. List 5 foods that help with {req.deficiency} deficiency. Return ONLY valid JSON: {{\"foods\": [\"Food 1\", \"Food 2\", \"Food 3\", \"Food 4\", \"Food 5\"]}}"
        response = model.generate_content(prompt)
        text = response.text.strip().replace("```json","").replace("```","").strip()
        with pool.connect() as conn:
            conn.execute(sqlalchemy.text("INSERT INTO queries (user_email, deficiency, response) VALUES (:e, :d, :r)"), {"e": req.user_email, "d": req.deficiency, "r": text})
            conn.commit()
        return {"result": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
