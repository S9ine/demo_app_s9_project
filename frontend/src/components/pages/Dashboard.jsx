import React, { useState, useEffect } from 'react';
import { 
    Users, Building2, Shield, Calendar, TrendingUp, TrendingDown,
    DollarSign, Package, AlertCircle, CheckCircle, Clock, ArrowUpRight
} from 'lucide-react';
import axios from 'axios';

export default function Dashboard({ setActivePage }) {
    const [stats, setStats] = useState({
        customers: { total: 0, active: 0, inactive: 0 },
        sites: { total: 0, active: 0 },
        guards: { total: 0, active: 0 },
        staff: { total: 0, active: 0 },
        advances: { today: 0, thisMonth: 0, pending: 0 },
        services: { total: 0 },
        products: { total: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch all data in parallel
            const [customers, sites, guards, staff, services, products] = await Promise.all([
                axios.get('http://localhost:8000/api/customers', config),
                axios.get('http://localhost:8000/api/sites', config),
                axios.get('http://localhost:8000/api/guards', config),
                axios.get('http://localhost:8000/api/staff', config),
                axios.get('http://localhost:8000/api/services', config),
                axios.get('http://localhost:8000/api/products', config)
            ]);

            setStats({
                customers: {
                    total: customers.data.length,
                    active: customers.data.filter(c => c.isActive).length,
                    inactive: customers.data.filter(c => !c.isActive).length
                },
                sites: {
                    total: sites.data.length,
                    active: sites.data.filter(s => s.isActive).length
                },
                guards: {
                    total: guards.data.length,
                    active: guards.data.filter(g => g.isActive).length
                },
                staff: {
                    total: staff.data.length,
                    active: staff.data.filter(s => s.isActive).length
                },
                services: {
                    total: services.data.length
                },
                products: {
                    total: products.data.length
                },
                advances: {
                    today: 0,
                    thisMonth: 0,
                    pending: 0
                }
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, subtitle, icon: Icon, color, bgColor, trend, trendValue }) => (
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`${bgColor} p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-7 h-7 ${color}`} />
                    </div>
                    {trend && (
                        <div className={`flex items-center text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
                    <h3 className="text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{value}</h3>
                    {subtitle && (
                        <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );

    const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
        <button
            onClick={onClick}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 text-left relative overflow-hidden"
        >
            {/* Animated gradient background */}
            <div className={`absolute inset-0 ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            <div className="relative z-10 flex items-center space-x-4">
                <div className={`${color} p-4 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
            </div>
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Header with enhanced gradient */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-2xl p-10 text-white overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-3 tracking-tight">Dashboard</h1>
                            <p className="text-blue-100 text-lg">ภาพรวมของระบบจัดการ</p>
                        </div>
                        <div className="hidden lg:flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm">อัพเดต: {new Date().toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid with better spacing */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                    <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                    สถิติหลัก
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="ลูกค้าทั้งหมด"
                    value={stats.customers.total}
                    subtitle={`ใช้งาน ${stats.customers.active} | ไม่ใช้งาน ${stats.customers.inactive}`}
                    icon={Building2}
                    color="text-purple-600"
                    bgColor="bg-purple-100"
                />
                <StatCard
                    title="หน่วยงาน"
                    value={stats.sites.total}
                    subtitle={`ใช้งาน ${stats.sites.active} แห่ง`}
                    icon={Building2}
                    color="text-indigo-600"
                    bgColor="bg-indigo-100"
                />
                <StatCard
                    title="พนักงานรปภ."
                    value={stats.guards.total}
                    subtitle={`ปฏิบัติงาน ${stats.guards.active} คน`}
                    icon={Shield}
                    color="text-green-600"
                    bgColor="bg-green-100"
                />
                <StatCard
                    title="พนักงานภายใน"
                    value={stats.staff.total}
                    subtitle={`ปฏิบัติงาน ${stats.staff.active} คน`}
                    icon={Users}
                    color="text-teal-600"
                    bgColor="bg-teal-100"
                />
            </div>
            </div>

            {/* Secondary Stats with section header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                    <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
                    บริการและสินค้า
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="บริการทั้งหมด"
                    value={stats.services.total}
                    subtitle="รายการบริการที่มี"
                    icon={Package}
                    color="text-pink-600"
                    bgColor="bg-pink-100"
                />
                <StatCard
                    title="สินค้าทั้งหมด"
                    value={stats.products.total}
                    subtitle="รายการสินค้าในสต็อก"
                    icon={Package}
                    color="text-orange-600"
                    bgColor="bg-orange-100"
                />
                <StatCard
                    title="รายการเบิกวันนี้"
                    value={stats.advances.today}
                    subtitle={`รออนุมัติ ${stats.advances.pending} รายการ`}
                    icon={DollarSign}
                    color="text-amber-600"
                    bgColor="bg-amber-100"
                />
            </div>
            </div>

            {/* Quick Actions with enhanced styling */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                    <div className="w-1 h-8 bg-purple-600 rounded-full mr-3"></div>
                    เมนูด่วน
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <QuickActionCard
                        title="เพิ่มลูกค้า"
                        description="เพิ่มข้อมูลลูกค้าใหม่"
                        icon={Building2}
                        color="bg-purple-500"
                        onClick={() => setActivePage('customer-list')}
                    />
                    <QuickActionCard
                        title="เพิ่มพนักงาน"
                        description="เพิ่มพนักงานรปภ. หรือภายใน"
                        icon={Users}
                        color="bg-green-500"
                        onClick={() => setActivePage('guard-list')}
                    />
                    <QuickActionCard
                        title="สร้างเอกสารเบิก"
                        description="สร้างเอกสารเบิกรายวัน"
                        icon={DollarSign}
                        color="bg-orange-500"
                        onClick={() => setActivePage('daily-advance')}
                    />
                    <QuickActionCard
                        title="จัดตารางงาน"
                        description="จัดการตารางการทำงาน"
                        icon={Calendar}
                        color="bg-violet-500"
                        onClick={() => setActivePage('scheduler')}
                    />
                    <QuickActionCard
                        title="จัดการบริการ"
                        description="จัดการบริการและสินค้า"
                        icon={Package}
                        color="bg-blue-500"
                        onClick={() => setActivePage('services')}
                    />
                    <QuickActionCard
                        title="ตั้งค่าระบบ"
                        description="จัดการข้อมูลผู้ใช้และสิทธิ์"
                        icon={Users}
                        color="bg-gray-500"
                        onClick={() => setActivePage('settings')}
                    />
                </div>
            </div>

            {/* Status Summary with enhanced design */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                    <div className="w-1 h-8 bg-orange-600 rounded-full mr-3"></div>
                    สถานะและการแจ้งเตือน
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-7 border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                        สถานะระบบ
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                <span className="font-semibold text-gray-700">ระบบทำงานปกติ</span>
                            </div>
                            <span className="text-sm text-green-600 font-bold">Online</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                            <div className="flex items-center space-x-3">
                                <Users className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-gray-700">ผู้ใช้งานออนไลน์</span>
                            </div>
                            <span className="text-sm text-blue-600 font-bold">1 คน</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-7 border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
                        <AlertCircle className="w-6 h-6 text-yellow-600 mr-2" />
                        แจ้งเตือน
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold text-gray-700">เอกสารรออนุมัติ</p>
                                <p className="text-sm text-gray-600 mt-1">มี {stats.advances.pending} เอกสารรออนุมัติ</p>
                            </div>
                        </div>
                        {stats.customers.inactive > 0 && (
                            <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                                <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-700">ลูกค้าไม่ได้ใช้งาน</p>
                                    <p className="text-sm text-gray-600 mt-1">มี {stats.customers.inactive} รายการ</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}