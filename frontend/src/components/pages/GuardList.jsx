// frontend/src/components/pages/GuardList.jsx
import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import GuardFormModal from '../modals/GuardFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import GenericExcelImportModal from '../modals/GenericExcelImportModal';
import EntityHistoryModal from '../modals/EntityHistoryModal';
import { PlusCircle, Edit, Trash2, Download, Search, X, Upload, History } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';
import { useBanks } from '../../hooks/useBanks';
import * as XLSX from 'xlsx';

export default function GuardList() {
    const [guards, setGuards] = useState([]);
    const { banks } = useBanks();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [guardToDelete, setGuardToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGuard, setSelectedGuard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // History Modal States
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedGuardForHistory, setSelectedGuardForHistory] = useState(null);

    // Selection States
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
    
    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchGuards = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/guards');

            // แปลงข้อมูลจาก Backend ให้ตรงกับที่ Modal ต้องการ
            setGuards(response.data.map(g => ({
                ...g,
                // Map all 24 fields from API
                id: g.id,
                guardId: g.guardId,
                // Personal Information
                title: g.title || '',
                firstName: g.firstName || '',
                lastName: g.lastName || '',
                birthDate: g.birthDate || '',
                nationality: g.nationality || '',
                religion: g.religion || '',
                idCardNumber: g.idCardNumber || '',
                // Addresses
                addressIdCard: g.addressIdCard || '',
                addressCurrent: g.addressCurrent || '',
                phone: g.phone || '',
                // Education & License
                education: g.education || '',
                licenseNumber: g.licenseNumber || '',
                licenseExpiry: g.licenseExpiry || '',
                // Employment
                startDate: g.startDate || '',
                status: g.isActive ? 'Active' : 'Inactive',
                // Banking
                bankAccountName: g.bankAccountName || '',
                bankAccountNo: g.bankAccountNo || '',
                bankName: banks.find(b => b.code === g.bankCode)?.name || '',
                bankCode: g.bankCode || '',
                // Family Status
                maritalStatus: g.maritalStatus || '',
                spouseName: g.spouseName || '',
                // Emergency Contact
                emergencyContactName: g.emergencyContactName || '',
                emergencyContactPhone: g.emergencyContactPhone || '',
                emergencyContactRelation: g.emergencyContactRelation || '',
                // Legacy fields (for backward compatibility)
                address: g.address || '',
                position: g.position || '',
                department: g.department || '',
                createdAt: g.createdAt
            })));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (banks.length > 0) {
            fetchGuards();
        }
    }, [banks]);

    const handleOpenModal = (guard = null) => {
        setSelectedGuard(guard);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGuard(null);
    };

    const handleSaveGuard = async (guardData) => {
        try {
            const payload = {
                title: guardData.title || null,
                firstName: guardData.firstName,
                lastName: guardData.lastName,
                birthDate: guardData.birthDate || null,
                nationality: guardData.nationality || null,
                religion: guardData.religion || null,
                addressIdCard: guardData.addressIdCard || null,
                addressCurrent: guardData.addressCurrent || null,
                phone: guardData.phone || null,
                education: guardData.education || null,
                licenseNumber: guardData.licenseNumber || null,
                licenseExpiry: guardData.licenseExpiry || null,
                startDate: guardData.startDate || null,
                bankAccountName: guardData.bankAccountName || null,
                bankAccountNo: guardData.bankAccountNo || null,
                bankCode: banks.find(b => b.name === guardData.bankName)?.code || null,
                idCardNumber: guardData.idCardNumber || null,
                maritalStatus: guardData.maritalStatus || null,
                spouseName: guardData.spouseName || null,
                emergencyContactName: guardData.emergencyContactName || null,
                emergencyContactPhone: guardData.emergencyContactPhone || null,
                emergencyContactRelation: guardData.emergencyContactRelation || null,
                isActive: guardData.status === 'Active'
            };

            if (guardData.id) {
                // Update - send guardId for reference but backend won't change it
                payload.guardId = guardData.guardId;
                await api.put(`/guards/${guardData.id}`, payload);
            } else {
                // Create - backend will auto-generate guardId
                await api.post('/guards', payload);
            }
            fetchGuards();
            handleCloseModal();
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const openDeleteConfirm = (guard) => {
        setGuardToDelete(guard);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (guardToDelete) {
            try {
                await api.delete(`/guards/${guardToDelete.id}`);
                fetchGuards();
                setIsConfirmOpen(false);
                setGuardToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    // Filter guards based on search
    const filteredGuards = guards.filter(g => {
        const search = searchTerm.toLowerCase();
        const fullName = `${g.firstName} ${g.lastName}`.toLowerCase();
        return (
            g.guardId?.toLowerCase().includes(search) ||
            fullName.includes(search) ||
            g.firstName?.toLowerCase().includes(search) ||
            g.lastName?.toLowerCase().includes(search) ||
            g.phone?.toLowerCase().includes(search) ||
            g.address?.toLowerCase().includes(search)
        );
    });

    const paginatedGuards = filteredGuards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Selection handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(paginatedGuards.map(g => g.id));
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

    const isAllSelected = paginatedGuards.length > 0 && selectedIds.length === paginatedGuards.length;
    const isSomeSelected = selectedIds.length > 0 && selectedIds.length < paginatedGuards.length;

    // Bulk delete handler
    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/guards/${id}`)));
            fetchGuards();
            setSelectedIds([]);
            setIsBulkDeleteConfirmOpen(false);
            alert(`✅ ลบข้อมูลพนักงาน รปภ. ${selectedIds.length} รายการเรียบร้อยแล้ว`);
        } catch (error) {
            alert('❌ เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    };

    // Export to Excel handler
    const handleExportExcel = () => {
        const dataToExport = selectedIds.length > 0
            ? guards.filter(g => selectedIds.includes(g.id))
            : guards;

        const exportData = dataToExport.map(g => ({
            'รหัสพนักงาน': g.guardId,
            'คำนำหน้า': g.title || '-',
            'ชื่อ': g.firstName,
            'นามสกุล': g.lastName,
            'วันเกิด': g.birthDate || '-',
            'สัญชาติ': g.nationality || '-',
            'ศาสนา': g.religion || '-',
            'เลขบัตรประชาชน': g.idCardNumber || '-',
            'ที่อยู่ตามบัตร': g.addressIdCard || '-',
            'ที่อยู่ปัจจุบัน': g.addressCurrent || '-',
            'เบอร์โทร': g.phone || '-',
            'การศึกษา': g.education || '-',
            'เลขใบอนุญาต': g.licenseNumber || '-',
            'วันหมดอายุใบอนุญาต': g.licenseExpiry || '-',
            'วันเริ่มงาน': g.startDate || '-',
            'ชื่อบัญชี': g.bankAccountName || '-',
            'เลขบัญชี': g.bankAccountNo || '-',
            'ธนาคาร': g.bankName || '-',
            'สถานภาพสมรส': g.maritalStatus || '-',
            'ชื่อคู่สมรส': g.spouseName || '-',
            'ผู้ติดต่อฉุกเฉิน': g.emergencyContactName || '-',
            'เบอร์ฉุกเฉิน': g.emergencyContactPhone || '-',
            'ความสัมพันธ์': g.emergencyContactRelation || '-',
            'สถานะ': g.status === 'Active' ? 'ทำงาน' : 'ลาออก'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Guards');
        
        const fileName = selectedIds.length > 0
            ? `guards_selected_${new Date().toISOString().split('T')[0]}.xlsx`
            : `guards_all_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
        alert(`📊 Export ข้อมูล ${dataToExport.length} รายการเรียบร้อยแล้ว`);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                {/* Search Bar */}
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาจาก รหัส, ชื่อ, เบอร์โทร..."
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
                        onClick={handleExportExcel}
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
                                <th className="text-left p-3 font-semibold" style={{width: '150px'}}>เบอร์โทร</th>
                                <th className="text-left p-3 font-semibold" style={{width: '100px'}}>สถานะ</th>
                                <th className="text-left p-3 font-semibold" style={{width: '100px'}}>การกระทำ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedGuards.map(g => (
                                <tr key={g.id} className={`hover:bg-gray-50 border-b ${selectedIds.includes(g.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(g.id)}
                                            onChange={() => handleSelectOne(g.id)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-3 truncate" title={g.guardId}>{g.guardId}</td>
                                    <td className="p-3 truncate" title={`${g.firstName} ${g.lastName}`}>{g.firstName} {g.lastName}</td>
                                    <td className="p-3 truncate" title={g.phone}>{g.phone}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${g.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {g.isActive ? 'ทำงาน' : 'ลาออก'}
                                        </span>
                                    </td>
                                    <td className="p-3 flex space-x-2">
                                        <button 
                                            onClick={() => {
                                                setSelectedGuardForHistory({
                                                    id: g.id,
                                                    name: `${g.firstName} ${g.lastName}`,
                                                    code: g.guardId
                                                });
                                                setIsHistoryModalOpen(true);
                                            }}
                                            className="text-purple-500 hover:text-purple-700"
                                            title="ดูประวัติ"
                                        >
                                            <History className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleOpenModal(g)} className="text-blue-500 hover:text-blue-700"><Edit className="w-5 h-5" /></button>
                                        <button onClick={() => openDeleteConfirm(g)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
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
                totalItems={filteredGuards.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                }}
            />

            <GuardFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveGuard}
                guard={selectedGuard}
                banks={banks}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="ยืนยันการลบพนักงาน"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ "${guardToDelete?.firstName} ${guardToDelete?.lastName}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />

            <ConfirmationModal
                isOpen={isBulkDeleteConfirmOpen}
                onClose={() => setIsBulkDeleteConfirmOpen(false)}
                onConfirm={handleBulkDelete}
                title="ยืนยันการลบข้อมูลหลายรายการ"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลพนักงาน รปภ. ${selectedIds.length} รายการ? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />

            <EntityHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => {
                    setIsHistoryModalOpen(false);
                    setSelectedGuardForHistory(null);
                }}
                entityType="guards"
                entityId={selectedGuardForHistory?.code}
                entityName={selectedGuardForHistory?.name}
            />

            <GenericExcelImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    setIsImportModalOpen(false);
                    fetchGuards();
                }}
                entityType="guards"
                title="Import ข้อมูลพนักงาน รปภ."
            />
        </div>
    );
}