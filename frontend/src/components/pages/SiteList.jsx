import React, { useState } from 'react';
import { initialSites, initialCustomers, initialServices } from '../../data/mockData';
import SiteFormModal from '../modals/SiteFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import { PlusCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';


export default function SiteList() {
    const [sites, setSites] = useState(initialSites);
    const [customers, setCustomers] = useState(initialCustomers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [siteToDelete, setSiteToDelete] = useState(null);

    const handleOpenModal = (site = null) => {
        setSelectedSite(site);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSite(null);
    };

    const handleSaveSite = (siteData) => {
        if (siteData.id) {
            setSites(sites.map(s => s.id === siteData.id ? siteData : s));
        } else {
            const newId = sites.length > 0 ? Math.max(...sites.map(s => s.id)) + 1 : 1;
            setSites([...sites, { ...siteData, id: newId }]);
        }
        handleCloseModal();
    };

    const openDeleteConfirm = (site) => {
        setSiteToDelete(site);
        setIsConfirmOpen(true);
    };

    const handleDelete = () => {
        if (siteToDelete) {
            setSites(sites.filter(s => s.id !== siteToDelete.id));
            setIsConfirmOpen(false);
            setSiteToDelete(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">ข้อมูลหน่วยงาน</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มหน่วยงาน
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                 <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3">ชื่อหน่วยงาน</th>
                            <th className="text-left p-3">ลูกค้า</th>
                            <th className="text-left p-3">วันเริ่มสัญญา</th>
                            <th className="text-left p-3">วันสิ้นสุดสัญญา</th>
                            <th className="text-left p-3">การกระทำ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sites.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50 border-b">
                                <td className="p-3">{s.name}</td>
                                <td className="p-3">{customers.find(c => c.id === s.customerId)?.name}</td>
                                <td className="p-3">{s.startDate}</td>
                                <td className="p-3">{s.endDate}</td>
                                <td className="p-3 flex space-x-2">
                                    <button onClick={() => handleOpenModal(s)} className="text-blue-500 hover:text-blue-700"><Edit className="w-5 h-5" /></button>
                                    <button onClick={() => openDeleteConfirm(s)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <SiteFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                site={selectedSite}
                onSave={handleSaveSite}
                customers={customers}
                initialServices={initialServices}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="ยืนยันการลบหน่วยงาน"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบหน่วยงาน "${siteToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />
        </div>
    );
}