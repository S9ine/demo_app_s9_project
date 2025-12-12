// frontend/src/components/pages/CustomerList.jsx
import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import CustomerFormModal from '../modals/CustomerFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import ExcelImportModal from '../modals/ExcelImportModal';
import { FullPageLoading } from '../common/LoadingSpinner';
import { PlusCircle, Edit, Trash2, Upload, Download, X, Search } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';
import * as XLSX from 'xlsx';

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Selection States
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
    
    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleOpenModal = (customer = null) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleSaveCustomer = async (customerData) => {
        try {
            const payload = {
                code: customerData.code,
                businessType: customerData.businessType,
                name: customerData.name,
                taxId: customerData.taxId,
                address: customerData.address,
                subDistrict: customerData.subDistrict,
                district: customerData.district,
                province: customerData.province,
                postalCode: customerData.postalCode,
                contactPerson: customerData.contactPerson,
                phone: customerData.phone,
                email: customerData.email,
                secondaryContact: customerData.secondaryContact,
                paymentTerms: customerData.paymentTerms,
                isActive: customerData.isActive !== undefined ? customerData.isActive : true
            };

            if (customerData.id) {
                await api.put(`/customers/${customerData.id}`, payload);
            } else {
                await api.post('/customers', payload);
            }
            fetchCustomers();
            handleCloseModal();
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const openDeleteConfirm = (customer) => {
        setCustomerToDelete(customer);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (customerToDelete) {
            try {
                await api.delete(`/customers/${customerToDelete.id}`);
                fetchCustomers();
                setIsConfirmOpen(false);
                setCustomerToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    // Filter customers based on search
    const filteredCustomers = customers.filter(c => {
        const search = searchTerm.toLowerCase();
        return (
            c.code?.toLowerCase().includes(search) ||
            c.name?.toLowerCase().includes(search) ||
            c.businessType?.toLowerCase().includes(search) ||
            c.phone?.toLowerCase().includes(search) ||
            c.email?.toLowerCase().includes(search) ||
            c.contactPerson?.toLowerCase().includes(search)
        );
    });

    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Selection handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(paginatedCustomers.map(c => c.id));
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

    const isAllSelected = paginatedCustomers.length > 0 && selectedIds.length === paginatedCustomers.length;
    const isSomeSelected = selectedIds.length > 0 && selectedIds.length < paginatedCustomers.length;

    // Bulk delete handler
    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/customers/${id}`)));
            fetchCustomers();
            setSelectedIds([]);
            setIsBulkDeleteConfirmOpen(false);
            alert(`✅ ลบข้อมูลลูกค้า ${selectedIds.length} รายการเรียบร้อยแล้ว`);
        } catch (error) {
            alert('❌ เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    };

    // Export to Excel handler
    const handleExportExcel = () => {
        const dataToExport = selectedIds.length > 0
            ? customers.filter(c => selectedIds.includes(c.id))
            : customers;

        const exportData = dataToExport.map(c => ({
            'รหัสลูกค้า': c.code,
            'ประเภทธุรกิจ': c.businessType || '-',
            'ชื่อลูกค้า': c.name,
            'เลขประจำตัวผู้เสียภาษี': c.taxId || '-',
            'ที่อยู่': c.address || '-',
            'ตำบล': c.subDistrict || '-',
            'อำเภอ': c.district || '-',
            'จังหวัด': c.province || '-',
            'รหัสไปรษณีย์': c.postalCode || '-',
            'ผู้ติดต่อ': c.contactPerson || '-',
            'เบอร์โทร': c.phone || '-',
            'อีเมล': c.email || '-',
            'ผู้ติดต่อสำรอง': c.secondaryContact || '-',
            'เงื่อนไขการชำระเงิน': c.paymentTerms || '-',
            'สถานะ': c.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Customers');
        
        const fileName = selectedIds.length > 0
            ? `customers_selected_${new Date().toISOString().split('T')[0]}.xlsx`
            : `customers_all_${new Date().toISOString().split('T')[0]}.xlsx`;
        
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
                        placeholder="ค้นหาจาก รหัส, ชื่อ, เบอร์โทร, อีเมล..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
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
                <div className="flex items-center gap-3">
                    {/* Excel Group */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border-2 border-gray-200 shadow-sm">
                        <button
                            onClick={() => setIsExportConfirmOpen(true)}
                            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                            title={selectedIds.length > 0 ? `Export ${selectedIds.length} รายการที่เลือก` : 'Export ทั้งหมด'}
                        >
                            <Download className="w-5 h-5" />
                            <span>Export Excel</span>
                            {selectedIds.length > 0 && (
                                <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">{selectedIds.length}</span>
                            )}
                        </button>
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            <Upload className="w-5 h-5" />
                            <span>Import Excel</span>
                        </button>
                    </div>
                    
                    {/* Add Button */}
                    <button 
                        onClick={() => handleOpenModal()} 
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span>เพิ่มลูกค้า</span>
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
                    <FullPageLoading text="กำลังโหลดข้อมูลลูกค้า" />
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
                                <th className="text-left p-3 font-semibold" style={{width: '120px'}}>รหัสลูกค้า</th>
                                <th className="text-left p-3 font-semibold" style={{width: '150px'}}>ประเภทธุรกิจ</th>
                                <th className="text-left p-3 font-semibold" style={{width: '250px'}}>ชื่อลูกค้า</th>
                                <th className="text-left p-3 font-semibold" style={{width: '200px'}}>ที่อยู่</th>
                                <th className="text-left p-3 font-semibold" style={{width: '180px'}}>ข้อมูลติดต่อ</th>
                                <th className="text-left p-3 font-semibold" style={{width: '100px'}}>สถานะ</th>
                                <th className="text-left p-3 font-semibold" style={{width: '100px'}}>การกระทำ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCustomers.map(c => (
                                <tr key={c.id} className={`hover:bg-gray-50 border-b ${selectedIds.includes(c.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(c.id)}
                                            onChange={() => handleSelectOne(c.id)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-3 truncate" title={c.code}>{c.code}</td>
                                    <td className="p-3 truncate" title={c.businessType || '-'}>{c.businessType || '-'}</td>
                                    <td className="p-3 truncate" title={c.name}>{c.name}</td>
                                    <td className="p-3 text-sm truncate" title={[c.address, c.subDistrict, c.district, c.province, c.postalCode].filter(Boolean).join(' ') || '-'}>
                                        {[c.address, c.subDistrict, c.district, c.province, c.postalCode]
                                            .filter(Boolean).join(' ') || '-'}
                                    </td>
                                    <td className="p-3 text-sm" title={[c.contactPerson, c.phone, c.email].filter(Boolean).join(' | ') || '-'}>
                                        <div className="truncate">
                                            {c.contactPerson && <span>{c.contactPerson}</span>}
                                            {c.phone && <span className="text-gray-600">{c.contactPerson ? ' | ' : ''}{c.phone}</span>}
                                            {c.email && <span className="text-gray-600 block truncate">{c.email}</span>}
                                            {!c.contactPerson && !c.phone && !c.email && '-'}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {c.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                        </span>
                                    </td>
                                    <td className="p-3 flex space-x-2">
                                        <button onClick={() => handleOpenModal(c)} className="text-blue-500 hover:text-blue-700"><Edit className="w-5 h-5" /></button>
                                        <button onClick={() => openDeleteConfirm(c)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
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
                totalItems={filteredCustomers.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                }}
            />

            <CustomerFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                customer={selectedCustomer}
                onSave={handleSaveCustomer}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="ยืนยันการลบลูกค้า"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้า "${customerToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />

            <ExcelImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    setIsImportModalOpen(false);
                    fetchCustomers();
                }}
            />

            <ConfirmationModal
                isOpen={isBulkDeleteConfirmOpen}
                onClose={() => setIsBulkDeleteConfirmOpen(false)}
                onConfirm={handleBulkDelete}
                title="ยืนยันการลบข้อมูลหลายรายการ"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้า ${selectedIds.length} รายการ? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />

            <ConfirmationModal
                isOpen={isExportConfirmOpen}
                onClose={() => setIsExportConfirmOpen(false)}
                onConfirm={() => {
                    setIsExportConfirmOpen(false);
                    handleExportExcel();
                }}
                title="ยืนยันการ Export ข้อมูล"
                message={`คุณต้องการ Export ข้อมูลลูกค้า${selectedIds.length > 0 ? ` ${selectedIds.length} รายการที่เลือก` : 'ทั้งหมด'} ใช่หรือไม่?`}
            />
        </div>
    );
}