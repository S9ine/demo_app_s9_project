import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Trash2, Clock, GripVertical, Upload, Download, FileText, X, Eye } from 'lucide-react';
import api from '../../config/api';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


// Sortable Shift Item Component
function SortableShiftItem({ id, index, shiftAssignment, selectedShift, isShiftLocked, shifts, handleShiftChange, removeShiftRow }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${isShiftLocked ? 'border-yellow-300 bg-yellow-50' : 'border-amber-200'} ${isDragging ? 'shadow-lg' : ''}`}
        >
            <div className="flex items-center gap-3 flex-wrap">
                {/* Drag Handle */}
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
                    title="ลากเพื่อจัดลำดับ"
                >
                    <GripVertical className="w-5 h-5" />
                </button>
                
                {/* Lock indicator */}
                {isShiftLocked && (
                    <span className="text-yellow-600 text-sm" title="กะนี้มีคนจัดแล้ว">🔒</span>
                )}
                
                {/* Shift Selection */}
                <div className="flex items-center gap-2">
                    <select
                        value={shiftAssignment.shiftId || ''}
                        onChange={(e) => handleShiftChange(index, 'shiftId', e.target.value)}
                        disabled={isShiftLocked}
                        className={`px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 font-medium min-w-[140px] ${isShiftLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                        {shifts.map(shift => (
                            <option key={shift.id} value={shift.id}>
                                {shift.shiftCode} - {shift.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Editable Time Inputs */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <input
                        type="time"
                        value={shiftAssignment.startTime || selectedShift?.startTime || ''}
                        onChange={(e) => handleShiftChange(index, 'startTime', e.target.value)}
                        className="px-2 py-0.5 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white w-24"
                        title="เวลาเข้า"
                    />
                    <span className="text-blue-600 font-bold">-</span>
                    <input
                        type="time"
                        value={shiftAssignment.endTime || selectedShift?.endTime || ''}
                        onChange={(e) => handleShiftChange(index, 'endTime', e.target.value)}
                        className="px-2 py-0.5 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white w-24"
                        title="เวลาออก"
                    />
                </div>
                
                {/* Number of People */}
                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 whitespace-nowrap">จำนวน:</label>
                    <input
                        type="number"
                        value={shiftAssignment.numberOfPeople || 1}
                        onChange={(e) => handleShiftChange(index, 'numberOfPeople', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-xs text-gray-500">คน</span>
                </div>
                
                {/* Delete Button */}
                <button
                    type="button"
                    onClick={() => removeShiftRow(index)}
                    disabled={isShiftLocked}
                    className={`p-1.5 rounded-lg transition-colors ml-auto ${isShiftLocked ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                    title={isShiftLocked ? 'ไม่สามารถลบได้ เนื่องจากกะนี้มีคนจัดแล้ว' : 'ลบกะนี้'}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}


export default function SiteFormModal({ isOpen, onClose, site, onSave, customers }) {
    const [formData, setFormData] = useState({ employmentDetails: [], shiftAssignments: [] });
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [services, setServices] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [positionSearches, setPositionSearches] = useState({});
    const [showPositionDropdowns, setShowPositionDropdowns] = useState({});
    const [shiftsWithGuards, setShiftsWithGuards] = useState([]);  // กะที่มีคนจัดแล้ว
    
    // Contract file states
    const [contractFile, setContractFile] = useState(null);
    const [contractFileName, setContractFileName] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef(null);

    // Drag & Drop sensors - ต้องอยู่หลัง useState ทั้งหมด
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        const initializeForm = async () => {
            if (isOpen) {
                const customer = customers.find(c => c.id === site?.customerId) || customers[0];
                setCustomerSearch(customer?.name || '');
                
                let initialSiteCode = site?.siteCode || '';
                
                // If creating new site and customer is selected, get next site code
                if (!site && customer) {
                    try {
                        const response = await api.get(`/sites/next-code/${customer.id}`);
                        initialSiteCode = response.data.nextCode;
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
                            otherAllowance: detail.otherAllowance || 0,
                            dailyIncome: detail.dailyIncome || 0
                        }))
                        : [],
                    shiftAssignments: site?.shiftAssignments && Array.isArray(site.shiftAssignments)
                        ? site.shiftAssignments
                        : []
                };
                setFormData(initialData);
                
                // Set contract file name if exists
                setContractFileName(site?.contractFileName || '');
                setContractFile(null);
                
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

    // Fetch services and shifts on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch services and shifts in parallel
                const [servicesRes, shiftsRes] = await Promise.all([
                    api.get('/services'),
                    api.get('/shifts')
                ]);
                setServices(servicesRes.data);
                setShifts(shiftsRes.data.filter(s => s.isActive));
                
                // ตรวจสอบว่ากะไหนมีคนจัดแล้ว (เฉพาะตอนแก้ไข)
                if (site?.id) {
                    const scheduleRes = await api.get(`/sites/${site.id}/has-schedule`);
                    setShiftsWithGuards(scheduleRes.data.shiftsWithGuards || []);
                } else {
                    setShiftsWithGuards([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, site?.id]);

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
            const response = await api.get(`/sites/next-code/${customer.id}`);
            setFormData(prev => ({
                ...prev,
                customerId: customer.id,
                customerCode: customer.code,
                customerName: customer.name,
                siteCode: response.data.nextCode  // Auto-fill site code
            }));
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
            workingDays: 30,
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

    // Shift assignment functions
    const addShiftRow = () => {
        const firstShift = shifts[0];
        const newShiftAssignment = {
            shiftId: firstShift?.id || null,
            shiftCode: firstShift?.shiftCode || '',
            shiftName: firstShift?.name || '',
            startTime: firstShift?.startTime || '',
            endTime: firstShift?.endTime || '',
            numberOfPeople: 1
        };
        setFormData(prev => ({
            ...prev,
            shiftAssignments: [...(prev.shiftAssignments || []), newShiftAssignment]
        }));
    };

    const removeShiftRow = (index) => {
        setFormData(prev => ({
            ...prev,
            shiftAssignments: prev.shiftAssignments.filter((_, i) => i !== index)
        }));
    };

    // Handle drag end for shift reordering
    const handleShiftDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setFormData(prev => {
                const oldIndex = prev.shiftAssignments.findIndex((_, i) => `shift-${i}` === active.id);
                const newIndex = prev.shiftAssignments.findIndex((_, i) => `shift-${i}` === over.id);
                return {
                    ...prev,
                    shiftAssignments: arrayMove(prev.shiftAssignments, oldIndex, newIndex)
                };
            });
        }
    };

    const handleShiftChange = (index, field, value) => {
        const updatedShifts = [...formData.shiftAssignments];
        
        if (field === 'shiftId') {
            const selectedShift = shifts.find(s => s.id === parseInt(value));
            if (selectedShift) {
                updatedShifts[index] = {
                    ...updatedShifts[index],
                    shiftId: selectedShift.id,
                    shiftCode: selectedShift.shiftCode,
                    shiftName: selectedShift.name,
                    startTime: selectedShift.startTime || '',
                    endTime: selectedShift.endTime || ''
                };
            }
        } else {
            updatedShifts[index] = {
                ...updatedShifts[index],
                [field]: value
            };
        }
        
        setFormData(prev => ({ ...prev, shiftAssignments: updatedShifts }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        // Validation
        if (!formData.siteCode || !formData.name) {
            alert('กรุณากรอกรหัสหน่วยงานและชื่อหน่วยงาน');
            return;
        }
        
        // Debug: แสดงข้อมูลที่จะส่ง
        console.log('📤 Sending site data:', formData);
        console.log('📋 shiftAssignments detail:', JSON.stringify(formData.shiftAssignments, null, 2));
        
        // Save site first
        const savedSite = await onSave(formData);
        
        // Upload contract file if selected
        if (contractFile && savedSite?.id) {
            await handleUploadContractFile(savedSite.id);
            // Reload page to refresh data after file upload
            window.location.reload();
            return;
        }
        
        onClose();
    };
    
    // Contract file handlers
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
            const fileExt = '.' + file.name.split('.').pop().toLowerCase();
            if (!allowedTypes.includes(fileExt)) {
                alert(`ไฟล์ไม่ถูกต้อง กรุณาอัปโหลดไฟล์ประเภท: ${allowedTypes.join(', ')}`);
                return;
            }
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('ไฟล์ใหญ่เกินไป กรุณาอัปโหลดไฟล์ขนาดไม่เกิน 10MB');
                return;
            }
            setContractFile(file);
            setContractFileName(file.name);
        }
    };
    
    const handleUploadContractFile = async (siteId) => {
        if (!contractFile) return;
        
        setUploadingFile(true);
        try {
            const formDataFile = new FormData();
            formDataFile.append('file', contractFile);
            
            await api.post(`/sites/${siteId}/contract-file`, formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('✅ Contract file uploaded successfully');
        } catch (error) {
            console.error('❌ Error uploading contract file:', error);
            alert('เกิดข้อผิดพลาดในการอัปโหลดเอกสารสัญญา');
        } finally {
            setUploadingFile(false);
        }
    };
    
    const handleDownloadContractFile = async () => {
        if (!formData.id) return;
        
        try {
            const response = await api.get(`/sites/${formData.id}/contract-file`, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', contractFileName || 'contract_file');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('❌ Error downloading contract file:', error);
            alert('เกิดข้อผิดพลาดในการดาวน์โหลดเอกสารสัญญา');
        }
    };
    
    const handleViewContractFile = async () => {
        if (!formData.id) return;
        
        try {
            const response = await api.get(`/sites/${formData.id}/contract-file`, {
                responseType: 'blob'
            });
            
            // Determine MIME type from filename
            const ext = (contractFileName || '').toLowerCase().split('.').pop();
            let mimeType = 'application/octet-stream';
            if (ext === 'pdf') mimeType = 'application/pdf';
            else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
            else if (ext === 'png') mimeType = 'image/png';
            else if (ext === 'doc') mimeType = 'application/msword';
            else if (ext === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            
            // Create blob with correct type
            const blob = new Blob([response.data], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            
            // Open in new tab
            const newTab = window.open(url, '_blank');
            
            // If popup blocked, show alert
            if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
                alert('กรุณาอนุญาต popup ใน browser หรือใช้ปุ่มดาวน์โหลดแทน');
                // Fallback: download
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', contractFileName || 'contract_file');
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
            
            // Cleanup after a delay
            setTimeout(() => window.URL.revokeObjectURL(url), 30000);
        } catch (error) {
            console.error('❌ Error viewing contract file:', error);
            alert('เกิดข้อผิดพลาดในการเปิดดูเอกสารสัญญา');
        }
    };
    
    const handleDeleteContractFile = async () => {
        if (!formData.id) {
            // If site not saved yet, just clear local state
            setContractFile(null);
            setContractFileName('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }
        
        if (!window.confirm('ต้องการลบเอกสารสัญญาหรือไม่?')) return;
        
        try {
            await api.delete(`/sites/${formData.id}/contract-file`);
            setContractFile(null);
            setContractFileName('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            alert('ลบเอกสารสัญญาสำเร็จ');
        } catch (error) {
            console.error('❌ Error deleting contract file:', error);
            alert('เกิดข้อผิดพลาดในการลบเอกสารสัญญา');
        }
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
                        
                        {/* Contract File Upload */}
                        <div className="mt-4 pt-4 border-t">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                เอกสารสัญญา
                            </label>
                            <div className="flex items-center gap-3 flex-wrap">
                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    className="hidden"
                                />
                                
                                {/* Upload button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingFile}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    <Upload className="w-4 h-4" />
                                    {uploadingFile ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}
                                </button>
                                
                                {/* File info */}
                                {contractFileName && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                        <FileText className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-green-700 max-w-[200px] truncate" title={contractFileName}>
                                            {contractFileName}
                                        </span>
                                        
                                        {/* View button (only if site already saved and has file in server) */}
                                        {formData.id && !contractFile && (
                                            <button
                                                type="button"
                                                onClick={handleViewContractFile}
                                                className="p-1 text-green-600 hover:text-green-800"
                                                title="ดูเอกสาร"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        )}
                                        
                                        {/* Download button (only if site already saved and has file in server) */}
                                        {formData.id && !contractFile && (
                                            <button
                                                type="button"
                                                onClick={handleDownloadContractFile}
                                                className="p-1 text-blue-600 hover:text-blue-800"
                                                title="ดาวน์โหลด"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}
                                        
                                        {/* Delete button */}
                                        <button
                                            type="button"
                                            onClick={handleDeleteContractFile}
                                            className="p-1 text-red-500 hover:text-red-700"
                                            title="ลบไฟล์"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                
                                {!contractFileName && (
                                    <span className="text-sm text-gray-500">
                                        รองรับไฟล์ PDF, Word, รูปภาพ (ไม่เกิน 10MB)
                                    </span>
                                )}
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
                                        {/* Header: ตำแหน่งงาน + ปุ่มลบ */}
                                        <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-indigo-700 mb-1.5">
                                                    ชื่อ/ตำแหน่งงาน <span className="text-red-500">*</span>
                                                </label>
                                                <div className={`relative position-search-${index}`}>
                                                    <input
                                                        type="text"
                                                        value={positionSearches[index] !== undefined ? positionSearches[index] : detail.position}
                                                        onChange={(e) => handlePositionSearch(index, e.target.value)}
                                                        onFocus={() => setShowPositionDropdowns(prev => ({ ...prev, [index]: true }))}
                                                        placeholder="🔍 ค้นหาหรือพิมพ์ชื่อบริการ..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                                                    />
                                                    {showPositionDropdowns[index] && getFilteredServices(index).length > 0 && (
                                                        <div className="absolute z-50 w-full mt-1 bg-white border border-indigo-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                            {getFilteredServices(index).map(service => (
                                                                <div
                                                                    key={service.id}
                                                                    onClick={() => handlePositionSelect(index, service)}
                                                                    className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0"
                                                                >
                                                                    <div className="font-medium text-sm text-gray-900">{service.serviceName}</div>
                                                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-600">
                                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded">{service.serviceCode}</span>
                                                                        <span className="text-green-600 font-medium">฿{service.hiringRate?.toLocaleString()}</span>
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
                                                className="ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="ลบรายการ"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        {/* Body: แบ่งเป็น 3 กลุ่ม */}
                                        <div className="space-y-3">
                                            {/* กลุ่ม 1: ข้อมูลพื้นฐาน */}
                                            <div className="grid grid-cols-4 gap-2">
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">จำนวน</label>
                                                    <input
                                                        type="number"
                                                        value={detail.quantity || 0}
                                                        onChange={(e) => handleEmploymentChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-indigo-500"
                                                        min="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">วันทำงาน</label>
                                                    <input
                                                        type="number"
                                                        value={detail.workingDays || 30}
                                                        onChange={(e) => handleEmploymentChange(index, 'workingDays', parseInt(e.target.value) || 30)}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-indigo-500"
                                                        min="1"
                                                        max="31"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-blue-700 font-semibold mb-1">รายได้/วัน (฿)</label>
                                                    <input
                                                        type="number"
                                                        value={detail.dailyIncome || 0}
                                                        onChange={(e) => handleEmploymentChange(index, 'dailyIncome', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1.5 border border-blue-300 bg-blue-50 rounded text-right text-sm font-semibold text-blue-700 focus:ring-1 focus:ring-blue-500"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">ราคาจ้าง (฿)</label>
                                                    <input
                                                        type="number"
                                                        value={detail.hiringRate || 0}
                                                        onChange={(e) => handleEmploymentChange(index, 'hiringRate', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-indigo-500"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </div>

                                            {/* กลุ่ม 2: ค่าใช้จ่ายเพิ่มเติม */}
                                            <div className="grid grid-cols-5 gap-2">
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">ค่าตำแหน่ง (฿)</label>
                                                    <input
                                                        type="number"
                                                        value={detail.positionAllowance || 0}
                                                        onChange={(e) => handleEmploymentChange(index, 'positionAllowance', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-indigo-500"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">เบี้ยขยัน (฿)</label>
                                                    <input
                                                        type="number"
                                                        value={detail.diligenceBonus || 0}
                                                        onChange={(e) => handleEmploymentChange(index, 'diligenceBonus', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-indigo-500"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">7DAY (฿)</label>
                                                    <input
                                                        type="number"
                                                        value={detail.sevenDayBonus || 0}
                                                        onChange={(e) => handleEmploymentChange(index, 'sevenDayBonus', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-indigo-500"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">ค่าจุด (฿)</label>
                                                    <input
                                                        type="number"
                                                        value={detail.pointBonus || 0}
                                                        onChange={(e) => handleEmploymentChange(index, 'pointBonus', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-indigo-500"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">ค่าอื่นๆ (฿)</label>
                                                    <input
                                                        type="number"
                                                        value={detail.otherAllowance || 0}
                                                        onChange={(e) => handleEmploymentChange(index, 'otherAllowance', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-indigo-500"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </div>

                                            {/* กลุ่ม 3: สรุปต้นทุน + หมายเหตุ */}
                                            {detail.dailyIncome > 0 && (
                                                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                                    <div className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-gray-600">ต้นทุน/คน:</span>
                                                            <span className="text-sm font-bold text-orange-600">
                                                                ฿{(((detail.dailyIncome || 0) * (detail.workingDays || 30)) + (detail.positionAllowance || 0) + (detail.diligenceBonus || 0) + (detail.sevenDayBonus || 0) + (detail.pointBonus || 0) + (detail.otherAllowance || 0)).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-gray-600">รวม ({detail.quantity || 0} คน):</span>
                                                            <span className="text-sm font-bold text-green-700">
                                                                ฿{((((detail.dailyIncome || 0) * (detail.workingDays || 30)) + (detail.positionAllowance || 0) + (detail.diligenceBonus || 0) + (detail.sevenDayBonus || 0) + (detail.pointBonus || 0) + (detail.otherAllowance || 0)) * (detail.quantity || 0)).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">หมายเหตุ</label>
                                                <textarea
                                                    value={detail.remarks || ''}
                                                    onChange={(e) => handleEmploymentChange(index, 'remarks', e.target.value)}
                                                    placeholder="เพิ่มหมายเหตุ (ถ้ามี)..."
                                                    rows="1"
                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-sm resize-none"
                                                />
                                            </div>
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
                        </div>
                    </div>

                    {/* Section 3: ข้อมูลกะงาน */}
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 mt-6">
                        <div className="flex justify-between items-center pb-3 mb-4 border-b-2 border-amber-200">
                            <div>
                                <h3 className="font-semibold text-lg text-amber-700">3. ข้อมูลกะงาน</h3>
                                <p className="text-xs text-gray-600 mt-1">กำหนดกะและจำนวนคนต่อกะ</p>
                            </div>
                            <button
                                type="button"
                                onClick={addShiftRow}
                                disabled={shifts.length === 0}
                                className="flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 shadow-md hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มกะ
                            </button>
                        </div>
                        
                        {/* แจ้งเตือนถ้ามีกะที่มีคนจัดแล้ว */}
                        {shiftsWithGuards.length > 0 && (
                            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg flex items-center gap-2">
                                <span className="text-yellow-600">⚠️</span>
                                <span className="text-sm text-yellow-800">กะที่มีการจัดคนแล้วไม่สามารถลบได้ (กรุณาลบตารางงานก่อน)</span>
                            </div>
                        )}
                        
                        {shifts.length === 0 ? (
                            <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-amber-200">
                                <p className="text-amber-600 font-medium">ไม่พบข้อมูลกะในระบบ</p>
                                <p className="text-sm text-gray-500 mt-1">กรุณาเพิ่มข้อมูลกะในเมนู "กะงาน" ก่อน</p>
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleShiftDragEnd}>
                                <SortableContext items={formData.shiftAssignments?.map((_, i) => `shift-${i}`) || []} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-3">
                                        {formData.shiftAssignments && formData.shiftAssignments.length > 0 ? (
                                            formData.shiftAssignments.map((shiftAssignment, index) => {
                                                const selectedShift = shifts.find(s => s.id === parseInt(shiftAssignment.shiftId));
                                                // ตรวจสอบว่ากะนี้มีคนจัดแล้วหรือไม่
                                                const isShiftLocked = shiftsWithGuards.includes(shiftAssignment.shiftCode);
                                                return (
                                                    <SortableShiftItem
                                                        key={`shift-${index}`}
                                                        id={`shift-${index}`}
                                                        index={index}
                                                        shiftAssignment={shiftAssignment}
                                                        selectedShift={selectedShift}
                                                        isShiftLocked={isShiftLocked}
                                                        shifts={shifts}
                                                        handleShiftChange={handleShiftChange}
                                                        removeShiftRow={removeShiftRow}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-amber-200">
                                                <PlusCircle className="w-12 h-12 mx-auto text-amber-400 mb-3" />
                                                <p className="text-gray-500 font-medium">ยังไม่มีการกำหนดกะ</p>
                                                <p className="text-sm text-gray-400 mt-1">คลิกปุ่ม "เพิ่มกะ" เพื่อเริ่มต้น</p>
                                            </div>
                                        )}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
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
