"""
Test API endpoints for guard work history
ทดสอบ API สำหรับ query ประวัติการทำงานของ รปภ.
"""
import requests
from datetime import date

# API configuration
BASE_URL = "http://localhost:8000/api"
USERNAME = "admin"
PASSWORD = "admin123"

def login():
    """Login and get access token"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"username": USERNAME, "password": PASSWORD}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None

def test_guard_work_history(token: str, guard_id: str):
    """Test GET /schedules/guard/{guard_id}/work-history"""
    print(f"\n{'='*80}")
    print(f"Testing: GET /schedules/guard/{guard_id}/work-history")
    print('='*80)
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/schedules/guard/{guard_id}/work-history",
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n👤 Guard: {data['guardName']} ({data['guardId']})")
        print(f"📅 Work Days: {data['summary']['totalWorkDays']}")
        print(f"💰 Total Income: ฿{data['summary']['totalIncome']:,.2f}")
        print(f"🌞 Day Shifts: {data['summary']['dayShiftCount']}")
        print(f"🌙 Night Shifts: {data['summary']['nightShiftCount']}")
        
        if data['workDays']:
            print(f"\n📋 Work History:")
            print(f"{'Date':<12} {'Site':<20} {'Shift':<8} {'Position':<15} {'Income':>10}")
            print("-" * 70)
            for day in data['workDays']:
                print(f"{day['date']:<12} {day['siteName']:<20} {day['shift']:<8} {day['position']:<15} ฿{day['totalIncome']:>8,.2f}")
    else:
        print(f"❌ Error: {response.text}")

def test_guard_summary(token: str, guard_id: str):
    """Test GET /schedules/guard/{guard_id}/summary"""
    print(f"\n{'='*80}")
    print(f"Testing: GET /schedules/guard/{guard_id}/summary")
    print('='*80)
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/schedules/guard/{guard_id}/summary",
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n👤 Guard: {data['guardName']} ({data['guardId']})")
        print(f"📅 Total Work Days: {data['totalWorkDays']}")
        print(f"💰 Total Income: ฿{data['totalIncome']:,.2f}")
        print(f"🌞 Day Shifts: {data['dayShiftCount']}")
        print(f"🌙 Night Shifts: {data['nightShiftCount']}")
        
        if data['topSites']:
            print(f"\n🏢 Top Sites:")
            for site in data['topSites']:
                print(f"   {site['siteName']}: {site['workDays']} days")
    else:
        print(f"❌ Error: {response.text}")

if __name__ == "__main__":
    print("="*80)
    print("Testing Guard Work History API Endpoints")
    print("="*80)
    
    # Login
    token = login()
    if not token:
        exit(1)
    
    print("✅ Login successful")
    
    # Test with guard PG-0001
    test_guard_work_history(token, "PG-0001")
    test_guard_summary(token, "PG-0001")
    
    # Test with non-existent guard
    print(f"\n{'='*80}")
    print("Testing with non-existent guard (should return empty)")
    print('='*80)
    test_guard_summary(token, "PG-9999")
    
    print(f"\n{'='*80}")
    print("✅ All tests completed!")
    print('='*80)
