import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, DollarSign, Clock, TrendingUp, Building2 } from 'lucide-react';
import api from '../../config/api';
import { FullPageLoading } from '../common/LoadingSpinner';

const PayrollReport = () => {
  const [guards, setGuards] = useState([]);
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [workHistory, setWorkHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date range filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Fetch guards list
  useEffect(() => {
    fetchGuards();
  }, []);

  const fetchGuards = async () => {
    try {
      const response = await api.get('/guards');
      setGuards(response.data);
    } catch (error) {
      console.error('Error fetching guards:', error);
    }
  };

  // Fetch work history for selected guard
  const fetchWorkHistory = async (guardId) => {
    if (!guardId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await api.get(`/schedules/guard/${guardId}/work-history?${params}`);
      setWorkHistory(response.data);
    } catch (error) {
      console.error('Error fetching work history:', error);
      setWorkHistory(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle guard selection
  const handleGuardSelect = (guard) => {
    setSelectedGuard(guard);
    fetchWorkHistory(guard.guardId);
  };

  // Filter guards by search term
  const filteredGuards = guards.filter(guard => {
    const searchLower = searchTerm.toLowerCase();
    return (
      guard.guardId?.toLowerCase().includes(searchLower) ||
      `${guard.firstName} ${guard.lastName}`.toLowerCase().includes(searchLower)
    );
  });

  // Export to Excel (placeholder)
  const handleExport = () => {
    if (!workHistory || workHistory.workDays.length === 0) {
      alert('ไม่มีข้อมูลสำหรับ Export');
      return;
    }
    
    // TODO: Implement Excel export
    alert('ฟีเจอร์ Export จะพัฒนาในอนาคต');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">รายงานเงินเดือน รปภ.</h1>
        <p className="text-gray-600">ดูประวัติการทำงานและคำนวณเงินเดือนของพนักงาน</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Guards List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              เลือกพนักงาน
            </h2>
            
            {/* Search Box */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="ค้นหารหัส/ชื่อพนักงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Guards List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredGuards.map((guard) => (
                <button
                  key={guard.id}
                  onClick={() => handleGuardSelect(guard)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedGuard?.guardId === guard.guardId
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{guard.guardId}</div>
                  <div className="text-sm text-gray-600">
                    {guard.title} {guard.firstName} {guard.lastName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{guard.position || 'ไม่ระบุตำแหน่ง'}</div>
                </button>
              ))}
              
              {filteredGuards.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  ไม่พบพนักงาน
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Work History & Summary */}
        <div className="lg:col-span-2">
          {!selectedGuard ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">เลือกพนักงานเพื่อดูรายงาน</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header with Date Filter */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedGuard.title} {selectedGuard.firstName} {selectedGuard.lastName}
                    </h2>
                    <p className="text-gray-600">{selectedGuard.guardId}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">ถึง</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => fetchWorkHistory(selectedGuard.guardId)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      ดูข้อมูล
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <FullPageLoading text="กำลังโหลดข้อมูลการทำงาน" />
              ) : workHistory ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">วันทำงาน</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {workHistory.summary.totalWorkDays}
                          </p>
                          <p className="text-xs text-gray-500">วัน</p>
                        </div>
                        <Calendar className="w-10 h-10 text-blue-500 opacity-20" />
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">รายได้รวม</p>
                          <p className="text-2xl font-bold text-green-600">
                            {workHistory.summary.totalIncome.toLocaleString('th-TH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                          <p className="text-xs text-gray-500">บาท</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">กะเช้า</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {workHistory.summary.dayShiftCount}
                          </p>
                          <p className="text-xs text-gray-500">วัน</p>
                        </div>
                        <Clock className="w-10 h-10 text-orange-500 opacity-20" />
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">กะกลางคืน</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {workHistory.summary.nightShiftCount}
                          </p>
                          <p className="text-xs text-gray-500">วัน</p>
                        </div>
                        <Clock className="w-10 h-10 text-purple-500 opacity-20" />
                      </div>
                    </div>
                  </div>

                  {/* Work History Table */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        ประวัติการทำงาน ({workHistory.workDays.length} วัน)
                      </h3>
                      <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export Excel
                      </button>
                    </div>

                    {workHistory.workDays.length > 0 ? (
                      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">วันที่</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">หน่วยงาน</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">กะ</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ตำแหน่ง</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">ค่าจ้าง</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">เบี้ยเลี้ยง</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">รวม</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {workHistory.workDays.map((day, index) => {
                              const allowancesTotal = 
                                (day.allowances.positionAllowance || 0) +
                                (day.allowances.diligenceBonus || 0) +
                                (day.allowances.sevenDayBonus || 0) +
                                (day.allowances.pointBonus || 0) +
                                (day.allowances.otherAllowance || 0);

                              return (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-800">
                                    {new Date(day.date).toLocaleDateString('th-TH', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-800 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    {day.siteName}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                      day.shift === 'day' 
                                        ? 'bg-orange-100 text-orange-800' 
                                        : 'bg-purple-100 text-purple-800'
                                    }`}>
                                      {day.shift === 'day' ? '🌞 กะเช้า' : '🌙 กะกลางคืน'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-800">{day.position}</td>
                                  <td className="px-4 py-3 text-sm text-right text-gray-800">
                                    ฿{day.payoutRate.toLocaleString('th-TH', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                                    ฿{allowancesTotal.toLocaleString('th-TH', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                                    ฿{day.totalIncome.toLocaleString('th-TH', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-gray-100 font-semibold">
                            <tr>
                              <td colSpan="6" className="px-4 py-3 text-right text-gray-800">
                                รวมทั้งหมด:
                              </td>
                              <td className="px-4 py-3 text-right text-green-600 text-lg">
                                ฿{workHistory.summary.totalIncome.toLocaleString('th-TH', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p>ไม่พบข้อมูลการทำงานในช่วงเวลาที่เลือก</p>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollReport;
