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
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6 text-purple-600 border-b-2 border-purple-200 pb-3">
                        {guard ? '✏️ แก้ไขข้อมูลพนักงาน รปภ.' : '➕ เพิ่มพนักงาน รปภ. ใหม่'}
                    </h2>
                    
                    {/* รหัสพนักงาน (แสดงเฉพาะตอนแก้ไข) */}
                    {guard && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสพนักงาน</label>
                            <div className="text-xl font-bold text-purple-600">{formData.guardId}</div>
                            <p className="text-xs text-gray-500 mt-1">* รหัสพนักงานถูกสร้างอัตโนมัติ ไม่สามารถแก้ไขได้</p>
                        </div>
                    )}
                    
                    {/* ข้อมูลส่วนตัว */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700 bg-purple-50 p-2 rounded">👤 ข้อมูลส่วนตัว</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า <span className="text-red-500">*</span></label>
                                <select name="title" value={formData.title || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                                    <option value="นาย">นาย</option>
                                    <option value="นาง">นาง</option>
                                    <option value="นางสาว">นางสาว</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ <span className="text-red-500">*</span></label>
                                <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">สกุล <span className="text-red-500">*</span></label>
                                <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">วันเดือนปีเกิด</label>
                                <input type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">สัญชาติ</label>
                                <input type="text" name="nationality" value={formData.nationality || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ศาสนา</label>
                                <input type="text" name="religion" value={formData.religion || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่บัตรประชาชน (13 หลัก)</label>
                                <input type="text" name="idCardNumber" value={formData.idCardNumber || ''} onChange={handleChange} maxLength="13" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" placeholder="1234567890123" />
                            </div>
                        </div>
                    </div>

                    {/* ที่อยู่ */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700 bg-blue-50 p-2 rounded">🏠 ที่อยู่</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ตามบัตรประชาชน</label>
                                <textarea name="addressIdCard" value={formData.addressIdCard || ''} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" placeholder="บ้านเลขที่ หมู่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ปัจจุบันที่ติดต่อได้</label>
                                <textarea name="addressCurrent" value={formData.addressCurrent || ''} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" placeholder="ที่อยู่สำหรับติดต่อ (ถ้าแตกต่างจากบัตรประชาชน)"></textarea>
                            </div>
                            <div className="md:w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์มือถือ</label>
                                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" placeholder="081-234-5678" />
                            </div>
                        </div>
                    </div>

                    {/* การศึกษาและใบอนุญาต */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700 bg-green-50 p-2 rounded">🎓 การศึกษาและใบอนุญาต</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">วุฒิการศึกษาสูงสุด</label>
                                <input type="text" name="education" value={formData.education || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" placeholder="ม.6, ปวส., ปริญญาตรี" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่บัตร/ใบอนุญาต รปภ.</label>
                                <input type="text" name="licenseNumber" value={formData.licenseNumber || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">วันหมดอายุใบอนุญาต</label>
                                <input type="date" name="licenseExpiry" value={formData.licenseExpiry || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" />
                            </div>
                        </div>
                    </div>

                    {/* การทำงาน */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700 bg-yellow-50 p-2 rounded">💼 การทำงาน</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มปฏิบัติงาน</label>
                                <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                                <select name="status" value={formData.status || 'Active'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                                    <option value="Active">ทำงาน</option>
                                    <option value="Inactive">ลาออก</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ข้อมูลธนาคาร */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700 bg-indigo-50 p-2 rounded">🏦 ข้อมูลธนาคาร</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบัญชีธนาคาร</label>
                                <input type="text" name="bankAccountName" value={formData.bankAccountName || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" placeholder="ชื่อ-สกุล ตามบัญชีธนาคาร" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่บัญชี</label>
                                <input type="text" name="bankAccountNo" value={formData.bankAccountNo || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" placeholder="1234567890" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อธนาคาร</label>
                                <select name="bankName" value={formData.bankName || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                                    <option value="">-- เลือกธนาคาร --</option>
                                    {banks.map(bank => (
                                        <option key={bank.id} value={bank.name}>{bank.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* สถานภาพครอบครัว */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700 bg-pink-50 p-2 rounded">👨‍👩‍👧‍👦 สถานภาพครอบครัว</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">สถานภาพสมรส</label>
                                <select name="maritalStatus" value={formData.maritalStatus || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                                    <option value="โสด">โสด</option>
                                    <option value="สมรส">สมรส</option>
                                    <option value="หย่าร้าง">หย่าร้าง</option>
                                    <option value="หม้าย">หม้าย</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุลคู่สมรส (ถ้ามี)</label>
                                <input type="text" name="spouseName" value={formData.spouseName || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" />
                            </div>
                        </div>
                    </div>

                    {/* ผู้ติดต่อฉุกเฉิน */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700 bg-red-50 p-2 rounded">🚨 ผู้ติดต่อฉุกเฉิน</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบุคคลที่ติดต่อได้ในกรณีฉุกเฉิน</label>
                                <input type="text" name="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์บุคคลฉุกเฉิน</label>
                                <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ความสัมพันธ์กับบุคคลฉุกเฉิน</label>
                                <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" placeholder="พ่อ, แม่, พี่, น้อง, คู่สมรส" />
                            </div>
                        </div>
                    </div>

                    {/* ปุ่ม */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition">
                            ยกเลิก
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium transition shadow-md">
                            💾 บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
