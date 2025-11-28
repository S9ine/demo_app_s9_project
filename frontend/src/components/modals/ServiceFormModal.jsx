import React, { useState, useEffect } from 'react';

export default function ServiceFormModal({ isOpen, onClose, onSave, service }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const initialData = {
            id: service?.id || null,
            name: service?.name || '',
            status: service?.isActive === false ? 'Inactive' : 'Active'
        };
        setFormData(initialData);
    }, [service, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{service ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริการ/ตำแหน่ง</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="Active">ใช้งาน</option>
                                <option value="Inactive">ไม่ใช้งาน</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            บันทึก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

