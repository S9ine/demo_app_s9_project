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
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            <span className="font-medium">{trendValue}</span>
                        </div>
                    )}
                </div>
                <div className={`${bgColor} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
        </div>
    );

    const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
        <button
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-5 border border-gray-100 text-left group w-full"
        >
            <div className="flex items-start space-x-4">
                <div className={`${color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
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
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-blue-100">ภาพรวมของระบบจัดการ</p>
                <div className="mt-4 flex items-center space-x-2 text-sm text-blue-100">
                    <Clock className="w-4 h-4" />
                    <span>อัพเดตล่าสุด: {new Date().toLocaleString('th-TH')}</span>
                </div>
            </div>

            {/* Main Stats Grid */}
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

            {/* Secondary Stats */}
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

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">เมนูด่วน</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

            {/* Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">สถานะระบบ</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-medium text-gray-700">ระบบทำงานปกติ</span>
                            </div>
                            <span className="text-sm text-green-600 font-medium">Online</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Users className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-gray-700">ผู้ใช้งานออนไลน์</span>
                            </div>
                            <span className="text-sm text-blue-600 font-medium">1 คน</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">แจ้งเตือน</h3>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-gray-700">เอกสารรออนุมัติ</p>
                                <p className="text-sm text-gray-600 mt-1">มี {stats.advances.pending} เอกสารรออนุมัติ</p>
                            </div>
                        </div>
                        {stats.customers.inactive > 0 && (
                            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-700">ลูกค้าไม่ได้ใช้งาน</p>
                                    <p className="text-sm text-gray-600 mt-1">มี {stats.customers.inactive} รายการ</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}