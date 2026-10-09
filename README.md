# Intelligent Email Management and Spam Detection Platform

A DBMS-focused full-stack academic project for managing email records, searching and classifying messages, and storing spam-detection results in a normalized PostgreSQL database.

The system combines a **React + Vite frontend**, **FastAPI backend**, **PostgreSQL database**, and a supporting **machine-learning spam classifier**. Database-side functions, triggers, constraints, indexes, and audit logging demonstrate practical DBMS concepts, while the ML module provides spam predictions that can be persisted and acted upon by the database.

> **Project scope:** This is an academic prototype. Email data is entered through the application or API and stored in the local PostgreSQL database. The project does **not** connect to Gmail, Outlook, IMAP, or another live mail provider.

## Features

- User registration and JWT-based authentication
- Password hashing with bcrypt
- Inbox, Sent, Spam, Trash, and email status management
- Email creation, viewing, updating, and deletion workflow
- Category management
- Keyword and multi-criteria email search
- Dashboard statistics and reports
- PostgreSQL audit logging
- PostgreSQL triggers for automatic spam categorization
- Stored database functions
- Full-text search using a PostgreSQL GIN index
- ML-based spam prediction using TF-IDF features
- Persisted spam scores, classifications, reasons, and detection timestamps
- Automated tests covering authentication, database functionality, email operations, dashboard/search, and spam prediction

## System Architecture

```text
                    USER
                      |
                      v
              React + Vite Frontend
                      |
                      v
                FastAPI Backend
                      |
          +-----------+-----------+
          |                       |
          v                       v
    PostgreSQL DB          ML Spam Classifier
          |                       |
          +-----------+-----------+
                      |
                      v
             Spam Detection Record
                      |
                      v
              PostgreSQL Triggers
                      |
                      v
                 Audit Log
```

The implemented architecture uses PostgreSQL as the central persistence and DBMS layer, FastAPI with SQLAlchemy for the API/application layer, and React + Vite for the client interface.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | FastAPI, Python |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Machine Learning | scikit-learn |
| NLP Features | TF-IDF, unigrams + bigrams |
| Authentication | JWT, bcrypt |
| Testing | pytest |

## Database Design

The relational schema is normalized to **3NF** and contains five core tables:

- `users` — account identity and authentication data
- `categories` — system and custom email categories
- `emails` — message content, sender/receiver relationships, status, and category
- `spam_detection` — persisted spam score, classification, reason, and detection time
- `email_audit_log` — email creation, status changes, and automatic spam actions

The database also includes primary keys, foreign keys, unique/check constraints, indexes, stored functions, PostgreSQL triggers, and a GIN full-text-search index.

## Spam Detection Pipeline

```text
Subject + Body
      |
      v
Text Cleaning / Normalization
      |
      v
TF-IDF Vectorization
      |
      v
Candidate ML Models
      |
      v
Spam / Not Spam + Score
      |
      v
PostgreSQL spam_detection
      |
      v
Trigger -> Email Status / Category + Audit Log
```

The training script combines subject and body, cleans the text, applies TF-IDF with up to 2,500 features, unigrams and bigrams, English stop-word removal, and a stratified 80/20 train-test split with `random_state=42`.

The supplied dataset contains **179 labeled emails**: 90 legitimate and 89 spam. The currently saved model artifact is **Multinomial Naive Bayes (alpha=0.5)**.

### Recorded Holdout Results

| Metric | Result |
|---|---:|
| Accuracy | 94.44% |
| Precision | 90.00% |
| Recall | 100.00% |
| F1 Score | 94.74% |
| Holdout samples | 36 |
| TN / FP / FN / TP | 16 / 2 / 0 / 18 |

These results are a **prototype benchmark**, not a production spam-filtering claim, because the dataset is small and project-specific.

## Repository Structure

```text
Intelligent_Email_Management_Final/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   ├── tests/
│   └── requirements.txt
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── functions.sql
│   ├── triggers.sql
│   └── queries.sql
├── ml/
│   ├── train.py
│   ├── evaluate.py
│   ├── predict.py
│   └── model/
├── data/
│   ├── email_dataset.csv
│   └── generate_dataset.py
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── docs/
│   ├── presentations/
│   └── report/
├── .env.example
├── .gitignore
└── README.md
```

## Setup and Running Locally

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Intelligent_Email_Management_Final
```

### 2. Create the environment file

```bash
cp .env.example .env
```

Update `.env` with your local PostgreSQL credentials. **Do not commit `.env`.**

The default configuration expects PostgreSQL on port `5433` and database `email_management_db`. Change these values if your PostgreSQL installation uses different settings.

### 3. Create the PostgreSQL database

Create the database first, then run the SQL files in this order:

```text
schema.sql
seed.sql
functions.sql
triggers.sql
```

For example:

```bash
psql -U postgres -h localhost -p 5433 -d email_management_db -f database/schema.sql
psql -U postgres -h localhost -p 5433 -d email_management_db -f database/seed.sql
psql -U postgres -h localhost -p 5433 -d email_management_db -f database/functions.sql
psql -U postgres -h localhost -p 5433 -d email_management_db -f database/triggers.sql
```

### 4. Install backend dependencies

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

On Windows, activate the environment with:

```powershell
.venv\Scripts\activate
```

### 5. Start the FastAPI backend

From the project root:

```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

API documentation is available at:

```text
http://localhost:8000/docs
```

### 6. Start the React frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server normally runs at:

```text
http://localhost:5173
```

If the backend is running somewhere else, set `VITE_API_URL` before starting the frontend. The default frontend API URL is `http://localhost:8000/api`.

## Machine Learning

To retrain the classifier from the supplied dataset:

```bash
python ml/train.py
```

This regenerates the saved model, TF-IDF vectorizer, and evaluation metrics under `ml/model/`.

To evaluate the stored model:

```bash
python ml/evaluate.py
```

## Testing

The repository contains 20 pytest test functions covering authentication, database objects and functions, email operations, dashboard/search functionality, and spam prediction.

Run:

```bash
pytest backend/tests
```

The test definitions are included in the repository; successful execution requires a correctly configured PostgreSQL environment.

## API Overview

Main route groups include:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/emails`
- `POST /api/emails`
- `PUT /api/emails/{email_id}/status`
- `DELETE /api/emails/{email_id}`
- `POST /api/spam/predict`
- `POST /api/spam/detect/{email_id}`
- `GET /api/spam/detections`
- `GET /api/search`
- `GET /api/dashboard/stats`
- `GET /api/dashboard/reports`
- `GET /api/health`

For the complete interactive API, run the backend and open `/docs`.

## Documentation and Presentations

The repository includes the project report and four project-review presentation decks supplied with the project.

### Project Documentation

- [Project Documentation — PDF](docs/report/Project_Documentation.pdf)
- [Project Documentation — DOCX](docs/report/Project_Documentation.docx)

### Presentations

- [Project Review 1](docs/presentations/01_Project_Review_1.pdf)
- [Project Review 2](docs/presentations/02_Project_Review_2.pdf)
- [Project Review 3 — Methodology Development](docs/presentations/03_Project_Review_3_Methodology.pdf)
- [Final Review](docs/presentations/04_Final_Review.pdf)

The presentations document the project's progression from problem definition and feasibility through literature review, methodology, implementation progress, database design, ML integration, and final system architecture/results.

## Project Screenshots

[Download all project screenshots (ZIP)](PROJECT%20SCREENSHOTS.zip)


## Project Documentation: What Goes Where?

The **README is the short project landing page**. It should explain what the project is, what it does, the technology stack, how to run it, and where the detailed material is located.

The **full project documentation should remain a separate report** under `docs/report/`. Keeping the complete report out of the README makes the repository easier to read while still making the report immediately accessible.

The **presentation decks should also remain separate** under `docs/presentations/`, with links from the README as provided above.

## Limitations and Future Work

- The current ML dataset is small and project-specific.
- A larger and more representative dataset is required for stronger generalization estimates.
- Cross-validation, calibration, and time-based evaluation can improve model assessment.
- Endpoint authorization and CORS should be tightened for deployment.
- Secrets should always be supplied through environment variables.
- PostgreSQL migrations, backups, and deployment procedures can be added.
- Query plans and index performance can be evaluated on larger datasets.
- Live Gmail/Outlook/IMAP integration is outside the current project scope.

## Team

- Harshitha Y
- Srujan T
- M Sai Vignesh
- Siri Vennela

**Course:** DSE & DBD — Database Management Systems project

**Institution:** Koneru Lakshmaiah Education Foundation (KLH), Hyderabad

## License

This repository is an academic project. No production license has been specified.
