// frontend/src/components/pages/MasterDataPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import ConfirmationModal from '../modals/ConfirmationModal';
import { Building2, PlusCircle, Edit, Trash2, Shield } from 'lucide-react';

// Form Modal สำหรับ 'เพิ่ม' หรือ 'แก้ไข' ข้อมูลธนาคาร
function BankFormModal({ isOpen, onClose, onSave, bank }) {
    const [formData, setFormData] = useState({ code: '', name: '', shortNameEN: '' });

    useEffect(() => {
        setFormData(bank ? { code: bank.code, name: bank.name, shortNameEN: bank.shortNameEN } : { code: '', name: '', shortNameEN: '' });
    }, [bank, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ id: bank?.id, ...formData });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-bold mb-4">{bank ? 'แก้ไขข้อมูลธนาคาร' : 'เพิ่มธนาคารใหม่'}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Code ธนาคาร</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                                disabled={!!bank}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ชื่อธนาคาร</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">อักษรย่อ (EN)</label>
                            <input type="text" name="shortNameEN" value={formData.shortNameEN} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">ยกเลิก</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function MasterDataPage({ user }) {
    // State declarations must come before any conditional returns
    const [banks, setBanks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [bankToDelete, setBankToDelete] = useState(null);

    const fetchBanks = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/banks');
            setBanks(response.data);
        } catch (error) {
            console.error('Error fetching banks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    // ตรวจสอบว่าเป็น Admin หรือไม่ (after hooks)
    if (!user || user.role !== 'Admin') {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Shield className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
                <p className="text-gray-600">หน้านี้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น</p>
            </div>
        );
    }

    const handleOpenModal = (bank = null) => { 
        setEditingBank(bank); 
        setIsModalOpen(true); 
    };
    
    const handleCloseModal = () => { 
        setEditingBank(null); 
        setIsModalOpen(false); 
    };

    const handleSaveBank = async (bankData) => {
        try {
            if (bankData.id) {
                await api.put(`/banks/${bankData.id}`, bankData);
            } else {
                await api.post('/banks', bankData);
            }
            fetchBanks();
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleOpenDeleteConfirm = (bank) => { 
        setBankToDelete(bank); 
        setIsConfirmOpen(true); 
    };

    const handleDeleteBank = async () => {
        if (bankToDelete) {
            try {
                await api.delete(`/banks/${bankToDelete.id}`);
                fetchBanks();
                setIsConfirmOpen(false);
                setBankToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">จัดการข้อมูลหลัก (Master Data)</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                {/* ส่วนจัดการข้อมูลธนาคาร */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <div className="flex items-center">
                            <Building2 className="w-6 h-6 text-indigo-600 mr-2" />
                            <h2 className="text-xl font-semibold">จัดการข้อมูลธนาคาร</h2>
                        </div>
                        <button 
                            onClick={() => handleOpenModal()} 
                            className="flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-600 text-sm rounded-md hover:bg-indigo-200 transition-colors"
                        >
                            <PlusCircle className="w-4 h-4 mr-1" /> 
                            เพิ่มธนาคาร
                        </button>
                    </div>
                    
                    {/* ตารางแสดงรายชื่อธนาคาร */}
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-white">
                                <tr className="border-b">
                                    <th className="text-left p-2 text-sm font-medium text-gray-500">Code</th>
                                    <th className="text-left p-2 text-sm font-medium text-gray-500">ชื่อธนาคาร</th>
                                    <th className="text-left p-2 text-sm font-medium text-gray-500">อักษรย่อ EN</th>
                                    <th className="text-left p-2 text-sm font-medium text-gray-500">การกระทำ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {banks.map(bank => (
                                    <tr key={bank.id} className="hover:bg-gray-50 border-b transition-colors">
                                        <td className="p-2 font-medium">{bank.code}</td>
                                        <td className="p-2">{bank.name}</td>
                                        <td className="p-2">{bank.shortNameEN}</td>
                                        <td className="p-2 flex space-x-2">
                                            <button 
                                                onClick={() => handleOpenModal(bank)} 
                                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                                title="แก้ไข"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenDeleteConfirm(bank)} 
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                title="ลบ"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {banks.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p>ไม่มีข้อมูลธนาคาร</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* ส่วน Placeholder สำหรับฟีเจอร์ในอนาคต */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                    <Building2 className="w-16 h-16 text-gray-300 mb-3" />
                    <h2 className="text-xl font-semibold text-gray-400">จัดการคำนำหน้าชื่อ</h2>
                    <p className="text-gray-400 mt-2">เร็วๆ นี้</p>
                </div>
            </div>

            <BankFormModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveBank} 
                bank={editingBank} 
            />
            
            <ConfirmationModal 
                isOpen={isConfirmOpen} 
                onClose={() => setIsConfirmOpen(false)} 
                onConfirm={handleDeleteBank} 
                title="ยืนยันการลบธนาคาร" 
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล "${bankToDelete?.name}"?`} 
            />
        </div>
    );
}
