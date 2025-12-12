import React, { useState, useEffect } from 'react';
import { History, X, User, Calendar, Edit, Plus, Trash2, Upload, Download } from 'lucide-react';
import api from '../../config/api';

const actionColors = {
    'CREATE': 'bg-green-100 text-green-800 border-green-300',
    'UPDATE': 'bg-blue-100 text-blue-800 border-blue-300',
    'DELETE': 'bg-red-100 text-red-800 border-red-300',
    'IMPORT': 'bg-purple-100 text-purple-800 border-purple-300',
    'EXPORT': 'bg-orange-100 text-orange-800 border-orange-300'
};

const actionIcons = {
    'CREATE': Plus,
    'UPDATE': Edit,
    'DELETE': Trash2,
    'IMPORT': Upload,
    'EXPORT': Download
};

const actionLabels = {
    'CREATE': 'สร้าง',
    'UPDATE': 'แก้ไข',
    'DELETE': 'ลบ',
    'IMPORT': 'นำเข้า',
    'EXPORT': 'ส่งออก'
};

export default function EntityHistoryModal({ isOpen, onClose, entityType, entityId, entityName }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedLog, setExpandedLog] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
    });

    useEffect(() => {
        if (isOpen && entityType && entityId) {
            fetchEntityHistory(1);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, entityType, entityId]);

    const fetchEntityHistory = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/audit/logs/${entityType}/${entityId}`, {
                params: { page, limit: 10 }
            });
            setLogs(response.data.data);
            setPagination(response.data.pagination);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching entity history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchEntityHistory(newPage);
            setExpandedLog(null); // Close expanded log when changing page
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFieldName = (field) => {
        const fieldMap = {
            'code': 'รหัส',
            'name': 'ชื่อ',
            'firstName': 'ชื่อ',
            'lastName': 'นามสกุล',
            'phone': 'เบอร์โทร',
            'email': 'อีเมล',
            'address': 'ที่อยู่',
            'isActive': 'สถานะ',
            'businessType': 'ประเภทธุรกิจ',
            'guardId': 'รหัสพนักงาน',
            'staffId': 'รหัสพนักงาน',
            'siteCode': 'รหัสหน่วยงาน',
            'customerId': 'รหัสลูกค้า',
            'bankAccountNo': 'เลขบัญชี',
            'bankCode': 'รหัสธนาคาร',
            'position': 'ตำแหน่ง',
            'department': 'แผนก',
            'salary': 'เงินเดือน',
            'employmentDetails': 'ข้อมูลการจ้าง',
            'workingDays': 'วันทำงานต่อเดือน',
            'shiftAssignments': 'ข้อมูลกะงาน'
        };
        return fieldMap[field] || field;
    };

    const formatValue = (key, value) => {
        if (value === null || value === undefined) return '-';
        
        // ถ้าเป็น employmentDetails (ข้อมูลการจ้าง)
        if (key === 'employmentDetails' && Array.isArray(value)) {
            if (value.length === 0) return 'ไม่มีข้อมูล';
            return (
                <div className="space-y-2 mt-2">
                    {value.map((emp, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <div className="font-semibold text-indigo-700 mb-1">
                                {idx + 1}. {emp.position || '-'}
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <div><span className="text-gray-600">จำนวน:</span> <span className="font-semibold">{emp.quantity || 0}</span> คน</div>
                                <div><span className="text-gray-600">วันทำงาน:</span> <span className="font-semibold">{emp.workingDays || 30}</span> วัน/เดือน</div>
                                <div><span className="text-gray-600">อัตรา:</span> {emp.hiringRate || 0} บาท</div>
                                <div><span className="text-gray-600">เบี้ยตำแหน่ง:</span> {emp.positionAllowance || 0} บาท</div>
                                <div><span className="text-gray-600">เบี้ยอื่นๆ:</span> {emp.otherAllowance || 0} บาท</div>
                                <div className="col-span-2"><span className="text-gray-600">รายได้ต่อวัน:</span> <span className="font-semibold text-green-600">{emp.dailyIncome || 0}</span> บาท</div>
                            </div>
                        </div>
                    ))}
                    <div className="text-sm font-semibold text-gray-700 mt-2">
                        รวม {value.length} ตำแหน่ง
                    </div>
                </div>
            );
        }
        
        // ถ้าเป็น shiftAssignments (ข้อมูลกะงาน)
        if (key === 'shiftAssignments' && Array.isArray(value)) {
            if (value.length === 0) return 'ไม่มีข้อมูล';
            return (
                <div className="space-y-2 mt-2">
                    {value.map((shift, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-lg border border-amber-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="font-semibold text-amber-700">
                                    {shift.shiftCode} - {shift.shiftName}
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-600">จำนวน:</span> <span className="font-bold text-amber-600">{shift.numberOfPeople}</span> คน
                                </div>
                            </div>
                            {/* แสดงเวลากะถ้ามี */}
                            {(shift.startTime || shift.endTime) && (
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                    <span>🕐</span>
                                    <span>
                                        {shift.startTime ? shift.startTime.substring(0, 5) : '--:--'} - {shift.endTime ? shift.endTime.substring(0, 5) : '--:--'}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="text-sm font-semibold text-gray-700 mt-2">
                        รวม {value.length} กะ, {value.reduce((sum, s) => sum + (s.numberOfPeople || 0), 0)} คน
                    </div>
                </div>
            );
        }
        
        // ถ้าเป็น boolean
        if (typeof value === 'boolean') {
            return value ? 'ใช่' : 'ไม่ใช่';
        }
        
        // ถ้าเป็น array หรือ object อื่นๆ
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        
        return value.toString();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <History className="w-7 h-7" />
                            <div>
                                <h2 className="text-2xl font-bold">ประวัติการแก้ไข</h2>
                                <p className="text-indigo-100 text-sm mt-1">{entityName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">ไม่มีประวัติการแก้ไข</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Timeline */}
                            <div className="relative">
                                {/* Timeline Line */}
                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-transparent"></div>

                                {logs.map((log, index) => {
                                    const ActionIcon = actionIcons[log.action] || Edit;
                                    const isExpanded = expandedLog === log.id;

                                    return (
                                        <div key={log.id} className="relative pl-20 pb-8 last:pb-0">
                                            {/* Timeline Dot */}
                                            <div className={`absolute left-5 w-6 h-6 rounded-full border-4 border-white shadow-lg ${
                                                log.action === 'CREATE' ? 'bg-green-500' :
                                                log.action === 'UPDATE' ? 'bg-blue-500' :
                                                log.action === 'DELETE' ? 'bg-red-500' :
                                                'bg-purple-500'
                                            }`}></div>

                                            {/* Log Card */}
                                            <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                <div 
                                                    className="p-4 cursor-pointer"
                                                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            {/* Action Badge */}
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg border font-medium text-sm ${actionColors[log.action]}`}>
                                                                    <ActionIcon className="w-4 h-4" />
                                                                    <span>{actionLabels[log.action]}</span>
                                                                </span>
                                                                {index === 0 && currentPage === 1 && (
                                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                                                                        ล่าสุด
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Description */}
                                                            <p className="text-gray-800 font-medium mb-2">
                                                                {log.description}
                                                            </p>

                                                            {/* Meta Info */}
                                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                                <div className="flex items-center gap-1.5">
                                                                    <User className="w-4 h-4" />
                                                                    <span className="font-medium">{log.username}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>{formatDate(log.createdAt)}</span>
                                                                </div>
                                                            </div>

                                                            {/* Changes Preview */}
                                                            {log.changes && log.changes.length > 0 && (
                                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                                    <span className="text-xs text-gray-500">แก้ไข:</span>
                                                                    {log.changes.slice(0, 5).map((field, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                                                                        >
                                                                            {formatFieldName(field)}
                                                                        </span>
                                                                    ))}
                                                                    {log.changes.length > 5 && (
                                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                                            +{log.changes.length - 5} อื่นๆ
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Expand Button */}
                                                        <button className="text-gray-400 hover:text-gray-600">
                                                            <svg
                                                                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Expanded Details */}
                                                {isExpanded && (
                                                    <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                                                        {/* All Changes */}
                                                        {log.changes && log.changes.length > 0 && (
                                                            <div>
                                                                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                                    ฟิลด์ที่เปลี่ยนแปลง ({log.changes.length})
                                                                </label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {log.changes.map((field, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium border border-yellow-200"
                                                                        >
                                                                            {formatFieldName(field)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Data Comparison */}
                                                        {(log.oldData || log.newData) && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {/* Old Data */}
                                                                {log.oldData && Object.keys(log.oldData).length > 0 && (
                                                                    <div>
                                                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                                            ข้อมูลก่อนแก้ไข
                                                                        </label>
                                                                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                                                            <div className="space-y-1">
                                                                                {Object.entries(log.oldData).map(([key, value]) => (
                                                                                    <div key={key} className="text-sm">
                                                                                        <span className="font-medium text-red-900">
                                                                                            {formatFieldName(key)}:
                                                                                        </span>{' '}
                                                                                        <span className="text-red-700">
                                                                                            {formatValue(key, value)}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* New Data */}
                                                                {log.newData && Object.keys(log.newData).length > 0 && (
                                                                    <div>
                                                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                                            ข้อมูลหลังแก้ไข
                                                                        </label>
                                                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                                            <div className="space-y-1">
                                                                                {Object.entries(log.newData).map(([key, value]) => (
                                                                                    <div key={key} className="text-sm">
                                                                                        <span className="font-medium text-green-900">
                                                                                            {formatFieldName(key)}:
                                                                                        </span>{' '}
                                                                                        <span className="text-green-700">
                                                                                            {formatValue(key, value)}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* IP & User Agent */}
                                                        {(log.ipAddress || log.userAgent) && (
                                                            <div className="pt-2 border-t border-gray-300">
                                                                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                                                                    ข้อมูลเทคนิค
                                                                </label>
                                                                <div className="space-y-1">
                                                                    {log.ipAddress && (
                                                                        <div className="text-xs text-gray-600">
                                                                            <span className="font-medium">IP:</span> {log.ipAddress}
                                                                        </div>
                                                                    )}
                                                                    {log.userAgent && (
                                                                        <div className="text-xs text-gray-600 truncate">
                                                                            <span className="font-medium">Device:</span> {log.userAgent}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with Pagination */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-600">
                            แสดง <span className="font-bold text-gray-900">{((currentPage - 1) * pagination.limit) + 1}-{Math.min(currentPage * pagination.limit, pagination.total)}</span> จาก <span className="font-bold text-gray-900">{pagination.total}</span> รายการ
                        </p>
                        
                        {/* Pagination Controls */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!pagination.hasPrev}
                                    className={`px-3 py-1 rounded-lg font-medium text-sm transition-colors ${
                                        pagination.hasPrev
                                            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    ← ก่อนหน้า
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {[...Array(pagination.totalPages)].map((_, idx) => {
                                        const pageNum = idx + 1;
                                        // Show first page, last page, current page, and adjacent pages
                                        if (
                                            pageNum === 1 ||
                                            pageNum === pagination.totalPages ||
                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`w-8 h-8 rounded-lg font-medium text-sm transition-colors ${
                                                        pageNum === currentPage
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        } else if (
                                            pageNum === currentPage - 2 ||
                                            pageNum === currentPage + 2
                                        ) {
                                            return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!pagination.hasNext}
                                    className={`px-3 py-1 rounded-lg font-medium text-sm transition-colors ${
                                        pagination.hasNext
                                            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    ถัดไป →
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}
