import React, { useState, useEffect } from 'react';
import api from '../../config/api'; // เรียกใช้ API Config
import { Search, X, GripVertical, Trash2 } from 'lucide-react';
import { FullPageLoading } from '../common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

export default function Scheduler() {
    const toast = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
    const [isSchedulerModalOpen, setIsSchedulerModalOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState(null);
    const [schedule, setSchedule] = useState({});
    const [siteSearchTerm, setSiteSearchTerm] = useState('');
    const [guardSearchTerm, setGuardSearchTerm] = useState('');

    // Data form API
    const [allSites, setAllSites] = useState([]);
    const [allGuards, setAllGuards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Drag and Drop States
    const [availableGuards, setAvailableGuards] = useState([]);
    const [shifts, setShifts] = useState({}); // Dynamic shifts based on site's shiftAssignments
    const [siteShifts, setSiteShifts] = useState([]); // shiftAssignments from selected site
    const [draggedItem, setDraggedItem] = useState(null);

    // Position Selection Modal States
    const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
    const [guardForPosition, setGuardForPosition] = useState(null);
    const [targetShift, setTargetShift] = useState(null);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualPayoutRate, setManualPayoutRate] = useState('');

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    // Fetch schedules from API
    const fetchSchedules = async (date) => {
        try {
            const dateStr = date.toISOString().split('T')[0];
            const response = await api.get(`/schedules/by-date/${dateStr}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching schedules:", error);
            return {};
        }
    };

    // Fetch schedules for current month
    const fetchMonthSchedules = async (date) => {
        try {
            const year = date.getFullYear();
            const month = date.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            
            const response = await api.get('/schedules', {
                params: {
                    start_date: firstDay.toISOString().split('T')[0],
                    end_date: lastDay.toISOString().split('T')[0]
                }
            });
            
            // แปลง array เป็น object grouped by date
            const schedulesByDate = {};
            response.data.forEach(s => {
                const dateKey = s.scheduleDate;
                if (!schedulesByDate[dateKey]) {
                    schedulesByDate[dateKey] = {};
                }
                schedulesByDate[dateKey][s.siteId] = {
                    scheduleId: s.id,
                    siteId: s.siteId,
                    siteName: s.siteName,
                    totalGuards: s.totalGuards
                };
            });
            
            setSchedule(schedulesByDate);
        } catch (error) {
            console.error("Error fetching month schedules:", error);
        }
    };

    // Fetch Data from API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [sitesRes, guardsRes] = await Promise.all([
                    api.get('/sites'),
                    api.get('/guards')
                ]);
                setAllSites(sitesRes.data);

                // แปลงข้อมูล Guard ให้พร้อมใช้งาน (เพิ่ม originalId ถ้าจำเป็น)
                const guardsData = guardsRes.data.map(g => ({ ...g, originalId: g.id }));
                setAllGuards(guardsData);
                setAvailableGuards(guardsData);

                // โหลดตารางงานของเดือนปัจจุบัน
                await fetchMonthSchedules(currentDate);

            } catch (error) {
                console.error("Error fetching scheduler data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [currentDate.getMonth(), currentDate.getFullYear()]);

    const handleDateClick = async (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
        
        // Fetch schedules for this date - อัปเดตเฉพาะวันนั้น ไม่ reset ทั้งเดือน
        const scheduleData = await fetchSchedules(date);
        const dateKey = date.toISOString().split('T')[0];
        setSchedule(prev => ({ ...prev, [dateKey]: scheduleData[dateKey] || {} }));
        
        setIsSiteModalOpen(true);
    };

    const handleSiteSelect = (site) => {
        setSelectedSite(site);
        setIsSiteModalOpen(false);
        setSiteSearchTerm('');

        // ดึง shiftAssignments จากหน่วยงาน
        const siteShiftAssignments = site.shiftAssignments || [];
        setSiteShifts(siteShiftAssignments);

        // สร้าง initial shifts object จาก shiftAssignments
        const initialShifts = {};
        siteShiftAssignments.forEach(shift => {
            initialShifts[shift.shiftCode] = [];
        });

        const dateKey = selectedDate.toISOString().split('T')[0];
        const existingScheduleForDate = schedule[dateKey] || {};
        const existingScheduleForSite = existingScheduleForDate[String(site.id)];

        // หา ID ของรปภ. ที่ถูกจัดตารางไปแล้วในวันนั้น (ทุก Site)
        const scheduledGuardIdsForDate = Object.values(existingScheduleForDate)
            .flatMap(s => {
                if (!s.shifts) return [];
                return Object.values(s.shifts).flat();
            })
            .map(g => g.id);

        if (existingScheduleForSite && existingScheduleForSite.shifts) {
            // Merge existing shifts with site's shift structure
            const mergedShifts = { ...initialShifts };
            Object.keys(existingScheduleForSite.shifts).forEach(shiftCode => {
                mergedShifts[shiftCode] = existingScheduleForSite.shifts[shiftCode] || [];
            });
            setShifts(mergedShifts);
            setAvailableGuards(allGuards.filter(g => !scheduledGuardIdsForDate.includes(g.id)));
        } else {
            setShifts(initialShifts);
            setAvailableGuards(allGuards.filter(g => !scheduledGuardIdsForDate.includes(g.id)));
        }

        setIsSchedulerModalOpen(true);
    };

    const handleSaveSchedule = async () => {
        if (!selectedDate || !selectedSite) return;

        const dateKey = selectedDate.toISOString().split('T')[0];

        // ตรวจสอบว่ามีพนักงานในกะหรือไม่
        const hasPeople = Object.values(shifts).some(arr => arr.length > 0);

        try {
            if (hasPeople) {
                // บันทึกตารางงานลง database
                const schedulePayload = {
                    scheduleDate: dateKey,
                    siteId: selectedSite.id,
                    siteName: selectedSite.name,
                    shifts: shifts // ส่ง shifts ทั้งหมดตาม shiftCode
                };

                // ตรวจสอบว่ามีอยู่แล้วหรือไม่
                const existingScheduleId = schedule[dateKey]?.[String(selectedSite.id)]?.scheduleId;

                if (existingScheduleId) {
                    // Update existing schedule
                    await api.put(`/schedules/${existingScheduleId}`, { shifts: schedulePayload.shifts });
                } else {
                    // Create new schedule
                    await api.post('/schedules', schedulePayload);
                }

                toast.success('บันทึกตารางงานสำเร็จ', { title: '✅ สำเร็จ' });
            } else {
                // ถ้าไม่มีพนักงาน -> ลบตารางงาน
                const existingScheduleId = schedule[dateKey]?.[String(selectedSite.id)]?.scheduleId;
                if (existingScheduleId) {
                    await api.delete(`/schedules/${existingScheduleId}`);
                    toast.info('ลบตารางงานสำเร็จ', { title: '🗑️ ลบแล้ว' });
                }
            }

            // Reload schedule data - อัปเดตเฉพาะวันนั้น ไม่ reset ทั้งเดือน
            await fetchMonthSchedules(currentDate);

        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error);
            toast.error(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึก', { title: '❌ ผิดพลาด' });
        }

        setIsSchedulerModalOpen(false);
        setSelectedSite(null);
        setShifts({});
        setSiteShifts([]);
    };

    const handleDragStart = (e, guard, source) => {
        setDraggedItem({ guard, source });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, target) => {
        e.preventDefault();
        if (!draggedItem) return;

        const { guard, source } = draggedItem;

        // --- Handle dropping back to available list ---
        if (target === 'available') {
            if (source !== 'available') {
                removeGuardFromShift(guard, source);
            }
            setDraggedItem(null);
            return;
        }

        // --- Handle dropping into a shift ---
        const targetShiftCode = target; // shiftCode from shiftAssignments
        
        // ตรวจสอบว่ากะเต็มหรือยัง
        const targetShiftInfo = siteShifts.find(s => s.shiftCode === targetShiftCode);
        const targetCount = targetShiftInfo?.numberOfPeople || 0;
        const currentCount = (shifts[targetShiftCode] || []).length;
        if (targetCount > 0 && currentCount >= targetCount) {
            // กะเต็มแล้ว ไม่อนุญาตให้เพิ่ม
            setDraggedItem(null);
            return;
        }
        
        if (source === targetShiftCode || (shifts[targetShiftCode] && shifts[targetShiftCode].find(g => g.id === guard.id))) {
            setDraggedItem(null);
            return;
        }

        // Case 1: From available to a shift
        if (source === 'available') {
            setGuardForPosition(guard);
            setTargetShift(targetShiftCode);
            setIsPositionModalOpen(true);
            return;
        }

        // Case 2: From one shift to another
        if (source !== 'available') {
            const sourceShiftUpdated = (shifts[source] || []).filter(g => g.id !== guard.id);
            const targetShiftUpdated = [...(shifts[targetShiftCode] || []), guard];
            setShifts({
                ...shifts,
                [source]: sourceShiftUpdated,
                [targetShiftCode]: targetShiftUpdated
            });
        }
        setDraggedItem(null);
    };


    const closePositionModal = () => {
        setIsPositionModalOpen(false);
        setGuardForPosition(null);
        setTargetShift(null);
        setDraggedItem(null);
        setShowManualInput(false);
        setManualPayoutRate('');
    };

    const handlePositionSelect = (position) => {
        // หาข้อมูลตำแหน่งจาก employmentDetails ของ Site ที่เลือก
        const employmentDetail = selectedSite.employmentDetails.find(e => e.position === position);
        if (!employmentDetail || !guardForPosition) return;

        const newGuardInShift = {
            ...guardForPosition,
            position: employmentDetail.position,
            dailyIncome: employmentDetail.dailyIncome || 0,
            payoutRate: employmentDetail.hiringRate || 0,
            hiringRate: employmentDetail.hiringRate || 0,
            diligenceBonus: employmentDetail.diligenceBonus || 0,
            sevenDayBonus: employmentDetail.sevenDayBonus || 0,
            pointBonus: employmentDetail.pointBonus || 0,
            positionAllowance: employmentDetail.positionAllowance || 0,
            otherAllowance: employmentDetail.otherAllowance || 0
        };

        setShifts(prev => ({
            ...prev,
            [targetShift]: [...prev[targetShift], newGuardInShift]
        }));
        setAvailableGuards(prev => prev.filter(g => g.id !== guardForPosition.id));

        closePositionModal();
    };

    const handleManualRateConfirm = () => {
        if (!manualPayoutRate || isNaN(parseFloat(manualPayoutRate)) || !guardForPosition) {
            alert("กรุณาใส่ราคาที่ถูกต้อง");
            return;
        }

        const newGuardInShift = {
            ...guardForPosition,
            position: 'สแปร์',
            payoutRate: parseFloat(manualPayoutRate),
            hiringRate: 0,
            diligenceBonus: 0,
            pointBonus: 0,
            otherBonus: 0,
        };

        setShifts(prev => ({
            ...prev,
            [targetShift]: [...prev[targetShift], newGuardInShift]
        }));
        setAvailableGuards(prev => prev.filter(g => g.id !== guardForPosition.id));

        closePositionModal();
    };


    const removeGuardFromShift = (guard, shiftName) => {
        setShifts(prev => ({
            ...prev,
            [shiftName]: prev[shiftName].filter(g => g.id !== guard.id)
        }));

        const guardToAddBack = allGuards.find(g => g.id === guard.id);
        if (guardToAddBack) {
            setAvailableGuards(prev =>
                [...prev, guardToAddBack].sort((a, b) => a.id - b.id)
            );
        }
    };

    // Filter Logic
    const dateKey = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
    const scheduledSiteIds = dateKey && schedule[dateKey] ? Object.keys(schedule[dateKey]).map(String) : [];
    const today = new Date().toISOString().split('T')[0];

    // กรองเฉพาะ Site ที่ active และยังไม่หมดสัญญา (สำหรับหน่วยที่รอจัด)
    const activeSites = allSites.filter(site => {
        // ต้อง isActive
        if (!site.isActive) return false;
        // ถ้ามี contractEndDate ต้องยังไม่หมด
        if (site.contractEndDate && site.contractEndDate < today) return false;
        return true;
    });

    // หน่วยที่รอจัด - เฉพาะหน่วยที่ active และยังไม่หมดสัญญา
    let unscheduledSites = activeSites.filter(site => !scheduledSiteIds.includes(String(site.id)));
    
    // หน่วยที่จัดแล้ว - แสดงทุกหน่วยที่มีในตาราง (รวมหน่วยที่ปิดไปแล้วด้วย)
    let scheduledSites = allSites.filter(site => scheduledSiteIds.includes(String(site.id)));

    if (siteSearchTerm) {
        const term = siteSearchTerm.toLowerCase();
        unscheduledSites = unscheduledSites.filter(site => site.name.toLowerCase().includes(term));
        scheduledSites = scheduledSites.filter(site => site.name.toLowerCase().includes(term));
    }

    const displayedUnscheduledSites = unscheduledSites.slice(0, 5);
    const displayedScheduledSites = scheduledSites.slice(0, 5);

    const filteredAvailableGuards = availableGuards.filter(guard => {
        const fullName = `${guard.firstName || ''} ${guard.lastName || ''}`.toLowerCase();
        return fullName.includes(guardSearchTerm.toLowerCase());
    });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                ตารางงาน
            </h1>
            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <button 
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all duration-200 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>เดือนก่อน</span>
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">{currentDate.toLocaleString('th-TH', { month: 'long', year: 'numeric' })}</h2>
                    <button 
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all duration-200 flex items-center space-x-2"
                    >
                        <span>เดือนถัดไป</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-3 text-center">
                    {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => <div key={`day-header-${d}`} className="font-bold text-gray-700 text-lg py-2">{d}</div>)}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-day-${i}`}></div>)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const dateKey = date.toISOString().split('T')[0];
                        const scheduledSitesForDay = schedule[dateKey] ? Object.keys(schedule[dateKey]).length : 0;
                        // นับเฉพาะ Site ที่ active และยังไม่หมดสัญญา
                        const totalSites = allSites.filter(s => {
                            if (!s.isActive) return false;
                            if (s.contractEndDate && s.contractEndDate < today) return false;
                            return true;
                        }).length;
                        const unscheduledSitesCount = totalSites - scheduledSitesForDay;
                        const isToday = dateKey === new Date().toISOString().split('T')[0];
                        const isAllScheduled = scheduledSitesForDay > 0 && scheduledSitesForDay >= totalSites;
                        
                        return (
                            <div 
                                key={`calendar-day-${i}`} 
                                onClick={() => handleDateClick(day)} 
                                className={`min-h-[100px] p-3 bg-white border-2 rounded-xl cursor-pointer hover:border-indigo-500 hover:shadow-lg transition-all duration-200 relative flex flex-col ${isToday ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-gray-200'} ${isAllScheduled ? 'bg-green-50' : ''}`}
                            >
                                {/* วันที่ */}
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-lg font-bold ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>{day}</span>
                                    {isToday && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">วันนี้</span>}
                                </div>
                                
                                {/* แสดงสถิติ */}
                                {(totalSites > 0 || scheduledSitesForDay > 0) && (
                                    <div className="mt-auto space-y-1">
                                        {scheduledSitesForDay > 0 && (
                                            <div className="flex items-center text-xs">
                                                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                                                <span className="text-green-700 font-medium">จัดแล้ว {scheduledSitesForDay}</span>
                                            </div>
                                        )}
                                        {unscheduledSitesCount > 0 && (
                                            <div className="flex items-center text-xs">
                                                <span className="w-2 h-2 rounded-full bg-orange-400 mr-1.5"></span>
                                                <span className="text-orange-600 font-medium">รอจัด {unscheduledSitesCount}</span>
                                            </div>
                                        )}
                                        {isAllScheduled && totalSites > 0 && (
                                            <div className="flex items-center text-xs text-green-600 font-bold">
                                                <span className="mr-1">✓</span> ครบแล้ว
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Site Selection Modal */}
            {isSiteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
                        <div className="flex items-center mb-6 flex-shrink-0">
                            <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <h2 className="text-2xl font-bold text-gray-800">เลือกหน่วยงานสำหรับวันที่ {selectedDate?.toLocaleDateString('th-TH')}</h2>
                        </div>

                        <div className="relative mb-6 flex-shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ค้นหาหน่วยงาน..."
                                value={siteSearchTerm}
                                onChange={(e) => setSiteSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            />
                        </div>

                        {isLoading ? (
                            <FullPageLoading text="กำลังโหลดตารางการจัดตาราง" />
                        ) : (
                            <div className="flex-1 grid grid-cols-2 gap-6 overflow-y-auto">
                                {/* Unscheduled Sites */}
                                <div className="border-2 border-gray-300 rounded-xl p-4 bg-gray-50">
                                    <h3 className="font-bold text-center border-b-2 border-gray-300 pb-3 mb-4 text-gray-700 text-lg">หน่วยงานที่ยังไม่จัดตารางงาน</h3>
                                    <div className="space-y-3">
                                        {displayedUnscheduledSites.length > 0 ? displayedUnscheduledSites.map(site => (
                                            <button 
                                                key={`unscheduled-site-${site.id}`} 
                                                onClick={() => handleSiteSelect(site)} 
                                                className="w-full text-left p-4 bg-white hover:bg-indigo-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-indigo-400"
                                            >
                                                <div className="flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <span className="font-medium">{site.name}</span>
                                                </div>
                                            </button>
                                        )) : <p className="text-center text-gray-500 text-sm p-6">ไม่มี</p>}
                                    </div>
                                </div>
                                {/* Scheduled Sites */}
                                <div className="border-2 border-green-300 rounded-xl p-4 bg-green-50">
                                    <h3 className="font-bold text-center border-b-2 border-green-300 pb-3 mb-4 text-green-700 text-lg">หน่วยงานที่จัดแล้ว</h3>
                                    <div className="space-y-3">
                                        {displayedScheduledSites.length > 0 ? displayedScheduledSites.map(site => (
                                            <button 
                                                key={`scheduled-site-${site.id}`} 
                                                onClick={() => handleSiteSelect(site)} 
                                                className="w-full text-left p-4 bg-white hover:bg-green-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-2 border-green-200 hover:border-green-400"
                                            >
                                                <div className="flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="font-medium text-green-800">{site.name}</span>
                                                </div>
                                            </button>
                                        )) : <p className="text-center text-gray-500 text-sm p-6">ไม่มี</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                        <button onClick={() => { setIsSiteModalOpen(false); setSiteSearchTerm(''); }} className="mt-6 w-full p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md font-semibold flex-shrink-0">ปิด</button>
                    </div>
                </div>
            )}

            {/* Scheduler Modal - Redesigned */}
            {isSchedulerModalOpen && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-8 py-5">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedSite?.name}</h2>
                                        <p className="text-indigo-100 text-sm mt-0.5">
                                            📅 {selectedDate?.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsSchedulerModalOpen(false)} 
                                    className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-all"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex gap-6 p-6 overflow-hidden bg-slate-50">
                            {/* Available Guards Panel */}
                            <div
                                className="w-80 flex-shrink-0 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden border border-slate-200"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, 'available')}
                            >
                                {/* Guards Header */}
                                <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">รปภ. ที่ว่าง</h3>
                                            <p className="text-slate-300 text-xs">{filteredAvailableGuards.length} คน พร้อมจัดกะ</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Search */}
                                <div className="p-4 border-b border-slate-100">
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="ค้นหาพนักงาน..."
                                            value={guardSearchTerm}
                                            onChange={(e) => setGuardSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                
                                {/* Guards List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {filteredAvailableGuards.length > 0 ? filteredAvailableGuards.map(guard => (
                                        <div
                                            key={`available-guard-${guard.id}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, guard, 'available')}
                                            className="group flex items-center p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md"
                                        >
                                            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3 group-hover:bg-indigo-200 transition-colors">
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-700 truncate">{guard.firstName} {guard.lastName}</p>
                                                <p className="text-xs text-slate-400">ลากไปวางในกะ</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-slate-400">
                                            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            <p className="text-sm">ไม่พบพนักงาน</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Shifts Area */}
                            <div className="flex-1 overflow-hidden">
                                {siteShifts.length > 0 ? (
                                    <div className={`grid gap-5 h-full ${siteShifts.length === 1 ? 'grid-cols-1' : siteShifts.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                        {siteShifts.map((shiftInfo, index) => {
                                            const colorSchemes = [
                                                { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'ring-amber-100', icon: '☀️', iconBg: 'bg-amber-100', iconText: 'text-amber-600', badge: 'bg-amber-100 text-amber-700', progress: 'bg-amber-500' },
                                                { gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50', border: 'border-indigo-200', ring: 'ring-indigo-100', icon: '🌙', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700', progress: 'bg-indigo-500' },
                                                { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-100', icon: '🌿', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', progress: 'bg-emerald-500' },
                                                { gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', border: 'border-purple-200', ring: 'ring-purple-100', icon: '✨', iconBg: 'bg-purple-100', iconText: 'text-purple-600', badge: 'bg-purple-100 text-purple-700', progress: 'bg-purple-500' },
                                            ];
                                            const colors = colorSchemes[index % colorSchemes.length];
                                            const guardsInShift = shifts[shiftInfo.shiftCode] || [];
                                            const targetCount = shiftInfo.numberOfPeople || 0;
                                            const currentCount = guardsInShift.length;
                                            const progressPercent = targetCount > 0 ? Math.min((currentCount / targetCount) * 100, 100) : 0;
                                            const isFull = currentCount >= targetCount && targetCount > 0;
                                            
                                            return (
                                                <div
                                                    key={`shift-${shiftInfo.shiftCode}`}
                                                    onDragOver={isFull ? undefined : handleDragOver}
                                                    onDrop={isFull ? undefined : (e) => handleDrop(e, shiftInfo.shiftCode)}
                                                    className={`bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden border-2 ${colors.border} hover:shadow-xl transition-shadow ${isFull ? 'cursor-not-allowed opacity-90' : ''}`}
                                                >
                                                    {/* Shift Header */}
                                                    <div className={`bg-gradient-to-r ${colors.gradient} px-5 py-4`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <span className="text-2xl">{colors.icon}</span>
                                                                <div>
                                                                    <h4 className="font-bold text-white text-lg">{shiftInfo.shiftName}</h4>
                                                                    <p className="text-white/80 text-sm">
                                                                        {shiftInfo.startTime ? shiftInfo.startTime.substring(0, 5) : '--:--'} - {shiftInfo.endTime ? shiftInfo.endTime.substring(0, 5) : '--:--'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${isFull ? 'bg-green-100 text-green-700' : 'bg-white/20 text-white'}`}>
                                                                    {isFull ? '✓ ครบแล้ว' : `${currentCount}/${targetCount}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Progress Bar */}
                                                        <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                                                            <div 
                                                                className={`h-full ${isFull ? 'bg-green-400' : 'bg-white'} transition-all duration-500 rounded-full`}
                                                                style={{ width: `${progressPercent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Guards in Shift - Compact Grid with Hover Details */}
                                                    <div className={`flex-1 overflow-y-auto p-3 ${colors.bg}`}>
                                                        {guardsInShift.length > 0 ? (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {guardsInShift.map(g => {
                                                                    // กำหนดสีตามตำแหน่ง
                                                                    const positionColors = {
                                                                        'หัวหน้าชุด': { bg: 'bg-red-500', text: 'text-white' },
                                                                        'หัวหน้ากะ': { bg: 'bg-orange-500', text: 'text-white' },
                                                                        'รองหัวหน้า': { bg: 'bg-amber-500', text: 'text-white' },
                                                                        'พนักงานรักษาความปลอดภัย': { bg: 'bg-blue-500', text: 'text-white' },
                                                                        'เจ้าหน้าที่รักษาความปลอดภัย': { bg: 'bg-blue-500', text: 'text-white' },
                                                                        'รปภ.': { bg: 'bg-blue-500', text: 'text-white' },
                                                                        'สแปร์': { bg: 'bg-purple-500', text: 'text-white' },
                                                                    };
                                                                    const pColor = positionColors[g.position] || { bg: 'bg-slate-500', text: 'text-white' };
                                                                    const guardCode = g.guardId || g.staffId || g.code || `G${String(g.id).padStart(3, '0')}`;
                                                                    
                                                                    return (
                                                                        <div
                                                                            key={`${shiftInfo.shiftCode}-guard-${g.id}`}
                                                                            draggable
                                                                            onDragStart={(e) => handleDragStart(e, g, shiftInfo.shiftCode)}
                                                                            className={`group bg-white rounded-lg border ${colors.border} hover:ring-2 ${colors.ring} shadow-sm hover:shadow-lg cursor-grab active:cursor-grabbing transition-all duration-150 relative overflow-hidden`}
                                                                        >
                                                                            {/* Delete Button */}
                                                                            <button 
                                                                                onClick={(e) => { e.stopPropagation(); removeGuardFromShift(g, shiftInfo.shiftCode); }} 
                                                                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-0.5 rounded-full shadow-md transition-all z-20 hover:bg-red-600"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                            
                                                                            {/* Header - รหัสพนักงาน */}
                                                                            <div className={`${pColor.bg} ${pColor.text} px-2 py-1 flex items-center justify-between`}>
                                                                                <span className="font-bold text-xs tracking-wide">{guardCode}</span>
                                                                                <span className="text-xs opacity-90">฿{(g.dailyIncome || 0).toLocaleString()}</span>
                                                                            </div>
                                                                            
                                                                            {/* Body - ชื่อ */}
                                                                            <div className="px-2 py-1.5">
                                                                                <p className="font-medium text-slate-700 text-sm truncate">
                                                                                    {g.firstName} {g.lastName}
                                                                                </p>
                                                                                <p className="text-xs text-slate-400 truncate">{g.position}</p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full py-8 text-slate-400">
                                                                <div className={`${colors.iconBg} p-4 rounded-full mb-3`}>
                                                                    <svg className={`w-8 h-8 ${colors.iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                                    </svg>
                                                                </div>
                                                                <p className="text-sm font-medium">ยังไม่มีพนักงาน</p>
                                                                <p className="text-xs mt-1">ลากพนักงานมาวางที่นี่</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-300">
                                        <div className="text-center p-8">
                                            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-lg font-semibold text-slate-600">ไม่มีข้อมูลกะงาน</p>
                                            <p className="text-sm text-slate-400 mt-2">กรุณาเพิ่มกะงานในหน้าหน่วยงานก่อน</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-white border-t border-slate-200 px-8 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6 text-sm text-slate-500">
                                    <span>💡 ลากพนักงานไปวางในกะที่ต้องการ</span>
                                </div>
                                <div className="flex space-x-3">
                                    <button 
                                        onClick={() => setIsSchedulerModalOpen(false)} 
                                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button 
                                        onClick={handleSaveSchedule} 
                                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all flex items-center space-x-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>บันทึกตารางงาน</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Position Selection Modal - Redesigned */}
            {isPositionModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/20 p-2.5 rounded-xl">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">เลือกตำแหน่งงาน</h3>
                                    <p className="text-indigo-100 text-sm">{guardForPosition?.firstName} {guardForPosition?.lastName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {!showManualInput ? (
                                <div className="space-y-3">
                                    {selectedSite?.employmentDetails?.map((detail, idx) => (
                                        <button
                                            key={`position-select-${idx}`}
                                            onClick={() => handlePositionSelect(detail.position)}
                                            className="w-full text-left p-4 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all duration-200 border-2 border-slate-200 hover:border-indigo-400 group"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-semibold text-slate-700">{detail.position}</span>
                                                </div>
                                                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                                                    ฿{(detail.dailyIncome || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    
                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-3 bg-white text-slate-400">หรือ</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowManualInput(true)}
                                        className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-amber-200 text-amber-700 w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-amber-300 transition-colors">
                                                    <span className="text-xl">⚡</span>
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-semibold text-amber-800 block">สแปร์</span>
                                                    <span className="text-xs text-amber-600">กำหนดราคาเอง</span>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">กำหนดราคาจ่ายสำหรับ "สแปร์"</label>
                                    <div className="flex space-x-3">
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">฿</span>
                                            <input
                                                type="number"
                                                placeholder="ใส่ราคา"
                                                value={manualPayoutRate}
                                                onChange={(e) => setManualPayoutRate(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                                                autoFocus
                                            />
                                        </div>
                                        <button 
                                            onClick={handleManualRateConfirm} 
                                            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all"
                                        >
                                            ยืนยัน
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => setShowManualInput(false)}
                                        className="mt-3 text-sm text-slate-500 hover:text-slate-700 flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        กลับไปเลือกตำแหน่ง
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6">
                            <button 
                                onClick={closePositionModal} 
                                className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}