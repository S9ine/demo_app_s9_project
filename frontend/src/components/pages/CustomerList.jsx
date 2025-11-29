// frontend/src/components/pages/CustomerList.jsx
import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import CustomerFormModal from '../modals/CustomerFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import ExcelImportModal from '../modals/ExcelImportModal';
import { PlusCircle, Edit, Trash2, Upload } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Bulk Delete States
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/customers');
            // แปลงข้อมูลจาก API ให้เข้ากับโครงสร้างที่ Frontend ใช้แสดงผล
            setCustomers(response.data.map(c => ({
                ...c,
                // ใช้ code จาก Backend โดยตรง (เช่น TEST001) ไม่ต้องสร้างรหัสจำลอง
                contact: { primary: { name: c.contactPerson, phone: c.phone, email: c.email } }
            })));
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleOpenModal = (customer = null) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleSaveCustomer = async (customerData) => {
        try {
            // เตรียมข้อมูลให้ตรงกับ Schema ของ Backend
            const payload = {
                code: customerData.code,
                name: customerData.name,
                contactPerson: customerData.contact?.primary?.name || '',
                phone: customerData.contact?.primary?.phone || '',
                email: customerData.contact?.primary?.email || '',
                address: typeof customerData.address === 'object'
                    ? `${customerData.address.street || ''} ${customerData.address.subdistrict || ''} ${customerData.address.district || ''} ${customerData.address.province || ''} ${customerData.address.zipcode || ''}`.trim()
                    : customerData.address,
                taxId: customerData.taxId,
                mapLink: customerData.mapLink,
                contact: customerData.contact,
                billing: customerData.billing,
                isActive: customerData.isActive !== undefined ? customerData.isActive : true
            };

            if (customerData.id) {
                await api.put(`/customers/${customerData.id}`, payload);
            } else {
                await api.post('/customers', payload);
            }
            fetchCustomers();
            handleCloseModal();
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const openDeleteConfirm = (customer) => {
        setCustomerToDelete(customer);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (customerToDelete) {
            try {
                await api.delete(`/customers/${customerToDelete.id}`);
                fetchCustomers();
                setIsConfirmOpen(false);
                setCustomerToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(customers.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = async () => {
        try {
            await api.post('/customers/bulk-delete', selectedIds);
            fetchCustomers();
            setSelectedIds([]);
            setIsBulkDeleteConfirmOpen(false);
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    };

    const paginatedCustomers = customers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">ข้อมูลลูกค้า</h1>
                <div className="flex space-x-2">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => setIsBulkDeleteConfirmOpen(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <Trash2 className="w-5 h-5 mr-2" />
                            ลบที่เลือก ({selectedIds.length})
                        </button>
                    )}
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <Upload className="w-5 h-5 mr-2" />
                        Import Excel
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        เพิ่มลูกค้า
                    </button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={customers.length > 0 && selectedIds.length === customers.length}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </th>
                                <th className="text-left p-3">รหัส</th>
                                <th className="text-left p-3">ชื่อลูกค้า</th>
                                <th className="text-left p-3">ข้อมูลติดต่อ</th>
                                <th className="text-left p-3">สถานะ</th>
                                <th className="text-left p-3">การกระทำ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCustomers.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50 border-b">
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(c.id)}
                                            onChange={() => handleSelectOne(c.id)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </td>
                                    <td className="p-3">{c.code}</td>
                                    <td className="p-3">{c.name}</td>
                                    <td className="p-3">{c.contactPerson} ({c.phone})</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {c.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                        </span>
                                    </td>
                                    <td className="p-3 flex space-x-2">
                                        <button onClick={() => handleOpenModal(c)} className="text-blue-500 hover:text-blue-700"><Edit className="w-5 h-5" /></button>
                                        <button onClick={() => openDeleteConfirm(c)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
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
                totalItems={customers.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                }}
            />

            <CustomerFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                customer={selectedCustomer}
                onSave={handleSaveCustomer}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="ยืนยันการลบลูกค้า"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้า "${customerToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />
            <ConfirmationModal
                isOpen={isBulkDeleteConfirmOpen}
                onClose={() => setIsBulkDeleteConfirmOpen(false)}
                onConfirm={handleBulkDelete}
                title="ยืนยันการลบหมู่"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้าจำนวน ${selectedIds.length} รายการ? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />

            <ExcelImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    setIsImportModalOpen(false);
                    fetchCustomers();
                }}
            />
        </div>
    );
}