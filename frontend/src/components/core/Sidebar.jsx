import React, { useState } from 'react';
import { ChevronDown, Home, Users, Briefcase, UserCheck, FileText, Calendar, ShoppingBag, Settings } from 'lucide-react';

export default function Sidebar({ setActivePage, activePage, userPermissions }) {
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (menu) => {
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const menuItems = [
        { id: 'dashboard', icon: Home, label: 'หน้าหลัก' },
        {
            id: 'customers', icon: Users, label: 'ข้อมูลลูกค้า', subItems: [
                { id: 'customer-list', label: 'เพิ่มข้อมูลลูกค้า' },
                { id: 'site-list', label: 'เพิ่มข้อมูลหน่วยงาน' },
            ]
        },
        {
            id: 'employees', icon: Briefcase, label: 'ข้อมูลพนักงาน', subItems: [
                { id: 'guard-list', label: 'พนักงานรปภ.' },
                { id: 'staff-list', label: 'พนักงานภายใน' },
            ]
        },
        {
            id: 'requests', icon: FileText, label: 'รายการเบิก', subItems: [
                { id: 'daily-advance', label: 'เบิกรายวัน' },
                { id: 'equipment-request', label: 'เบิกอุปกรณ์' },
                { id: 'damage-deposit', label: 'เงินประกันความเสียหาย' },
            ]
        },
        { id: 'social-security', icon: UserCheck, label: 'ประกันสังคม' },
        { id: 'scheduler', icon: Calendar, label: 'ตารางงาน' },
        { id: 'services', icon: ShoppingBag, label: 'สินค้าและบริการ' },
        { id: 'settings', icon: Settings, label: 'ตั้งค่าระบบ' },
    ];

    const visibleMenuItems = menuItems.map(item => {
        if (!item.subItems) {
            return userPermissions.includes(item.id) ? item : null;
        }

        const visibleSubItems = item.subItems.filter(sub => userPermissions.includes(sub.id));
        if (visibleSubItems.length > 0) {
            return { ...item, subItems: visibleSubItems };
        }
        return null;
    }).filter(Boolean);


    return (
        <aside className="w-64 bg-white shadow-md flex flex-col">
            <div className="h-16 flex items-center justify-center border-b">
                <h1 className="text-xl font-bold text-indigo-600">บริหารงานพรีเมี่ยม</h1>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {visibleMenuItems.map(item => (
                    <div key={item.id}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (item.subItems) {
                                    toggleMenu(item.id);
                                } else {
                                    setActivePage(item.id);
                                }
                            }}
                            className={`flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 ${activePage === item.id && !item.subItems ? 'bg-indigo-100 text-indigo-600' : ''}`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="ml-3">{item.label}</span>
                            {item.subItems && <ChevronDown className={`w-5 h-5 ml-auto transform transition-transform duration-200 ${openMenus[item.id] ? 'rotate-180' : ''}`} />}
                        </a>
                        {item.subItems && openMenus[item.id] && (
                            <div className="pl-8 mt-2 space-y-2">
                                {item.subItems.map(sub => (
                                    <a
                                        key={sub.id}
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setActivePage(sub.id); }}
                                        className={`block p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 ${activePage === sub.id ? 'bg-indigo-100 text-indigo-600' : ''}`}
                                    >
                                        {sub.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
}