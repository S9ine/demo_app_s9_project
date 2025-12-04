import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';


export default function SiteFormModal({ isOpen, onClose, site, onSave, customers }) {
    const [formData, setFormData] = useState({});
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const customer = customers.find(c => c.id === site?.customerId) || customers[0];
            setCustomerSearch(customer?.name || '');
            
            const initialData = {
                id: site?.id || null,
                siteCode: site?.siteCode || '',
                name: site?.name || '',
                customerId: site?.customerId || (customer?.id || ''),
                customerCode: site?.customerCode || (customer?.code || ''),
                customerName: site?.customerName || (customer?.name || ''),
                contractStartDate: site?.contractStartDate || '',
                contractEndDate: site?.contractEndDate || '',
                address: site?.address || '',
                subDistrict: site?.subDistrict || '',
                district: site?.district || '',
                province: site?.province || '',
                postalCode: site?.postalCode || '',
                contactPerson: site?.contactPerson || '',
                phone: site?.phone || '',
                employmentDetails: site?.employmentDetails && Array.isArray(site.employmentDetails) 
                    ? JSON.parse(JSON.stringify(site.employmentDetails))
                    : []
            };
            setFormData(initialData);
        }
    }, [site, isOpen, customers]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showCustomerDropdown && !event.target.closest('.customer-search-container')) {
                setShowCustomerDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCustomerDropdown]);

    // Filter customers based on search
    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.code.toLowerCase().includes(customerSearch.toLowerCase())
    );

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomerSearch = (e) => {
        setCustomerSearch(e.target.value);
        setShowCustomerDropdown(true);
    };

    const handleCustomerSelect = (customer) => {
        setCustomerSearch(customer.name);
        setShowCustomerDropdown(false);
        setFormData(prev => ({
            ...prev,
            customerId: customer.id,
            customerCode: customer.code,
            customerName: customer.name
        }));
    };

    const handleEmploymentChange = (index, field, value) => {
        const updatedDetails = [...formData.employmentDetails];
        updatedDetails[index] = { ...updatedDetails[index], [field]: value };
        setFormData(prev => ({ ...prev, employmentDetails: updatedDetails }));
    };

    const addEmploymentRow = () => {
        const newDetail = {
            position: '',
            quantity: 1,
            hiringRate: 0,
            diligenceBonus: 0,
            sevenDayBonus: 0,
            pointBonus: 0,
            remarks: ''
        };
        setFormData(prev => ({
            ...prev,
            employmentDetails: [...prev.employmentDetails, newDetail]
        }));
    };

    const removeEmploymentRow = (index) => {
        setFormData(prev => ({
            ...prev,
            employmentDetails: prev.employmentDetails.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        
        // Validation
        if (!formData.siteCode || !formData.name) {
            alert('กรุณากรอกรหัสหน่วยงานและชื่อหน่วยงาน');
            return;
        }
        
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-6 flex-shrink-0">
                    {site ? 'แก้ไขข้อมูลหน่วยงาน' : 'เพิ่มข้อมูลหน่วยงานใหม่'}
                </h2>
                
                <div className="flex-1 overflow-y-auto pr-2">
                    {/* Section 1: ข้อมูลหน่วยงานและสัญญา */}
                    <div className="p-4 border rounded-lg mb-6 bg-gray-50">
                        <h3 className="font-semibold text-lg border-b pb-2 mb-4 text-indigo-700">
                            1. ข้อมูลหน่วยงานและสัญญา
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    รหัสหน่วยงาน <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="siteCode"
                                    value={formData.siteCode}
                                    onChange={handleChange}
                                    placeholder="เช่น SITE-001"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    ชื่อหน่วยงาน <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="เช่น สำนักงานใหญ่"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div className="customer-search-container">
                                <label className="block text-sm font-medium text-gray-700">ชื่อลูกค้า</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={customerSearch}
                                        onChange={handleCustomerSearch}
                                        onFocus={() => setShowCustomerDropdown(true)}
                                        placeholder="ค้นหาชื่อหรือรหัสลูกค้า..."
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {showCustomerDropdown && filteredCustomers.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {filteredCustomers.map(c => (
                                                <div
                                                    key={c.id}
                                                    onClick={() => handleCustomerSelect(c)}
                                                    className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0"
                                                >
                                                    <div className="font-medium text-gray-900">{c.name}</div>
                                                    <div className="text-sm text-gray-500">รหัส: {c.code}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">รหัสลูกค้า</label>
                                <input
                                    type="text"
                                    name="customerCode"
                                    value={formData.customerCode}
                                    readOnly
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">วันเริ่มสัญญา</label>
                                <input
                                    type="date"
                                    name="contractStartDate"
                                    value={formData.contractStartDate}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">วันสิ้นสุดสัญญา</label>
                                <input
                                    type="date"
                                    name="contractEndDate"
                                    value={formData.contractEndDate}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        
                        <h4 className="font-medium text-md pt-4 mt-4 border-t text-gray-700">ที่อยู่หน่วยงาน</h4>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700">ที่อยู่หน่วยงาน</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="บ้านเลขที่, หมู่, ซอย, ถนน"
                                rows="2"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">แขวง/ตำบล</label>
                                <input
                                    type="text"
                                    name="subDistrict"
                                    value={formData.subDistrict}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">เขต/อำเภอ</label>
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">จังหวัด</label>
                                <input
                                    type="text"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">รหัสไปรษณีย์</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    maxLength="5"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: ข้อมูลการจ้าง */}
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h3 className="font-semibold text-lg text-indigo-700">2. ข้อมูลการจ้าง</h3>
                            <button
                                type="button"
                                onClick={addEmploymentRow}
                                className="flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-600 text-sm rounded-md hover:bg-indigo-200 transition"
                            >
                                <PlusCircle className="w-4 h-4 mr-1" /> เพิ่มรายการ
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-indigo-50">
                                    <tr>
                                        <th className="p-2 text-left font-medium border">ชื่อ/ตำแหน่ง</th>
                                        <th className="p-2 text-center font-medium border w-20">จำนวน</th>
                                        <th className="p-2 text-right font-medium border w-28">ราคาจ้าง</th>
                                        <th className="p-2 text-right font-medium border w-24">เบี้ยขยัน</th>
                                        <th className="p-2 text-right font-medium border w-24">7DAY</th>
                                        <th className="p-2 text-right font-medium border w-24">ค่าจุด</th>
                                        <th className="p-2 text-left font-medium border">หมายเหตุ</th>
                                        <th className="p-2 text-center font-medium border w-16"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.employmentDetails && formData.employmentDetails.length > 0 ? (
                                        formData.employmentDetails.map((detail, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="p-2 border">
                                                    <input
                                                        type="text"
                                                        value={detail.position}
                                                        onChange={(e) => handleEmploymentChange(index, 'position', e.target.value)}
                                                        placeholder="เช่น พนักงานรักษาความปลอดภัย"
                                                        className="w-full p-1 border rounded-md"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="number"
                                                        value={detail.quantity}
                                                        onChange={(e) => handleEmploymentChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        className="w-full p-1 border rounded-md text-center"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="number"
                                                        value={detail.hiringRate}
                                                        onChange={(e) => handleEmploymentChange(index, 'hiringRate', parseFloat(e.target.value) || 0)}
                                                        className="w-full p-1 border rounded-md text-right"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="number"
                                                        value={detail.diligenceBonus}
                                                        onChange={(e) => handleEmploymentChange(index, 'diligenceBonus', parseFloat(e.target.value) || 0)}
                                                        className="w-full p-1 border rounded-md text-right"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="number"
                                                        value={detail.sevenDayBonus}
                                                        onChange={(e) => handleEmploymentChange(index, 'sevenDayBonus', parseFloat(e.target.value) || 0)}
                                                        className="w-full p-1 border rounded-md text-right"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="number"
                                                        value={detail.pointBonus}
                                                        onChange={(e) => handleEmploymentChange(index, 'pointBonus', parseFloat(e.target.value) || 0)}
                                                        className="w-full p-1 border rounded-md text-right"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="text"
                                                        value={detail.remarks || ''}
                                                        onChange={(e) => handleEmploymentChange(index, 'remarks', e.target.value)}
                                                        placeholder="หมายเหตุ"
                                                        className="w-full p-1 border rounded-md"
                                                    />
                                                </td>
                                                <td className="p-2 border text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEmploymentRow(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                        title="ลบรายการ"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="p-4 text-center text-gray-500 border">
                                                ไม่มีข้อมูลการจ้าง (กดปุ่ม "เพิ่มรายการ" เพื่อเพิ่มข้อมูล)
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex justify-end space-x-4 flex-shrink-0 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        บันทึกข้อมูล
                    </button>
                </div>
            </div>
        </div>
    );
}
