import React from 'react';
import { LogOut } from 'lucide-react';

export default function Header({ user, handleLogout }) {
    // เพิ่มการตรวจสอบเผื่อ user ยังไม่มีข้อมูล จะได้ไม่ error
    if (!user) {
        return null;
    }

    return (
        <header className="h-16 bg-white border-b flex items-center justify-end px-6 flex-shrink-0">
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    {/* เปลี่ยนจาก user.username เป็นชื่อ-นามสกุล */}
                    <p className="font-semibold text-gray-800">{`${user.firstName} ${user.lastName}`}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold">
                    <LogOut className="w-4 h-4 mr-2" />
                    ออกจากระบบ
                </button>
            </div>
        </header>
    );
}