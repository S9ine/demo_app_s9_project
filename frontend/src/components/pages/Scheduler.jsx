import React, { useState, useEffect } from 'react';
import api from '../../config/api'; // เรียกใช้ API Config
import { Search, X, GripVertical, Trash2 } from 'lucide-react';

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

            } catch (error) {
                console.error("Error fetching scheduler data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDateClick = (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
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

    const handleSaveSchedule = () => {
        if (!selectedDate || !selectedSite) return;

        const dateKey = selectedDate.toISOString().split('T')[0];

        // บันทึกลง Local State (เนื่องจากยังไม่มี API Endpoint สำหรับ Schedule)
        setSchedule(prev => {
            const updatedDateSchedule = {
                ...(prev[dateKey] || {}),
                [selectedSite.id]: {
                    siteId: selectedSite.id,
                    siteName: selectedSite.name,
                    shifts: shifts
                }
            };
            return {
                ...prev,
                [dateKey]: updatedDateSchedule
            };
        });

        // TODO: เมื่อมี Backend API สำหรับ Schedule ให้เรียกใช้ตรงนี้
        // ตัวอย่าง:
        // await api.post('/schedules', { 
        //    date: dateKey, 
        //    siteId: selectedSite.id, 
        //    shifts: shifts 
        // });

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
        // หาข้อมูลตำแหน่งจาก contractedServices ของ Site ที่เลือก
        const serviceInfo = selectedSite.contractedServices.find(s => s.position === position);
        if (!serviceInfo || !guardForPosition) return;

        const newGuardInShift = { ...serviceInfo, ...guardForPosition };

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
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">ตารางงาน</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>&lt;</button>
                    <h2 className="text-xl font-semibold">{currentDate.toLocaleString('th-TH', { month: 'long', year: 'numeric' })}</h2>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => <div key={`day-header-${d}`} className="font-semibold text-gray-600">{d}</div>)}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-day-${i}`}></div>)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const dateKey = date.toISOString().split('T')[0];
                        const scheduledSitesForDay = schedule[dateKey] ? Object.keys(schedule[dateKey]).length : 0;
                        return (
                            <div key={`calendar-day-${i}`} onClick={() => handleDateClick(day)} className="p-4 border rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors relative">
                                {day}
                                {scheduledSitesForDay > 0 && (
                                    <span className="absolute bottom-1 right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                        <h2 className="text-xl font-bold mb-4 flex-shrink-0">เลือกหน่วยงานสำหรับวันที่ {selectedDate?.toLocaleDateString('th-TH')}</h2>

                        <div className="relative mb-4 flex-shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ค้นหาหน่วยงาน..."
                                value={siteSearchTerm}
                                onChange={(e) => setSiteSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        {isLoading ? (
                            <div className="text-center py-4">กำลังโหลดข้อมูล...</div>
                        ) : (
                            <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto">
                                {/* Unscheduled Sites */}
                                <div className="border rounded-lg p-3">
                                    <h3 className="font-semibold text-center border-b pb-2 mb-2">หน่วยงานที่ยังไม่จัดตารางงาน</h3>
                                    <div className="space-y-2">
                                        {displayedUnscheduledSites.length > 0 ? displayedUnscheduledSites.map(site => (
                                            <button key={`unscheduled-site-${site.id}`} onClick={() => handleSiteSelect(site)} className="w-full text-left p-3 bg-gray-100 hover:bg-indigo-100 rounded-lg">
                                                {site.name}
                                            </button>
                                        )) : <p className="text-center text-gray-500 text-sm p-4">ไม่มี</p>}
                                    </div>
                                </div>
                                {/* Scheduled Sites */}
                                <div className="border rounded-lg p-3">
                                    <h3 className="font-semibold text-center border-b pb-2 mb-2 text-green-700">หน่วยงานที่จัดแล้ว</h3>
                                    <div className="space-y-2">
                                        {displayedScheduledSites.length > 0 ? displayedScheduledSites.map(site => (
                                            <button key={`scheduled-site-${site.id}`} onClick={() => handleSiteSelect(site)} className="w-full text-left p-3 bg-green-100 hover:bg-green-200 rounded-lg">
                                                {site.name}
                                            </button>
                                        )) : <p className="text-center text-gray-500 text-sm p-4">ไม่มี</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                        <button onClick={() => { setIsSiteModalOpen(false); setSiteSearchTerm(''); }} className="mt-4 w-full p-2 bg-red-500 text-white rounded-lg flex-shrink-0">ปิด</button>
                    </div>
                </div>
            )}

            {/* Scheduler Modal */}
            {isSchedulerModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h2 className="text-2xl font-bold">จัดตารางงาน: {selectedSite?.name} - {selectedDate?.toLocaleDateString('th-TH')}</h2>
                            <button onClick={() => setIsSchedulerModalOpen(false)} className="p-2 rounded-full hover:bg-gray-200"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
                            {/* Available Guards */}
                            <div
                                className="col-span-1 bg-gray-50 rounded-lg p-4 flex flex-col overflow-y-auto"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, 'available')}
                            >
                                <div className="relative mb-4 flex-shrink-0">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาพนักงาน..."
                                        value={guardSearchTerm}
                                        onChange={(e) => setGuardSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">รปภ. ที่ว่าง</h3>
                                <div className="space-y-2 overflow-y-auto">
                                    {filteredAvailableGuards.map(guard => (
                                        <div
                                            key={`available-guard-${guard.id}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, guard, 'available')}
                                            className="flex items-center p-3 bg-white border rounded-lg shadow-sm cursor-grab active:cursor-grabbing"
                                        >
                                            <GripVertical className="w-5 h-5 text-gray-400 mr-3" />
                                            {guard.firstName} {guard.lastName}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Shifts */}
                            <div className="col-span-2 grid grid-cols-2 gap-6 overflow-hidden">
                                <div
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, 'day')}
                                    className="bg-blue-50 rounded-lg p-4 flex flex-col overflow-y-auto"
                                >
                                    <h3 className="text-lg font-semibold mb-4 text-blue-800">
                                        กะกลางวัน (Day)
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            ({shifts.day.length} คน)
                                        </span>
                                    </h3>
                                    <div className="space-y-2">
                                        {shifts.day.map(g => (
                                            <div
                                                key={`day-shift-guard-${g.id}`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, g, 'day')}
                                                className="p-3 bg-white border border-blue-200 rounded-lg shadow-sm flex justify-between items-center cursor-grab active:cursor-grabbing"
                                            >
                                                <div>
                                                    <p className="font-semibold">{g.firstName} {g.lastName}</p>
                                                    <p className="text-sm text-gray-600">{g.position} - {g.payoutRate.toLocaleString()} บาท</p>
                                                </div>
                                                <button onClick={() => removeGuardFromShift(g, 'day')} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, 'night')}
                                    className="bg-indigo-50 rounded-lg p-4 flex flex-col overflow-y-auto"
                                >
                                    <h3 className="text-lg font-semibold mb-4 text-indigo-800">
                                        กะกลางคืน (Night)
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            ({shifts.night.length} คน)
                                        </span>
                                    </h3>
                                    <div className="space-y-2">
                                        {shifts.night.map(g => (
                                            <div
                                                key={`night-shift-guard-${g.id}`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, g, 'night')}
                                                className="p-3 bg-white border border-indigo-200 rounded-lg shadow-sm flex justify-between items-center cursor-grab active:cursor-grabbing"
                                            >
                                                <div>
                                                    <p className="font-semibold">{g.firstName} {g.lastName}</p>
                                                    <p className="text-sm text-gray-600">{g.position} - {g.payoutRate.toLocaleString()} บาท</p>
                                                </div>
                                                <button onClick={() => removeGuardFromShift(g, 'night')} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button onClick={() => setIsSchedulerModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">ยกเลิก</button>
                            <button onClick={handleSaveSchedule} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">บันทึกตารางงาน</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Position Selection Modal */}
            {isPositionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">เลือกตำแหน่งสำหรับ {guardForPosition?.firstName} {guardForPosition?.lastName}</h3>

                        {!showManualInput ? (
                            <div className="space-y-2">
                                {selectedSite?.contractedServices?.map(service => (
                                    <button
                                        key={`position-select-${service.id}`}
                                        onClick={() => handlePositionSelect(service.position)}
                                        className="w-full text-left p-3 bg-gray-100 hover:bg-indigo-100 rounded-lg flex justify-between"
                                    >
                                        <span>{service.position}</span>
                                        <span className="font-semibold">{service.payoutRate.toLocaleString()} บาท/วัน</span>
                                    </button>
                                ))}
                                <button
                                    onClick={() => setShowManualInput(true)}
                                    className="w-full text-left p-3 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-yellow-800 font-semibold"
                                >
                                    สแปร์ (กำหนดราคาเอง)
                                </button>
                            </div>
                        ) : (
                            <div className="mt-2">
                                <label className="block text-sm font-medium text-gray-700">กำหนดราคาจ่ายสำหรับ "สแปร์"</label>
                                <div className="mt-1 flex space-x-2">
                                    <input
                                        type="number"
                                        placeholder="ใส่ราคา"
                                        value={manualPayoutRate}
                                        onChange={(e) => setManualPayoutRate(e.target.value)}
                                        className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        autoFocus
                                    />
                                    <button onClick={handleManualRateConfirm} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">ยืนยัน</button>
                                </div>
                            </div>
                        )}

                        <button onClick={closePositionModal} className="mt-4 w-full p-2 bg-gray-200 text-gray-800 rounded-lg">ยกเลิก</button>
                    </div>
                </div>
            )}
        </div>
    );
}