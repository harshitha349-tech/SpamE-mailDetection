"""
Authentication and Authorization Tests
Verifies registration, login, JWT token validity, and credential validation.
"""
def test_login_successful(client):
    """Verifies that seeded demo user can log in with valid credentials."""
    response = client.post("/api/auth/login", json={
        "email": "john.doe@emailmgmt.local",
        "password": "User@1234"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "john.doe@emailmgmt.local"

def test_login_invalid_password(client):
    """Verifies that invalid password returns 401 Unauthorized."""
    response = client.post("/api/auth/login", json={
        "email": "john.doe@emailmgmt.local",
        "password": "WrongPassword999"
    })
    assert response.status_code == 401

def test_register_new_user(client, db):
    """Verifies user registration flow."""
    test_email = "new_student_test@emailmgmt.local"
    # Ensure clean state
    from sqlalchemy import text
    db.execute(text("DELETE FROM users WHERE email = :e"), {"e": test_email})
    db.commit()

    response = client.post("/api/auth/register", json={
        "name": "Test Student",
        "email": test_email,
        "password": "SecurePassword@123"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_email

    # Attempt duplicate registration
    dup_res = client.post("/api/auth/register", json={
        "name": "Test Student Duplicate",
        "email": test_email,
        "password": "SecurePassword@123"
    })
    assert dup_res.status_code == 400

    # Cleanup
    db.execute(text("DELETE FROM users WHERE email = :e"), {"e": test_email})
    db.commit()

def test_get_current_user_profile(client, user_headers):
    """Verifies /api/auth/me returns profile when token is valid."""
    response = client.get("/api/auth/me", headers=user_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "john.doe@emailmgmt.local"
