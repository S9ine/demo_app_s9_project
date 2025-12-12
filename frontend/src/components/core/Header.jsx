import React from 'react';
import { LogOut } from 'lucide-react';

export default function Header({ user, handleLogout }) {
    // เพิ่มการตรวจสอบเผื่อ user ยังไม่มีข้อมูล จะได้ไม่ error
    if (!user) {
        return null;
    }

    return (
        <header className="h-16 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-lg flex items-center justify-end px-6 flex-shrink-0">
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    {/* เปลี่ยนจาก user.username เป็นชื่อ-นามสกุล */}
                    <p className="font-semibold text-white drop-shadow-md">{`${user.firstName} ${user.lastName}`}</p>
                    <p className="text-xs text-blue-200 capitalize">{user.role}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl">
                    <LogOut className="w-4 h-4 mr-2" />
                    ออกจากระบบ
                </button>
            </div>
        </header>
    );
}