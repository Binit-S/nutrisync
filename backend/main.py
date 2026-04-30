import os, json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlalchemy
from google.cloud.sql.connector import Connector
import vertexai
from vertexai.generative_models import GenerativeModel
from time import time

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
    deficiency: str = ""
    user_email: str = ""
    constraints: str = ""
    mode: str = "known"
    symptoms: str = ""

class ExplainRequest(BaseModel):
    deficiency: str
    foods: list[str]

last_calls = {}

@app.get("/api/history")
def history():
    with pool.connect() as conn:
        rows = conn.execute(
            sqlalchemy.text("""
            SELECT deficiency, response
            FROM queries
            ORDER BY id DESC
            LIMIT 5
            """)
        ).fetchall()

    return [json.loads(r[1]) for r in rows]

@app.post("/api/explain")
def explain(req: ExplainRequest):
    prompt = f"Explain why these foods help {req.deficiency}: {req.foods}"
    res = model.generate_content(prompt)
    return {"explanation": res.text}

@app.post("/api/consult")
async def consult(req: QueryRequest):
    now = time()
    if req.user_email in last_calls and now - last_calls[req.user_email] < 5:
        raise HTTPException(429, "Too many requests")
    last_calls[req.user_email] = now

    try:
        with pool.connect() as conn:
            result = conn.execute(
                sqlalchemy.text("SELECT response FROM queries WHERE deficiency=:d LIMIT 1"),
                {"d": req.deficiency}
            ).fetchone()

        if result:
            return json.loads(result[0])

        if req.mode == "consult":
            prompt = f"""
User symptoms: {req.symptoms}
Infer deficiency + severity + diet plan.
Return structured JSON in this exact structure:

{{
  "deficiency": "inferred deficiency",
  "severity": "mild | moderate | severe",
  "foods": ["...", "..."],
  "meal_plan": [
    {{"meal": "Breakfast", "items": ["...", "..."]}},
    {{"meal": "Lunch", "items": ["...", "..."]}},
    {{"meal": "Dinner", "items": ["...", "..."]}}
  ],
  "dos": ["...", "..."],
  "donts": ["...", "..."],
  "buy_list": {{
    "vegetables": ["..."],
    "proteins": ["..."],
    "others": ["..."]
  }}
}}
STRICT RULES:
- valid JSON only
- no markdown
- no explanation
Limit response to under 200 tokens.
"""
        else:
            prompt = f"""
You are a clinical dietitian.

User deficiency: {req.deficiency}
User constraints: {req.constraints}
Respect dietary restrictions strictly.

Return ONLY valid JSON in this exact structure:

{{
  "deficiency": "{req.deficiency}",
  "severity": "mild | moderate | severe",
  "foods": ["...", "..."],
  "meal_plan": [
    {{"meal": "Breakfast", "items": ["...", "..."]}},
    {{"meal": "Lunch", "items": ["...", "..."]}},
    {{"meal": "Dinner", "items": ["...", "..."]}}
  ],
  "dos": ["...", "..."],
  "donts": ["...", "..."],
  "buy_list": {{
    "vegetables": ["..."],
    "proteins": ["..."],
    "others": ["..."]
  }}
}}
STRICT RULES:
- valid JSON only
- no markdown
- no explanation
Limit response to under 200 tokens.
"""
        response = model.generate_content(prompt)
        text = response.text.strip().replace("```json","").replace("```","").strip()
        
        try:
            parsed = json.loads(text)
        except:
            raise HTTPException(status_code=500, detail="Invalid JSON from model")

        with pool.connect() as conn:
            conn.execute(
                sqlalchemy.text("""
                INSERT INTO queries (user_email, deficiency, response)
                VALUES (:e, :d, :r)
                """),
                {
                    "e": req.user_email,
                    "d": parsed.get("deficiency", req.deficiency),
                    "r": json.dumps(parsed)
                }
            )
            conn.commit()
        return parsed
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

