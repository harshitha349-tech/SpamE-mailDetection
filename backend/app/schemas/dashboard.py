"""
Dashboard and Reports Pydantic Schemas
"""
from pydantic import BaseModel

class DashboardStatsResponse(BaseModel):
    total_users: int
    total_emails: int
    total_spam_detected: int
    total_legitimate_detected: int
    spam_ratio: float
    total_categories: int
    categories_breakdown: list[dict]
    status_breakdown: list[dict]
    audit_events_count: int

class UserStatsResponse(BaseModel):
    total_received: int
    total_sent: int
    inbox_count: int
    spam_count: int
    trash_count: int
    read_count: int

class AnalyticsReportResponse(BaseModel):
    system_stats: DashboardStatsResponse
    model_evaluation: dict
    spam_timeline: list[dict]
