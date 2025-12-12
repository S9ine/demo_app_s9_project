"""
สคริปต์สำหรับเพิ่มข้อมูล รปภ. สมมุติ 10 คน
"""
import asyncio
from datetime import date, timedelta
import random
from app.database import async_session_maker
from app.models.guard import Guard

# ข้อมูล รปภ. สมมุติ 10 คน
MOCK_GUARDS = [
    {
        "title": "นาย",
        "firstName": "สมชาย",
        "lastName": "ใจดี",
        "phone": "081-234-5678",
        "idCardNumber": "1100100123456",
        "nationality": "ไทย",
        "religion": "พุทธ",
        "education": "มัธยมศึกษาตอนปลาย",
        "addressCurrent": "123/45 หมู่ 1 ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000",
        "bankCode": "KBANK",
        "bankAccountName": "นายสมชาย ใจดี",
        "bankAccountNo": "1234567890",
        "emergencyContactName": "นางสมหญิง ใจดี",
        "emergencyContactPhone": "089-111-2222",
        "emergencyContactRelation": "ภรรยา",
    },
    {
        "title": "นาย",
        "firstName": "วิชัย",
        "lastName": "เก่งกล้า",
        "phone": "082-345-6789",
        "idCardNumber": "1100100234567",
        "nationality": "ไทย",
        "religion": "พุทธ",
        "education": "ปริญญาตรี",
        "addressCurrent": "456 ซ.รามคำแหง 24 แขวงหัวหมาก เขตบางกะปิ กทม. 10240",
        "bankCode": "SCB",
        "bankAccountName": "นายวิชัย เก่งกล้า",
        "bankAccountNo": "2345678901",
        "emergencyContactName": "นายวิเชียร เก่งกล้า",
        "emergencyContactPhone": "089-222-3333",
        "emergencyContactRelation": "พ่อ",
    },
    {
        "title": "นาย",
        "firstName": "ประเสริฐ",
        "lastName": "มั่นคง",
        "phone": "083-456-7890",
        "idCardNumber": "1100100345678",
        "nationality": "ไทย",
        "religion": "พุทธ",
        "education": "มัธยมศึกษาตอนปลาย",
        "addressCurrent": "789 ถ.พหลโยธิน ต.ในเมือง อ.เมือง จ.พิษณุโลก 65000",
        "bankCode": "BBL",
        "bankAccountName": "นายประเสริฐ มั่นคง",
        "bankAccountNo": "3456789012",
        "emergencyContactName": "นางประภา มั่นคง",
        "emergencyContactPhone": "089-333-4444",
        "emergencyContactRelation": "แม่",
    },
    {
        "title": "นาย",
        "firstName": "สุรชัย",
        "lastName": "แข็งแรง",
        "phone": "084-567-8901",
        "idCardNumber": "1100100456789",
        "nationality": "ไทย",
        "religion": "พุทธ",
        "education": "ปวช.",
        "addressCurrent": "101 หมู่ 5 ต.บ้านใหม่ อ.บางใหญ่ จ.นนทบุรี 11140",
        "bankCode": "KTB",
        "bankAccountName": "นายสุรชัย แข็งแรง",
        "bankAccountNo": "4567890123",
        "emergencyContactName": "นางสาวสุรีย์ แข็งแรง",
        "emergencyContactPhone": "089-444-5555",
        "emergencyContactRelation": "พี่สาว",
    },
    {
        "title": "นาย",
        "firstName": "อนุชา",
        "lastName": "รักษาการ",
        "phone": "085-678-9012",
        "idCardNumber": "1100100567890",
        "nationality": "ไทย",
        "religion": "พุทธ",
        "education": "มัธยมศึกษาตอนต้น",
        "addressCurrent": "222 ซ.ลาดพร้าว 101 แขวงคลองจั่น เขตบางกะปิ กทม. 10240",
        "bankCode": "KBANK",
        "bankAccountName": "นายอนุชา รักษาการ",
        "bankAccountNo": "5678901234",
        "emergencyContactName": "นายอนุชิต รักษาการ",
        "emergencyContactPhone": "089-555-6666",
        "emergencyContactRelation": "พี่ชาย",
    },
    {
        "title": "นาย",
        "firstName": "ธนากร",
        "lastName": "เฝ้าระวัง",
        "phone": "086-789-0123",
        "idCardNumber": "1100100678901",
        "nationality": "ไทย",
        "religion": "พุทธ",
        "education": "ปริญญาตรี",
        "addressCurrent": "333 หมู่ 3 ต.ศาลายา อ.พุทธมณฑล จ.นครปฐม 73170",
        "bankCode": "SCB",
        "bankAccountName": "นายธนากร เฝ้าระวัง",
        "bankAccountNo": "6789012345",
        "emergencyContactName": "นางธนิดา เฝ้าระวัง",
        "emergencyContactPhone": "089-666-7777",
        "emergencyContactRelation": "ภรรยา",
    },
    {
        "title": "นาย",
        "firstName": "ชัยวัฒน์",
        "lastName": "ปกป้อง",
        "phone": "087-890-1234",
        "idCardNumber": "1100100789012",
        "nationality": "ไทย",
        "religion": "พุทธ",
        "education": "มัธยมศึกษาตอนปลาย",
        "addressCurrent": "444 ถ.รัชดาภิเษก แขวงจตุจักร เขตจตุจักร กทม. 10900",
        "bankCode": "TMB",
        "bankAccountName": "นายชัยวัฒน์ ปกป้อง",
        "bankAccountNo": "7890123456",
        "emergencyContactName": "นางชุติมา ปกป้อง",
        "emergencyContactPhone": "089-777-8888",
        "emergencyContactRelation": "แม่",
    },
    {
        "title": "นาย",
        "firstName": "วรพล",
        "lastName": "คุ้มครอง",
        "phone": "088-901-2345",
        "idCardNumber": "1100100890123",
        "nationality": "ไทย",
        "religion": "พุทธ",
        "education": "ปวส.",
        "addressCurrent": "555 หมู่ 2 ต.บางพูด อ.ปากเกร็ด จ.นนทบุรี 11120",
        "bankCode": "KBANK",
        "bankAccountName": "นายวรพล คุ้มครอง",
        "bankAccountNo": "8901234567",
        "emergencyContactName": "นายวรเชษฐ์ คุ้มครอง",
        "emergencyContactPhone": "089-888-9999",
        "emergencyContactRelation": "พ่อ",
    },
    {
        "title": "นาย",
        "firstName": "พิทักษ์",
        "lastName": "ดูแล",
        "phone": "089-012-3456",
        "idCardNumber": "1100100901234",
        "nationality": "ไทย",
        "religion": "พุทธ",
        "education": "มัธยมศึกษาตอนปลาย",
        "addressCurrent": "666 ซ.สุขุมวิท 77 แขวงพระโขนงเหนือ เขตวัฒนา กทม. 10110",
        "bankCode": "BBL",
        "bankAccountName": "นายพิทักษ์ ดูแล",
        "bankAccountNo": "9012345678",
        "emergencyContactName": "นางพิมพ์ใจ ดูแล",
        "emergencyContactPhone": "089-999-0000",
        "emergencyContactRelation": "ภรรยา",
    },
    {
        "title": "นาย",
        "firstName": "ศักดิ์ชัย",
        "lastName": "ตรวจตรา",
        "phone": "090-123-4567",
        "idCardNumber": "1100101012345",
        "nationality": "ไทย",
        "religion": "พุทธ",
        "education": "ปริญญาตรี",
        "addressCurrent": "777 หมู่ 4 ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี 12120",
        "bankCode": "SCB",
        "bankAccountName": "นายศักดิ์ชัย ตรวจตรา",
        "bankAccountNo": "0123456789",
        "emergencyContactName": "นางสาวศิริพร ตรวจตรา",
        "emergencyContactPhone": "089-000-1111",
        "emergencyContactRelation": "น้องสาว",
    },
]


async def seed_guards():
    """เพิ่มข้อมูล รปภ. สมมุติ"""
    async with async_session_maker() as session:
        try:
            for i, guard_data in enumerate(MOCK_GUARDS, 1):
                # สร้าง guardId อัตโนมัติ
                guard_id = f"G{str(i).zfill(4)}"
                
                # สุ่มวันเกิด (อายุ 25-55 ปี)
                age = random.randint(25, 55)
                birth_year = date.today().year - age
                birth_date = date(birth_year, random.randint(1, 12), random.randint(1, 28))
                
                # สุ่มวันเริ่มงาน (1-5 ปีที่แล้ว)
                years_worked = random.randint(1, 5)
                start_date = date.today() - timedelta(days=years_worked * 365)
                
                # สุ่มวันหมดอายุใบอนุญาต (1-3 ปีข้างหน้า)
                license_expiry = date.today() + timedelta(days=random.randint(365, 1095))
                
                guard = Guard(
                    guardId=guard_id,
                    title=guard_data["title"],
                    firstName=guard_data["firstName"],
                    lastName=guard_data["lastName"],
                    birthDate=birth_date,
                    nationality=guard_data["nationality"],
                    religion=guard_data["religion"],
                    addressCurrent=guard_data["addressCurrent"],
                    phone=guard_data["phone"],
                    education=guard_data["education"],
                    licenseNumber=f"กภ.{random.randint(10000, 99999)}",
                    licenseExpiry=license_expiry,
                    startDate=start_date,
                    bankCode=guard_data["bankCode"],
                    bankAccountName=guard_data["bankAccountName"],
                    bankAccountNo=guard_data["bankAccountNo"],
                    idCardNumber=guard_data["idCardNumber"],
                    emergencyContactName=guard_data["emergencyContactName"],
                    emergencyContactPhone=guard_data["emergencyContactPhone"],
                    emergencyContactRelation=guard_data["emergencyContactRelation"],
                    isActive=True
                )
                
                session.add(guard)
                print(f"✅ เพิ่ม รปภ.: {guard_id} - {guard_data['firstName']} {guard_data['lastName']}")
            
            await session.commit()
            print(f"\n🎉 เพิ่มข้อมูล รปภ. ทั้งหมด {len(MOCK_GUARDS)} คน สำเร็จ!")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ เกิดข้อผิดพลาด: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(seed_guards())
