import React, { useState, useEffect } from 'react';

export default function CustomerFormModal({ isOpen, onClose, customer, onSave }) {
    // State สำหรับเก็บข้อมูลฟอร์ม ตามโครงสร้างในรูปภาพ
    const [formData, setFormData] = useState({
        code: '',
        taxId: '',
        name: '',
        address: { street: '', subdistrict: '', district: '', province: '', zipcode: '' },
        mapLink: '',
        contact: {
            primary: { name: '', phone: '', email: '' },
            secondary: { name: '' }
        },
        billing: {
            useSameAddress: true,
            address: { street: '', subdistrict: '', district: '', province: '', zipcode: '' },
            paymentTerms: ''
        }
    });

    useEffect(() => {
        if (customer) {
            // กรณีแก้ไข: แปลงข้อมูลจาก Backend กลับมาใส่ฟอร์ม
            setFormData({
                code: customer.code || '',
                taxId: customer.taxId || '',
                name: customer.name || '',
                address: {
                    street: typeof customer.address === 'string' ? customer.address : '',
                    subdistrict: '', district: '', province: '', zipcode: ''
                },
                mapLink: customer.mapLink || '',
                contact: {
                    primary: {
                        name: customer.contact?.primary?.name || customer.contactPerson || '',
                        phone: customer.contact?.primary?.phone || customer.phone || '',
                        email: customer.contact?.primary?.email || customer.email || ''
                    },
                    secondary: {
                        name: customer.contact?.secondary?.name || ''
                    }
                },
                billing: {
                    useSameAddress: true,
                    address: { street: '', subdistrict: '', district: '', province: '', zipcode: '' },
                    paymentTerms: ''
                }
            });
        } else {
            // กรณีเพิ่มใหม่: เคลียร์ค่าเป็นค่าว่าง
            setFormData({
                code: '',
                taxId: '',
                name: '',
                address: { street: '', subdistrict: '', district: '', province: '', zipcode: '' },
                mapLink: '',
                contact: {
                    primary: { name: '', phone: '', email: '' },
                    secondary: { name: '' }
                },
                billing: {
                    useSameAddress: true,
                    address: { street: '', subdistrict: '', district: '', province: '', zipcode: '' },
                    paymentTerms: ''
                }
            });
        }
    }, [customer, isOpen]);

    if (!isOpen) return null;

    // ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
    const handleChange = (e, section, subsection = null) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const newData = { ...prev };

            if (section === 'address') {
                newData.address = { ...newData.address, [name]: val };
                if (newData.billing.useSameAddress) {
                    newData.billing.address = { ...newData.address, [name]: val };
                }
            } else if (section === 'contact') {
                if (subsection) {
                    newData.contact[subsection] = { ...newData.contact[subsection], [name]: val };
                }
            } else if (section === 'billing') {
                if (name === 'useSameAddress') {
                    newData.billing.useSameAddress = val;
                    if (val) {
                        newData.billing.address = { ...newData.address };
                    }
                } else if (subsection === 'address') {
                    newData.billing.address = { ...newData.billing.address, [name]: val };
                } else {
                    newData.billing[name] = val;
                }
            } else {
                newData[name] = val;
            }
            return newData;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate รหัสลูกค้าไม่ให้มีช่องว่าง
        if (formData.code && formData.code.includes(' ')) {
            alert('รหัสลูกค้าต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)');
            return;
        }

        // รวมข้อมูลที่อยู่จากหลายช่อง ให้เป็น String เดียว เพื่อส่งให้ Backend
        const combineAddress = (addr) => {
            return [addr.street, addr.subdistrict, addr.district, addr.province, addr.zipcode]
                .filter(Boolean).join(' ');
        };

        const dataToSave = {
            id: customer?.id,
            code: formData.code,
            name: formData.name,
            address: combineAddress(formData.address),
            contactPerson: formData.contact.primary.name,
            phone: formData.contact.primary.phone,
            email: formData.contact.primary.email,
            taxId: formData.taxId,
            mapLink: formData.mapLink,
            contact: formData.contact,
            billing: formData.billing,
            isActive: true
        };

        onSave(dataToSave);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6">{customer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มข้อมูลลูกค้าใหม่'}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* --- คอลัมน์ซ้าย: ข้อมูลทั่วไป & ที่อยู่ --- */}
                        <div className="space-y-6">
                            {/* ข้อมูลทั่วไป */}
                            <div className="border p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-4 border-b pb-2">ข้อมูลทั่วไป</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">
                                            รหัสลูกค้า <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={(e) => handleChange(e)}
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
                                        <p className="text-xs text-gray-500 mt-1">ตัวอย่าง: CUST-001, ABC_123 (ห้ามมีช่องว่าง)</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
                                        <input
                                            type="text"
                                            name="taxId"
                                            value={formData.taxId}
                                            onChange={(e) => handleChange(e)}
                                            className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">ชื่อลูกค้า <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={(e) => handleChange(e)}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* ที่อยู่หลัก */}
                            <div className="border p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-4 border-b pb-2">ที่อยู่หลัก</h3>
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-700 mb-1">บ้านเลขที่, หมู่, ซอย, ถนน</label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={formData.address.street}
                                        onChange={(e) => handleChange(e, 'address')}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">แขวง/ตำบล</label>
                                        <input
                                            type="text"
                                            name="subdistrict"
                                            value={formData.address.subdistrict}
                                            onChange={(e) => handleChange(e, 'address')}
                                            className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">เขต/อำเภอ</label>
                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.address.district}
                                            onChange={(e) => handleChange(e, 'address')}
                                            className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">จังหวัด</label>
                                        <input
                                            type="text"
                                            name="province"
                                            value={formData.address.province}
                                            onChange={(e) => handleChange(e, 'address')}
                                            className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">รหัสไปรษณีย์</label>
                                        <input
                                            type="text"
                                            name="zipcode"
                                            value={formData.address.zipcode}
                                            onChange={(e) => handleChange(e, 'address')}
                                            className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">ลิงก์ Google Maps</label>
                                    <input
                                        type="text"
                                        name="mapLink"
                                        value={formData.mapLink}
                                        onChange={(e) => handleChange(e)}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* --- คอลัมน์ขวา: ข้อมูลผู้ติดต่อ & วางบิล --- */}
                        <div className="space-y-6">
                            {/* ข้อมูลผู้ติดต่อ */}
                            <div className="border p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-4 border-b pb-2">ข้อมูลผู้ติดต่อ</h3>

                                {/* ผู้ติดต่อหลัก */}
                                <div className="mb-4">
                                    <h4 className="font-semibold text-md mb-2">ผู้ติดต่อหลัก</h4>
                                    <div className="mb-2">
                                        <label className="block text-sm text-gray-700 mb-1">ชื่อ</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.contact.primary.name}
                                            onChange={(e) => handleChange(e, 'contact', 'primary')}
                                            className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-1">เบอร์โทร</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.contact.primary.phone}
                                                onChange={(e) => handleChange(e, 'contact', 'primary')}
                                                className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-1">อีเมล</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.contact.primary.email}
                                                onChange={(e) => handleChange(e, 'contact', 'primary')}
                                                className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* ผู้ติดต่อรอง */}
                                <div>
                                    <h4 className="font-semibold text-md mb-2">ผู้ติดต่อรอง (ถ้ามี)</h4>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">ชื่อ</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.contact.secondary.name}
                                            onChange={(e) => handleChange(e, 'contact', 'secondary')}
                                            className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ข้อมูลวางบิล */}
                            <div className="border p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h3 className="font-bold text-lg">ข้อมูลวางบิล</h3>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="useSameAddress"
                                            checked={formData.billing.useSameAddress}
                                            onChange={(e) => handleChange(e, 'billing')}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">
                                            ใช้ที่อยู่เดียวกับที่อยู่หลัก
                                        </label>
                                    </div>
                                </div>

                                {!formData.billing.useSameAddress && (
                                    <div className="mb-4 space-y-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-1">บ้านเลขที่, หมู่, ซอย, ถนน</label>
                                            <input type="text" name="street" value={formData.billing.address.street} onChange={(e) => handleChange(e, 'billing', 'address')} className="w-full border p-2 rounded-md bg-white" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="block text-sm text-gray-700 mb-1">แขวง/ตำบล</label><input type="text" name="subdistrict" value={formData.billing.address.subdistrict} onChange={(e) => handleChange(e, 'billing', 'address')} className="w-full border p-2 rounded-md bg-white" /></div>
                                            <div><label className="block text-sm text-gray-700 mb-1">เขต/อำเภอ</label><input type="text" name="district" value={formData.billing.address.district} onChange={(e) => handleChange(e, 'billing', 'address')} className="w-full border p-2 rounded-md bg-white" /></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="block text-sm text-gray-700 mb-1">จังหวัด</label><input type="text" name="province" value={formData.billing.address.province} onChange={(e) => handleChange(e, 'billing', 'address')} className="w-full border p-2 rounded-md bg-white" /></div>
                                            <div><label className="block text-sm text-gray-700 mb-1">รหัสไปรษณีย์</label><input type="text" name="zipcode" value={formData.billing.address.zipcode} onChange={(e) => handleChange(e, 'billing', 'address')} className="w-full border p-2 rounded-md bg-white" /></div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">เงื่อนไขการชำระเงิน</label>
                                    <input
                                        type="text"
                                        name="paymentTerms"
                                        value={formData.billing.paymentTerms}
                                        onChange={(e) => handleChange(e, 'billing')}
                                        className="w-full border p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
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