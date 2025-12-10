"""
Test script to debug 422 error
"""
import json

# ตัวอย่างข้อมูลที่อาจส่งมาจาก Frontend
test_payload = {
    "siteCode": "C001.02",
    "name": "Test Site",
    "customerId": "1",
    "customerCode": "C001",
    "customerName": "Test Customer",
    "contractStartDate": None,
    "contractEndDate": None,
    "address": "",
    "subDistrict": "",
    "district": "",
    "province": "",
    "postalCode": "",
    "contactPerson": "",
    "phone": "",
    "employmentDetails": [
        {
            "position": "พนักงานรักษาความปลอดภัย",
            "quantity": 6,
            "hiringRate": 24000,
            # ไม่มี positionAllowance และ otherAllowance
            "diligenceBonus": 0,
            "sevenDayBonus": 1000,
            "pointBonus": 0,
            "remarks": ""
        }
    ],
    "contractedServices": [],
    "isActive": True
}

print("Testing payload:")
print(json.dumps(test_payload, indent=2, ensure_ascii=False))

# Test Pydantic validation
from app.schemas.master_data import EmploymentDetail

try:
    detail = EmploymentDetail(**test_payload["employmentDetails"][0])
    print("\n✅ Pydantic validation passed!")
    print(f"Detail: {detail.model_dump()}")
except Exception as e:
    print(f"\n❌ Pydantic validation failed: {e}")
