import React, { useState } from 'react';
import { initialServices } from '../../data/mockData';
import ConfirmationModal from '../modals/ConfirmationModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';

export default function ServiceList() {
    const [services, setServices] = useState(initialServices);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Note: Add/Edit functionality is not fully implemented in the original code.
    // This component only shows the list and delete confirmation.

    const openDeleteConfirm = (service) => {
        setServiceToDelete(service);
        setIsConfirmOpen(true);
    };

    const handleDelete = () => {
        if (serviceToDelete) {
            setServices(services.filter(s => s.id !== serviceToDelete.id));
            setIsConfirmOpen(false);
            setServiceToDelete(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">สินค้าและบริการ</h1>
                <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มบริการ
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3">#</th>
                            <th className="text-left p-3">ชื่อบริการ/ตำแหน่ง</th>
                            <th className="text-left p-3">การกระทำ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(s => (
                            <tr key={s.id} className="hover:bg-gray-50 border-b">
                                <td className="p-3">{s.id}</td>
                                <td className="p-3">{s.name}</td>
                                <td className="p-3 flex space-x-2">
                                    <button className="text-blue-500 hover:text-blue-700"><Edit className="w-5 h-5" /></button>
                                    <button onClick={() => openDeleteConfirm(s)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="ยืนยันการลบบริการ"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบบริการ "${serviceToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />
        </div>
    );
}