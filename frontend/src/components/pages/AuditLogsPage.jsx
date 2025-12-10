import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Download, User, Calendar, FileText, Trash2, Edit, Plus, Upload } from 'lucide-react';
import api from '../../config/api';

const actionColors = {
    'CREATE': 'bg-green-100 text-green-800 border-green-200',
    'UPDATE': 'bg-blue-100 text-blue-800 border-blue-200',
    'DELETE': 'bg-red-100 text-red-800 border-red-200',
    'IMPORT': 'bg-purple-100 text-purple-800 border-purple-200',
    'EXPORT': 'bg-orange-100 text-orange-800 border-orange-200'
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

const entityTypeLabels = {
    'customers': 'ลูกค้า',
    'sites': 'หน่วยงาน',
    'guards': 'พนักงาน รปภ.',
    'staff': 'พนักงานภายใน',
    'services': 'บริการ',
    'products': 'สินค้า',
    'banks': 'ธนาคาร',
    'daily_advances': 'เอกสารเบิกรายวัน'
};

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState('');
    const [filterEntityType, setFilterEntityType] = useState('');
    const [filterDays, setFilterDays] = useState(30);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterAction, filterEntityType, filterDays]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = {
                days: filterDays
            };
            if (filterAction) params.action = filterAction;
            if (filterEntityType) params.entity_type = filterEntityType;

            const response = await api.get('/audit/logs', { params });
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            log.username?.toLowerCase().includes(term) ||
            log.entityName?.toLowerCase().includes(term) ||
            log.description?.toLowerCase().includes(term) ||
            log.entityId?.toLowerCase().includes(term)
        );
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const LogDetailModal = ({ log, onClose }) => {
        if (!log) return null;

        const ActionIcon = actionIcons[log.action] || FileText;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <ActionIcon className="w-6 h-6" />
                                <h2 className="text-2xl font-bold">รายละเอียด Log</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600">การกระทำ</label>
                                <div className={`mt-1 px-3 py-2 rounded-lg border ${actionColors[log.action]}`}>
                                    {actionLabels[log.action]}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">ประเภทข้อมูล</label>
                                <div className="mt-1 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
                                    {entityTypeLabels[log.entityType] || log.entityType}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">ผู้ทำรายการ</label>
                                <div className="mt-1 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
                                    {log.username}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">เวลา</label>
                                <div className="mt-1 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
                                    {formatDate(log.createdAt)}
                                </div>
                            </div>
                        </div>

                        {/* Entity Info */}
                        {log.entityName && (
                            <div>
                                <label className="text-sm font-semibold text-gray-600">ข้อมูลที่กระทำ</label>
                                <div className="mt-1 px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="font-semibold text-blue-900">{log.entityName}</div>
                                    {log.entityId && (
                                        <div className="text-sm text-blue-700 mt-1">ID: {log.entityId}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {log.description && (
                            <div>
                                <label className="text-sm font-semibold text-gray-600">คำอธิบาย</label>
                                <div className="mt-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                    {log.description}
                                </div>
                            </div>
                        )}

                        {/* Changes */}
                        {log.changes && log.changes.length > 0 && (
                            <div>
                                <label className="text-sm font-semibold text-gray-600">ฟิลด์ที่เปลี่ยนแปลง</label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {log.changes.map((field, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200"
                                        >
                                            {field}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Old Data */}
                        {log.oldData && Object.keys(log.oldData).length > 0 && (
                            <div>
                                <label className="text-sm font-semibold text-gray-600">ข้อมูลก่อนแก้ไข</label>
                                <div className="mt-1 p-4 bg-red-50 rounded-lg border border-red-200">
                                    <pre className="text-sm text-red-900 whitespace-pre-wrap">
                                        {JSON.stringify(log.oldData, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* New Data */}
                        {log.newData && Object.keys(log.newData).length > 0 && (
                            <div>
                                <label className="text-sm font-semibold text-gray-600">ข้อมูลหลังแก้ไข</label>
                                <div className="mt-1 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <pre className="text-sm text-green-900 whitespace-pre-wrap">
                                        {JSON.stringify(log.newData, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* IP & User Agent */}
                        {(log.ipAddress || log.userAgent) && (
                            <div className="border-t pt-4">
                                <label className="text-sm font-semibold text-gray-600 mb-2 block">ข้อมูลเทคนิค</label>
                                {log.ipAddress && (
                                    <div className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">IP Address:</span> {log.ipAddress}
                                    </div>
                                )}
                                {log.userAgent && (
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">User Agent:</span> {log.userAgent}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
                <div className="flex items-center space-x-3 mb-2">
                    <History className="w-10 h-10" />
                    <h1 className="text-3xl font-bold">ประวัติการแก้ไขข้อมูล</h1>
                </div>
                <p className="text-indigo-100">ติดตามและตรวจสอบการเปลี่ยนแปลงข้อมูลทั้งหมดในระบบ</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="ค้นหา..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Action Filter */}
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">ทุกการกระทำ</option>
                        <option value="CREATE">สร้าง</option>
                        <option value="UPDATE">แก้ไข</option>
                        <option value="DELETE">ลบ</option>
                        <option value="IMPORT">นำเข้า</option>
                        <option value="EXPORT">ส่งออก</option>
                    </select>

                    {/* Entity Type Filter */}
                    <select
                        value={filterEntityType}
                        onChange={(e) => setFilterEntityType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">ทุกประเภทข้อมูล</option>
                        <option value="customers">ลูกค้า</option>
                        <option value="sites">หน่วยงาน</option>
                        <option value="guards">พนักงาน รปภ.</option>
                        <option value="staff">พนักงานภายใน</option>
                        <option value="services">บริการ</option>
                        <option value="products">สินค้า</option>
                    </select>

                    {/* Days Filter */}
                    <select
                        value={filterDays}
                        onChange={(e) => setFilterDays(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="7">7 วันล่าสุด</option>
                        <option value="30">30 วันล่าสุด</option>
                        <option value="90">90 วันล่าสุด</option>
                        <option value="365">1 ปีล่าสุด</option>
                    </select>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">ไม่พบข้อมูล Log</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">เวลา</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">การกระทำ</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ประเภท</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ข้อมูล</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ผู้ทำรายการ</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">คำอธิบาย</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">ดูรายละเอียด</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredLogs.map((log) => {
                                    const ActionIcon = actionIcons[log.action] || FileText;
                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(log.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg border font-medium text-sm ${actionColors[log.action]}`}>
                                                    <ActionIcon className="w-4 h-4" />
                                                    <span>{actionLabels[log.action]}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {entityTypeLabels[log.entityType] || log.entityType}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="font-medium text-gray-900">{log.entityName || '-'}</div>
                                                {log.entityId && (
                                                    <div className="text-xs text-gray-500">ID: {log.entityId}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">{log.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {log.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                                                >
                                                    ดูเพิ่มเติม
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <LogDetailModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}
        </div>
    );
}
