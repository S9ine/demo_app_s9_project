import React, { useState } from 'react';
import api from '../../config/api';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, AlertCircle, Download } from 'lucide-react';

export default function ExcelImportModal({ isOpen, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
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
            setResult(null);
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
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/customers/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResult(response.data);
            if (response.data.success) {
                // Clear file input
                setFile(null);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.detail || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        if (result?.success) {
            onSuccess();
        }
        setFile(null);
        setResult(null);
        setError(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold flex items-center">
                        <FileSpreadsheet className="w-6 h-6 mr-2 text-green-600" />
                        Import ข้อมูลลูกค้าจาก Excel
                    </h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Step 1: Download Template */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-800 mb-2">1. ดาวน์โหลด Template</h3>
                        <p className="text-sm text-blue-600 mb-3">
                            ดาวน์โหลดไฟล์ Excel ต้นแบบเพื่อกรอกข้อมูลลูกค้าตามรูปแบบที่กำหนด
                        </p>
                        <button
                            onClick={handleDownloadTemplate}
                            className="flex items-center px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition-colors text-sm font-medium"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            ดาวน์โหลด Template
                        </button>
                    </div>

                    {/* Step 2: Upload File */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2">2. อัปโหลดไฟล์</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
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
                                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                <span className="text-gray-600 font-medium">
                                    {file ? file.name : 'คลิกเพื่อเลือกไฟล์ Excel'}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">
                                    รองรับไฟล์ .xlsx, .xls
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Result Summary */}
                    {result && (
                        <div className="bg-gray-50 rounded-lg p-4 border">
                            <h4 className="font-bold mb-3">ผลลัพธ์การ Import</h4>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-green-100 p-3 rounded text-center">
                                    <div className="text-green-800 text-xs font-bold uppercase">สำเร็จ</div>
                                    <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                                </div>
                                <div className="bg-yellow-100 p-3 rounded text-center">
                                    <div className="text-yellow-800 text-xs font-bold uppercase">ข้าม (ซ้ำ)</div>
                                    <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
                                </div>
                                <div className="bg-red-100 p-3 rounded text-center">
                                    <div className="text-red-800 text-xs font-bold uppercase">ผิดพลาด</div>
                                    <div className="text-2xl font-bold text-red-600">{result.errors}</div>
                                </div>
                            </div>

                            {/* Error Details */}
                            {result.errors > 0 && (
                                <div className="mt-4">
                                    <h5 className="font-semibold text-sm mb-2 text-red-700">รายการที่ผิดพลาด:</h5>
                                    <div className="bg-white border rounded max-h-40 overflow-y-auto text-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-100 sticky top-0">
                                                <tr>
                                                    <th className="p-2 border-b">แถวที่</th>
                                                    <th className="p-2 border-b">สาเหตุ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.details.errors.map((err, idx) => (
                                                    <tr key={idx} className="border-b last:border-0">
                                                        <td className="p-2 w-20">{err.row}</td>
                                                        <td className="p-2 text-red-600">{err.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        disabled={uploading}
                    >
                        {result?.success ? 'ปิด' : 'ยกเลิก'}
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`px-4 py-2 rounded-lg text-white font-medium flex items-center ${!file || uploading
                            ? 'bg-indigo-300 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
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
