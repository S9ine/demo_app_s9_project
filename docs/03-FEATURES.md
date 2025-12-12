# ⚙️ Features & API Reference
## Premium Security ERP System

**Last Updated:** December 12, 2025

---

## 📋 Features Overview

| Module | Features |
|--------|----------|
| 🔐 Authentication | Login, Logout, JWT Token, Role-based Access |
| 👤 Users | CRUD, Role Assignment, Password Management |
| 🎭 Roles | CRUD, Permission Management |
| 🏢 Customers | CRUD, Excel Import/Export, Business Types |
| 🏭 Sites | CRUD, Employment Details, Shift Assignments |
| 💂 Guards | CRUD, Auto ID, Excel Import/Export, History |
| 👔 Staff | CRUD, Auto ID, Excel Import/Export, History |
| ⏰ Shifts | CRUD, Time Management |
| 🏦 Banks | CRUD (Master Data) |
| 📦 Products | CRUD |
| 🛠️ Services | CRUD |
| 💰 Daily Advances | Create Documents, Batch Entry, Approval |
| 📅 Scheduler | Calendar View, Drag & Drop |
| 📝 Audit Logs | History Tracking, Timeline View |
| 📊 Dashboard | Statistics, Charts, Quick Links |

---

## 🔌 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| GET | `/api/auth/me` | ดูข้อมูลผู้ใช้ปัจจุบัน |
| POST | `/api/auth/logout` | ออกจากระบบ |

**Login Request:**
```json
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

**Login Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "firstName": "Admin",
    "lastName": "User",
    "role": "Admin",
    "permissions": ["dashboard", "customers", ...]
  }
}
```

---

### 👤 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | รายการผู้ใช้ทั้งหมด |
| GET | `/api/users/{id}` | ดูข้อมูลผู้ใช้ |
| POST | `/api/users` | สร้างผู้ใช้ใหม่ |
| PUT | `/api/users/{id}` | แก้ไขผู้ใช้ |
| DELETE | `/api/users/{id}` | ลบผู้ใช้ |
| PUT | `/api/users/{id}/password` | เปลี่ยนรหัสผ่าน |

---

### 🎭 Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | รายการบทบาททั้งหมด |
| GET | `/api/roles/{id}` | ดูข้อมูลบทบาท |
| POST | `/api/roles` | สร้างบทบาทใหม่ |
| PUT | `/api/roles/{id}` | แก้ไขบทบาท |
| DELETE | `/api/roles/{id}` | ลบบทบาท |

---

### 🏢 Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | รายการลูกค้าทั้งหมด |
| GET | `/api/customers/{id}` | ดูข้อมูลลูกค้า |
| POST | `/api/customers` | สร้างลูกค้าใหม่ |
| PUT | `/api/customers/{id}` | แก้ไขลูกค้า |
| DELETE | `/api/customers/{id}` | ลบลูกค้า |
| GET | `/api/customers/template` | Download Excel Template |
| POST | `/api/customers/import` | Import จาก Excel |

**Customer Create/Update:**
```json
{
  "code": "PG-0001",
  "businessType": "บริษัทจำกัด",
  "name": "บริษัท ไทย ยามาซากิ จำกัด",
  "taxId": "1234567890123",
  "address": "123 ถนนสุขุมวิท",
  "subDistrict": "คลองเตย",
  "district": "คลองเตย",
  "province": "กรุงเทพมหานคร",
  "postalCode": "10110",
  "contactPerson": "คุณสมชาย",
  "phone": "02-123-4567",
  "email": "contact@company.com",
  "isActive": true
}
```

---

### 🏭 Sites

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sites` | รายการหน่วยงานทั้งหมด |
| GET | `/api/sites/{id}` | ดูข้อมูลหน่วยงาน |
| POST | `/api/sites` | สร้างหน่วยงานใหม่ |
| PUT | `/api/sites/{id}` | แก้ไขหน่วยงาน |
| DELETE | `/api/sites/{id}` | ลบหน่วยงาน |
| GET | `/api/sites/template` | Download Excel Template |
| POST | `/api/sites/import` | Import จาก Excel |

**Site Create/Update:**
```json
{
  "name": "สำนักงานใหญ่",
  "customerId": 1,
  "address": "123 ถนนรัชดา",
  "subDistrict": "ดินแดง",
  "district": "ดินแดง",
  "province": "กรุงเทพมหานคร",
  "postalCode": "10400",
  "contactPerson": "คุณสมหญิง",
  "phone": "02-999-9999",
  "employmentDetails": [
    {
      "position": "รปภ. หัวหน้า",
      "headcount": 1,
      "wagePerDay": 500,
      "workingDays": 26,
      "otHours": 0
    }
  ],
  "shiftAssignments": [
    { "shiftId": 1, "workerCount": 2 },
    { "shiftId": 2, "workerCount": 3 }
  ],
  "isActive": true
}
```

---

### 💂 Guards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/guards` | รายการพนักงาน รปภ. |
| GET | `/api/guards/{id}` | ดูข้อมูลพนักงาน |
| POST | `/api/guards` | สร้างพนักงานใหม่ (Auto ID) |
| PUT | `/api/guards/{id}` | แก้ไขพนักงาน |
| DELETE | `/api/guards/{id}` | ลบพนักงาน |
| GET | `/api/guards/template` | Download Excel Template |
| POST | `/api/guards/import` | Import จาก Excel |

**Guard Create (Auto ID):**
```json
{
  "title": "นาย",
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "idCardNumber": "1234567890123",
  "phone": "081-234-5678",
  "addressCurrent": "123 หมู่ 5 ต.บางปู",
  "bankAccountNo": "123-456-7890",
  "bankCode": "004",
  "isActive": true
}
```

**Response (with generated ID):**
```json
{
  "id": 1,
  "guardId": "PG-0001",  // Auto-generated
  "firstName": "สมชาย",
  ...
}
```

---

### 👔 Staff

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/staff` | รายการพนักงานภายใน |
| GET | `/api/staff/{id}` | ดูข้อมูลพนักงาน |
| POST | `/api/staff` | สร้างพนักงานใหม่ (Auto ID) |
| PUT | `/api/staff/{id}` | แก้ไขพนักงาน |
| DELETE | `/api/staff/{id}` | ลบพนักงาน |
| GET | `/api/staff/template` | Download Excel Template |
| POST | `/api/staff/import` | Import จาก Excel |

---

### ⏰ Shifts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shifts` | รายการกะงานทั้งหมด |
| GET | `/api/shifts/{id}` | ดูข้อมูลกะ |
| POST | `/api/shifts` | สร้างกะใหม่ |
| PUT | `/api/shifts/{id}` | แก้ไขกะ |
| DELETE | `/api/shifts/{id}` | ลบกะ |

**Shift Create/Update:**
```json
{
  "name": "กะเช้า",
  "startTime": "06:00",
  "endTime": "18:00",
  "description": "กะเช้า 06:00-18:00",
  "isActive": true
}
```

---

### 🏦 Banks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/banks` | รายการธนาคารทั้งหมด |
| GET | `/api/banks/{id}` | ดูข้อมูลธนาคาร |
| POST | `/api/banks` | สร้างธนาคารใหม่ |
| PUT | `/api/banks/{id}` | แก้ไขธนาคาร |
| DELETE | `/api/banks/{id}` | ลบธนาคาร |

---

### 📦 Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | รายการสินค้าทั้งหมด |
| GET | `/api/products/{id}` | ดูข้อมูลสินค้า |
| POST | `/api/products` | สร้างสินค้าใหม่ |
| PUT | `/api/products/{id}` | แก้ไขสินค้า |
| DELETE | `/api/products/{id}` | ลบสินค้า |

---

### 🛠️ Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | รายการบริการทั้งหมด |
| GET | `/api/services/{id}` | ดูข้อมูลบริการ |
| POST | `/api/services` | สร้างบริการใหม่ |
| PUT | `/api/services/{id}` | แก้ไขบริการ |
| DELETE | `/api/services/{id}` | ลบบริการ |

---

### 💰 Daily Advances

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/daily-advances` | รายการเอกสารเบิก |
| GET | `/api/daily-advances/{id}` | ดูรายละเอียด |
| POST | `/api/daily-advances` | สร้างเอกสารใหม่ |
| PUT | `/api/daily-advances/{id}` | แก้ไขเอกสาร |
| DELETE | `/api/daily-advances/{id}` | ลบเอกสาร |
| POST | `/api/daily-advances/{id}/approve` | อนุมัติ |
| POST | `/api/daily-advances/{id}/reject` | ปฏิเสธ |

---

### 📝 Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit-logs` | รายการ log ทั้งหมด |
| GET | `/api/audit-logs?entityType=guards&entityId=1` | Log ของ entity |

**Query Parameters:**
- `entityType` - ประเภท (guards, staff, customers, sites)
- `entityId` - ID ของ entity
- `action` - การกระทำ (CREATE, UPDATE, DELETE)
- `userId` - ผู้ใช้ที่ทำ
- `startDate` - วันที่เริ่มต้น
- `endDate` - วันที่สิ้นสุด

---

## 🎨 Frontend Components

### Pages

| Component | Path | Description |
|-----------|------|-------------|
| `Dashboard` | `/` | หน้าแรก, สถิติภาพรวม |
| `CustomerList` | `/customers` | รายการลูกค้า |
| `SiteList` | `/sites` | รายการหน่วยงาน |
| `GuardList` | `/guards` | รายการพนักงาน รปภ. |
| `StaffList` | `/staff` | รายการพนักงานภายใน |
| `ShiftList` | `/shifts` | รายการกะงาน |
| `ProductList` | `/products` | รายการสินค้า |
| `ServiceList` | `/services` | รายการบริการ |
| `DailyAdvancePage` | `/daily-advances` | เบิกเงินรายวัน |
| `Scheduler` | `/scheduler` | ตารางนัดหมาย |
| `PayrollReport` | `/payroll` | รายงานเงินเดือน |
| `SettingsPage` | `/settings` | การตั้งค่า |
| `MasterDataPage` | `/master-data` | ข้อมูลหลัก |
| `AuditLogsPage` | `/audit-logs` | ประวัติการแก้ไข |

### Modals

| Component | Description |
|-----------|-------------|
| `CustomerFormModal` | Form เพิ่ม/แก้ไขลูกค้า |
| `SiteFormModal` | Form เพิ่ม/แก้ไขหน่วยงาน |
| `GuardFormModal` | Form เพิ่ม/แก้ไขพนักงาน รปภ. |
| `StaffFormModal` | Form เพิ่ม/แก้ไขพนักงานภายใน |
| `ShiftFormModal` | Form เพิ่ม/แก้ไขกะงาน |
| `ProductFormModal` | Form เพิ่ม/แก้ไขสินค้า |
| `ServiceFormModal` | Form เพิ่ม/แก้ไขบริการ |
| `ExcelImportModal` | Modal import Excel (customers) |
| `GenericExcelImportModal` | Modal import Excel (generic) |
| `ConfirmationModal` | Dialog ยืนยันการลบ |
| `EntityHistoryModal` | ประวัติการแก้ไข entity |

### Common Components

| Component | Description |
|-----------|-------------|
| `LoadingSpinner` | Loading indicator with Shield icon |
| `FullPageLoading` | Full screen loading |
| `PaginationControls` | Pagination controls |
| `Header` | Header bar with user info |
| `Sidebar` | Navigation menu (Google Apps style) |
| `MainContent` | Main content area |

---

## 🔧 Special Features

### 1. Auto ID Generation

**Guards:** `PG-XXXX` (e.g., PG-0001, PG-0002)
**Staff:** `S-XXXX` (e.g., S-0001, S-0002)
**Sites:** `{CustomerCode}.XX` (e.g., PG-0001.01)

### 2. Excel Import/Export

- Download template with correct columns
- Import validates data before saving
- Export selected rows or all
- Audit log tracks imports/exports

### 3. Shift Management

- Create shifts with start/end time
- Assign shifts to sites
- Set worker count per shift
- Calculate total workers needed

### 4. Audit Trail

- Tracks CREATE, UPDATE, DELETE
- Records who, when, what changed
- View history per entity
- Filter by date, user, action

### 5. Permission System

- Role-based access control
- Menu visibility by permissions
- API endpoint protection
- Admin can manage roles

### 6. Premium UI

- Gradient headers & buttons
- Glassmorphism effects
- Animated loading (Shield icon)
- Responsive design
- Dark theme header

---

## 📊 Statistics Endpoints

| Endpoint | Returns |
|----------|---------|
| `/api/dashboard/stats` | Overall statistics |
| `/api/customers/stats` | Customer counts |
| `/api/sites/stats` | Site counts |
| `/api/guards/stats` | Guard counts |
| `/api/staff/stats` | Staff counts |
| `/api/daily-advances/stats` | Advance totals |
