# 🗄️ Database Schema Documentation
## Premium Security ERP System

**Database Type:** PostgreSQL 15+  
**ORM:** SQLAlchemy 2.0 (Async)  
**Last Updated:** December 11, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Tables](#database-tables)
3. [Table Relationships](#table-relationships)
4. [Field Details](#field-details)
5. [Indexes and Constraints](#indexes-and-constraints)
6. [Migration History](#migration-history)

---

## 🎯 Overview

### Database Connection
```
Host: localhost
Database: erp_db
Port: 5432
User: postgres
Encoding: UTF-8
```

### Total Tables: 11

| Table | Purpose | Records (Est.) |
|-------|---------|----------------|
| users | ผู้ใช้งานระบบ | 10-100 |
| roles | บทบาทและสิทธิ์ | 5-10 |
| customers | ข้อมูลลูกค้า | 100-1000 |
| sites | หน่วยงาน/สาขา | 200-2000 |
| guards | พนักงานรักษาความปลอดภัย | 500-5000 |
| staff | พนักงานภายใน | 50-500 |
| banks | ธนาคาร | 20-50 |
| products | สินค้า | 50-200 |
| services | บริการ | 20-100 |
| daily_advances | เบิกรายวัน | 1000-50000 |
| audit_logs | ประวัติการแก้ไข | 10000+ |

---

## 📊 Database Tables

### 1. 👤 **users** - ผู้ใช้งานระบบ

**Purpose:** เก็บข้อมูลผู้ใช้งานระบบ

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary Key |
| username | VARCHAR(50) | NO | - | ชื่อผู้ใช้ (unique) |
| email | VARCHAR(100) | YES | - | อีเมล (unique) |
| hashedPassword | VARCHAR(255) | NO | - | รหัสผ่านที่เข้ารหัส (Argon2) |
| fullName | VARCHAR(200) | YES | - | ชื่อ-นามสกุล |
| role | VARCHAR(50) | NO | 'User' | บทบาท (Admin/Manager/User) |
| isActive | BOOLEAN | NO | TRUE | สถานะใช้งาน |
| createdAt | TIMESTAMP | NO | NOW() | วันที่สร้าง |
| updatedAt | TIMESTAMP | YES | - | วันที่แก้ไขล่าสุด |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `username`, `email`
- INDEX: `role`

**Sample Data:**
```sql
INSERT INTO users (username, email, hashedPassword, fullName, role)
VALUES ('admin', 'admin@example.com', '$argon2...', 'Administrator', 'Admin');
```

---

### 2. 🔐 **roles** - บทบาทและสิทธิ์

**Purpose:** กำหนดสิทธิ์การเข้าถึงเมนูต่างๆ

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary Key |
| name | VARCHAR(50) | NO | - | ชื่อบทบาท (unique) |
| permissions | TEXT | YES | '[]' | JSON Array ของเมนูที่สามารถเข้าถึง |
| description | TEXT | YES | - | คำอธิบาย |
| createdAt | TIMESTAMP | NO | NOW() | วันที่สร้าง |

**Permissions Format:**
```json
[
  "dashboard",
  "customer-list",
  "site-list",
  "guard-list",
  "staff-list",
  "daily-advance",
  "settings"
]
```

---

### 3. 🏢 **customers** - ข้อมูลลูกค้า

**Purpose:** เก็บข้อมูลลูกค้า/บริษัท

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary Key |
| code | VARCHAR(50) | NO | - | รหัสลูกค้า (unique, ไม่มีช่องว่าง) |
| businessType | VARCHAR(50) | YES | - | ประเภทธุรกิจ |
| name | VARCHAR(200) | NO | - | ชื่อลูกค้า |
| taxId | VARCHAR(20) | YES | - | เลขประจำตัวผู้เสียภาษี |
| address | VARCHAR(500) | YES | - | บ้านเลขที่, หมู่, ซอย, ถนน |
| subDistrict | VARCHAR(100) | YES | - | แขวง/ตำบล |
| district | VARCHAR(100) | YES | - | เขต/อำเภอ |
| province | VARCHAR(100) | YES | - | จังหวัด |
| postalCode | VARCHAR(10) | YES | - | รหัสไปรษณีย์ |
| contactPerson | VARCHAR(100) | YES | - | ชื่อผู้ติดต่อ |
| phone | VARCHAR(20) | YES | - | เบอร์โทร |
| email | VARCHAR(100) | YES | - | อีเมล |
| secondaryContact | VARCHAR(100) | YES | - | ผู้ติดต่อรอง |
| paymentTerms | VARCHAR(500) | YES | - | เงื่อนไขการชำระเงิน |
| isActive | BOOLEAN | NO | TRUE | สถานะใช้งาน |
| createdAt | TIMESTAMP | NO | NOW() | วันที่สร้าง |
| updatedAt | TIMESTAMP | YES | - | วันที่แก้ไขล่าสุด |

**Business Types:**
- กิจการเจ้าของคนเดียว
- ห้างหุ้นส่วน
- บริษัทจำกัด
- รัฐวิสาหกิจ

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `code`
- INDEX: `name`

---

### 4. 🏭 **sites** - หน่วยงาน/สาขา

**Purpose:** เก็บข้อมูลหน่วยงานหรือสาขาของลูกค้า

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary Key |
| siteCode | VARCHAR(50) | NO | - | รหัสหน่วยงาน (unique) |
| name | VARCHAR(200) | NO | - | ชื่อหน่วยงาน |
| customerId | INTEGER | NO | - | FK → customers.id |
| customerCode | VARCHAR(50) | YES | - | รหัสลูกค้า (denormalized) |
| customerName | VARCHAR(200) | YES | - | ชื่อลูกค้า (denormalized) |
| contractStartDate | DATE | YES | - | วันเริ่มสัญญา |
| contractEndDate | DATE | YES | - | วันสิ้นสุดสัญญา |
| address | VARCHAR(500) | YES | - | ที่อยู่หน่วยงาน |
| subDistrict | VARCHAR(100) | YES | - | แขวง/ตำบล |
| district | VARCHAR(100) | YES | - | เขต/อำเภอ |
| province | VARCHAR(100) | YES | - | จังหวัด |
| postalCode | VARCHAR(10) | YES | - | รหัสไปรษณีย์ |
| contactPerson | VARCHAR(100) | YES | - | ผู้ติดต่อ |
| phone | VARCHAR(20) | YES | - | เบอร์โทร |
| employmentDetails | TEXT | YES | - | JSON: ข้อมูลการจ้าง |
| isActive | BOOLEAN | NO | TRUE | สถานะใช้งาน |
| createdAt | TIMESTAMP | NO | NOW() | วันที่สร้าง |
| updatedAt | TIMESTAMP | YES | - | วันที่แก้ไขล่าสุด |

**Employment Details Format:**
```json
[
  {
    "position": "รปภ.ชาย",
    "quantity": 10,
    "dailyIncome": 350,
    "hiringRate": 450,
    "positionAllowance": 50,
    "diligenceBonus": 500,
    "sevenDayBonus": 1000,
    "pointBonus": 200,
    "otherAllowance": 0,
    "remarks": "เปิด 24 ชม."
  }
]
```

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `siteCode`
- FOREIGN KEY: `customerId` → `customers.id`
- INDEX: `customerCode`, `name`

---

### 5. 💂 **guards** - พนักงานรักษาความปลอดภัย

**Purpose:** เก็บข้อมูลพนักงาน รปภ.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary Key |
| guardId | VARCHAR(50) | NO | AUTO | รหัสพนักงาน (unique, auto-generated) |
| title | VARCHAR(20) | YES | - | คำนำหน้า (นาย/นาง/นางสาว) |
| firstName | VARCHAR(100) | NO | - | ชื่อ |
| lastName | VARCHAR(100) | NO | - | นามสกุล |
| birthDate | DATE | YES | - | วันเดือนปีเกิด |
| nationality | VARCHAR(50) | YES | - | สัญชาติ |
| religion | VARCHAR(50) | YES | - | ศาสนา |
| addressIdCard | VARCHAR(500) | YES | - | ที่อยู่ตามบัตรประชาชน |
| addressCurrent | VARCHAR(500) | YES | - | ที่อยู่ปัจจุบัน |
| phone | VARCHAR(20) | YES | - | เบอร์โทรศัพท์ |
| education | VARCHAR(100) | YES | - | วุฒิการศึกษา |
| licenseNumber | VARCHAR(50) | YES | - | เลขที่บัตร/ใบอนุญาต |
| licenseExpiry | DATE | YES | - | วันหมดอายุใบอนุญาต |
| startDate | DATE | YES | - | วันเริ่มปฏิบัติงาน |
| bankAccountName | VARCHAR(200) | YES | - | ชื่อบัญชีธนาคาร |
| bankAccountNo | VARCHAR(50) | YES | - | เลขที่บัญชี |
| bankCode | VARCHAR(10) | YES | - | รหัสธนาคาร |
| idCardNumber | VARCHAR(13) | YES | - | เลขบัตรประชาชน 13 หลัก |
| maritalStatus | VARCHAR(50) | YES | - | สถานภาพสมรส |
| spouseName | VARCHAR(200) | YES | - | ชื่อคู่สมรส |
| emergencyContactName | VARCHAR(200) | YES | - | ชื่อผู้ติดต่อฉุกเฉิน |
| emergencyContactPhone | VARCHAR(20) | YES | - | เบอร์โทรฉุกเฉิน |
| emergencyContactRelation | VARCHAR(100) | YES | - | ความสัมพันธ์กับผู้ติดต่อฉุกเฉิน |
| isActive | BOOLEAN | NO | TRUE | สถานะใช้งาน |
| createdAt | TIMESTAMP | NO | NOW() | วันที่สร้าง |
| updatedAt | TIMESTAMP | YES | - | วันที่แก้ไขล่าสุด |

**Guard ID Format:** `G-YYYYMMDD-XXXX`
- Example: `G-20251211-0001`

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `guardId`
- INDEX: `firstName`, `lastName`, `idCardNumber`

---

### 6. 👔 **staff** - พนักงานภายใน

**Purpose:** เก็บข้อมูลพนักงานภายในบริษัท

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary Key |
| staffId | VARCHAR(50) | NO | AUTO | รหัสพนักงาน (unique, auto-generated) |
| title | VARCHAR(20) | YES | - | คำนำหน้า (นาย/นาง/นางสาว) ⭐ ใหม่ |
| firstName | VARCHAR(100) | NO | - | ชื่อ |
| lastName | VARCHAR(100) | NO | - | นามสกุล |
| idCardNumber | VARCHAR(13) | YES | - | เลขบัตรประชาชน |
| phone | VARCHAR(20) | YES | - | เบอร์โทร |
| email | VARCHAR(100) | YES | - | อีเมล ⭐ ใหม่ |
| address | VARCHAR(500) | YES | - | ที่อยู่ |
| position | VARCHAR(100) | YES | - | ตำแหน่งงาน |
| department | VARCHAR(100) | YES | - | แผนก |
| startDate | DATE | YES | - | วันเริ่มงาน |
| birthDate | DATE | YES | - | วันเกิด |
| salary | NUMERIC(10,2) | YES | - | เงินเดือน |
| salaryType | VARCHAR(50) | YES | - | ประเภท (รายเดือน/รายวัน/รายชั่วโมง) |
| paymentMethod | VARCHAR(50) | YES | - | วิธีรับเงิน (โอน/สด/เช็ค) |
| bankAccountNo | VARCHAR(50) | YES | - | เลขบัญชี |
| bankCode | VARCHAR(10) | YES | - | รหัสธนาคาร |
| isActive | BOOLEAN | NO | TRUE | สถานะใช้งาน |
| createdAt | TIMESTAMP | NO | NOW() | วันที่สร้าง |
| updatedAt | TIMESTAMP | YES | - | วันที่แก้ไขล่าสุด |

**Staff ID Format:** `S-YYYYMMDD-XXXX`
- Example: `S-20251211-0001`

**Salary Types:**
- รายเดือน
- รายวัน
- รายชั่วโมง

**Payment Methods:**
- โอนเข้าบัญชี
- เงินสด
- เช็ค

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `staffId`
- INDEX: `firstName`, `lastName`

---

### 7. 🏦 **banks** - ธนาคาร

**Purpose:** Master data ธนาคาร

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary Key |
| code | VARCHAR(10) | NO | - | รหัสธนาคาร (unique) |
| name | VARCHAR(200) | NO | - | ชื่อธนาคาร (ภาษาไทย) |
| shortNameEN | VARCHAR(50) | NO | - | ชื่อย่อ (English) |

**Sample Data:**
```sql
INSERT INTO banks (code, name, shortNameEN) VALUES
('002', 'ธนาคารกรุงเทพ', 'BBL'),
('004', 'ธนาคารกสิกรไทย', 'KBANK'),
('006', 'ธนาคารกรุงไทย', 'KTB'),
('011', 'ธนาคารทหารไทยธนชาต', 'TTB'),
('014', 'ธนาคารไทยพาณิชย์', 'SCB');
```

---

### 8. 📦 **products** - สินค้า

**Purpose:** เก็บข้อมูลสินค้า

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary Key |
| code | VARCHAR(50) | NO | - | รหัสสินค้า (unique) |
| name | VARCHAR(200) | NO | - | ชื่อสินค้า |
| category | VARCHAR(100) | YES | - | หมวดหมู่ |
| price | NUMERIC(10,2) | YES | 0 | ราคา |
| isActive | BOOLEAN | NO | TRUE | สถานะใช้งาน |

---

### 9. 🛠️ **services** - บริการ

**Purpose:** เก็บข้อมูลบริการ

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary Key |
| code | VARCHAR(50) | NO | - | รหัสบริการ (unique) |
| name | VARCHAR(200) | NO | - | ชื่อบริการ |
| category | VARCHAR(100) | YES | - | หมวดหมู่ |
| price | NUMERIC(10,2) | YES | 0 | ราคา |
| isActive | BOOLEAN | NO | TRUE | สถานะใช้งาน |

---

### 10. 💰 **daily_advances** - เบิกรายวัน

**Purpose:** เก็บข้อมูลการเบิกเงินรายวัน

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary Key |
| advanceId | VARCHAR(50) | NO | AUTO | รหัสการเบิก (unique) |
| date | DATE | NO | - | วันที่เบิก |
| guardId | INTEGER | YES | - | FK → guards.id |
| staffId | INTEGER | YES | - | FK → staff.id |
| amount | NUMERIC(10,2) | NO | - | จำนวนเงิน |
| purpose | TEXT | YES | - | วัตถุประสงค์ |
| status | VARCHAR(50) | NO | 'Pending' | สถานะ (Pending/Approved/Rejected) |
| approvedBy | INTEGER | YES | - | FK → users.id |
| approvedAt | TIMESTAMP | YES | - | วันที่อนุมัติ |
| remarks | TEXT | YES | - | หมายเหตุ |
| createdBy | INTEGER | NO | - | FK → users.id |
| createdAt | TIMESTAMP | NO | NOW() | วันที่สร้าง |

---

### 11. 📝 **audit_logs** - ประวัติการแก้ไข

**Purpose:** ติดตามการเปลี่ยนแปลงข้อมูล

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO | Primary Key |
| entityType | VARCHAR(50) | NO | - | ประเภทข้อมูล (guard/staff/customer/site) |
| entityId | INTEGER | NO | - | ID ของข้อมูล |
| action | VARCHAR(20) | NO | - | การกระทำ (CREATE/UPDATE/DELETE) |
| changes | TEXT | YES | - | JSON: ข้อมูลที่เปลี่ยนแปลง |
| userId | INTEGER | YES | - | FK → users.id |
| username | VARCHAR(50) | YES | - | ชื่อผู้ใช้ (denormalized) |
| timestamp | TIMESTAMP | NO | NOW() | วันเวลาที่เกิดเหตุการณ์ |

**Changes Format:**
```json
{
  "field": "phone",
  "oldValue": "0812345678",
  "newValue": "0898765432"
}
```

---

## 🔗 Table Relationships

### Entity Relationship Diagram (ERD)

```
users (1) ─────── (∞) audit_logs
  │
  └─── (∞) daily_advances (as approvedBy/createdBy)

customers (1) ─────── (∞) sites
  
sites (1) ─────── (∞) employmentDetails (JSON)

guards (1) ─────── (∞) daily_advances
guards (∞) ─────── (1) banks (via bankCode)

staff (1) ─────── (∞) daily_advances
staff (∞) ─────── (1) banks (via bankCode)

roles (1) ─────── (∞) permissions (JSON)
```

### Foreign Key Constraints

| Table | Column | References | On Delete |
|-------|--------|------------|-----------|
| sites | customerId | customers.id | CASCADE |
| daily_advances | guardId | guards.id | SET NULL |
| daily_advances | staffId | staff.id | SET NULL |
| daily_advances | approvedBy | users.id | SET NULL |
| daily_advances | createdBy | users.id | CASCADE |
| audit_logs | userId | users.id | SET NULL |

---

## 🔍 Indexes and Constraints

### Primary Keys
- All tables have auto-increment `id` as PRIMARY KEY

### Unique Constraints
- `users.username`
- `users.email`
- `customers.code`
- `sites.siteCode`
- `guards.guardId`
- `staff.staffId`
- `banks.code`
- `products.code`
- `services.code`
- `daily_advances.advanceId`

### Indexes for Performance
```sql
-- users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(isActive);

-- customers
CREATE INDEX idx_customers_name ON customers(name);

-- sites
CREATE INDEX idx_sites_customer ON sites(customerId);
CREATE INDEX idx_sites_customer_code ON sites(customerCode);

-- guards
CREATE INDEX idx_guards_name ON guards(firstName, lastName);
CREATE INDEX idx_guards_id_card ON guards(idCardNumber);

-- staff
CREATE INDEX idx_staff_name ON staff(firstName, lastName);
CREATE INDEX idx_staff_department ON staff(department);

-- audit_logs
CREATE INDEX idx_audit_entity ON audit_logs(entityType, entityId);
CREATE INDEX idx_audit_user ON audit_logs(userId);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
```

---

## 📅 Migration History

### Version 1.0.0 (December 1, 2025)
- ✅ Initial database schema
- ✅ Created all core tables
- ✅ Set up user authentication system

### Version 1.1.0 (December 5, 2025)
- ✅ Added Guard Auto ID generation
- ✅ Implemented audit_logs table
- ✅ Added company_prefix configuration

### Version 1.2.0 (December 11, 2025) ⭐ Current
- ✅ **Added `title` column to `staff` table**
- ✅ **Added `email` column to `staff` table**
- ✅ Updated staff schemas to support new fields
- ✅ Frontend-Backend alignment completed

---

## 🛠️ Common Queries

### Check Database Size
```sql
SELECT 
    pg_size_pretty(pg_database_size('erp_db')) as database_size;
```

### List All Tables with Row Counts
```sql
SELECT 
    schemaname,
    tablename,
    n_tup_ins as "Inserts",
    n_tup_upd as "Updates",
    n_tup_del as "Deletes"
FROM pg_stat_user_tables
ORDER BY tablename;
```

### Find Missing Indexes
```sql
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100
ORDER BY n_distinct DESC;
```

### Backup Database
```bash
pg_dump -U postgres -d erp_db -F c -b -v -f erp_db_backup_$(date +%Y%m%d).dump
```

### Restore Database
```bash
pg_restore -U postgres -d erp_db -v erp_db_backup_20251211.dump
```

---

## 📊 Data Validation Rules

### Customer Code
- ต้องไม่มีช่องว่าง
- อนุญาตเฉพาะ: ตัวอักษร, ตัวเลข, `-`, `_`
- ตัวอย่าง: `CUST-001`, `ABC_COMPANY`

### Site Code
- ต้องไม่มีช่องว่าง
- อนุญาตเฉพาะ: ตัวอักษร, ตัวเลข, `-`, `_`, `.`
- รูปแบบแนะนำ: `{CUSTOMER_CODE}.{SITE_NUMBER}`
- ตัวอย่าง: `CUST-001.01`, `ABC_COMPANY.HQ`

### Guard ID / Staff ID
- สร้างอัตโนมัติ
- รูปแบบ: `{PREFIX}-{YYYYMMDD}-{XXXX}`
- Guard: `G-20251211-0001`
- Staff: `S-20251211-0001`

### Phone Numbers
- ไม่จำเป็นต้องมีรูปแบบเฉพาะ
- แนะนำ: `0812345678` (10 หลัก)

### Tax ID
- 13 หลัก
- ตัวอย่าง: `0105536001490`

### ID Card Number
- 13 หลัก
- ตัวอย่าง: `1234567890123`

---

## 🔒 Security Considerations

### Password Hashing
- Algorithm: **Argon2** (recommended by OWASP)
- Library: `argon2-cffi`
- Salt: Auto-generated per password

### Database Access
- Use environment variables for credentials
- Never hardcode passwords
- Implement least privilege principle

### Audit Logging
- All CREATE/UPDATE/DELETE operations are logged
- Includes user identification
- Stores before/after values

---

## 📞 Support

**Database Issues:**
- Check PostgreSQL logs: `C:\Program Files\PostgreSQL\15\data\log\`
- Verify connections: `SELECT * FROM pg_stat_activity;`
- Monitor locks: `SELECT * FROM pg_locks;`

**Contact:**
- GitHub Issues: [https://github.com/S9ine/demo_app_s9_project/issues](https://github.com/S9ine/demo_app_s9_project/issues)
- Email: support@premiumsecurity.com

---

## 📝 Notes

- All timestamps are stored in UTC
- All monetary values use NUMERIC(10,2) for precision
- JSON fields are validated before storage
- Soft delete is implemented via `isActive` flag
- Database is backed up daily at 02:00 AM

---

**Last Updated:** December 11, 2025  
**Document Version:** 1.2.0  
**Author:** Premium Security Development Team
