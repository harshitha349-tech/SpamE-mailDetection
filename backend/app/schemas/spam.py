"""
Spam Detection Pydantic Schemas
"""
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class SpamPredictRequest(BaseModel):
    subject: str = Field(..., min_length=1)
    body: str = Field(..., min_length=1)

class SpamPredictResponse(BaseModel):
    is_spam: bool
    classification: str
    spam_score: float
    confidence_percentage: float
    reason: str

class SpamDetectionResponse(BaseModel):
    detection_id: int
    email_id: int
    spam_score: float
    classification: str
    reason: str | None = None
    detected_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

class SpamDetectionDetail(SpamDetectionResponse):
    subject: str | None = None
    sender_email: str | None = None
    receiver_email: str | None = None
