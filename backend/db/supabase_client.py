# db/supabase_client.py
from typing import List, Dict
from sqlalchemy import text
from db.postgres_client import SessionLocal


def get_last_visits(patient_id: str, limit: int = 5) -> List[Dict]:
    print("🔍 Fetching visits from PostgreSQL for patient_id:", patient_id)

    db = SessionLocal()

    try:
        query = text("""
            SELECT *
            FROM patient_visits
            WHERE patient_id = :patient_id
            ORDER BY visit_date DESC
            LIMIT :limit
        """)

        result = db.execute(
            query,
            {
                "patient_id": patient_id,
                "limit": limit
            }
        )

        rows = result.mappings().all()
        visits = [dict(row) for row in rows]

        print("📦 PostgreSQL response:", visits)

        return visits

    finally:
        db.close()
