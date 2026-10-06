"""
Dashboard and Reports Router
Provides database-derived platform statistics and genuine ML model evaluation metrics.
"""
import os
import json
from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.dashboard import DashboardStatsResponse, UserStatsResponse, AnalyticsReportResponse
from backend.app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard & Reports"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Retrieves platform statistics computed in real-time from PostgreSQL.
    """
    # 1. Execute stored function fn_get_system_dashboard_stats()
    sys_stats = db.execute(text("SELECT * FROM fn_get_system_dashboard_stats();")).mappings().first()
    
    # 2. Get category breakdown
    cat_query = text("""
        SELECT c.category_name, COUNT(e.email_id) AS email_count
        FROM categories c
        LEFT JOIN emails e ON c.category_id = e.category_id
        GROUP BY c.category_name
        ORDER BY email_count DESC;
    """)
    cat_rows = db.execute(cat_query).mappings().all()
    categories_breakdown = [{"name": r["category_name"], "count": int(r["email_count"])} for r in cat_rows]

    # 3. Get status breakdown
    status_query = text("""
        SELECT status, COUNT(*) AS count
        FROM emails
        GROUP BY status
        ORDER BY count DESC;
    """)
    status_rows = db.execute(status_query).mappings().all()
    status_breakdown = [{"status": r["status"], "count": int(r["count"])} for r in status_rows]

    # 4. Count audit log events
    audit_count = db.execute(text("SELECT COUNT(*) AS c FROM email_audit_log;")).scalar() or 0

    return {
        "total_users": int(sys_stats["total_users"]),
        "total_emails": int(sys_stats["total_emails"]),
        "total_spam_detected": int(sys_stats["total_spam_detected"]),
        "total_legitimate_detected": int(sys_stats["total_legitimate_detected"]),
        "spam_ratio": float(sys_stats["spam_ratio"]),
        "total_categories": int(sys_stats["total_categories"]),
        "categories_breakdown": categories_breakdown,
        "status_breakdown": status_breakdown,
        "audit_events_count": int(audit_count)
    }

@router.get("/user-stats", response_model=UserStatsResponse)
def get_user_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieves user-specific statistics using the PostgreSQL stored function fn_get_user_email_stats().
    """
    query = text("SELECT * FROM fn_get_user_email_stats(:uid);")
    row = db.execute(query, {"uid": current_user.user_id}).mappings().first()
    if not row:
        return {
            "total_received": 0, "total_sent": 0, "inbox_count": 0,
            "spam_count": 0, "trash_count": 0, "read_count": 0
        }
    return {
        "total_received": int(row["total_received"]),
        "total_sent": int(row["total_sent"]),
        "inbox_count": int(row["inbox_count"]),
        "spam_count": int(row["spam_count"]),
        "trash_count": int(row["trash_count"]),
        "read_count": int(row["read_count"])
    }

@router.get("/reports", response_model=AnalyticsReportResponse)
def get_analytics_report(db: Session = Depends(get_db)):
    """
    Returns unified reporting data including real-time DB metrics,
    actual ML evaluation metrics, and timeline distribution.
    """
    stats = get_dashboard_stats(db=db)

    # Load real model evaluation metrics
    metrics_path = Path(__file__).resolve().parent.parent.parent.parent / "ml" / "model" / "evaluation_metrics.json"
    if metrics_path.exists():
        with open(metrics_path, "r", encoding="utf-8") as f:
            model_eval = json.load(f)
    else:
        model_eval = {"status": "Metrics not yet generated. Run ml/train.py"}

    # Aggregate spam timeline by day
    timeline_query = text("""
        SELECT TO_CHAR(detected_at, 'YYYY-MM-DD') AS day,
               COUNT(CASE WHEN classification = 'Spam' THEN 1 END) AS spam,
               COUNT(CASE WHEN classification = 'Not Spam' THEN 1 END) AS legitimate
        FROM spam_detection
        GROUP BY TO_CHAR(detected_at, 'YYYY-MM-DD')
        ORDER BY day ASC;
    """)
    timeline_rows = db.execute(timeline_query).mappings().all()
    timeline = [
        {"day": r["day"], "spam": int(r["spam"]), "legitimate": int(r["legitimate"])}
        for r in timeline_rows
    ]

    return {
        "system_stats": stats,
        "model_evaluation": model_eval,
        "spam_timeline": timeline
    }
