from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/asha_ai"

engine = create_engine(DATABASE_URL)


def get_last_visits(patient_id: str, limit: int = 5):
    query = text("""
        SELECT *
        FROM patient_visits
        WHERE patient_id = :patient_id
        ORDER BY visit_date DESC
        LIMIT :limit
    """)

    with engine.connect() as conn:
        result = conn.execute(query, {
            "patient_id": patient_id,
            "limit": limit
        })
        return [dict(row._mapping) for row in result]
