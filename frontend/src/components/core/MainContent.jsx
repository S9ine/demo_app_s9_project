import React from 'react';
import Dashboard from '../pages/Dashboard';
import CustomerList from '../pages/CustomerList';
import SiteList from '../pages/SiteList';
import GuardList from '../pages/GuardList';
import ServiceList from '../pages/ServiceList';
import Scheduler from '../pages/Scheduler';
import SettingsPage from '../pages/SettingsPage';
import StaffList from '../pages/StaffList';
import DailyAdvancePage from '../pages/DailyAdvancePage';
import ProductList from '../pages/ProductList';
import SiteServiceRates from '../pages/SiteServiceRates';

//vvvv <-- 1. รับ user prop เข้ามาตรงนี้

export default function MainContent({ activePage, user }) {
    const renderPage = () => {
        switch (activePage) {
            // (แนะนำ) ส่ง user ไปให้หน้าอื่นๆ ด้วย เผื่อต้องใช้ในอนาคต
            case 'dashboard': return <Dashboard user={user} />;
            case 'customer-list': return <CustomerList user={user} />;
            case 'site-list': return <SiteList user={user} />;

            // --- จุดที่แก้ไข ---
            //                                  vvvvvvvvvvv <-- 2. ส่ง user prop ต่อไปให้ DailyAdvancePage
            case 'daily-advance': return <DailyAdvancePage user={user} />;

            case 'guard-list': return <GuardList user={user} />;
            case 'staff-list': return <StaffList user={user} />;
            case 'services': return <ServiceList user={user} />;
            case 'product': return <ProductList user={user} />;
            case 'site-service-rates': return <SiteServiceRates user={user} />;
            case 'scheduler': return <Scheduler user={user} />;
            case 'settings': return <SettingsPage user={user} />;

            default: return <div className="p-6"><h1 className="text-2xl font-semibold">{activePage}</h1><p>เนื้อหาของหน้านี้ยังไม่ถูกสร้าง</p></div>;
        }
    };
    return (
        <main className="flex-1 p-6 overflow-y-auto">
            {renderPage()}
        </main>
    );
}