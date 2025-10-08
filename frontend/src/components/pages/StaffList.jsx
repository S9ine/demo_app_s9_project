import React, { useState } from 'react'
import { initialStaff } from '../../data/mockData';
import StaffFormModal from '../modals/StaffFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function StaffList() {
    const [staff, setStaff] = useState(initialStaff);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const handleOpenModal = (staffMember = null) => {
        setSelectedStaff(staffMember);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStaff(null);
    };

    const handleSaveStaff = (staffData) => {
        if (staffData.id) {
            setStaff(staff.map(s => s.id === staffData.id ? staffData : s));
        } else {
            const newId = staff.length > 0 ? Math.max(...staff.map(s => s.id)) + 1 : 201;
            setStaff([...staff, { ...staffData, id: newId }]);
        }
        handleCloseModal();
    };

    const openDeleteConfirm = (staffMember) => {
        setStaffToDelete(staffMember);
        setIsConfirmOpen(true);
    };

    const handleDelete = () => {
        if (staffToDelete) {
            setStaff(staff.filter(s => s.id !== staffToDelete.id));
            setIsConfirmOpen(false);
            setStaffToDelete(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">ข้อมูลพนักงาน ภายใน</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มพนักงาน
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3">รหัส</th>
                            <th className="text-left p-3">ชื่อ-สกุล</th>
                            <th className="text-left p-3">ตำแหน่ง</th>
                            <th className="text-left p-3">เบอร์โทร</th>
                            <th className="text-left p-3">อีเมล</th>
                            <th className="text-left p-3">สถานะ</th>
                            <th className="text-left p-3">การกระทำ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50 border-b">
                                <td className="p-3">{s.staffId}</td>
                                <td className="p-3">{s.title}{s.name}</td>
                                <td className="p-3">{s.position}</td>
                                <td className="p-3">{s.phone}</td>
                                <td className="p-3">{s.email}</td>
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
            </div>
            <StaffFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveStaff}
                staffMember={selectedStaff}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="ยืนยันการลบพนักงาน"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ "${staffToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />
        </div>
    );
}