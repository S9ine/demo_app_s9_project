import React, { useState } from 'react';
import api from '../../config/api';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, AlertCircle, Download } from 'lucide-react';

export default function ExcelImportModal({ isOpen, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
                setError('กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/customers/template', {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'customer_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download template failed:', err);
            setError('ไม่สามารถดาวน์โหลด Template ได้');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/customers/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const data = response.data;
            
            // Build result message
            let message = '📊 ผลลัพธ์การ Import\n\n';
            message += `✅ อัปใหม่: ${data.imported} รายการ\n`;
            message += `⚠️ รายการซ้ำ: ${data.skipped} รายการ\n`;
            message += `❌ อัปไม่สำเร็จ: ${data.errors} รายการ`;
            
            alert(message);
            
            // Close modal and refresh if any success
            if (data.imported > 0 || data.success) {
                onSuccess();
                onClose();
            }
            
            // Clear file input
            setFile(null);
        } catch (err) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.detail || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <FileSpreadsheet className="w-6 h-6 mr-2" />
                        <h2 className="text-2xl font-bold">Import ข้อมูลจาก Excel</h2>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Step 1: Download Template */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs mr-2">1</div>
                            <h3 className="font-bold text-blue-900 text-sm">ดาวน์โหลด Template</h3>
                        </div>
                        <p className="text-xs text-blue-700 mb-3 leading-relaxed">
                            ดาวน์โหลดไฟล์ Excel ต้นแบบเพื่อกรอกข้อมูลตามรูปแบบที่กำหนด
                        </p>
                        <button
                            onClick={handleDownloadTemplate}
                            className="flex items-center px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            ดาวน์โหลด Template
                        </button>
                    </div>

                    {/* Step 2: Upload File */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs mr-2">2</div>
                            <h3 className="font-bold text-purple-900 text-sm">อัปโหลดไฟล์</h3>
                        </div>
                        <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center bg-white hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                                    <Upload className="w-6 h-6 text-purple-600" />
                                </div>
                                <span className="text-gray-800 font-medium text-sm mb-1">
                                    {file ? file.name : 'คลิกเพื่อเลือกไฟล์ Excel'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    รองรับไฟล์ .xlsx, .xls
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="ml-2">
                                    <h3 className="text-xs font-semibold text-red-800">เกิดข้อผิดพลาด</h3>
                                    <p className="text-xs text-red-700 mt-0.5">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium text-sm transition-colors"
                        disabled={uploading}
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`px-5 py-2 rounded-lg text-white font-medium text-sm flex items-center transition-colors shadow-md hover:shadow-lg ${
                            !file || uploading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                        }`}
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                กำลังประมวลผล...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                เริ่ม Import
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
