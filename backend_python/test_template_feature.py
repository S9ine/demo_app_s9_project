"""
สคริปต์ทดสอบฟีเจอร์ Download Template และ Import Excel
"""
import requests
import os

BASE_URL = "http://localhost:8000/api/master-data"

def get_token():
    """Login and get token"""
    login_url = "http://localhost:8000/api/auth/login"
    response = requests.post(login_url, data={
        "username": "admin",
        "password": "admin123"
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"❌ Login failed: {response.status_code}")
        return None

def test_download_template(token):
    """Test download template endpoint"""
    print("\n" + "="*60)
    print("🧪 TEST 1: ดาวน์โหลด Customer Template")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/customers/template", headers=headers)
        
        if response.status_code == 200:
            # Save file
            filename = "downloaded_customer_template.xlsx"
            with open(filename, "wb") as f:
                f.write(response.content)
            
            file_size = os.path.getsize(filename)
            print(f"✅ ดาวน์โหลดสำเร็จ!")
            print(f"   📄 ไฟล์: {filename}")
            print(f"   📊 ขนาด: {file_size:,} bytes")
            
            # Check if it's a valid Excel file
            if response.headers.get('content-type') == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                print(f"   ✅ ไฟล์เป็น Excel format ถูกต้อง")
            
            return True
        else:
            print(f"❌ ดาวน์โหลดล้มเหลว: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาด: {e}")
        return False

def test_import_excel(token):
    """Test import Excel endpoint"""
    print("\n" + "="*60)
    print("🧪 TEST 2: Import ข้อมูลจาก Excel")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    template_file = "templates/customer_template.xlsx"
    
    if not os.path.exists(template_file):
        print(f"❌ ไม่พบไฟล์: {template_file}")
        return False
    
    try:
        with open(template_file, 'rb') as f:
            files = {'file': ('customer_template.xlsx', f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
            response = requests.post(f"{BASE_URL}/customers/import", headers=headers, files=files)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Import สำเร็จ!")
            print(f"   ✔️  สำเร็จ: {result.get('successCount', 0)} รายการ")
            print(f"   ❌ ล้มเหลว: {result.get('errorCount', 0)} รายการ")
            
            if result.get('errors'):
                print(f"\n   ⚠️  รายละเอียดข้อผิดพลาด:")
                for error in result.get('errors', [])[:5]:
                    print(f"      - {error}")
            
            return True
        else:
            print(f"❌ Import ล้มเหลว: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาด: {e}")
        return False

def test_list_customers(token):
    """Test list customers to verify import"""
    print("\n" + "="*60)
    print("🧪 TEST 3: ตรวจสอบรายการลูกค้าที่ Import")
    print("="*60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/customers", headers=headers)
        
        if response.status_code == 200:
            customers = response.json()
            print(f"✅ ดึงข้อมูลสำเร็จ!")
            print(f"   📋 จำนวนลูกค้าทั้งหมด: {len(customers)} รายการ")
            
            if customers:
                print(f"\n   📝 ตัวอย่างลูกค้า 3 รายการแรก:")
                for i, customer in enumerate(customers[:3], 1):
                    print(f"      {i}. รหัส: {customer.get('code')} | ชื่อ: {customer.get('name')}")
                    print(f"         ประเภท: {customer.get('businessType', '-')}")
                    print(f"         ที่อยู่: {customer.get('address', '-')}, {customer.get('subDistrict', '-')}, {customer.get('district', '-')}")
            
            return True
        else:
            print(f"❌ ดึงข้อมูลล้มเหลว: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาด: {e}")
        return False

def main():
    print("\n" + "🚀 " + "="*58)
    print("   ทดสอบฟีเจอร์ Customer Template Download & Import")
    print("="*60)
    
    # 1. Login
    print("\n🔐 กำลัง Login...")
    token = get_token()
    
    if not token:
        print("❌ ไม่สามารถ Login ได้ กรุณาตรวจสอบ Backend Server")
        return
    
    print("✅ Login สำเร็จ!")
    
    # 2. Test Download Template
    download_success = test_download_template(token)
    
    # 3. Test Import Excel
    if download_success:
        import_success = test_import_excel(token)
    
    # 4. Test List Customers
    test_list_customers(token)
    
    print("\n" + "="*60)
    print("✨ การทดสอบเสร็จสิ้น")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
