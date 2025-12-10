import React, { useState, useEffect } from 'react';

export default function ServiceFormModal({ isOpen, onClose, onSave, service }) {
    const [formData, setFormData] = useState({
        id: null,
        serviceCode: '',
        serviceName: '',
        remarks: '',
        status: 'Active'
    });

    useEffect(() => {
        const initialData = {
            id: service?.id || null,
            serviceCode: service?.serviceCode || '',
            serviceName: service?.serviceName || '',
            remarks: service?.remarks || '',
            status: service?.isActive === false ? 'Inactive' : 'Active'
        };
        setFormData(initialData);
        console.log('ServiceFormModal initialized:', { service, initialData, isOpen });
    }, [service, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? (parseFloat(value) || 0) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
        console.log('handleChange:', name, val);
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสบริการ *</label>
                            <input
                                type="text"
                                name="serviceCode"
                                value={formData.serviceCode}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100"
                                required
                                disabled
                                placeholder="สร้างอัตโนมัติ"
                            />
                            <p className="text-xs text-gray-500 mt-1">รหัสสร้างอัตโนมัติ</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริการ/ตำแหน่ง *</label>
                            <input
                                type="text"
                                name="serviceName"
                                value={formData.serviceName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                placeholder="เช่น พนักงานรักษาความปลอดภัย"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                rows="3"
                                placeholder="เพิ่มหมายเหตุ (ถ้ามี)"
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

