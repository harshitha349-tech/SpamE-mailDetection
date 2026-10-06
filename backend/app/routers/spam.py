"""
Spam Detection Router
Provides real-time ML inference and PostgreSQL spam_detection persistence.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.email import Email
from backend.app.models.spam import SpamDetection
from backend.app.schemas.spam import (
    SpamPredictRequest, 
    SpamPredictResponse, 
    SpamDetectionResponse, 
    SpamDetectionDetail
)
from backend.app.services.spam_service import classify_and_persist_spam
from ml.predict import predict_email_spam

router = APIRouter(prefix="/api/spam", tags=["Spam Detection"])

@router.post("/predict", response_model=SpamPredictResponse)
def predict_raw_text(req: SpamPredictRequest):
    """
    Direct NLP inference endpoint: Preprocesses input subject and body,
    vectorizes via TF-IDF, predicts with trained classifier, and explains decision.
    """
    res = predict_email_spam(req.subject, req.body)
    return res

@router.post("/detect/{email_id}", response_model=SpamDetectionResponse)
def detect_and_store_for_email(email_id: int, db: Session = Depends(get_db)):
    """
    Runs classification for an existing email and stores the detection in PostgreSQL.
    Automatically triggers database trigger `trg_spam_detection_sync` if classified as Spam.
    """
    email = db.query(Email).filter(Email.email_id == email_id).first()
    if not email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found.")

    detection = classify_and_persist_spam(
        email_id=email.email_id,
        subject=email.subject,
        body=email.body,
        db=db
    )
    return detection

@router.get("/detections", response_model=list[SpamDetectionDetail])
def list_all_detections(db: Session = Depends(get_db)):
    """
    Retrieves all recorded spam detections with joined email subject and sender/receiver emails.
    """
    results = db.query(SpamDetection).join(Email).order_by(SpamDetection.detected_at.desc()).all()
    out = []
    for d in results:
        out.append({
            "detection_id": d.detection_id,
            "email_id": d.email_id,
            "spam_score": d.spam_score,
            "classification": d.classification,
            "reason": d.reason,
            "detected_at": d.detected_at,
            "subject": d.email.subject if d.email else None,
            "sender_email": d.email.sender.email if d.email and d.email.sender else None,
            "receiver_email": d.email.receiver.email if d.email and d.email.receiver else None
        })
    return out
