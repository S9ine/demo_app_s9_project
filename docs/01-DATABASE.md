# 🗄️ Database Documentation
## Premium Security ERP System

**Database:** PostgreSQL 15+  
**ORM:** SQLAlchemy 2.0 (Async)  
**Last Updated:** December 12, 2025

---

## 📊 Overview

| Setting | Value |
|---------|-------|
| Host | localhost |
| Database | erp_db |
| Port | 5432 |
| User | postgres |
| Encoding | UTF-8 |

---

## 📋 Tables Summary (12 Tables)

| Table | Purpose | Est. Records |
|-------|---------|--------------|
| `users` | ผู้ใช้งานระบบ | 10-100 |
| `roles` | บทบาทและสิทธิ์ | 5-10 |
| `customers` | ข้อมูลลูกค้า | 100-1,000 |
| `sites` | หน่วยงาน/สาขา | 200-2,000 |
| `guards` | พนักงาน รปภ. | 500-5,000 |
| `staff` | พนักงานภายใน | 50-500 |
| `shifts` | กะการทำงาน | 10-50 |
| `banks` | ธนาคาร (Master) | 20-50 |
| `products` | สินค้า | 50-200 |
| `services` | บริการ | 20-100 |
| `daily_advances` | เบิกรายวัน | 1,000-50,000 |
| `audit_logs` | ประวัติการแก้ไข | 10,000+ |

---

## 📝 Table Details

### 1. `users` - ผู้ใช้งานระบบ

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | INTEGER | NO | Primary Key (Auto) |
| username | VARCHAR(50) | NO | ชื่อผู้ใช้ (unique) |
| email | VARCHAR(100) | YES | อีเมล (unique) |
| hashedPassword | VARCHAR(255) | NO | รหัสผ่าน (Argon2) |
| firstName | VARCHAR(100) | YES | ชื่อ |
| lastName | VARCHAR(100) | YES | นามสกุล |
| role | VARCHAR(50) | NO | บทบาท (Admin/Manager/User) |
| isActive | BOOLEAN | NO | สถานะใช้งาน |
| createdAt | TIMESTAMP | NO | วันที่สร้าง |
| updatedAt | TIMESTAMP | YES | วันที่แก้ไข |

---

### 2. `roles` - บทบาทและสิทธิ์

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | INTEGER | NO | Primary Key |
| name | VARCHAR(50) | NO | ชื่อบทบาท (unique) |
| permissions | TEXT | YES | JSON Array ของเมนู |
| description | TEXT | YES | คำอธิบาย |
| createdAt | TIMESTAMP | NO | วันที่สร้าง |

**Permissions Format:**
```json
["dashboard", "customers", "sites", "guards", "staff", "settings"]
```

---

### 3. `customers` - ข้อมูลลูกค้า

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | INTEGER | NO | Primary Key |
| code | VARCHAR(50) | NO | รหัสลูกค้า (unique) |
| businessType | VARCHAR(50) | YES | ประเภทธุรกิจ |
| name | VARCHAR(200) | NO | ชื่อลูกค้า |
| taxId | VARCHAR(20) | YES | เลขผู้เสียภาษี |
| address | VARCHAR(500) | YES | ที่อยู่ |
| subDistrict | VARCHAR(100) | YES | แขวง/ตำบล |
| district | VARCHAR(100) | YES | เขต/อำเภอ |
| province | VARCHAR(100) | YES | จังหวัด |
| postalCode | VARCHAR(10) | YES | รหัสไปรษณีย์ |
| contactPerson | VARCHAR(100) | YES | ผู้ติดต่อหลัก |
| phone | VARCHAR(20) | YES | เบอร์โทร |
| email | VARCHAR(100) | YES | อีเมล |
| secondaryContact | VARCHAR(100) | YES | ผู้ติดต่อรอง |
| paymentTerms | VARCHAR(500) | YES | เงื่อนไขชำระเงิน |
| isActive | BOOLEAN | NO | สถานะ |
| createdAt | TIMESTAMP | NO | วันที่สร้าง |
| updatedAt | TIMESTAMP | YES | วันที่แก้ไข |

**Business Types:** กิจการเจ้าของคนเดียว, ห้างหุ้นส่วน, บริษัทจำกัด, รัฐวิสาหกิจ

---

### 4. `sites` - หน่วยงาน/สาขา

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | INTEGER | NO | Primary Key |
| siteCode | VARCHAR(50) | NO | รหัสหน่วยงาน (unique, auto) |
| name | VARCHAR(200) | NO | ชื่อหน่วยงาน |
| customerId | INTEGER | NO | FK → customers.id |
| customerCode | VARCHAR(50) | YES | รหัสลูกค้า (denorm) |
| customerName | VARCHAR(200) | YES | ชื่อลูกค้า (denorm) |
| contractStartDate | DATE | YES | วันเริ่มสัญญา |
| contractEndDate | DATE | YES | วันสิ้นสุดสัญญา |
| address | VARCHAR(500) | YES | ที่อยู่ |
| subDistrict | VARCHAR(100) | YES | แขวง/ตำบล |
| district | VARCHAR(100) | YES | เขต/อำเภอ |
| province | VARCHAR(100) | YES | จังหวัด |
| postalCode | VARCHAR(10) | YES | รหัสไปรษณีย์ |
| contactPerson | VARCHAR(100) | YES | ผู้ติดต่อ |
| phone | VARCHAR(20) | YES | เบอร์โทร |
| employmentDetails | TEXT | YES | JSON: ข้อมูลการจ้าง |
| shiftAssignments | TEXT | YES | JSON: กะงานที่กำหนด |
| isActive | BOOLEAN | NO | สถานะ |
| createdAt | TIMESTAMP | NO | วันที่สร้าง |
| updatedAt | TIMESTAMP | YES | วันที่แก้ไข |

**Site Code Format:** `{CustomerCode}.XX` (e.g., PG-0001.01)

---

### 5. `guards` - พนักงาน รปภ.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | INTEGER | NO | Primary Key |
| guardId | VARCHAR(50) | NO | รหัสพนักงาน (unique, auto) |
| title | VARCHAR(20) | YES | คำนำหน้า |
| firstName | VARCHAR(100) | NO | ชื่อ |
| lastName | VARCHAR(100) | NO | นามสกุล |
| birthDate | DATE | YES | วันเกิด |
| nationality | VARCHAR(50) | YES | สัญชาติ |
| religion | VARCHAR(50) | YES | ศาสนา |
| idCardNumber | VARCHAR(13) | YES | เลขบัตรประชาชน |
| addressIdCard | VARCHAR(500) | YES | ที่อยู่ตามบัตร |
| addressCurrent | VARCHAR(500) | YES | ที่อยู่ปัจจุบัน |
| phone | VARCHAR(20) | YES | เบอร์โทร |
| education | VARCHAR(100) | YES | วุฒิการศึกษา |
| licenseNumber | VARCHAR(50) | YES | เลขใบอนุญาต |
| licenseExpiry | DATE | YES | วันหมดอายุใบอนุญาต |
| startDate | DATE | YES | วันเริ่มงาน |
| bankAccountName | VARCHAR(200) | YES | ชื่อบัญชี |
| bankAccountNo | VARCHAR(50) | YES | เลขบัญชี |
| bankCode | VARCHAR(10) | YES | รหัสธนาคาร |
| maritalStatus | VARCHAR(50) | YES | สถานภาพ |
| spouseName | VARCHAR(200) | YES | ชื่อคู่สมรส |
| emergencyContactName | VARCHAR(200) | YES | ผู้ติดต่อฉุกเฉิน |
| emergencyContactPhone | VARCHAR(20) | YES | เบอร์ฉุกเฉิน |
| emergencyContactRelation | VARCHAR(100) | YES | ความสัมพันธ์ |
| isActive | BOOLEAN | NO | สถานะ |
| createdAt | TIMESTAMP | NO | วันที่สร้าง |
| updatedAt | TIMESTAMP | YES | วันที่แก้ไข |

**Guard ID Format:** `PG-XXXX` (Auto-generated, e.g., PG-0001)

---

### 6. `staff` - พนักงานภายใน

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | INTEGER | NO | Primary Key |
| staffId | VARCHAR(50) | NO | รหัสพนักงาน (unique, auto) |
| title | VARCHAR(20) | YES | คำนำหน้า |
| firstName | VARCHAR(100) | NO | ชื่อ |
| lastName | VARCHAR(100) | NO | นามสกุล |
| idCardNumber | VARCHAR(13) | YES | เลขบัตรประชาชน |
| phone | VARCHAR(20) | YES | เบอร์โทร |
| email | VARCHAR(100) | YES | อีเมล |
| address | VARCHAR(500) | YES | ที่อยู่ |
| position | VARCHAR(100) | YES | ตำแหน่ง |
| department | VARCHAR(100) | YES | แผนก |
| startDate | DATE | YES | วันเริ่มงาน |
| birthDate | DATE | YES | วันเกิด |
| salary | NUMERIC(10,2) | YES | เงินเดือน |
| salaryType | VARCHAR(50) | YES | ประเภท (รายเดือน/รายวัน) |
| paymentMethod | VARCHAR(50) | YES | วิธีรับเงิน |
| bankAccountNo | VARCHAR(50) | YES | เลขบัญชี |
| bankCode | VARCHAR(10) | YES | รหัสธนาคาร |
| isActive | BOOLEAN | NO | สถานะ |
| createdAt | TIMESTAMP | NO | วันที่สร้าง |
| updatedAt | TIMESTAMP | YES | วันที่แก้ไข |

**Staff ID Format:** `S-XXXX` (Auto-generated, e.g., S-0001)

---

### 7. `shifts` - กะการทำงาน

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | INTEGER | NO | Primary Key |
| name | VARCHAR(100) | NO | ชื่อกะ |
| startTime | TIME | NO | เวลาเริ่ม |
| endTime | TIME | NO | เวลาสิ้นสุด |
| description | TEXT | YES | รายละเอียด |
| isActive | BOOLEAN | NO | สถานะ |
| createdAt | TIMESTAMP | NO | วันที่สร้าง |
| updatedAt | TIMESTAMP | YES | วันที่แก้ไข |

---

### 8. `banks` - ธนาคาร (Master Data)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | INTEGER | NO | Primary Key |
| code | VARCHAR(10) | NO | รหัสธนาคาร (unique) |
| name | VARCHAR(200) | NO | ชื่อธนาคาร (ไทย) |
| shortNameEN | VARCHAR(50) | NO | ชื่อย่อ (EN) |

---

### 9. `products` - สินค้า

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | INTEGER | NO | Primary Key |
| code | VARCHAR(50) | NO | รหัสสินค้า (unique) |
| name | VARCHAR(200) | NO | ชื่อสินค้า |
| category | VARCHAR(100) | YES | หมวดหมู่ |
| price | NUMERIC(10,2) | YES | ราคา |
| isActive | BOOLEAN | NO | สถานะ |

---

### 10. `services` - บริการ

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | INTEGER | NO | Primary Key |
| code | VARCHAR(50) | NO | รหัสบริการ (unique) |
| name | VARCHAR(200) | NO | ชื่อบริการ |
| category | VARCHAR(100) | YES | หมวดหมู่ |
| price | NUMERIC(10,2) | YES | ราคา |
| isActive | BOOLEAN | NO | สถานะ |

---

### 11. `daily_advances` - เบิกรายวัน

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | INTEGER | NO | Primary Key |
| advanceId | VARCHAR(50) | NO | รหัสการเบิก (unique) |
| date | DATE | NO | วันที่เบิก |
| guardId | INTEGER | YES | FK → guards.id |
| staffId | INTEGER | YES | FK → staff.id |
| amount | NUMERIC(10,2) | NO | จำนวนเงิน |
| purpose | TEXT | YES | วัตถุประสงค์ |
| status | VARCHAR(50) | NO | สถานะ (Pending/Approved/Rejected) |
| approvedBy | INTEGER | YES | FK → users.id |
| approvedAt | TIMESTAMP | YES | วันที่อนุมัติ |
| remarks | TEXT | YES | หมายเหตุ |
| createdBy | INTEGER | NO | FK → users.id |
| createdAt | TIMESTAMP | NO | วันที่สร้าง |

---

### 12. `audit_logs` - ประวัติการแก้ไข

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | INTEGER | NO | Primary Key |
| entityType | VARCHAR(50) | NO | ประเภทข้อมูล |
| entityId | INTEGER | NO | ID ของข้อมูล |
| action | VARCHAR(20) | NO | การกระทำ (CREATE/UPDATE/DELETE) |
| changes | TEXT | YES | JSON: ข้อมูลที่เปลี่ยน |
| userId | INTEGER | YES | FK → users.id |
| username | VARCHAR(50) | YES | ชื่อผู้ใช้ |
| timestamp | TIMESTAMP | NO | วันเวลา |

---

## 🔗 Relationships (ERD)

```
users ──────────< audit_logs
   │
   └──────────< daily_advances (approvedBy, createdBy)

customers ────< sites ──────< employmentDetails (JSON)
                   │
                   └──────< shiftAssignments (JSON)

guards ───────< daily_advances
   └──────────> banks (via bankCode)

staff ────────< daily_advances  
   └──────────> banks (via bankCode)

shifts ───────< shiftAssignments (in sites JSON)
```

---

## 🔑 Foreign Keys

| Table | Column | References | On Delete |
|-------|--------|------------|-----------|
| sites | customerId | customers.id | CASCADE |
| daily_advances | guardId | guards.id | SET NULL |
| daily_advances | staffId | staff.id | SET NULL |
| daily_advances | approvedBy | users.id | SET NULL |
| daily_advances | createdBy | users.id | CASCADE |
| audit_logs | userId | users.id | SET NULL |

---

## 📌 Indexes

```sql
-- Performance Indexes
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_sites_customer ON sites(customerId);
CREATE INDEX idx_guards_name ON guards(firstName, lastName);
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_audit_entity ON audit_logs(entityType, entityId);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
```

---

## 🔧 Maintenance Commands

```bash
# Backup Database
pg_dump -U postgres -d erp_db -F c -f backup_$(date +%Y%m%d).dump

# Restore Database
pg_restore -U postgres -d erp_db backup_20251212.dump

# Check Size
psql -U postgres -d erp_db -c "SELECT pg_size_pretty(pg_database_size('erp_db'));"
```
