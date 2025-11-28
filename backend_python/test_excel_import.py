import requests
import os

BASE_URL = "http://localhost:8000/api"
TEMPLATE_PATH = "downloaded_template.xlsx"
IMPORT_FILE = "templates/customer_template.xlsx"

# 1. Login to get token (assuming admin/admin123)
def login():
    try:
        response = requests.post(f"{BASE_URL}/auth/login", data={
            "username": "admin",
            "password": "admin123"
        })
        response.raise_for_status()
        return response.json()["access_token"]
    except Exception as e:
        print(f"Login failed: {e}")
        return None

# 2. Test Download Template
def test_download(token):
    print("\nTesting Download Template...")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}/master-data/customers/template", headers=headers)
        if response.status_code == 200:
            with open(TEMPLATE_PATH, "wb") as f:
                f.write(response.content)
            print(f"✅ Download success! Saved to {TEMPLATE_PATH}")
            return True
        else:
            print(f"❌ Download failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Download error: {e}")
        return False

# 3. Test Import Excel
def test_import(token):
    print("\nTesting Import Excel...")
    headers = {"Authorization": f"Bearer {token}"}
    
    if not os.path.exists(IMPORT_FILE):
        print(f"❌ Import file not found: {IMPORT_FILE}")
        return

    try:
        files = {'file': open(IMPORT_FILE, 'rb')}
        response = requests.post(f"{BASE_URL}/master-data/customers/import", headers=headers, files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Import success!")
            print(f"   Total: {result['total']}")
            print(f"   Imported: {result['imported']}")
            print(f"   Skipped: {result['skipped']}")
            print(f"   Errors: {result['errors']}")
            if result['errors'] > 0:
                print("   Error Details:", result['details']['errors'])
        else:
            print(f"❌ Import failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Import error: {e}")

if __name__ == "__main__":
    token = login()
    if token:
        test_download(token)
        test_import(token)
