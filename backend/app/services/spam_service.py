"""
Spam Detection Service
Connects ML text classification pipeline with PostgreSQL spam_detection table.
"""
from sqlalchemy.orm import Session
from backend.app.models.spam import SpamDetection
from backend.app.models.email import Email
from ml.predict import predict_email_spam

def classify_and_persist_spam(email_id: int, subject: str, body: str, db: Session) -> SpamDetection:
    """
    Executes the TF-IDF + Classifier pipeline and persists results into PostgreSQL.
    Note: When classification is 'Spam', the PostgreSQL database trigger
    `trg_spam_detection_sync` automatically updates `emails.status = 'Spam'`
    and logs the event into `email_audit_log`.
    """
    prediction = predict_email_spam(subject, body)
    
    # Check if a detection entry already exists for this email
    existing = db.query(SpamDetection).filter(SpamDetection.email_id == email_id).first()
    if existing:
        existing.spam_score = prediction["spam_score"]
        existing.classification = prediction["classification"]
        existing.reason = prediction["reason"]
        db_detection = existing
    else:
        db_detection = SpamDetection(
            email_id=email_id,
            spam_score=prediction["spam_score"],
            classification=prediction["classification"],
            reason=prediction["reason"]
        )
        db.add(db_detection)
    
    db.commit()
    db.refresh(db_detection)
    return db_detection
