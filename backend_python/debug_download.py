import requests

BASE_URL = "http://localhost:8000/api"

def test_download():
    print("Testing download from:", f"{BASE_URL}/customers/template")
    try:
        # ลองเรียกแบบไม่ต้อง Login ก่อน (ถ้าติด Auth เดี๋ยวจะฟ้อง 401)
        response = requests.get(f"{BASE_URL}/customers/template")
        print(f"Status Code: {response.status_code}")
        print(f"Response Content (First 100 chars): {response.content[:100]}")
        
        if response.status_code == 401:
            print("⚠️ ติด Authentication (ต้อง Login ก่อน)")
            # ลอง Login
            login_resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": "admin123"})
            if login_resp.status_code == 200:
                token = login_resp.json()["access_token"]
                print("✅ Login Success. Token obtained.")
                headers = {"Authorization": f"Bearer {token}"}
                
                # ลองใหม่พร้อม Token
                resp2 = requests.get(f"{BASE_URL}/customers/template", headers=headers)
                print(f"Retry Status Code: {resp2.status_code}")
                if resp2.status_code == 200:
                    print("✅ Download Success!")
                else:
                    print(f"❌ Retry Failed: {resp2.text}")
            else:
                print("❌ Login Failed")

    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_download()
