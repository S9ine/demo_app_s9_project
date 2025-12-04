import React, { useState, useEffect } from 'react';

const BUSINESS_TYPES = [
    'กิจการเจ้าของคนเดียว',
    'ห้างหุ้นส่วน',
    'บริษัทจำกัด',
    'รัฐวิสาหกิจ'
];

export default function CustomerFormModal({ isOpen, onClose, customer, onSave }) {
    const [formData, setFormData] = useState({
        code: '',
        businessType: '',
        name: '',
        taxId: '',
        address: '',
        subDistrict: '',
        district: '',
        province: '',
        postalCode: '',
        contactPerson: '',
        phone: '',
        email: '',
        secondaryContact: '',
        paymentTerms: ''
    });

    useEffect(() => {
        if (customer) {
            // กรณีแก้ไข: โหลดข้อมูลจาก Backend
            setFormData({
                code: customer.code || '',
                businessType: customer.businessType || '',
                name: customer.name || '',
                taxId: customer.taxId || '',
                address: customer.address || '',
                subDistrict: customer.subDistrict || '',
                district: customer.district || '',
                province: customer.province || '',
                postalCode: customer.postalCode || '',
                contactPerson: customer.contactPerson || '',
                phone: customer.phone || '',
                email: customer.email || '',
                secondaryContact: customer.secondaryContact || '',
                paymentTerms: customer.paymentTerms || ''
            });
        } else {
            // กรณีเพิ่มใหม่: เคลียร์ฟอร์ม
            setFormData({
                code: '',
                businessType: '',
                name: '',
                taxId: '',
                address: '',
                subDistrict: '',
                district: '',
                province: '',
                postalCode: '',
                contactPerson: '',
                phone: '',
                email: '',
                secondaryContact: '',
                paymentTerms: ''
            });
        }
    }, [customer, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate รหัสลูกค้าไม่ให้มีช่องว่าง
        if (formData.code && formData.code.includes(' ')) {
            alert('รหัสลูกค้าต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)');
            return;
        }

        const dataToSave = {
            id: customer?.id,
            code: formData.code,
            businessType: formData.businessType,
            name: formData.name,
            taxId: formData.taxId,
            address: formData.address,
            subDistrict: formData.subDistrict,
            district: formData.district,
            province: formData.province,
            postalCode: formData.postalCode,
            contactPerson: formData.contactPerson,
            phone: formData.phone,
            email: formData.email,
            secondaryContact: formData.secondaryContact,
            paymentTerms: formData.paymentTerms,
            isActive: true
        };

        onSave(dataToSave);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6">{customer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มข้อมูลลูกค้าใหม่'}</h2>

                    <div className="space-y-6">
                        {/* ข้อมูลทั่วไป */}
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2">ข้อมูลทั่วไป</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">
                                        รหัสลูกค้า <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        onBlur={(e) => {
                                            const value = e.target.value;
                                            if (value && value.includes(' ')) {
                                                alert('รหัสลูกค้าต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)');
                                                e.target.focus();
                                            } else if (value && !/^[\w\-]+$/.test(value)) {
                                                alert('รหัสลูกค้าต้องเป็นตัวอักษร ตัวเลข - หรือ _ เท่านั้น');
                                                e.target.focus();
                                            }
                                        }}
                                        pattern="[\w\-]+"
                                        title="รหัสลูกค้าต้องไม่มีช่องว่าง (ใช้ - หรือ _ แทน)"
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">ตัวอย่าง: CUST-001 (ห้ามมีช่องว่าง)</p>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">
                                        ประเภทธุรกิจ <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="businessType"
                                        value={formData.businessType}
                                        onChange={handleChange}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="">-- เลือกประเภทธุรกิจ --</option>
                                        {BUSINESS_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
                                    <input
                                        type="text"
                                        name="taxId"
                                        value={formData.taxId}
                                        onChange={handleChange}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                    ชื่อลูกค้า <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* ที่อยู่ */}
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2">ที่อยู่</h3>
                            <div className="mb-4">
                                <label className="block text-sm text-gray-700 mb-1">บ้านเลขที่, หมู่, ซอย, ถนน</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">แขวง/ตำบล</label>
                                    <input
                                        type="text"
                                        name="subDistrict"
                                        value={formData.subDistrict}
                                        onChange={handleChange}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">เขต/อำเภอ</label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">จังหวัด</label>
                                    <input
                                        type="text"
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">รหัสไปรษณีย์</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        maxLength="10"
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ข้อมูลผู้ติดต่อ */}
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2">ข้อมูลผู้ติดต่อ</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">ชื่อผู้ติดต่อหลัก</label>
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">เบอร์โทร</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">อีเมล</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">ผู้ติดต่อรอง (ถ้ามี)</label>
                                <input
                                    type="text"
                                    name="secondaryContact"
                                    value={formData.secondaryContact}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="ชื่อ, เบอร์โทร, อีเมล"
                                />
                            </div>
                        </div>

                        {/* เงื่อนไขการชำระเงิน */}
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2">เงื่อนไขการชำระเงิน</h3>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">เงื่อนไข</label>
                                <textarea
                                    name="paymentTerms"
                                    value={formData.paymentTerms}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="เช่น: เครดิต 30 วัน, เงินสด, โอนภายใน 7 วัน"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}