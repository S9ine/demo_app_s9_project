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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 p-8 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center mb-2">
                                <FileSpreadsheet className="w-7 h-7 mr-3" />
                                Import ข้อมูลจาก Excel
                            </h2>
                            <p className="text-green-100 text-sm">นำเข้าข้อมูลลูกค้าจากไฟล์ Excel อย่างรวดเร็ว</p>
                        </div>
                        <button 
                            onClick={handleClose} 
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                    {/* Step 1: Download Template - Enhanced */}
                    <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 opacity-20 rounded-full -mr-12 -mt-12"></div>
                        <div className="relative z-10">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">1</div>
                                <h3 className="font-bold text-blue-900 text-lg">ดาวน์โหลด Template</h3>
                            </div>
                            <p className="text-sm text-blue-700 mb-4 leading-relaxed">
                                ดาวน์โหลดไฟล์ Excel ต้นแบบเพื่อกรอกข้อมูลลูกค้าตามรูปแบบที่กำหนด
                            </p>
                            <button
                                onClick={handleDownloadTemplate}
                                className="flex items-center px-5 py-3 bg-white border-2 border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 hover:shadow-lg transition-all font-semibold group"
                            >
                                <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                                ดาวน์โหลด Template
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Upload File - Enhanced */}
                    <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200 overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-200 opacity-20 rounded-full -ml-12 -mb-12"></div>
                        <div className="relative z-10">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">2</div>
                                <h3 className="font-bold text-purple-900 text-lg">อัปโหลดไฟล์</h3>
                            </div>
                            <div className="border-2 border-dashed border-purple-300 rounded-xl p-10 text-center bg-white hover:border-purple-500 hover:bg-purple-50/30 transition-all cursor-pointer group">
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
                                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <span className="text-gray-800 font-semibold text-lg mb-1">
                                        {file ? file.name : 'คลิกเพื่อเลือกไฟล์ Excel'}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        รองรับไฟล์ .xlsx, .xls
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Error Message - Enhanced */}
                    {error && (
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-5 rounded-r-xl shadow-md">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-6 w-6 text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-semibold text-red-800 mb-1">เกิดข้อผิดพลาด</h3>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with enhanced buttons */}
                <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-slate-50 border-t flex justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:shadow-md font-semibold transition-all"
                        disabled={uploading}
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`px-6 py-3 rounded-xl text-white font-bold flex items-center shadow-lg transition-all ${!file || uploading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105'
                            }`}
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                กำลังประมวลผล...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5 mr-2" />
                                เริ่ม Import
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
