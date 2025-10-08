// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { initialUsers, initialRoles } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState(''); // Add error state

    const login = (username, password) => {
        setError(''); // Clear previous errors
        const foundUser = initialUsers.find(
            u => u.username === username && u.password === password
        );

        if (foundUser) {
            const userRole = initialRoles.find(r => r.id === foundUser.roleId);
            const userData = {
                id: foundUser.id,
                username: foundUser.username,
                firstName: foundUser.firstName,
                lastName: foundUser.lastName,
                role: userRole ? userRole.name : 'Unknown',
                permissions: userRole ? userRole.permissions : []
            };
            setUser(userData);
            setIsLoggedIn(true);
            return true;
        }
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        return false;
    };

    const logout = () => {
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