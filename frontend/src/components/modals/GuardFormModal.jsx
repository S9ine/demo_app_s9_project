import React, { useState, useEffect } from 'react';

export default function GuardFormModal({ isOpen, onClose, onSave, guard, banks = [] }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const initialData = {
            id: guard?.id || null,
            guardId: guard?.guardId || '',
            title: guard?.title || 'นาย',
            firstName: guard?.firstName || '',
            lastName: guard?.lastName || '',
            phone: guard?.phone || '',
            email: guard?.email || '',
            nationalId: guard?.nationalId || '',
            address: guard?.address || '',
            startDate: guard?.startDate || '',
            status: guard?.status || 'Active',
            paymentInfo: guard?.paymentInfo ? { ...guard.paymentInfo } : { bankName: '', accountName: '', accountNumber: '' },
        };

        if (!initialData.paymentInfo.bankName && banks.length > 0) {
            initialData.paymentInfo.bankName = banks[0].name;
        }

        setFormData(initialData);
    }, [guard, isOpen, banks]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            paymentInfo: {
                ...prev.paymentInfo,
                [name]: value
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6">{guard ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">รหัสพนักงาน</label>
                            <input type="text" name="guardId" value={formData.guardId || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">คำนำหน้า</label>
                            <select name="title" value={formData.title || 'นาย'} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option>นาย</option>
                                <option>นาง</option>
                                <option>นางสาว</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
                            <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
                            <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                            <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">เลขบัตรประชาชน</label>
                            <input type="text" name="nationalId" value={formData.nationalId || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">ที่อยู่</label>
                            <textarea name="address" value={formData.address || ''} onChange={handleChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">วันที่เริ่มงาน</label>
                            <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">สถานะ</label>
                            <select name="status" value={formData.status || 'Active'} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="Active">ทำงาน</option>
                                <option value="Inactive">ลาออก</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 mt-4 pt-4 border-t">
                            <h3 className="font-semibold text-lg mb-4">ข้อมูลการรับเงิน</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ธนาคาร</label>
                                    <select
                                        name="bankName"
                                        value={formData.paymentInfo?.bankName || ''}
                                        onChange={handlePaymentChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                                    >
                                        <option value="" disabled>-- กรุณาเลือกธนาคาร --</option>
                                        {banks.map(bank => (
                                            <option key={bank.id} value={bank.name}>
                                                {bank.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">เลขที่บัญชี</label>
                                    <input type="text" name="accountNumber" value={formData.paymentInfo?.accountNumber || ''} onChange={handlePaymentChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">ชื่อบัญชี</label>
                                    <input type="text" name="accountName" value={formData.paymentInfo?.accountName || ''} onChange={handlePaymentChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">บันทึกข้อมูล</button>
                    </div>
                </form>
            </div>
        </div>
    );
}