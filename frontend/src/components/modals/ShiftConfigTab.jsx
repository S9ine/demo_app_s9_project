import React from 'react';

export default function ShiftConfigTab({ shiftConfig, onChange }) {
    const handleShiftChange = (shiftType, field, value) => {
        const updatedConfig = {
            ...shiftConfig,
            [shiftType]: {
                ...(shiftConfig?.[shiftType] || {}),
                [field]: value
            }
        };
        onChange(updatedConfig);
    };

    const renderShiftConfig = (shiftType, title) => {
        const shift = shiftConfig?.[shiftType] || {
            enabled: true,
            name: shiftType === 'day' ? 'กะเช้า' : 'กะดึก',
            requiredGuards: 1,
            startTime: shiftType === 'day' ? '08:00' : '20:00',
            endTime: shiftType === 'day' ? '20:00' : '08:00'
        };

        return (
            <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={shift.enabled}
                                onChange={(e) => handleShiftChange(shiftType, 'enabled', e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`block w-14 h-8 rounded-full transition ${shift.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${shift.enabled ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                            {shift.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                    </label>
                </div>

                {shift.enabled && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อกะ</label>
                            <input
                                type="text"
                                value={shift.name}
                                onChange={(e) => handleShiftChange(shiftType, 'name', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="เช่น กะเช้า, กะดึก"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                จำนวนพนักงานที่ต้องการ
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={shift.requiredGuards}
                                onChange={(e) => handleShiftChange(shiftType, 'requiredGuards', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">เวลาเริ่ม</label>
                                <input
                                    type="time"
                                    value={shift.startTime}
                                    onChange={(e) => handleShiftChange(shiftType, 'startTime', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">เวลาสิ้นสุด</label>
                                <input
                                    type="time"
                                    value={shift.endTime}
                                    onChange={(e) => handleShiftChange(shiftType, 'endTime', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                    <strong>💡 คำแนะนำ:</strong> กำหนดกะงานที่ใช้ในหน่วยงานนี้ ระบบจะแสดงกะที่เปิดใช้งานในหน้าตารางงาน
                    และช่วยคำนวณจำนวนพนักงานที่ต้องการในแต่ละวัน
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderShiftConfig('day', '🌅 กะเช้า / กะกลางวัน')}
                {renderShiftConfig('night', '🌙 กะดึก / กะกลางคืน')}
            </div>
        </div>
    );
}
