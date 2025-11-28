import asyncio
import httpx
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_root():
    response = client.get("/")
    print(f"Root endpoint: {response.status_code}")
    print(response.json())
    assert response.status_code == 200

def test_login():
    print("Testing login...")
    response = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    print(f"Login status: {response.status_code}")
    if response.status_code == 200:
        print("Login successful!")
        token = response.json()["access_token"]
        return token
    else:
        print(f"Login failed: {response.text}")
        return None

if __name__ == "__main__":
    try:
        test_root()
        token = test_login()
        if token:
            print("✅ Basic API verification passed!")
        else:
            print("❌ Login failed")
    except Exception as e:
        print(f"❌ Verification failed: {e}")
