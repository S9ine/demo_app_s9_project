# 🚀 วิธีรันระบบ (Backend + Frontend)

## การรัน Backend (Python + FastAPI)

### วิธีที่ 1: ใช้ Quick Start Script (แนะนำ)

```bash
# เปิด Terminal 1
cd d:\work\ERP\Project\backend_python
start.bat
```

### วิธีที่ 2: Manual

```bash
# เปิด Terminal 1
cd d:\work\ERP\Project\backend_python

# Activate virtual environment
venv\Scripts\activate

# Run server
uvicorn app.main:app --reload --port 8000
```

**Backend จะรันที่:**
- API: http://localhost:8000
- Swagger UI (API Docs): http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## การรัน Frontend (React + Vite)

```bash
# เปิด Terminal 2
cd d:\work\ERP\Project\frontend
npm run dev
```

**Frontend จะรันที่:**
- http://localhost:5173

---

## การทดสอบ

### 1. ทดสอบ Backend

เปิด browser: `http://localhost:8000/docs`

ทดสอบ Login API:
```json
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

คุณจะได้ token กลับมา!

### 2. ทดสอบ Frontend + Backend

1. เปิด `http://localhost:5173`
2. Login ด้วย:
   - Username: `admin`
   - Password: `admin123`
3. ตรวจสอบ:
   - เปิด DevTools → Network tab
   - ดูว่า API calls ไปที่ `http://localhost:8000/api`
   - ตรวจสอบ Headers มี `Authorization: Bearer <token>`

---

## Troubleshooting

### ปัญหา: Backend ไม่รัน

**อาการ:** `uvicorn: command not found`

**แก้ไข:**
```bash
cd d:\work\ERP\Project\backend_python
venv\Scripts\activate
pip install -r requirements.txt
```

### ปัญหา: CORS Error

**อาการ:** `Access to XMLHttpRequest ... has been blocked by CORS policy`

**แก้ไข:** ตรวจสอบว่า Backend กำลังรันอยู่ที่ port 8000

### ปัญหา: Login ไม่ได้

**แก้ไข:**
1. ตรวจสอบว่า Backend รันอยู่
2. ตรวจสอบว่า Database initialized แล้ว (`python init_db.py`)
3. ลองใช้ `admin` / `admin123`

---

## คำสั่งที่มีประโยชน์

### Backend

```bash
# Initialize database (ครั้งแรกเท่านั้น)
python init_db.py

# Run server
uvicorn app.main:app --reload --port 8000

# Check dependencies
pip list
```

.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

### Frontend

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

---

## Default Login

```
Username: admin
Password: admin123
```

หลัง login สำเร็จ คุณสามารถ:
- จัดการ Users & Roles
- จัดการ Master Data (Customers, Sites, Guards, Staff, Banks)
- สร้างเอกสารเบิกจ่าย
- ดูตารางงาน

---

## สถานะปัจจุบัน

✅ Backend: พร้อมใช้งาน (40+ API endpoints)
✅ Frontend: เชื่อมต่อ Backend แล้ว
✅ Authentication: ทำงานผ่าน JWT
⏳ Testing: กำลังทดสอบทุกหน้า
