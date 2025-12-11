import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ShiftFormModal = ({ shift, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    shiftCode: '',
    name: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shift) {
      setFormData({
        shiftCode: shift.shiftCode || '',
        name: shift.name || '',
        isActive: shift.isActive !== undefined ? shift.isActive : true
      });
    }
  }, [shift]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.shiftCode.trim()) {
      newErrors.shiftCode = 'กรุณากรอกรหัสกะ';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อกะ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setLoading(true);
      await onSave(formData);
    } catch (error) {
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {shift ? 'แก้ไขข้อมูลกะ' : 'เพิ่มกะใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสกะ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="shiftCode"
              value={formData.shiftCode}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.shiftCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="เช่น K01"
              disabled={loading}
            />
            {errors.shiftCode && (
              <p className="text-red-500 text-sm mt-1">{errors.shiftCode}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อกะ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="เช่น กะเช้า"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              ใช้งาน
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftFormModal;
