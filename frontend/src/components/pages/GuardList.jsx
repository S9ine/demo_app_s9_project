import React, { useState } from 'react';
import { initialGuards,initialBanks } from '../../data/mockData';
import GuardFormModal from '../modals/GuardFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function GuardList() {
    const [guards, setGuards] = useState(initialGuards);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [guardToDelete, setGuardToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGuard, setSelectedGuard] = useState(null);

    const handleOpenModal = (guard = null) => {
        setSelectedGuard(guard);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGuard(null);
    };

    const handleSaveGuard = (guardData) => {
        if (guardData.id) {
            setGuards(guards.map(g => g.id === guardData.id ? guardData : g));
        } else {
            setGuards([...guards, { ...guardData, id: Date.now() }]);
        }
        handleCloseModal();
    };

    const openDeleteConfirm = (guard) => {
        setGuardToDelete(guard);
        setIsConfirmOpen(true);
    };

    const handleDelete = () => {
        if (guardToDelete) {
            setGuards(guards.filter(g => g.id !== guardToDelete.id));
            setIsConfirmOpen(false);
            setGuardToDelete(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">ข้อมูลพนักงาน รปภ.</h1>
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
                            <th className="text-left p-3">เบอร์โทร</th>
                            <th className="text-left p-3">วันที่เริ่มงาน</th>
                            <th className="text-left p-3">สถานะ</th>
                            <th className="text-left p-3">การกระทำ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {guards.map(g => (
                            <tr key={g.id} className="hover:bg-gray-50 border-b">
                                <td className="p-3">{g.guardId}</td>
                                <td className="p-3">{g.title}{g.name}</td>
                                <td className="p-3">{g.phone}</td>
                                <td className="p-3">{g.startDate}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${g.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {g.status === 'Active' ? 'ทำงาน' : 'ลาออก'}
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
            </div>
            <GuardFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveGuard}
                guard={selectedGuard}
                banks={initialBanks}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="ยืนยันการลบพนักงาน"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ "${guardToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />
        </div>
    );
}