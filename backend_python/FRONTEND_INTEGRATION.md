# การเชื่อม Frontend กับ Python Backend

คู่มือการเปลี่ยน Frontend ให้เรียก Python + FastAPI Backend แทน Node.js

---

## 🔧 ขั้นตอนการเชื่อม Frontend

### 1. สร้างไฟล์ Environment Variables

สร้างไฟล์ `.env` ใน folder frontend:

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000/api
```

### 2. สร้าง API Configuration File (แนะนำ)

สร้างไฟล์ `frontend/src/config/api.js`:

```javascript
import axios from 'axios';

// API Base URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
```

### 3. แก้ไข AuthContext

แก้ไข `frontend/src/context/AuthContext.jsx`:

```javascript
import React, { createContext, useState, useContext } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState('');

    const login = async (username, password) => {
        setError('');
        try {
            // เรียก API
            const response = await api.post('/auth/login', {
                username,
                password
            });

            const { access_token, user: userData } = response.data;

            // เก็บ token
            localStorage.setItem('token', access_token);

            // Set user data
            setUser(userData);
            setIsLoggedIn(true);
            return true;

        } catch (err) {
            setError(err.response?.data?.detail || 'เกิดข้อผิดพลาด');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, login, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
```

### 4. ตัวอย่างการใช้งาน API ในหน้าต่างๆ

#### **SettingsPage - User Management:**

```javascript
import { useState, useEffect } from 'react';
import api from '../../config/api';

function SettingsPage() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);

    // ดึงข้อมูล users
    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/users/roles/all');
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleCreateUser = async (userData) => {
        try {
            await api.post('/users', userData);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Error creating user:', error);
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาด');
        }
    };

    const handleUpdateUser = async (userId, userData) => {
        try {
            await api.put(`/users/${userId}`, userData);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await api.delete(`/users/${userId}`);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // ... rest of component
}
```

#### **CustomerList - Master Data:**

```javascript
import { useState, useEffect } from 'react';
import api from '../../config/api';

function CustomerList() {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleCreate = async (customerData) => {
        try {
            await api.post('/customers', customerData);
            fetchCustomers();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // ... rest of component
}
```

#### **DailyAdvancePage - Financial:**

```javascript
import { useState, useEffect } from 'react';
import api from '../../config/api';

function DailyAdvancePage() {
    const [documents, setDocuments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    useEffect(() => {
        fetchDocuments();
    }, [selectedDate]);

    const fetchDocuments = async () => {
        try {
            const response = await api.get('/daily-advances', {
                params: {
                    date: selectedDate,
                    type: 'advance' // or 'cash'
                }
            });
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const handleCreateDocument = async (docData) => {
        try {
            await api.post('/daily-advances', docData);
            fetchDocuments();
        } catch (error) {
            console.error('Error creating document:', error);
        }
    };

    const handleUpdateStatus = async (docId, status) => {
        try {
            await api.put(`/daily-advances/${docId}/status?status=${status}`);
            fetchDocuments();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // ... rest of component
}
```

---

## ✅ Checklist การเชื่อม

- [ ] สร้างไฟล์ `.env` ใน frontend
- [ ] สร้าง `frontend/src/config/api.js`
- [ ] แก้ไข `AuthContext.jsx` ให้เรียก API
- [ ] แก้ไข `SettingsPage.jsx` (User Management)
- [ ] แก้ไข `CustomerList.jsx`
- [ ] แก้ไข `SiteList.jsx`
- [ ] แก้ไข `GuardList.jsx`
- [ ] แก้ไข `StaffList.jsx`
- [ ] แก้ไข `DailyAdvancePage.jsx`
- [ ] ทดสอบทุกหน้า

---

## 🧪 การทดสอบหลังเชื่อม

### 1. Run ทั้ง Backend และ Frontend

```bash
# Terminal 1 - Backend
cd backend_python
start.bat

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. ทดสอบ Login

- เปิด `http://localhost:5173`
- Login ด้วย: `admin` / `admin123`
- ตรวจสอบว่า token ถูกเก็บใน localStorage

### 3. ทดสอบทุกหน้า

- Settings → User Management
- Settings → Dropdown (Banks)
- Customers, Sites, Guards, Staff
- Daily Advance

### 4. ตรวจสอบ Network Tab

- เปิด DevTools → Network
- ดูว่า API calls ไปที่ `http://localhost:8000/api`
- Headers มี `Authorization: Bearer <token>`

---

## 🐛 Troubleshooting

### ปัญหา CORS Error

**อาการ:** `Access to XMLHttpRequest ... has been blocked by CORS policy`

**แก้ไข:** ตรวจสอบว่า Backend เปิด CORS สำหรับ `http://localhost:5173`

### ปัญหา 401 Unauthorized

**อาการ:** API ตอบกลับ 401

**แก้ไข:**
1. ตรวจสอบว่า token ถูกส่งไปใน Header
2. ตรวจสอบว่า token ยังไม่หมดอายุ (24 ชม.)
3. Login ใหม่

### ปัญหา Cannot GET /api/...

**อาการ:** API endpoint ไม่พบ

**แก้ไข:**
1. ตรวจสอบว่า Backend กำลังรันอยู่
2. ตรวจสอบ URL ว่าถูกต้อง
3. ดู console ของ Backend

---

## 📝 หมายเหตุ

- Frontend ไม่ต้องเปลี่ยน UI เลย - เพียงแค่เปลี่ยน API calls
- ทุก response format จาก Python backend จะเหมือนกับ Node.js
- Decimal calculations ทำที่ Backend แล้ว - Frontend ไม่ต้องกังวล
- Token expiration: 24 ชั่วโมง (ตั้งค่าได้ที่ `.env`)

---

## 🎉 เสร็จสมบูรณ์

หลังจากทำตามขั้นตอนข้างต้น Frontend จะใช้งาน Python + FastAPI Backend ได้! 🚀
