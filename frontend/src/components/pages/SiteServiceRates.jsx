import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X, Check } from 'lucide-react';
import api from '../../config/api';

export default function SiteServiceRates() {
  const [rates, setRates] = useState([]);
  const [sites, setSites] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [filterSite, setFilterSite] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    siteId: '',
    serviceId: '',
    customRate: '',
    customDiligenceBonus: '',
    customSevenDayBonus: '',
    customPointBonus: '',
    useDefaultRate: false,
    remarks: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ratesRes, sitesRes, servicesRes] = await Promise.all([
        api.get('/site-service-rates'),
        api.get('/sites'),
        api.get('/services')
      ]);
      setRates(ratesRes.data);
      setSites(sitesRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        siteId: parseInt(formData.siteId),
        serviceId: parseInt(formData.serviceId),
        customRate: formData.customRate ? parseFloat(formData.customRate) : null,
        customDiligenceBonus: formData.customDiligenceBonus ? parseFloat(formData.customDiligenceBonus) : null,
        customSevenDayBonus: formData.customSevenDayBonus ? parseFloat(formData.customSevenDayBonus) : null,
        customPointBonus: formData.customPointBonus ? parseFloat(formData.customPointBonus) : null
      };

      if (editingRate) {
        await api.put(`/site-service-rates/${editingRate.id}`, payload);
        alert('อัปเดตอัตราค่าจ้างสำเร็จ');
      } else {
        await api.post('/site-service-rates', payload);
        alert('เพิ่มอัตราค่าจ้างสำเร็จ');
      }

      setIsModalOpen(false);
      setEditingRate(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving rate:', error);
      alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleEdit = (rate) => {
    setEditingRate(rate);
    setFormData({
      siteId: rate.siteId.toString(),
      serviceId: rate.serviceId.toString(),
      customRate: rate.customRate || '',
      customDiligenceBonus: rate.customDiligenceBonus || '',
      customSevenDayBonus: rate.customSevenDayBonus || '',
      customPointBonus: rate.customPointBonus || '',
      useDefaultRate: rate.useDefaultRate,
      remarks: rate.remarks || '',
      isActive: rate.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('คุณต้องการลบอัตราค่าจ้างนี้หรือไม่?')) return;

    try {
      await api.delete(`/site-service-rates/${id}`);
      alert('ลบอัตราค่าจ้างสำเร็จ');
      fetchData();
    } catch (error) {
      console.error('Error deleting rate:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const resetForm = () => {
    setFormData({
      siteId: '',
      serviceId: '',
      customRate: '',
      customDiligenceBonus: '',
      customSevenDayBonus: '',
      customPointBonus: '',
      useDefaultRate: false,
      remarks: '',
      isActive: true
    });
  };

  const filteredRates = filterSite === 'all' 
    ? rates 
    : rates.filter(r => r.siteId.toString() === filterSite);

  if (loading) {
    return <div className="flex justify-center items-center h-64">กำลังโหลด...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">จัดการอัตราค่าจ้างแยกตามหน่วยงาน</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingRate(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          เพิ่มอัตราค่าจ้าง
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">กรองตามหน่วยงาน:</label>
        <select
          value={filterSite}
          onChange={(e) => setFilterSite(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">ทั้งหมด</option>
          {sites.map(site => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หน่วยงาน</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตำแหน่ง</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">อัตรามาตรฐาน</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">อัตราเฉพาะ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">อัตราที่ใช้</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRates.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              filteredRates.map((rate) => (
                <tr key={rate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {rate.siteName}
                    <div className="text-xs text-gray-500">{rate.siteCode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {rate.serviceName}
                    <div className="text-xs text-gray-500">{rate.serviceCode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {rate.defaultRate?.toLocaleString()} ฿
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {rate.useDefaultRate ? (
                      <span className="text-gray-400">ใช้ค่ามาตรฐาน</span>
                    ) : rate.customRate ? (
                      <span className="text-blue-600 font-semibold">{rate.customRate.toLocaleString()} ฿</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                    {rate.effectiveRate?.toLocaleString()} ฿
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rate.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {rate.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleEdit(rate)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(rate.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingRate ? 'แก้ไขอัตราค่าจ้าง' : 'เพิ่มอัตราค่าจ้างใหม่'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">หน่วยงาน *</label>
                  <select
                    value={formData.siteId}
                    onChange={(e) => setFormData({...formData, siteId: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    required
                    disabled={editingRate}
                  >
                    <option value="">เลือกหน่วยงาน</option>
                    {sites.map(site => (
                      <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">ตำแหน่ง *</label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    required
                    disabled={editingRate}
                  >
                    <option value="">เลือกตำแหน่ง</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>{service.serviceName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.useDefaultRate}
                  onChange={(e) => setFormData({...formData, useDefaultRate: e.target.checked})}
                  id="useDefault"
                />
                <label htmlFor="useDefault" className="text-sm font-medium">
                  ใช้อัตราค่าจ้างมาตรฐาน (จากตาราง Services)
                </label>
              </div>

              {!formData.useDefaultRate && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">อัตราค่าจ้าง (บาท/วัน)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.customRate}
                      onChange={(e) => setFormData({...formData, customRate: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      placeholder="ระบุอัตราเฉพาะ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">เบี้ยขยัน (บาท)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.customDiligenceBonus}
                      onChange={(e) => setFormData({...formData, customDiligenceBonus: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">โบนัส 7 วัน (บาท)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.customSevenDayBonus}
                      onChange={(e) => setFormData({...formData, customSevenDayBonus: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">โบนัสแต้ม (บาท)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.customPointBonus}
                      onChange={(e) => setFormData({...formData, customPointBonus: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">หมายเหตุ</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                  placeholder="เช่น อัตราพิเศษเนื่องจาก..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-sm font-medium">ใช้งาน</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check size={20} />
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
