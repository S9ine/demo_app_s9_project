import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 1. Import axios
import LoginScreen from './pages/LoginScreen';
import Sidebar from './components/core/Sidebar';
import Header from './components/core/Header';
import MainContent from './components/core/MainContent';

// 2. กำหนด URL ของ Backend API ไว้ที่เดียวเพื่อง่ายต่อการจัดการ
const API_URL = 'http://localhost:5000/api';

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 3. เพิ่ม state สำหรับจัดการ loading
    const [activePage, setActivePage] = useState('dashboard');
    const [user, setUser] = useState(null);

    // 4. (Optional but Recommended) ตรวจสอบ token ใน localStorage เมื่อเปิดแอป
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true); // 5. เริ่ม loading

        try {
            // 6. เปลี่ยนมาใช้ axios เพื่อยิง POST request ไปยัง backend
            const response = await axios.post(`${API_URL}/auth/login`, {
                username,
                password,
            });

            const { user: userData, token } = response.data;

            // 7. เก็บข้อมูล user และ token ที่ได้จาก backend
            setUser(userData);
            setIsLoggedIn(true);
            
            // 8. (Recommended) เก็บ token และข้อมูล user ใน localStorage เพื่อให้ล็อกอินค้างไว้ได้
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            setActivePage('dashboard');

        } catch (err) {
            // 9. จัดการ error ที่มาจาก API
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
            }
        } finally {
            setIsLoading(false); // 10. หยุด loading
        }
    };

    const handleLogout = () => {
        // 11. เคลียร์ข้อมูลทั้งหมดเมื่อ Logout
        setUser(null);
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    if (!isLoggedIn) {
        return <LoginScreen {...{ handleLogin, username, setUsername, password, setPassword, error, isLoading }} />;
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar setActivePage={setActivePage} activePage={activePage} userPermissions={user.permissions} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} handleLogout={handleLogout} />
                <MainContent activePage={activePage} user={user} />
            </div>
        </div>
    );
}