import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import apiClient from '../../config/api';
import ShiftFormModal from '../modals/ShiftFormModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import { FullPageLoading } from '../common/LoadingSpinner';

const ShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/shifts');
      setShifts(response.data);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลกะ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShift = () => {
    setSelectedShift(null);
    setIsModalOpen(true);
  };

  const handleEditShift = (shift) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (shift) => {
    setDeleteTarget(shift);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiClient.delete(`/shifts/${deleteTarget.id}`);
      await fetchShifts();
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบข้อมูลกะ:', error);
      alert('ไม่สามารถลบข้อมูลกะได้');
    }
  };

  const handleSaveShift = async (shiftData) => {
    try {
      if (selectedShift) {
        await apiClient.put(`/shifts/${selectedShift.id}`, shiftData);
      } else {
        await apiClient.post('/shifts', shiftData);
      }
      await fetchShifts();
      setIsModalOpen(false);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูลกะ:', error);
      throw error;
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">จัดการข้อมูลกะ</h2>
          <button
            onClick={handleAddShift}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            เพิ่มกะใหม่
          </button>
        </div>

        {loading ? (
          <FullPageLoading text="กำลังโหลดข้อมูลกะงาน" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    รหัสกะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อกะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      ไม่พบข้อมูลกะ
                    </td>
                  </tr>
                ) : (
                  shifts.map((shift) => (
                    <tr key={shift.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {shift.shiftCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shift.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            shift.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {shift.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditShift(shift)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(shift)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ShiftFormModal
          shift={selectedShift}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveShift}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          title="ยืนยันการลบ"
          message={`คุณต้องการลบกะ "${deleteTarget?.name}" ใช่หรือไม่?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default ShiftList;
