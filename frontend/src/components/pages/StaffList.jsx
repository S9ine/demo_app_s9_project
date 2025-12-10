// frontend/src/components/pages/StaffList.jsx
import React, { useState, useEffect } from 'react'
import api from '../../config/api';
import StaffFormModal from '../modals/StaffFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';
import { useBanks } from '../../hooks/useBanks';

export default function StaffList() {
    const [staff, setStaff] = useState([]);
    const { banks } = useBanks();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/staff');
            
            setStaff(response.data.map(s => ({
                ...s,
                staffId: s.guardId, // Backend ใช้ฟิลด์ guardId แทน staffId ในบางโมเดล (Reuse logic)
                position: s.position || '',
                department: s.department || '',
                title: 'นาย', // Mock data
                status: s.isActive ? 'Active' : 'Resigned',
                bankName: banks.find(b => b.code === s.bankCode)?.name || s.bankCode || ''
            })));
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (banks.length > 0) {
            fetchStaff();
        }
    }, [banks]);

    const handleOpenModal = (staffMember = null) => {
        setSelectedStaff(staffMember);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStaff(null);
    };

    const handleSaveStaff = async (staffData) => {
        try {
            const payload = {
                guardId: staffData.staffId,
                firstName: staffData.firstName,
                lastName: staffData.lastName,
                idCardNumber: staffData.idCardNumber || null,
                phone: staffData.phone,
                address: staffData.address,
                position: staffData.position || null,
                department: staffData.department || null,
                
                // ข้อมูลวันที่
                startDate: staffData.startDate || null,
                birthDate: staffData.birthDate || null,
                
                // ข้อมูลเงินเดือน
                salary: staffData.salary ? parseFloat(staffData.salary) : null,
                salaryType: staffData.salaryType || null,
                
                // ข้อมูลการรับเงิน
                paymentMethod: staffData.paymentMethod || null,
                bankAccountNo: staffData.bankAccountNo || "",
                bankCode: staffData.bankCode || "",
                
                isActive: staffData.status === 'Active',
            };

            if (staffData.id) {
                await api.put(`/staff/${staffData.id}`, payload);
            } else {
                await api.post('/staff', payload);
            }
            fetchStaff();
            handleCloseModal();
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const openDeleteConfirm = (staffMember) => {
        setStaffToDelete(staffMember);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (staffToDelete) {
            try {
                await api.delete(`/staff/${staffToDelete.id}`);
                fetchStaff();
                setIsConfirmOpen(false);
                setStaffToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    const paginatedStaff = staff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">ข้อมูลพนักงาน ภายใน</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มพนักงาน
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-left p-3 font-semibold">รหัส</th>
                                <th className="text-left p-3 font-semibold">ชื่อ-สกุล</th>
                                <th className="text-left p-3 font-semibold">ตำแหน่ง</th>
                                <th className="text-left p-3 font-semibold">เบอร์โทร</th>
                                <th className="text-left p-3 font-semibold">สถานะ</th>
                                <th className="text-left p-3 font-semibold">การกระทำ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStaff.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50 border-b">
                                    <td className="p-3">{s.staffId}</td>
                                    <td className="p-3">{s.title}{s.firstName} {s.lastName}</td>
                                    <td className="p-3">{s.position}</td>
                                    <td className="p-3">{s.phone}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {s.status === 'Active' ? 'ทำงาน' : 'ลาออก'}
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
                totalItems={staff.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                }}
            />

            <StaffFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveStaff}
                staffMember={selectedStaff}
                banks={banks}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="ยืนยันการลบพนักงาน"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ "${staffToDelete?.firstName} ${staffToDelete?.lastName}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />
        </div>
    );
}