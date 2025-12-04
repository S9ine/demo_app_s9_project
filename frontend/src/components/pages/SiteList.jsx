// frontend/src/components/pages/SiteList.jsx
import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import SiteFormModal from '../modals/SiteFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';
// เรายังคงใช้ initialServices จาก mockData สำหรับ dropdown ตำแหน่งงาน เพราะยังไม่มี API Master Data สำหรับ Service
import { initialServices } from '../../data/mockData';

export default function SiteList() {
    const [sites, setSites] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [siteToDelete, setSiteToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [sitesRes, customersRes] = await Promise.all([
                api.get('/sites'),
                api.get('/customers')
            ]);
            setSites(sitesRes.data);
            setCustomers(customersRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (site = null) => {
        setSelectedSite(site);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSite(null);
    };

    const handleSaveSite = async (siteData) => {
        try {
            // แปลงโครงสร้างข้อมูลให้ตรงกับ Backend
            const payload = {
                siteCode: siteData.siteCode,
                name: siteData.name,
                customerId: String(siteData.customerId),
                customerCode: siteData.customerCode,
                customerName: siteData.customerName,
                contractStartDate: siteData.contractStartDate || null,
                contractEndDate: siteData.contractEndDate || null,
                address: siteData.address || "",
                subDistrict: siteData.subDistrict || "",
                district: siteData.district || "",
                province: siteData.province || "",
                postalCode: siteData.postalCode || "",
                contactPerson: siteData.contactPerson || "",
                phone: siteData.phone || "",
                employmentDetails: siteData.employmentDetails || [],
                contractedServices: [],  // เก็บไว้ backward compatible
                isActive: siteData.isActive !== undefined ? siteData.isActive : true
            };

            if (siteData.id) {
                await api.put(`/sites/${siteData.id}`, payload);
            } else {
                await api.post('/sites', payload);
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const openDeleteConfirm = (site) => {
        setSiteToDelete(site);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (siteToDelete) {
            try {
                await api.delete(`/sites/${siteToDelete.id}`);
                fetchData();
                setIsConfirmOpen(false);
                setSiteToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    const paginatedSites = sites.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">ข้อมูลหน่วยงาน</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มหน่วยงาน
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-100">
                                <th className="text-left p-3">รหัสหน่วยงาน</th>
                                <th className="text-left p-3">ชื่อหน่วยงาน</th>
                                <th className="text-left p-3">ลูกค้า</th>
                                <th className="text-left p-3">ที่อยู่</th>
                                <th className="text-left p-3">สถานะ</th>
                                <th className="text-left p-3">การกระทำ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSites.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50 border-b">
                                    <td className="p-3 font-mono text-sm">{s.siteCode || '-'}</td>
                                    <td className="p-3 font-medium">{s.name}</td>
                                    <td className="p-3">
                                        <div className="text-sm">
                                            <div className="font-medium">{s.customerName || customers.find(c => String(c.id) === String(s.customerId))?.name || "-"}</div>
                                            <div className="text-gray-500 text-xs">{s.customerCode || ''}</div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-sm">
                                        {s.district && s.province ? `${s.district}, ${s.province}` : (s.address ? s.address.substring(0, 30) + '...' : '-')}
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {s.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                        </span>
                                    </td>
                                    <td className="p-3 flex space-x-2">
                                        <button onClick={() => handleOpenModal(s)} className="text-blue-500 hover:text-blue-700"><Edit className="w-5 h-5" /></button>
                                        <button onClick={() => openDeleteConfirm(s)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <PaginationControls
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={sites.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                }}
            />

            <SiteFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                site={selectedSite}
                onSave={handleSaveSite}
                customers={customers}
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