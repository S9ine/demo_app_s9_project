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
      position: staffMember?.position || "",
      department: staffMember?.department || "",
      phone: staffMember?.phone || "",
      email: staffMember?.email || "",
      
      // ข้อมูลวันที่
      startDate: staffMember?.startDate || "",
      birthDate: staffMember?.birthDate || "",
      
      // ข้อมูลเงินเดือน
      salary: staffMember?.salary || "",
      salaryType: staffMember?.salaryType || "รายเดือน",
      
      // ข้อมูลการรับเงิน
      paymentMethod: staffMember?.paymentMethod || "โอนเข้าบัญชี",
      bankAccountNo: staffMember?.bankAccountNo || "",
      bankCode: staffMember?.bankCode || "",
      
      status: staffMember?.status || "Active",
    };
    setFormData(initialData);
  }, [staffMember, isOpen]);

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
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6">
            {staffMember ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                รหัสพนักงาน
              </label>
              <input
                type="text"
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                คำนำหน้า
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option>นาย</option>
                <option>นาง</option>
                <option>นางสาว</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ชื่อ
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                สกุล
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                เลขบัตรประชาชน
              </label>
              <input
                type="text"
                name="idCardNumber"
                value={formData.idCardNumber}
                onChange={handleChange}
                maxLength="13"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="1234567890123"
              />
            </div>
            
            {/* ข้อมูลวันที่ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                วันเริ่มงาน
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                วันเกิด
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ตำแหน่ง
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="เช่น พนักงานบัญชี, หัวหน้าแผนก"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                แผนก
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="เช่น บัญชี, ทรัพยากรบุคคล"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                เบอร์โทรศัพท์
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                อีเมล
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* ข้อมูลเงินเดือน */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                เงินเดือน (บาท)
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                step="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ประเภทเงินเดือน
              </label>
              <select
                name="salaryType"
                value={formData.salaryType}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="รายเดือน">รายเดือน</option>
                <option value="รายวัน">รายวัน</option>
                <option value="รายชั่วโมง">รายชั่วโมง</option>
              </select>
            </div>
            
            {/* ข้อมูลการรับเงิน */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                วิธีรับเงิน
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="โอนเข้าบัญชี">โอนเข้าบัญชี</option>
                <option value="เงินสด">เงินสด</option>
                <option value="เช็ค">เช็ค</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ธนาคาร
              </label>
              <select
                name="bankCode"
                value={formData.bankCode}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">เลือกธนาคาร</option>
                {banks.map(bank => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                เลขบัญชีธนาคาร
              </label>
              <input
                type="text"
                name="bankAccountNo"
                value={formData.bankAccountNo}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                สถานะ
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Active">ทำงาน</option>
                <option value="Resigned">ลาออก</option>
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
