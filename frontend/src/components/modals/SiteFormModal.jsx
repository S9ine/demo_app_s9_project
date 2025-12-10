import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';


export default function SiteFormModal({ isOpen, onClose, site, onSave, customers }) {
    const [formData, setFormData] = useState({ employmentDetails: [] });
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [services, setServices] = useState([]);
    const [positionSearches, setPositionSearches] = useState({});
    const [showPositionDropdowns, setShowPositionDropdowns] = useState({});

    useEffect(() => {
        const initializeForm = async () => {
            if (isOpen) {
                const customer = customers.find(c => c.id === site?.customerId) || customers[0];
                setCustomerSearch(customer?.name || '');
                
                let initialSiteCode = site?.siteCode || '';
                
                // If creating new site and customer is selected, get next site code
                if (!site && customer) {
                    try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`http://localhost:8000/api/sites/next-code/${customer.id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            initialSiteCode = data.nextCode;
                        } else {
                            initialSiteCode = `${customer.code}.01`;
                        }
                    } catch (error) {
                        console.error('Error fetching next site code:', error);
                        initialSiteCode = `${customer.code}.01`;
                    }
                }
                
                const initialData = {
                    id: site?.id || null,
                    siteCode: initialSiteCode,
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
                        ? site.employmentDetails.map(detail => ({
                            ...detail,
                            positionAllowance: detail.positionAllowance || 0,
                            otherAllowance: detail.otherAllowance || 0
                        }))
                        : []
                };
                setFormData(initialData);
                
                // Initialize position searches with existing values
                if (initialData.employmentDetails.length > 0) {
                    const searches = {};
                    initialData.employmentDetails.forEach((detail, index) => {
                        searches[index] = detail.position || '';
                    });
                    setPositionSearches(searches);
                } else {
                    setPositionSearches({});
                }
            }
        };
        
        initializeForm();
    }, [site, isOpen, customers]);

    // Fetch services on mount
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8000/api/services', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setServices(data);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };
        
        if (isOpen) {
            fetchServices();
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showCustomerDropdown && !event.target.closest('.customer-search-container')) {
                setShowCustomerDropdown(false);
            }
            // Close position dropdowns
            Object.keys(showPositionDropdowns).forEach(key => {
                if (showPositionDropdowns[key] && !event.target.closest(`.position-search-${key}`)) {
                    setShowPositionDropdowns(prev => ({ ...prev, [key]: false }));
                }
            });
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCustomerDropdown, showPositionDropdowns]);

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

    const handleCustomerSelect = async (customer) => {
        setCustomerSearch(customer.name);
        setShowCustomerDropdown(false);
        
        // Get next site code for this customer
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/sites/next-code/${customer.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    customerId: customer.id,
                    customerCode: customer.code,
                    customerName: customer.name,
                    siteCode: data.nextCode  // Auto-fill site code
                }));
            } else {
                // Fallback if API fails
                setFormData(prev => ({
                    ...prev,
                    customerId: customer.id,
                    customerCode: customer.code,
                    customerName: customer.name,
                    siteCode: `${customer.code}.01`  // Default to .01
                }));
            }
        } catch (error) {
            console.error('Error fetching next site code:', error);
            // Fallback to manual code
            setFormData(prev => ({
                ...prev,
                customerId: customer.id,
                customerCode: customer.code,
                customerName: customer.name,
                siteCode: `${customer.code}.01`
            }));
        }
    };

    const handleEmploymentChange = (index, field, value) => {
        const updatedDetails = [...formData.employmentDetails];
        updatedDetails[index] = { ...updatedDetails[index], [field]: value };
        setFormData(prev => ({ ...prev, employmentDetails: updatedDetails }));
    };

    const handlePositionSearch = (index, value) => {
        setPositionSearches(prev => ({ ...prev, [index]: value }));
        handleEmploymentChange(index, 'position', value);
        setShowPositionDropdowns(prev => ({ ...prev, [index]: true }));
    };

    const handlePositionSelect = (index, service) => {
        const updatedDetails = [...formData.employmentDetails];
        updatedDetails[index] = {
            ...updatedDetails[index],
            position: service.serviceName,
            hiringRate: service.hiringRate || 0,
            diligenceBonus: service.diligenceBonus || 0,
            sevenDayBonus: service.sevenDayBonus || 0,
            pointBonus: service.pointBonus || 0
        };
        setFormData(prev => ({ ...prev, employmentDetails: updatedDetails }));
        setPositionSearches(prev => ({ ...prev, [index]: service.serviceName }));
        setShowPositionDropdowns(prev => ({ ...prev, [index]: false }));
    };

    const getFilteredServices = (index) => {
        const searchTerm = positionSearches[index] || '';
        if (!searchTerm) return services;
        return services.filter(s => 
            s.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.serviceCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const addEmploymentRow = () => {
        const newDetail = {
            position: '',
            quantity: 1,
            hiringRate: 0,
            positionAllowance: 0,
            diligenceBonus: 0,
            sevenDayBonus: 0,
            pointBonus: 0,
            otherAllowance: 0,
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
        
        // Clean up position search states
        setPositionSearches(prev => {
            const newSearches = { ...prev };
            delete newSearches[index];
            // Re-index remaining items
            const reindexed = {};
            Object.keys(newSearches).forEach(key => {
                const oldIndex = parseInt(key);
                if (oldIndex > index) {
                    reindexed[oldIndex - 1] = newSearches[key];
                } else {
                    reindexed[key] = newSearches[key];
                }
            });
            return reindexed;
        });
        
        setShowPositionDropdowns(prev => {
            const newDropdowns = { ...prev };
            delete newDropdowns[index];
            // Re-index remaining items
            const reindexed = {};
            Object.keys(newDropdowns).forEach(key => {
                const oldIndex = parseInt(key);
                if (oldIndex > index) {
                    reindexed[oldIndex - 1] = newDropdowns[key];
                } else {
                    reindexed[key] = newDropdowns[key];
                }
            });
            return reindexed;
        });
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

    if (!isOpen) return null;

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
                                    value={formData.siteCode || ''}
                                    readOnly
                                    placeholder="เลือกลูกค้าเพื่อสร้างรหัสอัตโนมัติ"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    รหัสจะถูกสร้างอัตโนมัติจากรหัสลูกค้า (เช่น C001.01, C001.02)
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    ชื่อหน่วยงาน <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
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
                                    value={formData.customerCode || ''}
                                    readOnly
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">วันเริ่มสัญญา</label>
                                <input
                                    type="date"
                                    name="contractStartDate"
                                    value={formData.contractStartDate || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">วันสิ้นสุดสัญญา</label>
                                <input
                                    type="date"
                                    name="contractEndDate"
                                    value={formData.contractEndDate || ''}
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
                                value={formData.address || ''}
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
                                    value={formData.subDistrict || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">เขต/อำเภอ</label>
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.district || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">จังหวัด</label>
                                <input
                                    type="text"
                                    name="province"
                                    value={formData.province || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">รหัสไปรษณีย์</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode || ''}
                                    onChange={handleChange}
                                    placeholder="รหัสไปรษณีย์"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: ข้อมูลการจ้าง */}
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="flex justify-between items-center pb-3 mb-4 border-b-2 border-indigo-200">
                            <div>
                                <h3 className="font-semibold text-lg text-indigo-700">2. ข้อมูลการจ้าง</h3>
                                <p className="text-xs text-gray-500 mt-1">เพิ่มรายละเอียดตำแหน่งและอัตราค่าจ้าง</p>
                            </div>
                            <button
                                type="button"
                                onClick={addEmploymentRow}
                                className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                            >
                                <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มรายการ
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.employmentDetails && formData.employmentDetails.length > 0 ? (
                                formData.employmentDetails.map((detail, index) => (
                                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                    ชื่อ/ตำแหน่งงาน <span className="text-red-500">*</span>
                                                </label>
                                                <div className={`relative position-search-${index}`}>
                                                    <input
                                                        type="text"
                                                        value={positionSearches[index] !== undefined ? positionSearches[index] : detail.position}
                                                        onChange={(e) => handlePositionSearch(index, e.target.value)}
                                                        onFocus={() => setShowPositionDropdowns(prev => ({ ...prev, [index]: true }))}
                                                        placeholder="🔍 ค้นหาหรือพิมพ์ชื่อบริการ..."
                                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                    />
                                                    {showPositionDropdowns[index] && getFilteredServices(index).length > 0 && (
                                                        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-indigo-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                                            {getFilteredServices(index).map(service => (
                                                                <div
                                                                    key={service.id}
                                                                    onClick={() => handlePositionSelect(index, service)}
                                                                    className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0 transition-colors"
                                                                >
                                                                    <div className="font-semibold text-gray-900">{service.serviceName}</div>
                                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                                                        <span className="bg-gray-100 px-2 py-0.5 rounded">รหัส: {service.serviceCode}</span>
                                                                        <span className="text-green-600 font-medium">฿{service.hiringRate?.toLocaleString() || '0'}</span>
                                                                        {service.diligenceBonus > 0 && (
                                                                            <span className="text-blue-600">+เบี้ยขยัน ฿{service.diligenceBonus?.toLocaleString()}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeEmploymentRow(index)}
                                                className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="ลบรายการ"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">จำนวน</label>
                                                <input
                                                    type="number"
                                                    value={detail.quantity || 0}
                                                    onChange={(e) => handleEmploymentChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">ราคาจ้าง (฿)</label>
                                                <input
                                                    type="number"
                                                    value={detail.hiringRate || 0}
                                                    onChange={(e) => handleEmploymentChange(index, 'hiringRate', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">ค่าตำแหน่ง (฿)</label>
                                                <input
                                                    type="number"
                                                    value={detail.positionAllowance || 0}
                                                    onChange={(e) => handleEmploymentChange(index, 'positionAllowance', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">เบี้ยขยัน (฿)</label>
                                                <input
                                                    type="number"
                                                    value={detail.diligenceBonus || 0}
                                                    onChange={(e) => handleEmploymentChange(index, 'diligenceBonus', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">7DAY (฿)</label>
                                                <input
                                                    type="number"
                                                    value={detail.sevenDayBonus || 0}
                                                    onChange={(e) => handleEmploymentChange(index, 'sevenDayBonus', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">ค่าจุด (฿)</label>
                                                <input
                                                    type="number"
                                                    value={detail.pointBonus || 0}
                                                    onChange={(e) => handleEmploymentChange(index, 'pointBonus', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">ค่าอื่นๆ (฿)</label>
                                                <input
                                                    type="number"
                                                    value={detail.otherAllowance || 0}
                                                    onChange={(e) => handleEmploymentChange(index, 'otherAllowance', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">รวม/คน</label>
                                                <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-right font-bold text-green-700">
                                                    ฿{((detail.hiringRate || 0) + (detail.positionAllowance || 0) + (detail.diligenceBonus || 0) + (detail.sevenDayBonus || 0) + (detail.pointBonus || 0) + (detail.otherAllowance || 0)).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">หมายเหตุ</label>
                                            <textarea
                                                value={detail.remarks || ''}
                                                onChange={(e) => handleEmploymentChange(index, 'remarks', e.target.value)}
                                                placeholder="เพิ่มหมายเหตุ (ถ้ามี)..."
                                                rows="2"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                    <PlusCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                    <p className="text-gray-500 font-medium">ยังไม่มีรายการจ้าง</p>
                                    <p className="text-sm text-gray-400 mt-1">คลิกปุ่ม "เพิ่มรายการ" เพื่อเริ่มต้น</p>
                                </div>
                            )}
                            
                            {/* Grand Total Section */}
                            {formData.employmentDetails && formData.employmentDetails.length > 0 && (
                                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200 shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                                                <span className="text-sm text-gray-600">จำนวนรวม</span>
                                                <p className="text-2xl font-bold text-gray-800">
                                                    {formData.employmentDetails.reduce((sum, detail) => sum + (detail.quantity || 0), 0)} คน
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm text-gray-600 block mb-1">รวมทั้งหมด</span>
                                            <p className="text-3xl font-bold text-green-700">
                                                ฿{formData.employmentDetails.reduce((sum, detail) => {
                                                    const totalPerPerson = (detail.hiringRate || 0) + (detail.positionAllowance || 0) + (detail.diligenceBonus || 0) + (detail.sevenDayBonus || 0) + (detail.pointBonus || 0) + (detail.otherAllowance || 0);
                                                    return sum + ((detail.quantity || 0) * totalPerPerson);
                                                }, 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
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
