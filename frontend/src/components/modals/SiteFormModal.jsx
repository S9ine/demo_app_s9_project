import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';


export default function SiteFormModal({ isOpen, onClose, site, onSave, customers, initialServices }) {
    const emptyAddress = { street: '', subdistrict: '', district: '', province: '', zipcode: '' };
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const initialData = {
            id: site?.id || null,
            name: site?.name || '',
            customerId: site?.customerId || (customers.length > 0 ? customers[0].id : ''),
            address: site?.address ? { ...site.address } : emptyAddress,
            startDate: site?.startDate || '',
            endDate: site?.endDate || '',
            contractedServices: site?.contractedServices ? JSON.parse(JSON.stringify(site.contractedServices)) : []
        };
        setFormData(initialData);
    }, [site, isOpen, customers]);

    if (!isOpen) return null;

    const handleChange = (e, section) => {
        const { name, value } = e.target;
        if (section) {
            setFormData(prev => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleServiceChange = (index, e) => {
        const { name, value } = e.target;
        const updatedServices = [...formData.contractedServices];
        updatedServices[index] = { ...updatedServices[index], [name]: value };
        
        if (name === 'serviceId') {
            const selectedService = initialServices.find(s => s.id === parseInt(value));
            updatedServices[index].position = selectedService ? selectedService.name : '';
        }

        setFormData(prev => ({ ...prev, contractedServices: updatedServices }));
    };

    const addServiceRow = () => {
        const newService = { id: Date.now(), serviceId: 1, position: 'พนักงานรักษาความปลอดภัย', quantity: 1, hiringRate: 0, payoutRate: 0, diligenceBonus: 0, pointBonus: 0, otherBonus: 0 };
        setFormData(prev => ({ ...prev, contractedServices: [...prev.contractedServices, newService] }));
    };

    const removeServiceRow = (id) => {
        setFormData(prev => ({ ...prev, contractedServices: prev.contractedServices.filter(s => s.id !== id) }));
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-6 flex-shrink-0">{site ? 'แก้ไขข้อมูลหน่วยงาน' : 'เพิ่มข้อมูลหน่วยงานใหม่'}</h2>
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="p-4 border rounded-lg mb-6">
                        <h3 className="font-semibold text-lg border-b pb-2 mb-4">1. ข้อมูลหน่วยงานและสัญญา</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ชื่อหน่วยงาน</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ลูกค้า</label>
                                <select name="customerId" value={formData.customerId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">วันเริ่มสัญญา</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">วันสิ้นสุดสัญญา</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                        </div>
                        <h4 className="font-medium text-md pt-2 border-t mt-4">ที่อยู่หน่วยงาน</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">บ้านเลขที่, หมู่, ซอย, ถนน</label>
                            <input type="text" name="street" value={formData.address?.street} onChange={(e) => handleChange(e, 'address')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">แขวง/ตำบล</label>
                                <input type="text" name="subdistrict" value={formData.address?.subdistrict} onChange={(e) => handleChange(e, 'address')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">เขต/อำเภอ</label>
                                <input type="text" name="district" value={formData.address?.district} onChange={(e) => handleChange(e, 'address')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">จังหวัด</label>
                                <input type="text" name="province" value={formData.address?.province} onChange={(e) => handleChange(e, 'address')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">รหัสไปรษณีย์</label>
                                <input type="text" name="zipcode" value={formData.address?.zipcode} onChange={(e) => handleChange(e, 'address')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h3 className="font-semibold text-lg">2. ข้อมูลการจ้าง</h3>
                            <button type="button" onClick={addServiceRow} className="flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-600 text-sm rounded-md hover:bg-indigo-200">
                                <PlusCircle className="w-4 h-4 mr-1" /> เพิ่มรายการ
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-2 text-left font-medium">ชื่อ/ตำแหน่ง</th>
                                        <th className="p-2 text-left font-medium">จำนวน</th>
                                        <th className="p-2 text-left font-medium">ราคาจ้าง</th>
                                        <th className="p-2 text-left font-medium">ราคาจ่ายรายวัน</th>
                                        <th className="p-2 text-left font-medium">เบี้ยขยัน</th>
                                        <th className="p-2 text-left font-medium">ค่าจุด</th>
                                        <th className="p-2 text-left font-medium">ค่าอื่นๆ</th>
                                        <th className="p-2 text-left font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.contractedServices?.map((service, index) => (
                                        <tr key={service.id} className="border-b">
                                            <td>
                                                <select name="serviceId" value={service.serviceId} onChange={(e) => handleServiceChange(index, e)} className="w-full p-1 border rounded-md">
                                                    {initialServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                            </td>
                                            <td><input type="number" name="quantity" value={service.quantity} onChange={(e) => handleServiceChange(index, e)} className="w-20 p-1 border rounded-md"/></td>
                                            <td><input type="number" name="hiringRate" value={service.hiringRate} onChange={(e) => handleServiceChange(index, e)} className="w-24 p-1 border rounded-md"/></td>
                                            <td><input type="number" name="payoutRate" value={service.payoutRate} onChange={(e) => handleServiceChange(index, e)} className="w-24 p-1 border rounded-md"/></td>
                                            <td><input type="number" name="diligenceBonus" value={service.diligenceBonus} onChange={(e) => handleServiceChange(index, e)} className="w-20 p-1 border rounded-md"/></td>
                                            <td><input type="number" name="pointBonus" value={service.pointBonus} onChange={(e) => handleServiceChange(index, e)} className="w-20 p-1 border rounded-md"/></td>
                                            <td><input type="number" name="otherBonus" value={service.otherBonus} onChange={(e) => handleServiceChange(index, e)} className="w-20 p-1 border rounded-md"/></td>
                                            <td><button type="button" onClick={() => removeServiceRow(service.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">ยกเลิก</button>
                    <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">บันทึกข้อมูล</button>
                </div>
            </div>
        </div>
    );
}