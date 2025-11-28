# Python + FastAPI Backend - Premium Management System

Backend API สำหรับระบบจัดการบริษัทรักษาความปลอดภัย ใช้ Python + FastAPI + MongoDB

## 🚀 Features

- ✅ JWT Authentication
- ✅ User & Role Management
- ✅ Master Data (Customer, Site, Guard, Staff, Bank)
- ✅ Daily Advance & Expense tracking (Decimal precision)
- ✅ Schedule Management
- ✅ Auto-generated API Documentation (Swagger UI)

## 📋 Requirements

- Python 3.10+
- MongoDB 4.4+

## ⚙️ Setup

### 1. สร้าง Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. ติดตั้ง Dependencies

```bash
pip install -r requirements.txt
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` จาก `.env.example`:

```bash
cp .env.example .env
```

แก้ไขค่าใน `.env`:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key สำหรับ JWT

### 4. Run Server

```bash
uvicorn app.main:app --reload --port 8000
```

Server จะทำงานที่: `http://localhost:8000`

## 📚 API Documentation

เปิด browser ไปที่:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔐 Default Login

```
Username: admin
Password: admin123
```

## 📁 Project Structure

```
app/
├── main.py              # FastAPI application
├── config.py            # Configuration
├── database.py          # MongoDB connection
├── models/              # Pydantic models
├── schemas/             # Request/Response schemas
├── api/                 # API routes
├── core/                # Security & utilities
└── utils/               # Helper functions
```

## 🛠️ Development

- Format code: `black app/`
- Lint: `ruff check app/`
- Type check: `mypy app/`
