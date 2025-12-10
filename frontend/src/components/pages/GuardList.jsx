// frontend/src/components/pages/GuardList.jsx
import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import GuardFormModal from '../modals/GuardFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';
import { useBanks } from '../../hooks/useBanks';

export default function GuardList() {
    const [guards, setGuards] = useState([]);
    const { banks } = useBanks();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [guardToDelete, setGuardToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGuard, setSelectedGuard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchGuards = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/guards');

            // แปลงข้อมูลจาก Backend ให้ตรงกับที่ Modal ต้องการ
            setGuards(response.data.map(g => ({
                ...g,
                status: g.isActive ? 'Active' : 'Inactive',
                paymentInfo: {
                    accountNumber: g.bankAccountNo,
                    bankName: banks.find(b => b.code === g.bankCode)?.name || g.bankCode || '',
                    accountName: '',
                }
            })));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (banks.length > 0) {
            fetchGuards();
        }
    }, [banks]);

    const handleOpenModal = (guard = null) => {
        setSelectedGuard(guard);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGuard(null);
    };

    const handleSaveGuard = async (guardData) => {
        try {
            const payload = {
                guardId: guardData.guardId,
                firstName: guardData.firstName,
                lastName: guardData.lastName,
                phone: guardData.phone,
                address: guardData.address,
                bankAccountNo: guardData.paymentInfo?.accountNumber || "",
                bankCode: banks.find(b => b.name === guardData.paymentInfo?.bankName)?.code || guardData.paymentInfo?.bankCode || "",
                isActive: guardData.status === 'Active'
            };

            if (guardData.id) {
                await api.put(`/guards/${guardData.id}`, payload);
            } else {
                await api.post('/guards', payload);
            }
            fetchGuards();
            handleCloseModal();
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const openDeleteConfirm = (guard) => {
        setGuardToDelete(guard);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (guardToDelete) {
            try {
                await api.delete(`/guards/${guardToDelete.id}`);
                fetchGuards();
                setIsConfirmOpen(false);
                setGuardToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    const paginatedGuards = guards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">ข้อมูลพนักงาน รปภ.</h1>
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
                                <th className="text-left p-3 font-semibold">เบอร์โทร</th>
                                <th className="text-left p-3 font-semibold">สถานะ</th>
                                <th className="text-left p-3 font-semibold">การกระทำ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedGuards.map(g => (
                                <tr key={g.id} className="hover:bg-gray-50 border-b">
                                    <td className="p-3">{g.guardId}</td>
                                    <td className="p-3">{g.firstName} {g.lastName}</td>
                                    <td className="p-3">{g.phone}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${g.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {g.isActive ? 'ทำงาน' : 'ลาออก'}
                                        </span>
                                    </td>
                                    <td className="p-3 flex space-x-2">
                                        <button onClick={() => handleOpenModal(g)} className="text-blue-500 hover:text-blue-700"><Edit className="w-5 h-5" /></button>
                                        <button onClick={() => openDeleteConfirm(g)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
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
                totalItems={guards.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                }}
            />

            <GuardFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveGuard}
                guard={selectedGuard}
                banks={banks}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="ยืนยันการลบพนักงาน"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ "${guardToDelete?.firstName} ${guardToDelete?.lastName}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />
        </div>
    );
}