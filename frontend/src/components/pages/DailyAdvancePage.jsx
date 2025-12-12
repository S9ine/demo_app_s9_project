// frontend/src/components/pages/DailyAdvancePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import { 
    Trash2, ChevronLeft, ChevronRight,
    Save, Search, X, Users, Wallet,
    TrendingUp, Download, Calendar
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function DailyAdvancePage({ user }) {
    const toast = useToast();
    
    // วันที่ปัจจุบัน
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    // ประเภทการเบิก
    const [advanceType, setAdvanceType] = useState('advance'); // 'advance' | 'cash'
    
    // ข้อมูล
    const [guards, setGuards] = useState([]);
    const [entries, setEntries] = useState([]); // รายการเบิกของวันที่เลือก
    const [monthlyData, setMonthlyData] = useState({}); // ข้อมูลทั้งเดือน
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // UI States
    const [showMonthlySummary, setShowMonthlySummary] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showGuardDropdown, setShowGuardDropdown] = useState(false);
    
    // Format date
    const formatDateKey = (date) => {
        return date.toISOString().split('T')[0];
    };
    
    const formatThaiDate = (date) => {
        return date.toLocaleDateString('th-TH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatThaiMonth = (date) => {
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long'
        });
    };

    // Fetch guards
    useEffect(() => {
        const fetchGuards = async () => {
            try {
                const res = await api.get('/guards');
                setGuards(res.data.map(g => ({
                    ...g,
                    name: `${g.firstName} ${g.lastName}`
                })));
            } catch (error) {
                console.error('Error fetching guards:', error);
            }
        };
        fetchGuards();
    }, []);

    // Fetch data for selected date
    useEffect(() => {
        const fetchDailyData = async () => {
            setIsLoading(true);
            try {
                const dateStr = formatDateKey(selectedDate);
                const res = await api.get('/daily-advances', {
                    params: { date: dateStr, type: advanceType }
                });
                
                // แปลงข้อมูลจาก documents เป็น entries และรวม guardId ที่ซ้ำกัน
                const entriesMap = new Map();
                res.data.forEach(doc => {
                    doc.items.forEach(item => {
                        const key = item.guardId;
                        if (entriesMap.has(key)) {
                            // รวมยอดเงินถ้ามีซ้ำ
                            const existing = entriesMap.get(key);
                            existing.amount += item.amount;
                            if (item.reason && !existing.reason.includes(item.reason)) {
                                existing.reason = existing.reason 
                                    ? `${existing.reason}, ${item.reason}` 
                                    : item.reason;
                            }
                        } else {
                            entriesMap.set(key, {
                                id: `${doc.id}-${item.guardId}`,
                                docId: doc.id,
                                guardId: item.guardId,
                                amount: item.amount,
                                reason: item.reason || '',
                                status: doc.status
                            });
                        }
                    });
                });
                setEntries(Array.from(entriesMap.values()));
            } catch (error) {
                console.error('Error fetching daily data:', error);
                setEntries([]);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (user) fetchDailyData();
    }, [selectedDate, advanceType, user]);

    // Fetch monthly summary
    useEffect(() => {
        const fetchMonthlyData = async () => {
            setIsLoading(true);
            try {
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth();
                const startDate = new Date(year, month, 1);
                const endDate = new Date(year, month + 1, 0);
                
                const res = await api.get('/daily-advances/monthly-summary', {
                    params: {
                        start_date: formatDateKey(startDate),
                        end_date: formatDateKey(endDate),
                        type: advanceType
                    }
                });
                setMonthlyData(res.data || {});
            } catch (error) {
                console.error('Error fetching monthly data:', error);
                setMonthlyData({});
            } finally {
                setIsLoading(false);
            }
        };
        
        if (showMonthlySummary && user) fetchMonthlyData();
    }, [currentMonth, advanceType, showMonthlySummary, user]);

    // Navigation
    const goToPrevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    const goToPrevMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentMonth(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentMonth(newDate);
    };

    // Entry management
    const addEntry = (guard) => {
        // ตรวจสอบว่ามีอยู่แล้วหรือไม่
        if (entries.find(e => e.guardId === guard.guardId)) {
            toast.warning('พนักงานคนนี้มีรายการเบิกแล้ววันนี้');
            return;
        }
        
        const newEntry = {
            id: `new-${Date.now()}`,
            guardId: guard.guardId,
            amount: 0,
            reason: '',
            isNew: true
        };
        setEntries([...entries, newEntry]);
        setSearchTerm('');
        setShowGuardDropdown(false);
    };

    const updateEntry = (id, field, value) => {
        setEntries(entries.map(e => 
            e.id === id ? { ...e, [field]: value } : e
        ));
    };

    const removeEntry = (id) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    // Save
    const handleSave = async () => {
        const validEntries = entries.filter(e => e.guardId && e.amount > 0);
        
        if (validEntries.length === 0) {
            toast.warning('กรุณากรอกข้อมูลอย่างน้อย 1 รายการ');
            return;
        }
        
        setIsSaving(true);
        try {
            const dateStr = formatDateKey(selectedDate);
            const prefix = advanceType === 'advance' ? 'ADV' : 'CASH';
            const docNumber = `${prefix}-${dateStr.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;
            
            const payload = {
                docNumber,
                date: dateStr,
                type: advanceType,
                status: 'Pending',
                items: validEntries.map(e => ({
                    guardId: e.guardId,
                    amount: parseFloat(e.amount),
                    reason: e.reason || ''
                }))
            };
            
            await api.post('/daily-advances', payload);
            toast.success('บันทึกรายการเบิกจ่ายสำเร็จ');
            
            // Refresh data
            const res = await api.get('/daily-advances', {
                params: { date: dateStr, type: advanceType }
            });
            const entriesMap = new Map();
            res.data.forEach(doc => {
                doc.items.forEach(item => {
                    const key = item.guardId;
                    if (entriesMap.has(key)) {
                        const existing = entriesMap.get(key);
                        existing.amount += item.amount;
                    } else {
                        entriesMap.set(key, {
                            id: `${doc.id}-${item.guardId}`,
                            docId: doc.id,
                            guardId: item.guardId,
                            amount: item.amount,
                            reason: item.reason || '',
                            status: doc.status
                        });
                    }
                });
            });
            setEntries(Array.from(entriesMap.values()));
            
        } catch (error) {
            toast.error(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setIsSaving(false);
        }
    };

    // Filter guards for dropdown
    const filteredGuards = useMemo(() => {
        if (!searchTerm) return [];
        const term = searchTerm.toLowerCase();
        return guards.filter(g => 
            g.guardId.toLowerCase().includes(term) ||
            g.name.toLowerCase().includes(term) ||
            g.firstName.toLowerCase().includes(term) ||
            g.lastName.toLowerCase().includes(term)
        ).slice(0, 8);
    }, [guards, searchTerm]);

    // Get guard name
    const getGuardName = (guardId) => {
        const guard = guards.find(g => g.guardId === guardId);
        return guard ? guard.name : guardId;
    };

    // Calculate totals
    const totalAmount = useMemo(() => {
        return entries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    }, [entries]);

    // Calculate monthly summary
    const monthlySummary = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        
        return {
            guards: monthlyData.byGuard || [],
            total: monthlyData.total || 0,
            days
        };
    }, [monthlyData, currentMonth]);

    if (!user) {
        return <div className="p-6 text-center text-red-500">กรุณาเข้าสู่ระบบ</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">รายการเบิกจ่ายรายวัน</h1>
                    <p className="text-gray-500 text-sm mt-1">บันทึกการเบิกเงินของพนักงาน รปภ.</p>
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowMonthlySummary(false)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            !showMonthlySummary 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        📝 กรอกรายวัน
                    </button>
                    <button
                        onClick={() => setShowMonthlySummary(true)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            showMonthlySummary 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        📊 สรุปเดือน
                    </button>
                </div>
            </div>

            {/* Type Selection */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Wallet className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium text-gray-700">ประเภทการเบิก:</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setAdvanceType('advance')}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                            advanceType === 'advance'
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="font-semibold">💰 เบิกล่วงหน้า</div>
                        <div className="text-sm text-gray-500">หักจากเงินเดือน</div>
                    </button>
                    <button
                        onClick={() => setAdvanceType('cash')}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                            advanceType === 'cash'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="font-semibold">💵 เงินควง</div>
                        <div className="text-sm text-gray-500">จ่ายเงินสดทันที</div>
                    </button>
                </div>
            </div>

            {!showMonthlySummary ? (
                /* ===== DAILY INPUT VIEW ===== */
                <>
                    {/* Date Navigation */}
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={goToPrevDay}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-800">
                                    {formatThaiDate(selectedDate)}
                                </div>
                                <button
                                    onClick={goToToday}
                                    className="text-sm text-indigo-600 hover:underline mt-1"
                                >
                                    กลับไปวันนี้
                                </button>
                            </div>
                            
                            <button
                                onClick={goToNextDay}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Entry Form */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {/* Search to Add */}
                        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600">
                            <div className="relative">
                                <div className="flex items-center bg-white rounded-lg shadow-sm">
                                    <Search className="w-5 h-5 text-gray-400 ml-3" />
                                    <input
                                        type="text"
                                        placeholder="🔍 พิมพ์รหัสหรือชื่อพนักงานเพื่อเพิ่มรายการ..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setShowGuardDropdown(true);
                                        }}
                                        onFocus={() => setShowGuardDropdown(true)}
                                        className="flex-1 py-3 px-3 rounded-lg focus:outline-none"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setShowGuardDropdown(false);
                                            }}
                                            className="p-2 mr-1"
                                        >
                                            <X className="w-5 h-5 text-gray-400" />
                                        </button>
                                    )}
                                </div>
                                
                                {/* Dropdown */}
                                {showGuardDropdown && filteredGuards.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border z-50 max-h-64 overflow-y-auto">
                                        {filteredGuards.map(guard => (
                                            <button
                                                key={guard.id}
                                                onClick={() => addEntry(guard)}
                                                className="w-full px-4 py-3 text-left hover:bg-indigo-50 flex items-center gap-3 border-b last:border-b-0"
                                            >
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <span className="text-indigo-600 font-bold text-sm">
                                                        {guard.guardId.slice(-2)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800">
                                                        {guard.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        รหัส: {guard.guardId}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Entries List */}
                        <div className="p-4">
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                    <p className="text-gray-500">กำลังโหลด...</p>
                                </div>
                            ) : entries.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">ยังไม่มีรายการเบิกในวันนี้</p>
                                    <p className="text-sm">พิมพ์ค้นหาชื่อพนักงานด้านบนเพื่อเพิ่มรายการ</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {entries.map((entry, index) => (
                                        <div
                                            key={entry.id}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                entry.isNew 
                                                    ? 'border-indigo-300 bg-indigo-50' 
                                                    : 'border-gray-100 bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Number */}
                                                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                
                                                {/* Guard Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-gray-800">
                                                        {getGuardName(entry.guardId)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        รหัส: {entry.guardId}
                                                    </div>
                                                </div>
                                                
                                                {/* Amount */}
                                                <div className="w-32">
                                                    <input
                                                        type="number"
                                                        value={entry.amount || ''}
                                                        onChange={(e) => updateEntry(entry.id, 'amount', e.target.value)}
                                                        placeholder="0"
                                                        className="w-full px-3 py-2 border rounded-lg text-right font-semibold text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        disabled={!entry.isNew && entry.status !== 'Draft'}
                                                    />
                                                    <div className="text-xs text-gray-400 text-right mt-1">บาท</div>
                                                </div>
                                                
                                                {/* Remove */}
                                                {(entry.isNew || entry.status === 'Draft') && (
                                                    <button
                                                        onClick={() => removeEntry(entry.id)}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {/* Reason */}
                                            <div className="mt-3 ml-12">
                                                <input
                                                    type="text"
                                                    value={entry.reason}
                                                    onChange={(e) => updateEntry(entry.id, 'reason', e.target.value)}
                                                    placeholder="หมายเหตุ (ไม่บังคับ) เช่น ค่าเดินทาง, เบิกล่วงหน้า..."
                                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    disabled={!entry.isNew && entry.status !== 'Draft'}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer - Total & Save */}
                        {entries.length > 0 && (
                            <div className="p-4 bg-gray-50 border-t">
                                <div className="flex items-center justify-between">
                                    <div className="text-gray-600">
                                        <span className="font-medium">{entries.length}</span> รายการ
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">ยอดรวม</div>
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                                        </div>
                                    </div>
                                </div>
                                
                                {entries.some(e => e.isNew) && (
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                                กำลังบันทึก...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                บันทึกรายการเบิกจ่าย
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* ===== MONTHLY SUMMARY VIEW ===== */
                <>
                    {/* Month Navigation */}
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={goToPrevMonth}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-800">
                                    📊 สรุปการเบิกจ่าย - {formatThaiMonth(currentMonth)}
                                </div>
                            </div>
                            
                            <button
                                onClick={goToNextMonth}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-6 h-6" />
                                <span className="font-medium">ยอดรวมทั้งเดือน</span>
                            </div>
                            <div className="text-3xl font-bold">
                                {(monthlyData.total || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-indigo-100">บาท</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="w-6 h-6" />
                                <span className="font-medium">จำนวนพนักงานที่เบิก</span>
                            </div>
                            <div className="text-3xl font-bold">
                                {(monthlyData.byGuard || []).length}
                            </div>
                            <div className="text-green-100">คน</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-5 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-6 h-6" />
                                <span className="font-medium">จำนวนรายการ</span>
                            </div>
                            <div className="text-3xl font-bold">
                                {monthlyData.totalEntries || 0}
                            </div>
                            <div className="text-orange-100">รายการ</div>
                        </div>
                    </div>

                    {/* Monthly Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">รายละเอียดการเบิกรายคน</h3>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                ส่งออก Excel
                            </button>
                        </div>
                        
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p className="text-gray-500">กำลังโหลด...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 sticky left-0 bg-gray-50 z-10">
                                                รหัส
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 sticky left-16 bg-gray-50 z-10">
                                                ชื่อ-นามสกุล
                                            </th>
                                            {monthlySummary.days.map(day => (
                                                <th key={day} className="px-2 py-3 text-center text-sm font-semibold text-gray-600 min-w-[50px]">
                                                    {day}
                                                </th>
                                            ))}
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 bg-indigo-50">
                                                รวม
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {(monthlyData.byGuard || []).length === 0 ? (
                                            <tr>
                                                <td colSpan={monthlySummary.days.length + 3} className="px-4 py-12 text-center text-gray-400">
                                                    ไม่มีข้อมูลการเบิกในเดือนนี้
                                                </td>
                                            </tr>
                                        ) : (
                                            (monthlyData.byGuard || []).map((guard, idx) => (
                                                <tr key={guard.guardId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-800 sticky left-0 bg-inherit z-10">
                                                        {guard.guardId}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 sticky left-16 bg-inherit z-10 whitespace-nowrap">
                                                        {getGuardName(guard.guardId)}
                                                    </td>
                                                    {monthlySummary.days.map(day => {
                                                        const amount = guard.byDay?.[day] || 0;
                                                        return (
                                                            <td key={day} className={`px-2 py-3 text-center text-sm ${amount > 0 ? 'text-indigo-600 font-medium' : 'text-gray-300'}`}>
                                                                {amount > 0 ? amount.toLocaleString() : '-'}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="px-4 py-3 text-right text-sm font-bold text-indigo-600 bg-indigo-50">
                                                        {(guard.total || 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    {(monthlyData.byGuard || []).length > 0 && (
                                        <tfoot className="bg-indigo-100">
                                            <tr>
                                                <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-800 sticky left-0 bg-indigo-100 z-10">
                                                    รวมทั้งหมด
                                                </td>
                                                {monthlySummary.days.map(day => {
                                                    const dayTotal = (monthlyData.byDay || {})[day] || 0;
                                                    return (
                                                        <td key={day} className={`px-2 py-3 text-center text-sm font-medium ${dayTotal > 0 ? 'text-indigo-700' : 'text-gray-400'}`}>
                                                            {dayTotal > 0 ? dayTotal.toLocaleString() : '-'}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-4 py-3 text-right text-lg font-bold text-indigo-700 bg-indigo-200">
                                                    {(monthlyData.total || 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
