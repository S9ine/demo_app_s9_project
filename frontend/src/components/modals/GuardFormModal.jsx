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
            birthDate: guard?.birthDate || '',
            nationality: guard?.nationality || 'ไทย',
            religion: guard?.religion || 'พุทธ',
            addressIdCard: guard?.addressIdCard || '',
            addressCurrent: guard?.addressCurrent || '',
            phone: guard?.phone || '',
            education: guard?.education || '',
            licenseNumber: guard?.licenseNumber || '',
            licenseExpiry: guard?.licenseExpiry || '',
            startDate: guard?.startDate || '',
            bankAccountName: guard?.bankAccountName || '',
            bankAccountNo: guard?.bankAccountNo || '',
            bankCode: guard?.bankCode || '',
            bankName: banks.find(b => b.code === guard?.bankCode)?.name || (banks.length > 0 ? banks[0].name : ''),
            idCardNumber: guard?.idCardNumber || '',
            maritalStatus: guard?.maritalStatus || 'โสด',
            spouseName: guard?.spouseName || '',
            emergencyContactName: guard?.emergencyContactName || '',
            emergencyContactPhone: guard?.emergencyContactPhone || '',
            emergencyContactRelation: guard?.emergencyContactRelation || '',
            status: guard?.status || 'Active',
        };

        setFormData(initialData);
    }, [guard, isOpen, banks]);

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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4">
                    <h2 className="text-2xl font-bold">
                        {guard ? 'แก้ไขข้อมูลพนักงาน รปภ.' : 'เพิ่มพนักงาน รปภ. ใหม่'}
                    </h2>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-4">
                        {/* รหัสพนักงาน (แสดงเฉพาะตอนแก้ไข) */}
                        {guard && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <label className="block text-xs font-medium text-purple-700 mb-1">รหัสพนักงาน</label>
                                <div className="text-lg font-bold text-purple-600">{formData.guardId}</div>
                            </div>
                        )}
                        
                        {/* ข้อมูลส่วนตัว */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-purple-700 mb-3 pb-2 border-b border-purple-200">ข้อมูลส่วนตัว</h3>
                            <div className="space-y-2">
                                <div className="grid grid-cols-4 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">คำนำหน้า <span className="text-red-500">*</span></label>
                                        <select name="title" value={formData.title || ''} onChange={handleChange} required className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500">
                                            <option value="นาย">นาย</option>
                                            <option value="นาง">นาง</option>
                                            <option value="นางสาว">นางสาว</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อ <span className="text-red-500">*</span></label>
                                        <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} required className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500" placeholder="สมชาย" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">สกุล <span className="text-red-500">*</span></label>
                                        <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} required className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500" placeholder="ใจดี" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">วันเกิด</label>
                                        <input type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">สัญชาติ</label>
                                        <input type="text" name="nationality" value={formData.nationality || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500" placeholder="ไทย" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">ศาสนา</label>
                                        <input type="text" name="religion" value={formData.religion || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500" placeholder="พุทธ" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">เลขบัตรประชาชน (13 หลัก)</label>
                                        <input type="text" name="idCardNumber" value={formData.idCardNumber || ''} onChange={handleChange} maxLength="13" className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-purple-500" placeholder="1234567890123" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ที่อยู่ */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-blue-700 mb-3 pb-2 border-b border-blue-200">ที่อยู่</h3>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">ที่อยู่ตามบัตรประชาชน</label>
                                    <textarea name="addressIdCard" value={formData.addressIdCard || ''} onChange={handleChange} rows="2" className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 resize-none" placeholder="บ้านเลขที่ หมู่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">ที่อยู่ปัจจุบัน</label>
                                    <textarea name="addressCurrent" value={formData.addressCurrent || ''} onChange={handleChange} rows="2" className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 resize-none" placeholder="ถ้าแตกต่างจากบัตรประชาชน"></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">เบอร์โทรมือถือ</label>
                                    <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500" placeholder="081-234-5678" />
                                </div>
                            </div>
                        </div>

                        {/* การศึกษาและการทำงาน */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-green-700 mb-3 pb-2 border-b border-green-200">การศึกษาและการทำงาน</h3>
                            <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">วุฒิการศึกษา</label>
                                        <input type="text" name="education" value={formData.education || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500" placeholder="ม.6, ปวส." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">เลขใบอนุญาต รปภ.</label>
                                        <input type="text" name="licenseNumber" value={formData.licenseNumber || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">วันหมดอายุใบอนุญาต</label>
                                        <input type="date" name="licenseExpiry" value={formData.licenseExpiry || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">วันเริ่มงาน</label>
                                        <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">สถานะ</label>
                                        <select name="status" value={formData.status || 'Active'} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500">
                                            <option value="Active">ทำงาน</option>
                                            <option value="Inactive">ลาออก</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ข้อมูลธนาคาร */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-indigo-700 mb-3 pb-2 border-b border-indigo-200">ข้อมูลธนาคาร</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อบัญชี</label>
                                    <input type="text" name="bankAccountName" value={formData.bankAccountName || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500" placeholder="นายสมชาย ใจดี" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">เลขที่บัญชี</label>
                                    <input type="text" name="bankAccountNo" value={formData.bankAccountNo || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500" placeholder="1234567890" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">ธนาคาร</label>
                                    <select name="bankName" value={formData.bankName || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500">
                                        <option value="">-- เลือกธนาคาร --</option>
                                        {banks.map(bank => (
                                            <option key={bank.id} value={bank.name}>{bank.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* สถานภาพครอบครัว */}
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-pink-700 mb-3 pb-2 border-b border-pink-200">สถานภาพครอบครัว</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">สถานภาพสมรส</label>
                                    <select name="maritalStatus" value={formData.maritalStatus || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-pink-500">
                                        <option value="โสด">โสด</option>
                                        <option value="สมรส">สมรส</option>
                                        <option value="หย่าร้าง">หย่าร้าง</option>
                                        <option value="หม้าย">หม้าย</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อคู่สมรส (ถ้ามี)</label>
                                    <input type="text" name="spouseName" value={formData.spouseName || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-pink-500" />
                                </div>
                            </div>
                        </div>

                        {/* ผู้ติดต่อฉุกเฉิน */}
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-red-700 mb-3 pb-2 border-b border-red-200">ผู้ติดต่อฉุกเฉิน</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อผู้ติดต่อ</label>
                                    <input type="text" name="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500" placeholder="นางสมหญิง" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">เบอร์โทร</label>
                                    <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500" placeholder="082-345-6789" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">ความสัมพันธ์</label>
                                    <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500" placeholder="แม่, พี่สาว" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="border-t bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium text-sm transition-colors">
                            ยกเลิก
                        </button>
                        <button type="submit" className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium text-sm transition-colors shadow-md hover:shadow-lg">
                            บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
