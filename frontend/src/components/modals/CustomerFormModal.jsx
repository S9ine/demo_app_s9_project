import React, { useState, useEffect, useMemo } from 'react';

export default function CustomerFormModal({ isOpen, onClose, customer, onSave }) {
    const emptyAddress = useMemo(() => ({ 
        street: '', subdistrict: '', district: '', province: '', zipcode: '' 
    }), []);
    const [formData, setFormData] = useState({});
    const [useSameAddress, setUseSameAddress] = useState(true);

    useEffect(() => {
        const initialFormData = {
            id: customer?.id || null,
            code: customer?.code || '',
            name: customer?.name || '',
            taxId: customer?.taxId || '',
            address: customer?.address ? { ...customer.address } : emptyAddress,
            mapLink: customer?.mapLink || '',
            contact: {
                primary: { 
                    name: customer?.contact?.primary?.name || '', 
                    phone: customer?.contact?.primary?.phone || '', 
                    email: customer?.contact?.primary?.email || '' 
                },
                secondary: { 
                    name: customer?.contact?.secondary?.name || '', 
                    phone: customer?.contact?.secondary?.phone || '', 
                    email: customer?.contact?.secondary?.email || '' 
                }
            },
            billing: {
                address: customer?.billing?.address ? { ...customer.billing.address } : emptyAddress,
                paymentTerms: customer?.billing?.paymentTerms || ''
            }
        };
        setFormData(initialFormData);
        if (customer) {
            setUseSameAddress(JSON.stringify(customer.address) === JSON.stringify(customer.billing.address));
        } else {
            setUseSameAddress(true);
        }
    }, [customer, isOpen, emptyAddress]); // ✅ แก้ไขตรงนี้: เพิ่ม emptyAddress

    if (!isOpen) return null;
    
    const handleChange = (e, section, subsection) => {
        const { name, value } = e.target;
        
        let newFormData = { ...formData };

        if (section && subsection) {
            newFormData[section][subsection] = { ...newFormData[section][subsection], [name]: value };
        } else if (section) {
            newFormData[section] = { ...newFormData[section], [name]: value };
        } else {
            newFormData[name] = value;
        }
        
        if (section === 'address' && useSameAddress) {
            newFormData.billing.address = { ...newFormData.address };
        }

        setFormData(newFormData);
    };

    const handleSameAddressToggle = (e) => {
        const isChecked = e.target.checked;
        setUseSameAddress(isChecked);
        if (isChecked) {
            setFormData(prev => ({
                ...prev,
                billing: {
                    ...prev.billing,
                    address: { ...prev.address }
                }
            }));
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6">{customer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มข้อมูลลูกค้าใหม่'}</h2>
                    
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg border-b pb-2 mb-4">ข้อมูลทั่วไป</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">รหัสลูกค้า</label>
                                    <input type="text" name="code" value={formData.code} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">เลขประจำตัวผู้เสียภาษี</label>
                                    <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ชื่อลูกค้า</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                            </div>
                            
                            <h4 className="font-medium text-md pt-2 border-t mt-4">ที่อยู่หลัก</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">บ้านเลขที่, หมู่, ซอย, ถนน</label>
                                <input type="text" name="street" value={formData.address?.street} onChange={(e) => handleChange(e, 'address')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">แขวง/ตำบล</label>
                                    <input type="text" name="subdistrict" value={formData.address?.subdistrict} onChange={(e) => handleChange(e, 'address')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">เขต/อำเภอ</label>
                                    <input type="text" name="district" value={formData.address?.district} onChange={(e) => handleChange(e, 'address')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">จังหวัด</label>
                                    <input type="text" name="province" value={formData.address?.province} onChange={(e) => handleChange(e, 'address')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">รหัสไปรษณีย์</label>
                                    <input type="text" name="zipcode" value={formData.address?.zipcode} onChange={(e) => handleChange(e, 'address')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">ลิงก์ Google Maps</label>
                                <input type="text" name="mapLink" value={formData.mapLink} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="font-semibold text-lg border-b pb-2 mb-4">ข้อมูลผู้ติดต่อ</h3>
                                <h4 className="font-medium text-md">ผู้ติดต่อหลัก</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
                                    <input type="text" name="name" value={formData.contact?.primary.name} onChange={(e) => handleChange(e, 'contact', 'primary')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">เบอร์โทร</label>
                                        <input type="text" name="phone" value={formData.contact?.primary.phone} onChange={(e) => handleChange(e, 'contact', 'primary')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                                        <input type="email" name="email" value={formData.contact?.primary.email} onChange={(e) => handleChange(e, 'contact', 'primary')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                    </div>
                                </div>
                                <h4 className="font-medium text-md pt-2">ผู้ติดต่อรอง (ถ้ามี)</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
                                    <input type="text" name="name" value={formData.contact?.secondary.name} onChange={(e) => handleChange(e, 'contact', 'secondary')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                            </div>
                             <div className="space-y-4 p-4 border rounded-lg">
                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <h3 className="font-semibold text-lg">ข้อมูลวางบิล</h3>
                                    <label className="flex items-center text-sm">
                                        <input type="checkbox" checked={useSameAddress} onChange={handleSameAddressToggle} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                                        <span className="ml-2 text-gray-700">ใช้ที่อยู่เดียวกับที่อยู่หลัก</span>
                                    </label>
                                </div>
                                {!useSameAddress && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">บ้านเลขที่, หมู่, ซอย, ถนน</label>
                                            <input type="text" name="street" value={formData.billing?.address.street} onChange={(e) => handleChange(e, 'billing', 'address')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">แขวง/ตำบล</label>
                                                <input type="text" name="subdistrict" value={formData.billing?.address.subdistrict} onChange={(e) => handleChange(e, 'billing', 'address')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">เขต/อำเภอ</label>
                                                <input type="text" name="district" value={formData.billing?.address.district} onChange={(e) => handleChange(e, 'billing', 'address')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">จังหวัด</label>
                                                <input type="text" name="province" value={formData.billing?.address.province} onChange={(e) => handleChange(e, 'billing', 'address')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">รหัสไปรษณีย์</label>
                                                <input type="text" name="zipcode" value={formData.billing?.address.zipcode} onChange={(e) => handleChange(e, 'billing', 'address')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">เงื่อนไขการชำระเงิน</label>
                                    <input type="text" name="paymentTerms" value={formData.billing?.paymentTerms} onChange={(e) => handleChange(e, 'billing')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
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