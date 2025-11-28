// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is already logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Verify token by fetching current user
            fetchCurrentUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await api.get('/auth/me');
            const userData = response.data;

            setUser({
                id: userData.id,
                username: userData.username,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
                permissions: userData.permissions || []
            });
            setIsLoggedIn(true);
        } catch (err) {
            // Token is invalid
            localStorage.removeItem('token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username, password) => {
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', {
                username,
                password
            });

            const { access_token, user: userData } = response.data;

            // Save token to localStorage
            localStorage.setItem('token', access_token);

            // Set user data
            setUser({
                id: userData.id,
                username: userData.username,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
                permissions: userData.permissions || []
            });
            setIsLoggedIn(true);
            setIsLoading(false);
            return true;

        } catch (err) {
            setError(err.response?.data?.detail || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            setIsLoading(false);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsLoggedIn(false);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">กำลังโหลด...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, login, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};