import React, { useState, useEffect } from "react";

export default function StaffFormModal({
  isOpen,
  onClose,
  onSave,
  staffMember,
  banks = [],
}) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const initialData = {
      id: staffMember?.id || null,
      staffId: staffMember?.staffId || "",
      title: staffMember?.title || "นาย",
      firstName: staffMember?.firstName || "",
      lastName: staffMember?.lastName || "",
      idCardNumber: staffMember?.idCardNumber || "",
      birthDate: staffMember?.birthDate || "",
      
      // ตำแหน่ง/แผนก
      position: staffMember?.position || "",
      department: staffMember?.department || "",
      
      // ข้อมูลติดต่อ
      phone: staffMember?.phone || "",
      email: staffMember?.email || "",
      
      // การทำงาน
      startDate: staffMember?.startDate || "",
      
      // เงินเดือนและธนาคาร
      salary: staffMember?.salary || "",
      bankAccountNo: staffMember?.bankAccountNo || "",
      bankCode: staffMember?.bankCode || "",
      bankName: staffMember?.bankName || (banks.length > 0 ? banks[0].name : ""),
      
      // ผู้ติดต่อฉุกเฉิน
      emergencyContactName: staffMember?.emergencyContactName || "",
      emergencyContactPhone: staffMember?.emergencyContactPhone || "",
      emergencyContactRelation: staffMember?.emergencyContactRelation || "",
      
      status: staffMember?.status || "Active",
    };
    setFormData(initialData);
  }, [staffMember, isOpen, banks]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-teal-600 border-b-2 border-teal-200 pb-3">
            {staffMember ? '✏️ แก้ไขข้อมูลพนักงานภายใน' : '➕ เพิ่มพนักงานภายในใหม่'}
          </h2>
          
          {/* รหัสพนักงาน (แสดงเฉพาะตอนแก้ไข) */}
          {staffMember && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสพนักงาน</label>
              <div className="text-xl font-bold text-teal-600">{formData.staffId}</div>
              <p className="text-xs text-gray-500 mt-1">* รหัสพนักงานถูกสร้างอัตโนมัติ ไม่สามารถแก้ไขได้</p>
            </div>
          )}
          
          {/* ข้อมูลส่วนตัว */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 bg-teal-50 p-2 rounded">👤 ข้อมูลส่วนตัว</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า <span className="text-red-500">*</span></label>
                <select name="title" value={formData.title || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500">
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ <span className="text-red-500">*</span></label>
                <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สกุล <span className="text-red-500">*</span></label>
                <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันเกิด</label>
                <input type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่บัตรประชาชน (13 หลัก)</label>
                <input type="text" name="idCardNumber" value={formData.idCardNumber || ''} onChange={handleChange} maxLength="13" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" placeholder="1234567890123" />
              </div>
            </div>
          </div>

          {/* ตำแหน่ง/แผนก */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 bg-blue-50 p-2 rounded">💼 ตำแหน่ง/แผนก</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
                <input type="text" name="position" value={formData.position || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" placeholder="เช่น พนักงานบัญชี" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">แผนก</label>
                <input type="text" name="department" value={formData.department || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" placeholder="เช่น บัญชี, HR" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มงาน</label>
                <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
          </div>

          {/* ข้อมูลติดต่อ */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 bg-green-50 p-2 rounded">📞 ข้อมูลติดต่อ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" placeholder="081-234-5678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" placeholder="example@company.com" />
              </div>
            </div>
          </div>

          {/* เงินเดือนและธนาคาร */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 bg-yellow-50 p-2 rounded">💰 เงินเดือนและธนาคาร</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เงินเดือน (บาท)</label>
                <input type="number" name="salary" value={formData.salary || ''} onChange={handleChange} step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" placeholder="15000.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ธนาคาร</label>
                <select name="bankName" value={formData.bankName || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500">
                  <option value="">-- เลือกธนาคาร --</option>
                  {banks.map(bank => (
                    <option key={bank.id} value={bank.name}>{bank.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่บัญชี</label>
                <input type="text" name="bankAccountNo" value={formData.bankAccountNo || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" placeholder="1234567890" />
              </div>
            </div>
          </div>

          {/* ผู้ติดต่อฉุกเฉิน */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 bg-red-50 p-2 rounded">🚨 ผู้ติดต่อฉุกเฉิน</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบุคคลที่ติดต่อได้ในกรณีฉุกเฉิน</label>
                <input type="text" name="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์บุคคลฉุกเฉิน</label>
                <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ความสัมพันธ์กับบุคคลฉุกเฉิน</label>
                <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" placeholder="พ่อ, แม่, พี่, น้อง" />
              </div>
            </div>
          </div>

          {/* สถานะ */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 bg-gray-50 p-2 rounded">📋 สถานะ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะการทำงาน</label>
                <select name="status" value={formData.status || 'Active'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500">
                  <option value="Active">ทำงาน</option>
                  <option value="Resigned">ลาออก</option>
                </select>
              </div>
            </div>
          </div>

          {/* ปุ่ม */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition">
              ยกเลิก
            </button>
            <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 font-medium transition shadow-md">
              💾 บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
