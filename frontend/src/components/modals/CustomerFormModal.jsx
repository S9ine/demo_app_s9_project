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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
                    <h2 className="text-2xl font-bold">{customer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มข้อมูลลูกค้าใหม่'}</h2>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-4">
                        {/* ข้อมูลทั่วไป */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-indigo-700 mb-3 pb-2 border-b border-indigo-200">ข้อมูลทั่วไป</h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="PG-0001"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            ประเภทธุรกิจ <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="businessType"
                                            value={formData.businessType}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        >
                                            <option value="">-- เลือกประเภทธุรกิจ --</option>
                                            {BUSINESS_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        ชื่อลูกค้า <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="บริษัท โพลกาด จำกัด"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
                                    <input
                                        type="text"
                                        name="taxId"
                                        value={formData.taxId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0-0000-00000-00-0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ที่อยู่ */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-blue-700 mb-3 pb-2 border-b border-blue-200">ที่อยู่</h3>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">บ้านเลขที่, หมู่, ซอย, ถนน</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="123 หมู่ 5 ซอย รามคำแหง 24"
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">แขวง/ตำบล</label>
                                        <input
                                            type="text"
                                            name="subDistrict"
                                            value={formData.subDistrict}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="หัวหมาก"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">เขต/อำเภอ</label>
                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="บางกะปิ"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">จังหวัด</label>
                                        <input
                                            type="text"
                                            name="province"
                                            value={formData.province}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="กรุงเทพฯ"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">รหัสไปรษณีย์</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            maxLength="10"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="10240"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ข้อมูลผู้ติดต่อ */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-green-700 mb-3 pb-2 border-b border-green-200">ข้อมูลผู้ติดต่อ</h3>
                            <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อผู้ติดต่อหลัก</label>
                                        <input
                                            type="text"
                                            name="contactPerson"
                                            value={formData.contactPerson}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                            placeholder="คุณสมชาย"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">เบอร์โทร</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                            placeholder="081-234-5678"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">อีเมล</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                            placeholder="contact@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">ผู้ติดต่อรอง (ถ้ามี)</label>
                                    <input
                                        type="text"
                                        name="secondaryContact"
                                        value={formData.secondaryContact}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                        placeholder="คุณสมหญิง, 082-345-6789"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* เงื่อนไขการชำระเงิน */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 rounded-lg p-4">
                            <h3 className="text-sm font-bold text-amber-700 mb-3 pb-2 border-b border-amber-200">เงื่อนไขการชำระเงิน</h3>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">เงื่อนไข</label>
                                <textarea
                                    name="paymentTerms"
                                    value={formData.paymentTerms}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500 resize-none"
                                    placeholder="เช่น: เครดิต 30 วัน, เงินสด, โอนภายใน 7 วัน"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="border-t bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium text-sm transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-md hover:shadow-lg"
                        >
                            บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}