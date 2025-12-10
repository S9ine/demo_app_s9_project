import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './pages/LoginScreen';
import Sidebar from './components/core/Sidebar';
import Header from './components/core/Header';
import MainContent from './components/core/MainContent';

// Main App Component that uses the context
function AppContent() {
    const { user, isLoggedIn, login, logout, error } = useAuth();
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [activePage, setActivePage] = React.useState('dashboard');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // เรียกใช้ login แบบ async และรอจนเสร็จ
        await login(username, password);
        setIsLoading(false);
    };

    const handleLogout = () => {
        logout();
        setUsername('');
        setPassword('');
    };

    if (!isLoggedIn) {
        return <LoginScreen {...{ handleLogin, username, setUsername, password, setPassword, error, isLoading }} />;
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
            <Sidebar setActivePage={setActivePage} activePage={activePage} userPermissions={user.permissions} userRole={user.role} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} handleLogout={handleLogout} />
                <MainContent activePage={activePage} setActivePage={setActivePage} user={user} />
            </div>
        </div>
    );
}

// Wrap the app with AuthProvider
export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}