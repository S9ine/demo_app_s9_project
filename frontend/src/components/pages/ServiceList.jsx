import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import ConfirmationModal from '../modals/ConfirmationModal';
import ServiceFormModal from '../modals/ServiceFormModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';

export default function ServiceList() {
    const [services, setServices] = useState([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/services');
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleAdd = async () => {
        console.log('handleAdd clicked');
        try {
            // Generate next service code
            const maxCode = services.reduce((max, s) => {
                const match = s.serviceCode.match(/SVC-(\d+)/);
                if (match) {
                    const num = parseInt(match[1]);
                    return num > max ? num : max;
                }
                return max;
            }, 0);
            const nextCode = `SVC-${String(maxCode + 1).padStart(3, '0')}`;
            
            setSelectedService({ serviceCode: nextCode });
            setIsModalOpen(true);
            console.log('Generated service code:', nextCode);
        } catch (error) {
            console.error('Error generating code:', error);
            setSelectedService(null);
            setIsModalOpen(true);
        }
    };

    const handleEdit = (service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleSave = async (serviceData) => {
        try {
            const payload = {
                serviceCode: serviceData.serviceCode,
                serviceName: serviceData.serviceName,
                remarks: serviceData.remarks || '',
                hiringRate: 0,
                diligenceBonus: 0,
                sevenDayBonus: 0,
                pointBonus: 0,
                isActive: serviceData.status === 'Active'
            };

            if (serviceData.id) {
                await api.put(`/services/${serviceData.id}`, payload);
            } else {
                await api.post('/services', payload);
            }
            fetchServices();
            setIsModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const openDeleteConfirm = (service) => {
        setServiceToDelete(service);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (serviceToDelete) {
            try {
                await api.delete(`/services/${serviceToDelete.id}`);
                fetchServices();
                setIsConfirmOpen(false);
                setServiceToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    const paginatedServices = services.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">ข้อมูลบริการ</h1>
                <button onClick={handleAdd} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มบริการ
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-3">รหัสบริการ</th>
                                <th className="text-left p-3">ชื่อบริการ/ตำแหน่ง</th>
                                <th className="text-left p-3">หมายเหตุ</th>
                                <th className="text-center p-3">สถานะ</th>
                                <th className="text-left p-3">การกระทำ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedServices.map((s, index) => (
                                <tr key={s.id} className="hover:bg-gray-50 border-b">
                                    <td className="p-3 font-mono text-sm">{s.serviceCode}</td>
                                    <td className="p-3">{s.serviceName}</td>
                                    <td className="p-3 text-gray-600 text-sm">{s.remarks || '-'}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {s.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                        </span>
                                    </td>
                                    <td className="p-3 flex space-x-2">
                                        <button onClick={() => handleEdit(s)} className="text-blue-500 hover:text-blue-700"><Edit className="w-5 h-5" /></button>
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
                totalItems={services.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                }}
            />

            <ServiceFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                service={selectedService}
            />

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="ยืนยันการลบบริการ"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบบริการ "${serviceToDelete?.serviceName}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />
        </div>
    );
}