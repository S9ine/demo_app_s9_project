// frontend/src/components/pages/SiteList.jsx
import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import SiteFormModal from '../modals/SiteFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import GenericExcelImportModal from '../modals/GenericExcelImportModal';
import EntityHistoryModal from '../modals/EntityHistoryModal';
import { PlusCircle, Edit, Trash2, Download, Search, X, Upload, History } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';
import * as XLSX from 'xlsx';

export default function SiteList() {
    const [sites, setSites] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [siteToDelete, setSiteToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // History Modal States
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedSiteForHistory, setSelectedSiteForHistory] = useState(null);

    // Selection States
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
    
    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [sitesRes, customersRes] = await Promise.all([
                api.get('/sites'),
                api.get('/customers')
            ]);
            setSites(sitesRes.data);
            setCustomers(customersRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (site = null) => {
        setSelectedSite(site);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSite(null);
    };

    const handleSaveSite = async (siteData) => {
        try {
            // แปลงโครงสร้างข้อมูลให้ตรงกับ Backend
            const payload = {
                siteCode: siteData.siteCode,
                name: siteData.name,
                customerId: String(siteData.customerId),
                customerCode: siteData.customerCode,
                customerName: siteData.customerName,
                contractStartDate: siteData.contractStartDate || null,
                contractEndDate: siteData.contractEndDate || null,
                address: siteData.address || "",
                subDistrict: siteData.subDistrict || "",
                district: siteData.district || "",
                province: siteData.province || "",
                postalCode: siteData.postalCode || "",
                contactPerson: siteData.contactPerson || "",
                phone: siteData.phone || "",
                employmentDetails: siteData.employmentDetails || [],
                contractedServices: [],  // เก็บไว้ backward compatible
                isActive: siteData.isActive !== undefined ? siteData.isActive : true
            };

            if (siteData.id) {
                await api.put(`/sites/${siteData.id}`, payload);
            } else {
                await api.post('/sites', payload);
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const openDeleteConfirm = (site) => {
        setSiteToDelete(site);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (siteToDelete) {
            try {
                await api.delete(`/sites/${siteToDelete.id}`);
                fetchData();
                setIsConfirmOpen(false);
                setSiteToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    // Filter sites based on search
    const filteredSites = sites.filter(s => {
        const search = searchTerm.toLowerCase();
        const customerName = s.customerName || customers.find(c => String(c.id) === String(s.customerId))?.name || '';
        return (
            s.siteCode?.toLowerCase().includes(search) ||
            s.name?.toLowerCase().includes(search) ||
            customerName.toLowerCase().includes(search) ||
            s.customerCode?.toLowerCase().includes(search) ||
            s.address?.toLowerCase().includes(search) ||
            s.district?.toLowerCase().includes(search) ||
            s.province?.toLowerCase().includes(search)
        );
    });

    const paginatedSites = filteredSites.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Selection handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(paginatedSites.map(s => s.id));
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

    const isAllSelected = paginatedSites.length > 0 && selectedIds.length === paginatedSites.length;
    const isSomeSelected = selectedIds.length > 0 && selectedIds.length < paginatedSites.length;

    // Bulk delete handler
    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/sites/${id}`)));
            fetchData();
            setSelectedIds([]);
            setIsBulkDeleteConfirmOpen(false);
            alert(`✅ ลบข้อมูลหน่วยงาน ${selectedIds.length} รายการเรียบร้อยแล้ว`);
        } catch {
            alert('❌ เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    };

    // Export to Excel handler
    const handleExportExcel = () => {
        const dataToExport = selectedIds.length > 0
            ? sites.filter(s => selectedIds.includes(s.id))
            : sites;

        const exportData = dataToExport.map(s => {
            const customerName = s.customerName || customers.find(c => String(c.id) === String(s.customerId))?.name || '-';
            return {
                'รหัสหน่วยงาน': s.siteCode || '-',
                'ชื่อหน่วยงาน': s.name,
                'รหัสลูกค้า': s.customerCode || '-',
                'ชื่อลูกค้า': customerName,
                'ที่อยู่': s.address || '-',
                'ตำบล': s.subDistrict || '-',
                'อำเภอ': s.district || '-',
                'จังหวัด': s.province || '-',
                'รหัสไปรษณีย์': s.postalCode || '-',
                'ผู้ติดต่อ': s.contactPerson || '-',
                'เบอร์โทร': s.phone || '-',
                'วันเริ่มสัญญา': s.contractStartDate || '-',
                'วันสิ้นสุดสัญญา': s.contractEndDate || '-',
                'สถานะ': s.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sites');
        
        const fileName = selectedIds.length > 0
            ? `sites_selected_${new Date().toISOString().split('T')[0]}.xlsx`
            : `sites_all_${new Date().toISOString().split('T')[0]}.xlsx`;
        
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
                        placeholder="ค้นหาจาก รหัส, ชื่อหน่วยงาน, ลูกค้า, ที่อยู่..."
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
                        <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มหน่วยงาน
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
                                <th className="text-left p-3 font-semibold" style={{width: '120px'}}>รหัสหน่วยงาน</th>
                                <th className="text-left p-3 font-semibold" style={{width: '200px'}}>ชื่อหน่วยงาน</th>
                                <th className="text-left p-3 font-semibold" style={{width: '180px'}}>ลูกค้า</th>
                                <th className="text-left p-3 font-semibold" style={{width: '120px'}}>ข้อมูลการจ้าง</th>
                                <th className="text-left p-3 font-semibold" style={{width: '150px'}}>รายได้-ต้นทุน-กำไร</th>
                                <th className="text-left p-3 font-semibold" style={{width: '100px'}}>สถานะ</th>
                                <th className="text-left p-3 font-semibold" style={{width: '120px'}}>การกระทำ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSites.map(s => (
                                <tr key={s.id} className={`hover:bg-gray-50 border-b ${selectedIds.includes(s.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(s.id)}
                                            onChange={() => handleSelectOne(s.id)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-3 font-mono text-sm truncate" title={s.siteCode || '-'}>{s.siteCode || '-'}</td>
                                    <td className="p-3 font-medium truncate" title={s.name}>{s.name}</td>
                                    <td className="p-3 truncate">
                                        <div className="text-sm" title={`${s.customerName || customers.find(c => String(c.id) === String(s.customerId))?.name || "-"} (${s.customerCode || ''})`}>
                                            <div className="font-medium truncate">{s.customerName || customers.find(c => String(c.id) === String(s.customerId))?.name || "-"}</div>
                                            <div className="text-gray-500 text-xs truncate">{s.customerCode || ''}</div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-sm">
                                        {s.employmentDetails && s.employmentDetails.length > 0 ? (
                                            <div className="space-y-1">
                                                <div className="font-semibold text-blue-600">
                                                    รวม {s.employmentDetails.reduce((sum, emp) => sum + (emp.quantity || 0), 0)} คน
                                                </div>
                                                <div className="text-xs text-gray-600 space-y-0.5">
                                                    {s.employmentDetails.map((emp, idx) => (
                                                        <div key={idx} className="truncate" title={`${emp.position}: ${emp.quantity} คน`}>
                                                            {emp.position}: {emp.quantity} คน
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">ไม่มีข้อมูล</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-sm">
                                        {(() => {
                                            if (!s.employmentDetails || s.employmentDetails.length === 0) {
                                                return <span className="text-gray-400">-</span>;
                                            }
                                            
                                            // คำนวณรายได้จากลูกค้า (ค่าจ้างที่ลูกค้าจ้างเรา)
                                            const totalRevenue = s.employmentDetails.reduce((sum, emp) => {
                                                // รายได้ = ราคาจ้าง × จำนวน
                                                const hiringRate = parseFloat(emp.hiringRate || 0);
                                                const quantity = parseFloat(emp.quantity || 0);
                                                return sum + (hiringRate * quantity);
                                            }, 0);
                                            
                                            // คำนวณค่าใช้จ่ายให้รปภ (ต้นทุนที่เราจ่ายให้รปภ)
                                            const totalCost = s.employmentDetails.reduce((sum, emp) => {
                                                // ต้นทุน = (dailyIncome × workingDays) + positionAllowance + diligenceBonus + sevenDayBonus + pointBonus + otherAllowance
                                                const dailyIncome = parseFloat(emp.dailyIncome || 0);
                                                const workingDays = parseFloat(emp.workingDays || 30);
                                                const positionAllowance = parseFloat(emp.positionAllowance || 0);
                                                const diligenceBonus = parseFloat(emp.diligenceBonus || 0);
                                                const sevenDayBonus = parseFloat(emp.sevenDayBonus || 0);
                                                const pointBonus = parseFloat(emp.pointBonus || 0);
                                                const otherAllowance = parseFloat(emp.otherAllowance || 0);
                                                const quantity = parseFloat(emp.quantity || 0);
                                                
                                                const costPerPerson = (dailyIncome * workingDays) + positionAllowance + diligenceBonus + sevenDayBonus + pointBonus + otherAllowance;
                                                return sum + (costPerPerson * quantity);
                                            }, 0);
                                            
                                            // คำนวณกำไร = รายได้จากลูกค้า - ค่าใช้จ่ายให้รปภ
                                            const profit = totalRevenue - totalCost;
                                            
                                            return (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-gray-600">รายได้/เดือน:</span>
                                                        <span className="font-semibold text-blue-600">
                                                            ฿{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-gray-600">ต้นทุน/เดือน:</span>
                                                        <span className="font-semibold text-orange-600">
                                                            ฿{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs border-t pt-1">
                                                        <span className="text-gray-600">กำไร/เดือน:</span>
                                                        <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            ฿{profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {s.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                        </span>
                                    </td>
                                    <td className="p-3 flex space-x-2">
                                        <button 
                                            onClick={() => {
                                                setSelectedSiteForHistory({
                                                    id: s.id,
                                                    name: s.name,
                                                    code: s.siteCode
                                                });
                                                setIsHistoryModalOpen(true);
                                            }}
                                            className="text-purple-500 hover:text-purple-700"
                                            title="ดูประวัติ"
                                        >
                                            <History className="w-5 h-5" />
                                        </button>
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
                totalItems={filteredSites.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                }}
            />

            <SiteFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                site={selectedSite}
                onSave={handleSaveSite}
                customers={customers}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="ยืนยันการลบหน่วยงาน"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบหน่วยงาน "${siteToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />

            <ConfirmationModal
                isOpen={isBulkDeleteConfirmOpen}
                onClose={() => setIsBulkDeleteConfirmOpen(false)}
                onConfirm={handleBulkDelete}
                title="ยืนยันการลบข้อมูลหลายรายการ"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลหน่วยงาน ${selectedIds.length} รายการ? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />

            <ConfirmationModal
                isOpen={isExportConfirmOpen}
                onClose={() => setIsExportConfirmOpen(false)}
                onConfirm={() => {
                    setIsExportConfirmOpen(false);
                    handleExportExcel();
                }}
                title="ยืนยันการ Export ข้อมูล"
                message={`คุณต้องการ Export ข้อมูลหน่วยงาน${selectedIds.length > 0 ? ` ${selectedIds.length} รายการที่เลือก` : 'ทั้งหมด'} ใช่หรือไม่?`}
            />

            <EntityHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => {
                    setIsHistoryModalOpen(false);
                    setSelectedSiteForHistory(null);
                }}
                entityType="sites"
                entityId={selectedSiteForHistory?.code}
                entityName={selectedSiteForHistory?.name}
            />

            <GenericExcelImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    setIsImportModalOpen(false);
                    fetchData();
                }}
                entityType="sites"
                title="Import ข้อมูลหน่วยงาน"
            />
        </div>
    );
}