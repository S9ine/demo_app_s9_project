import pandas as pd
import os

# สร้าง folder templates ถ้ายังไม่มี
os.makedirs('templates', exist_ok=True)

# สร้างข้อมูลตัวอย่าง
data = [
    {
        'รหัสลูกค้า': 'CUST-001',
        'ชื่อลูกค้า': 'บริษัท ตัวอย่าง จำกัด',
        'เลขประจำตัวผู้เสียภาษี': '0123456789012',
        'ชื่อผู้ติดต่อ': 'คุณสมชาย',
        'เบอร์โทร': '081-234-5678',
        'อีเมล': 'info@example.com',
        'ที่อยู่': '123 ถนนพระราม 4 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330',
        'ลิงก์ Google Maps': 'https://maps.google.com/?q=13.7563,100.5018'
    },
    {
        'รหัสลูกค้า': 'CUST-002',
        'ชื่อลูกค้า': 'ห้างหุ้นส่วน ABC',
        'เลขประจำตัวผู้เสียภาษี': '',
        'ชื่อผู้ติดต่อ': 'คุณสมหญิง',
        'เบอร์โทร': '082-345-6789',
        'อีเมล': '',
        'ที่อยู่': '456 ซอยสุขุมวิท 1 เขตวัฒนา กรุงเทพฯ',
        'ลิงก์ Google Maps': ''
    }
]

# สร้าง DataFrame
df = pd.DataFrame(data)

# บันทึกเป็น Excel
df.to_excel('templates/customer_template.xlsx', index=False, engine='openpyxl')

print("✅ สร้าง customer_template.xlsx สำเร็จ")
