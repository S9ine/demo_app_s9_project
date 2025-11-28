from app.core.security import get_password_hash

try:
    print("Testing hash...")
    hash = get_password_hash("admin123")
    print(f"Hash success: {hash}")
except Exception as e:
    print(f"Hash failed: {e}")
