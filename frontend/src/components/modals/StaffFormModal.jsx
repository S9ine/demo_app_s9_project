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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4">
          <h2 className="text-2xl font-bold">
            {staffMember ? 'แก้ไขข้อมูลพนักงานภายใน' : 'เพิ่มพนักงานภายในใหม่'}
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* รหัสพนักงาน (แสดงเฉพาะตอนแก้ไข) */}
            {staffMember && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <label className="block text-xs font-medium text-teal-700 mb-1">รหัสพนักงาน</label>
                <div className="text-lg font-bold text-teal-600">{formData.staffId}</div>
              </div>
            )}
            
            {/* ข้อมูลส่วนตัว */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-teal-700 mb-3 pb-2 border-b border-teal-200">ข้อมูลส่วนตัว</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">คำนำหน้า <span className="text-red-500">*</span></label>
                    <select name="title" value={formData.title || ''} onChange={handleChange} required className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-teal-500">
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อ <span className="text-red-500">*</span></label>
                    <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} required className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-teal-500" placeholder="สมศักดิ์" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">สกุล <span className="text-red-500">*</span></label>
                    <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} required className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-teal-500" placeholder="ใจดี" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">วันเกิด</label>
                    <input type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-teal-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">เลขที่บัตรประชาชน (13 หลัก)</label>
                  <input type="text" name="idCardNumber" value={formData.idCardNumber || ''} onChange={handleChange} maxLength="13" className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-teal-500" placeholder="1234567890123" />
                </div>
              </div>
            </div>

            {/* ตำแหน่ง/แผนก */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-blue-700 mb-3 pb-2 border-b border-blue-200">ตำแหน่ง/แผนก</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ตำแหน่ง</label>
                  <input type="text" name="position" value={formData.position || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500" placeholder="พนักงานบัญชี" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">แผนก</label>
                  <input type="text" name="department" value={formData.department || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500" placeholder="บัญชี, HR" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">วันเริ่มงาน</label>
                  <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* ข้อมูลติดต่อ */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-green-700 mb-3 pb-2 border-b border-green-200">ข้อมูลติดต่อ</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                  <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500" placeholder="081-234-5678" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">อีเมล</label>
                  <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-green-500" placeholder="example@company.com" />
                </div>
              </div>
            </div>

            {/* เงินเดือนและธนาคาร */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-yellow-700 mb-3 pb-2 border-b border-yellow-200">เงินเดือนและธนาคาร</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">เงินเดือน (บาท)</label>
                  <input type="number" name="salary" value={formData.salary || ''} onChange={handleChange} step="0.01" className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-yellow-500" placeholder="35000.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ธนาคาร</label>
                  <select name="bankName" value={formData.bankName || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-yellow-500">
                    <option value="">-- เลือกธนาคาร --</option>
                    {banks.map(bank => (
                      <option key={bank.id} value={bank.name}>{bank.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">เลขที่บัญชี</label>
                  <input type="text" name="bankAccountNo" value={formData.bankAccountNo || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-yellow-500" placeholder="1112223334" />
                </div>
              </div>
            </div>

            {/* ผู้ติดต่อฉุกเฉิน */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-red-700 mb-3 pb-2 border-b border-red-200">ผู้ติดต่อฉุกเฉิน</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อผู้ติดต่อ</label>
                  <input type="text" name="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500" placeholder="นางสมหญิง" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">เบอร์โทร</label>
                  <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500" placeholder="082-345-6789" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ความสัมพันธ์</label>
                  <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation || ''} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500" placeholder="แม่, พี่สาว" />
                </div>
              </div>
            </div>

            {/* สถานะ */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-200">สถานะ</h3>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">สถานะการทำงาน</label>
                <select name="status" value={formData.status || 'Active'} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-500">
                  <option value="Active">ทำงาน</option>
                  <option value="Resigned">ลาออก</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium text-sm transition-colors">
              ยกเลิก
            </button>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 font-medium text-sm transition-colors shadow-md hover:shadow-lg">
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
