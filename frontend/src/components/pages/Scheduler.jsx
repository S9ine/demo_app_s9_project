import React, { useState, useEffect } from 'react';
import api from '../../config/api'; // เรียกใช้ API Config
import { Search, X, GripVertical, Trash2 } from 'lucide-react';
import { FullPageLoading } from '../common/LoadingSpinner';

export default function Scheduler() {
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
    const [shifts, setShifts] = useState({ day: [], night: [] });
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
            const response = await api.get(`/schedules/date/${dateStr}`);
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
        
        // Fetch schedules for this date
        const scheduleData = await fetchSchedules(date);
        const dateKey = date.toISOString().split('T')[0];
        setSchedule({ [dateKey]: scheduleData[dateKey] || {} });
        
        setIsSiteModalOpen(true);
    };

    const handleSiteSelect = (site) => {
        setSelectedSite(site);
        setIsSiteModalOpen(false);
        setSiteSearchTerm('');

        const dateKey = selectedDate.toISOString().split('T')[0];
        const existingScheduleForDate = schedule[dateKey] || {};
        const existingScheduleForSite = existingScheduleForDate[site.id];

        // หา ID ของรปภ. ที่ถูกจัดตารางไปแล้วในวันนั้น (ทุก Site)
        const scheduledGuardIdsForDate = Object.values(existingScheduleForDate)
            .flatMap(s => [...s.shifts.day, ...s.shifts.night])
            .map(g => g.id);

        if (existingScheduleForSite) {
            setShifts(existingScheduleForSite.shifts);
            // กรองเฉพาะรปภ.ที่ยังว่างอยู่
            setAvailableGuards(allGuards.filter(g => !scheduledGuardIdsForDate.includes(g.id)));
        } else {
            setShifts({ day: [], night: [] });
            setAvailableGuards(allGuards.filter(g => !scheduledGuardIdsForDate.includes(g.id)));
        }

        setIsSchedulerModalOpen(true);
    };

    const handleSaveSchedule = async () => {
        if (!selectedDate || !selectedSite) return;

        const dateKey = selectedDate.toISOString().split('T')[0];

        // ตรวจสอบว่ามีพนักงานในกะหรือไม่
        const hasPeople = shifts.day.length > 0 || shifts.night.length > 0;

        try {
            if (hasPeople) {
                // บันทึกตารางงานลง database
                const schedulePayload = {
                    scheduleDate: dateKey,
                    siteId: selectedSite.id,
                    siteName: selectedSite.name,
                    shifts: {
                        day: shifts.day,
                        night: shifts.night
                    }
                };

                // ตรวจสอบว่ามีอยู่แล้วหรือไม่
                const existingScheduleId = schedule[dateKey]?.[selectedSite.id]?.scheduleId;

                if (existingScheduleId) {
                    // Update existing schedule
                    await api.put(`/schedules/${existingScheduleId}`, { shifts: schedulePayload.shifts });
                } else {
                    // Create new schedule
                    await api.post('/schedules', schedulePayload);
                }

                alert('บันทึกตารางงานสำเร็จ');
            } else {
                // ถ้าไม่มีพนักงาน -> ลบตารางงาน
                const existingScheduleId = schedule[dateKey]?.[selectedSite.id]?.scheduleId;
                if (existingScheduleId) {
                    await api.delete(`/schedules/${existingScheduleId}`);
                    alert('ลบตารางงานสำเร็จ');
                }
            }

            // Reload schedule data
            const scheduleData = await fetchSchedules(selectedDate);
            setSchedule({ [dateKey]: scheduleData[dateKey] || {} });

        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error);
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึก');
        }

        setIsSchedulerModalOpen(false);
        setSelectedSite(null);
        setShifts({ day: [], night: [] });
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
        const targetShift = target; // 'day' or 'night'
        if (source === targetShift || shifts[targetShift].find(g => g.id === guard.id)) {
            setDraggedItem(null);
            return;
        }

        // Case 1: From available to a shift
        if (source === 'available') {
            setGuardForPosition(guard);
            setTargetShift(targetShift);
            setIsPositionModalOpen(true);
            return;
        }

        // Case 2: From one shift to another
        if (source !== 'available') {
            const sourceShiftUpdated = shifts[source].filter(g => g.id !== guard.id);
            const targetShiftUpdated = [...shifts[targetShift], guard];
            setShifts({
                ...shifts,
                [source]: sourceShiftUpdated,
                [targetShift]: targetShiftUpdated
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

    let unscheduledSites = allSites.filter(site => !scheduledSiteIds.includes(String(site.id)));
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
                        return (
                            <div 
                                key={`calendar-day-${i}`} 
                                onClick={() => handleDateClick(day)} 
                                className="min-h-[80px] p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-indigo-500 hover:shadow-lg hover:scale-105 transition-all duration-200 relative flex items-start justify-center font-semibold text-lg"
                            >
                                <span className="text-gray-700">{day}</span>
                                {scheduledSitesForDay > 0 && (
                                    <span className="absolute bottom-2 right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md">
                                        {scheduledSitesForDay}
                                    </span>
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

            {/* Scheduler Modal */}
            {isSchedulerModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-white to-gray-100 p-8 rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col border-2 border-gray-200">
                        <div className="flex justify-between items-center border-b-2 border-gray-300 pb-4 mb-6">
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                                <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                {selectedSite?.name} - {selectedDate?.toLocaleDateString('th-TH')}
                            </h2>
                            <button onClick={() => setIsSchedulerModalOpen(false)} className="p-2 rounded-full hover:bg-red-100 transition-all"><X className="w-7 h-7 text-gray-600" /></button>
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
                            {/* Available Guards */}
                            <div
                                className="col-span-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 flex flex-col overflow-y-auto border-2 border-gray-300 shadow-lg"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, 'available')}
                            >
                                <div className="relative mb-4 flex-shrink-0">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาพนักงาน..."
                                        value={guardSearchTerm}
                                        onChange={(e) => setGuardSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-700 flex items-center">
                                    <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    รปภ. ที่ว่าง
                                </h3>
                                <div className="space-y-3 overflow-y-auto">
                                    {filteredAvailableGuards.map(guard => (
                                        <div
                                            key={`available-guard-${guard.id}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, guard, 'available')}
                                            className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:border-indigo-400 transition-all duration-200"
                                        >
                                            <GripVertical className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="font-medium text-gray-800">{guard.firstName} {guard.lastName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Shifts */}
                            <div className="col-span-2 grid grid-cols-2 gap-6 overflow-hidden">
                                <div
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, 'day')}
                                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 flex flex-col overflow-y-auto border-2 border-blue-300 shadow-lg"
                                >
                                    <h3 className="text-xl font-bold mb-4 text-blue-800 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <svg className="w-6 h-6 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                            </svg>
                                            <span>กะกลางวัน</span>
                                        </div>
                                        <span className="text-sm font-semibold bg-blue-200 px-3 py-1 rounded-full text-blue-900">
                                            {shifts.day.length} คน
                                        </span>
                                    </h3>
                                    <div className="space-y-3">
                                        {shifts.day.map(g => (
                                            <div
                                                key={`day-shift-guard-${g.id}`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, g, 'day')}
                                                className="p-4 bg-white border-2 border-blue-200 rounded-xl shadow-md hover:shadow-lg flex justify-between items-center cursor-grab active:cursor-grabbing hover:border-blue-400 transition-all duration-200"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-800 text-lg">{g.firstName} {g.lastName}</p>
                                                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                                                        <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        {g.position}
                                                    </p>
                                                    <p className="text-sm text-blue-700 font-bold mt-2 bg-blue-50 px-2 py-1 rounded inline-block">💰 {(g.dailyIncome || 0).toLocaleString()} ฿</p>
                                                </div>
                                                <button onClick={() => removeGuardFromShift(g, 'day')} className="ml-3 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, 'night')}
                                    className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 flex flex-col overflow-y-auto border-2 border-indigo-300 shadow-lg"
                                >
                                    <h3 className="text-xl font-bold mb-4 text-indigo-800 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                            </svg>
                                            <span>กะกลางคืน</span>
                                        </div>
                                        <span className="text-sm font-semibold bg-indigo-200 px-3 py-1 rounded-full text-indigo-900">
                                            {shifts.night.length} คน
                                        </span>
                                    </h3>
                                    <div className="space-y-3">
                                        {shifts.night.map(g => (
                                            <div
                                                key={`night-shift-guard-${g.id}`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, g, 'night')}
                                                className="p-4 bg-white border-2 border-indigo-200 rounded-xl shadow-md hover:shadow-lg flex justify-between items-center cursor-grab active:cursor-grabbing hover:border-indigo-400 transition-all duration-200"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-800 text-lg">{g.firstName} {g.lastName}</p>
                                                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                                                        <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        {g.position}
                                                    </p>
                                                    <p className="text-sm text-indigo-700 font-bold mt-2 bg-indigo-50 px-2 py-1 rounded inline-block">💰 {(g.dailyIncome || 0).toLocaleString()} ฿</p>
                                                </div>
                                                <button onClick={() => removeGuardFromShift(g, 'night')} className="ml-3 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button 
                                onClick={() => setIsSchedulerModalOpen(false)} 
                                className="px-8 py-3 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition-all shadow-md font-semibold flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>ยกเลิก</span>
                            </button>
                            <button 
                                onClick={handleSaveSchedule} 
                                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg font-semibold flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                <span>บันทึกตารางงาน</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Position Selection Modal */}
            {isPositionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
                    <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-200">
                        <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            เลือกตำแหน่ง: {guardForPosition?.firstName} {guardForPosition?.lastName}
                        </h3>

                        {!showManualInput ? (
                            <div className="space-y-3">
                                {selectedSite?.employmentDetails?.map((detail, idx) => (
                                    <button
                                        key={`position-select-${idx}`}
                                        onClick={() => handlePositionSelect(detail.position)}
                                        className="w-full text-left p-4 bg-white hover:bg-indigo-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-2 border-gray-200 hover:border-indigo-400"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-800">{detail.position}</span>
                                            <span className="text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 rounded-full font-bold">{(detail.dailyIncome || 0).toLocaleString()} ฿</span>
                                        </div>
                                    </button>
                                ))}
                                <button
                                    onClick={() => setShowManualInput(true)}
                                    className="w-full text-left p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300 rounded-xl text-yellow-900 font-bold shadow-sm hover:shadow-md transition-all duration-200 border-2 border-yellow-300"
                                >
                                    ⚡ สแปร์ (กำหนดราคาเอง)
                                </button>
                            </div>
                        ) : (
                            <div className="mt-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">กำหนดราคาจ่ายสำหรับ "สแปร์"</label>
                                <div className="mt-1 flex space-x-2">
                                    <input
                                        type="number"
                                        placeholder="ใส่ราคา"
                                        value={manualPayoutRate}
                                        onChange={(e) => setManualPayoutRate(e.target.value)}
                                        className="flex-grow block w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        autoFocus
                                    />
                                    <button onClick={handleManualRateConfirm} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-md font-semibold">ยืนยัน</button>
                                </div>
                            </div>
                        )}

                        <button onClick={closePositionModal} className="mt-6 w-full p-3 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition-all shadow-md font-semibold">ยกเลิก</button>
                    </div>
                </div>
            )}
        </div>
    );
}