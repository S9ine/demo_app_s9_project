import React, { useState } from 'react';
import { initialCustomers } from '../../data/mockData';
import CustomerFormModal from '../modals/CustomerFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function CustomerList() {
    const [customers, setCustomers] = useState(initialCustomers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);

    const handleOpenModal = (customer = null) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleSaveCustomer = (customerData) => {
        if (customerData.id) {
            setCustomers(customers.map(c => c.id === customerData.id ? customerData : c));
        } else {
            const newCustomer = { ...customerData, id: Date.now() }; // Use timestamp for unique ID
            setCustomers([...customers, newCustomer]);
        }
        handleCloseModal();
    };

    const openDeleteConfirm = (customer) => {
        setCustomerToDelete(customer);
        setIsConfirmOpen(true);
    };

    const handleDelete = () => {
        if (customerToDelete) {
            setCustomers(customers.filter(c => c.id !== customerToDelete.id));
            setIsConfirmOpen(false);
            setCustomerToDelete(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">ข้อมูลลูกค้า</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มลูกค้า
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3">รหัส</th>
                            <th className="text-left p-3">ชื่อลูกค้า</th>
                            <th className="text-left p-3">ข้อมูลติดต่อ</th>
                            <th className="text-left p-3">การกระทำ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 border-b">
                                <td className="p-3">{c.code}</td>
                                <td className="p-3">{c.name}</td>
                                <td className="p-3">{c.contact.primary.name} ({c.contact.primary.phone})</td>
                                <td className="p-3 flex space-x-2">
                                    <button onClick={() => handleOpenModal(c)} className="text-blue-500 hover:text-blue-700"><Edit className="w-5 h-5" /></button>
                                    <button onClick={() => openDeleteConfirm(c)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
        </div>
    );
}