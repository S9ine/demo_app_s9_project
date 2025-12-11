// frontend/src/components/pages/StaffList.jsx
import React, { useState, useEffect } from 'react'
import api from '../../config/api';
import StaffFormModal from '../modals/StaffFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import GenericExcelImportModal from '../modals/GenericExcelImportModal';
import { PlusCircle, Edit, Trash2, Download, Search, X, Upload } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';
import { useBanks } from '../../hooks/useBanks';
import * as XLSX from 'xlsx';

export default function StaffList() {
    const [staff, setStaff] = useState([]);
    const { banks } = useBanks();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Selection States
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
    
    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/staff');
            
            setStaff(response.data.map(s => ({
                ...s,
                staffId: s.guardId, // Backend ใช้ฟิลด์ guardId แทน staffId ในบางโมเดล (Reuse logic)
                position: s.position || '',
                department: s.department || '',
                title: 'นาย', // Mock data
                status: s.isActive ? 'Active' : 'Resigned',
                bankName: banks.find(b => b.code === s.bankCode)?.name || s.bankCode || ''
            })));
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (banks.length > 0) {
            fetchStaff();
        }
    }, [banks]);

    const handleOpenModal = (staffMember = null) => {
        setSelectedStaff(staffMember);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStaff(null);
    };

    const handleSaveStaff = async (staffData) => {
        try {
            const payload = {
                guardId: staffData.staffId,
                firstName: staffData.firstName,
                lastName: staffData.lastName,
                idCardNumber: staffData.idCardNumber || null,
                phone: staffData.phone,
                address: staffData.address,
                position: staffData.position || null,
                department: staffData.department || null,
                
                // ข้อมูลวันที่
                startDate: staffData.startDate || null,
                birthDate: staffData.birthDate || null,
                
                // ข้อมูลเงินเดือน
                salary: staffData.salary ? parseFloat(staffData.salary) : null,
                salaryType: staffData.salaryType || null,
                
                // ข้อมูลการรับเงิน
                paymentMethod: staffData.paymentMethod || null,
                bankAccountNo: staffData.bankAccountNo || "",
                bankCode: staffData.bankCode || "",
                
                isActive: staffData.status === 'Active',
            };

            if (staffData.id) {
                await api.put(`/staff/${staffData.id}`, payload);
            } else {
                await api.post('/staff', payload);
            }
            fetchStaff();
            handleCloseModal();
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const openDeleteConfirm = (staffMember) => {
        setStaffToDelete(staffMember);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (staffToDelete) {
            try {
                await api.delete(`/staff/${staffToDelete.id}`);
                fetchStaff();
                setIsConfirmOpen(false);
                setStaffToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    // Filter staff based on search
    const filteredStaff = staff.filter(s => {
        const search = searchTerm.toLowerCase();
        const fullName = `${s.title}${s.firstName} ${s.lastName}`.toLowerCase();
        return (
            s.staffId?.toLowerCase().includes(search) ||
            fullName.includes(search) ||
            s.firstName?.toLowerCase().includes(search) ||
            s.lastName?.toLowerCase().includes(search) ||
            s.phone?.toLowerCase().includes(search) ||
            s.position?.toLowerCase().includes(search) ||
            s.department?.toLowerCase().includes(search)
        );
    });

    const paginatedStaff = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Selection handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(paginatedStaff.map(s => s.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const isAllSelected = paginatedStaff.length > 0 && selectedIds.length === paginatedStaff.length;
    const isSomeSelected = selectedIds.length > 0 && selectedIds.length < paginatedStaff.length;

    // Bulk delete handler
    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/staff/${id}`)));
            fetchStaff();
            setSelectedIds([]);
            setIsBulkDeleteConfirmOpen(false);
            alert(`✅ ลบข้อมูลพนักงานภายใน ${selectedIds.length} รายการเรียบร้อยแล้ว`);
        } catch (error) {
            alert('❌ เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    };

    // Export to Excel handler
    const handleExportExcel = () => {
        const dataToExport = selectedIds.length > 0
            ? staff.filter(s => selectedIds.includes(s.id))
            : staff;

        const exportData = dataToExport.map(s => ({
            'รหัสพนักงาน': s.staffId,
            'คำนำหน้า': s.title || '-',
            'ชื่อ': s.firstName,
            'นามสกุล': s.lastName,
            'ตำแหน่ง': s.position || '-',
            'แผนก': s.department || '-',
            'เบอร์โทร': s.phone || '-',
            'ที่อยู่': s.address || '-',
            'เลขบัตรประชาชน': s.idCardNumber || '-',
            'วันเริ่มงาน': s.startDate || '-',
            'วันเกิด': s.birthDate || '-',
            'เงินเดือน': s.salary || '-',
            'ประเภทเงินเดือน': s.salaryType || '-',
            'วิธีรับเงิน': s.paymentMethod || '-',
            'เลขบัญชี': s.bankAccountNo || '-',
            'ธนาคาร': s.bankName || '-',
            'สถานะ': s.status === 'Active' ? 'ทำงาน' : 'ลาออก'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Staff');
        
        const fileName = selectedIds.length > 0
            ? `staff_selected_${new Date().toISOString().split('T')[0]}.xlsx`
            : `staff_all_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
        alert(`📊 Export ข้อมูล ${dataToExport.length} รายการเรียบร้อยแล้ว`);
    };

    // เพิ่ม state สำหรับยืนยัน Export
    const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                {/* Search Bar */}
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาจาก รหัส, ชื่อ, ตำแหน่ง, แผนก..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setCurrentPage(1);
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsExportConfirmOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
                        title={selectedIds.length > 0 ? `Export ${selectedIds.length} รายการที่เลือก` : 'Export ทั้งหมด'}
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Export Excel {selectedIds.length > 0 && `(${selectedIds.length})`}
                    </button>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <Upload className="w-5 h-5 mr-2" />
                        Import Excel
                    </button>
                    <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มพนักงาน
                    </button>
                </div>
            </div>
            
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 flex items-center justify-between rounded-lg">
                    <div className="flex items-center">
                        <span className="text-blue-800 font-semibold">เลือก {selectedIds.length} รายการ</span>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setIsBulkDeleteConfirmOpen(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            ลบที่เลือก ({selectedIds.length})
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                        >
                            <X className="w-4 h-4 mr-2" />
                            ยกเลิก
                        </button>
                    </div>
                </div>
            )}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-y-scroll" style={{maxHeight: 'calc(100vh - 280px)'}}>
                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>
                ) : (
                    <table className="w-full text-sm table-fixed">
                        <thead className="sticky top-0 z-10 bg-gray-100 border-b-2 border-gray-300">
                            <tr>
                                <th className="text-left p-3 font-semibold w-12">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={input => {
                                            if (input) {
                                                input.indeterminate = isSomeSelected;
                                            }
                                        }}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 cursor-pointer"
                                    />
                                </th>
                                <th className="text-left p-3 font-semibold" style={{width: '120px'}}>รหัส</th>
                                <th className="text-left p-3 font-semibold" style={{width: '250px'}}>ชื่อ-สกุล</th>
                                <th className="text-left p-3 font-semibold" style={{width: '150px'}}>ตำแหน่ง</th>
                                <th className="text-left p-3 font-semibold" style={{width: '150px'}}>เบอร์โทร</th>
                                <th className="text-left p-3 font-semibold" style={{width: '100px'}}>สถานะ</th>
                                <th className="text-left p-3 font-semibold" style={{width: '100px'}}>การกระทำ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStaff.map(s => (
                                <tr key={s.id} className={`hover:bg-gray-50 border-b ${selectedIds.includes(s.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(s.id)}
                                            onChange={() => handleSelectOne(s.id)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-3 truncate" title={s.staffId}>{s.staffId}</td>
                                    <td className="p-3 truncate" title={`${s.title}${s.firstName} ${s.lastName}`}>{s.title}{s.firstName} {s.lastName}</td>
                                    <td className="p-3 truncate" title={s.position}>{s.position}</td>
                                    <td className="p-3 truncate" title={s.phone}>{s.phone}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {s.status === 'Active' ? 'ทำงาน' : 'ลาออก'}
                                        </span>
                                    </td>
                                    <td className="p-3 flex space-x-2">
                                        <button onClick={() => handleOpenModal(s)} className="text-blue-500 hover:text-blue-700"><Edit className="w-5 h-5" /></button>
                                        <button onClick={() => openDeleteConfirm(s)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                </div>
            </div>

            <PaginationControls
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredStaff.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                }}
            />

            <StaffFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveStaff}
                staffMember={selectedStaff}
                banks={banks}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="ยืนยันการลบพนักงาน"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ "${staffToDelete?.firstName} ${staffToDelete?.lastName}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />

            <ConfirmationModal
                isOpen={isBulkDeleteConfirmOpen}
                onClose={() => setIsBulkDeleteConfirmOpen(false)}
                onConfirm={handleBulkDelete}
                title="ยืนยันการลบข้อมูลหลายรายการ"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลพนักงานภายใน ${selectedIds.length} รายการ? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />

            <ConfirmationModal
                isOpen={isExportConfirmOpen}
                onClose={() => setIsExportConfirmOpen(false)}
                onConfirm={() => {
                    setIsExportConfirmOpen(false);
                    handleExportExcel();
                }}
                title="ยืนยันการ Export ข้อมูล"
                message={`คุณต้องการ Export ข้อมูลพนักงานภายใน${selectedIds.length > 0 ? ` ${selectedIds.length} รายการที่เลือก` : 'ทั้งหมด'} ใช่หรือไม่?`}
            />

            <GenericExcelImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    setIsImportModalOpen(false);
                    fetchStaff();
                }}
                entityType="staff"
                title="Import ข้อมูลพนักงานภายใน"
            />
        </div>
    );
}