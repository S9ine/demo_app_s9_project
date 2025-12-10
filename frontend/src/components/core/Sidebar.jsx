import React, { useState, useEffect } from 'react';
import { 
    ChevronDown, Home, Users, Briefcase, UserCheck, FileText, Calendar, Settings, X, Menu, Search,
    Building2, MapPin, Shield, UsersRound, Receipt, Package, Wrench, DollarSign,
    ShoppingBag, HeartHandshake, LayoutGrid, Database
} from 'lucide-react';

export default function Sidebar({ setActivePage, activePage, userPermissions, userRole }) {
    const [openMenus, setOpenMenus] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // โหลดหน้าที่บันทึกไว้จาก localStorage เมื่อ refresh
    useEffect(() => {
        const savedPage = localStorage.getItem('activePage');
        if (savedPage && savedPage !== activePage) {
            setActivePage(savedPage);
        }
    }, []);

    const toggleMenu = (menu) => {
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const handleMenuClick = (item) => {
        if (item.subItems) {
            toggleMenu(item.id);
        } else {
            setActivePage(item.id);
            localStorage.setItem('activePage', item.id); // บันทึกลง localStorage
            setIsOpen(false); // ปิด menu หลังคลิก
        }
    };

    const handleSubMenuClick = (subId) => {
        setActivePage(subId);
        localStorage.setItem('activePage', subId); // บันทึกลง localStorage
        setIsOpen(false); // ปิด menu หลังคลิก
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const menuItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'หน้าหลัก', color: 'from-blue-500 to-blue-600' },
        {
            id: 'customers', icon: Building2, label: 'ข้อมูลลูกค้า', color: 'from-purple-500 to-purple-600', subItems: [
                { id: 'customer-list', icon: Building2, label: 'เพิ่มข้อมูลลูกค้า', color: 'from-purple-500 to-purple-600' },
                { id: 'site-list', icon: MapPin, label: 'เพิ่มข้อมูลหน่วยงาน', color: 'from-indigo-500 to-indigo-600' },
            ]
        },
        {
            id: 'employees', icon: UsersRound, label: 'ข้อมูลพนักงาน', color: 'from-green-500 to-green-600', subItems: [
                { id: 'guard-list', icon: Shield, label: 'พนักงานรปภ.', color: 'from-emerald-500 to-emerald-600' },
                { id: 'staff-list', icon: Users, label: 'พนักงานภายใน', color: 'from-teal-500 to-teal-600' },
            ]
        },
        {
            id: 'requests', icon: Receipt, label: 'รายการเบิก', color: 'from-orange-500 to-orange-600', subItems: [
                { id: 'daily-advance', icon: DollarSign, label: 'เบิกรายวัน', color: 'from-amber-500 to-amber-600' },
                { id: 'equipment-request', icon: Wrench, label: 'เบิกอุปกรณ์', color: 'from-orange-500 to-orange-600' },
                { id: 'damage-deposit', icon: ShoppingBag, label: 'เงินประกันความเสียหาย', color: 'from-red-500 to-red-600' },
            ]
        },
        {
            id: 'services', icon: HeartHandshake, label: 'สินค้าและบริการ', color: 'from-pink-500 to-pink-600', subItems: [
                { id: 'services', icon: HeartHandshake, label: 'บริการ', color: 'from-pink-500 to-pink-600' },
                { id: 'product', icon: Package, label: 'สินค้า', color: 'from-rose-500 to-rose-600' },
            ]
        },
        { id: 'social-security', icon: UserCheck, label: 'ประกันสังคม', color: 'from-cyan-500 to-cyan-600' },
        { id: 'scheduler', icon: Calendar, label: 'ตารางงาน', color: 'from-violet-500 to-violet-600' },
        { id: 'master-data', icon: Database, label: 'ข้อมูลหลัก', color: 'from-slate-500 to-slate-600', adminOnly: true },
        { id: 'settings', icon: Settings, label: 'ตั้งค่าผู้ใช้', color: 'from-gray-500 to-gray-600', adminOnly: true },
    ];

    const visibleMenuItems = menuItems.map(item => {
        // Admin sees everything
        if (userRole === 'Admin') {
            return item;
        }

        // ซ่อนเมนูที่เป็น adminOnly สำหรับ role อื่น
        if (item.adminOnly) {
            return null;
        }

        if (!item.subItems) {
            return userPermissions.includes(item.id) ? item : null;
        }

        const visibleSubItems = item.subItems.filter(sub => userPermissions.includes(sub.id));
        if (visibleSubItems.length > 0) {
            return { ...item, subItems: visibleSubItems };
        }
        return null;
    }).filter(Boolean);

    // Filter เมนูตามคำค้นหา
    const filteredMenuItems = visibleMenuItems.filter(item => {
        if (!searchTerm) return true;
        
        const search = searchTerm.toLowerCase();
        const labelMatch = item.label.toLowerCase().includes(search);
        
        if (item.subItems) {
            const subMatch = item.subItems.some(sub => 
                sub.label.toLowerCase().includes(search)
            );
            return labelMatch || subMatch;
        }
        
        return labelMatch;
    }).map(item => {
        // ถ้ามี submenu, เปิดอัตโนมัติเมื่อค้นหา
        if (searchTerm && item.subItems) {
            const hasMatchingSub = item.subItems.some(sub => 
                sub.label.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (hasMatchingSub && !openMenus[item.id]) {
                setTimeout(() => setOpenMenus(prev => ({ ...prev, [item.id]: true })), 0);
            }
        }
        return item;
    });


    return (
        <>
            {/* Google Apps Menu Button - ย้ายมาซ้าย */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-50 p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 group"
                title="แอปของระบบ"
            >
                <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] transition-opacity duration-200"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Menu Modal Card - Google Apps Style ด้านซ้าย */}
            <div
                className={`fixed top-16 left-4 w-[360px] max-h-[600px] bg-white rounded-3xl shadow-2xl z-[101] transition-all duration-300 transform ${
                    isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                }`}
            >
                {/* Header */}
                <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-medium text-gray-700">เมนูระบบ</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Search Box */}
                <div className="px-6 pt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาแอป"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation - Flat Menu Grid (ไม่มี Submenu) */}
                <nav className="p-4 overflow-y-auto custom-scrollbar" style={{ maxHeight: '460px' }}>
                    {filteredMenuItems.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm text-gray-500">ไม่พบแอป</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {filteredMenuItems.map((item) => {
                                const isActive = activePage === item.id || item.subItems?.some(sub => sub.id === activePage);
                                
                                // ไม่ใช้ highlight แล้ว - แค่ return text ปกติ
                                const highlightText = (text) => text;
                                
                                // ใช้สีที่กำหนดไว้ใน menuItems
                                const gradient = item.color || 'from-gray-500 to-gray-600';
                                
                                // ถ้ามี submenu ให้แสดงทุก submenu แทน parent
                                if (item.subItems) {
                                    return item.subItems.map(sub => {
                                        const isSubActive = activePage === sub.id;
                                        if (searchTerm && !sub.label.toLowerCase().includes(searchTerm.toLowerCase())) {
                                            return null;
                                        }
                                        
                                        const SubIcon = sub.icon;
                                        const subGradient = sub.color || 'from-gray-500 to-gray-600';
                                        
                                        return (
                                            <button
                                                key={sub.id}
                                                onClick={() => handleSubMenuClick(sub.id)}
                                                className={`
                                                    group p-3 rounded-xl transition-all
                                                    ${isSubActive 
                                                        ? 'bg-blue-50 ring-2 ring-blue-400 shadow-lg' 
                                                        : 'hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                <div className="flex flex-col items-center space-y-1.5">
                                                    <div className={`
                                                        w-12 h-12 rounded-2xl flex items-center justify-center transition-all
                                                        ${isSubActive 
                                                            ? 'bg-blue-500 shadow-xl scale-110' 
                                                            : `bg-gradient-to-br ${subGradient} group-hover:shadow-lg group-hover:scale-105`
                                                        }
                                                    `}>
                                                        <SubIcon className={`w-6 h-6 ${isSubActive ? 'text-white' : 'text-white'}`} />
                                                    </div>
                                                    <span className={`
                                                        text-[10px] font-medium text-center leading-tight line-clamp-2
                                                        ${isSubActive ? 'text-blue-600 font-bold' : 'text-gray-700'}
                                                    `}>
                                                        {highlightText(sub.label)}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    });
                                }
                                
                                // เมนูเดี่ยว - แสดงตามปกติ
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleMenuClick(item)}
                                        className={`
                                            group p-3 rounded-xl transition-all
                                            ${isActive 
                                                ? 'bg-blue-50 ring-2 ring-blue-400 shadow-lg' 
                                                : 'hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <div className="flex flex-col items-center space-y-1.5">
                                            <div className={`
                                                w-12 h-12 rounded-2xl flex items-center justify-center transition-all
                                                ${isActive 
                                                    ? 'bg-blue-500 shadow-xl scale-110' 
                                                    : `bg-gradient-to-br ${gradient} group-hover:shadow-lg group-hover:scale-105`
                                                }
                                            `}>
                                                {isActive ? (
                                                    <item.icon className="w-6 h-6 text-white" />
                                                ) : (
                                                    <item.icon className="w-6 h-6 text-white" />
                                                )}
                                            </div>
                                            <span className={`
                                                text-[10px] font-medium text-center leading-tight line-clamp-2
                                                ${isActive ? 'text-blue-600 font-bold' : 'text-gray-700'}
                                            `}>
                                                {highlightText(item.label)}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </nav>
            </div>
        </>
    );
}