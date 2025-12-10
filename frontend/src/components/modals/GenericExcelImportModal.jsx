import React, { useState } from 'react';
import api from '../../config/api';
import { X, Upload, Download } from 'lucide-react';

export default function GenericExcelImportModal({ isOpen, onClose, onSuccess, entityType, title }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const entityConfig = {
        sites: {
            templateEndpoint: '/sites/template',
            importEndpoint: '/sites/import',
            templateFileName: 'site_template.xlsx',
            entityName: 'หน่วยงาน'
        },
        guards: {
            templateEndpoint: '/guards/template',
            importEndpoint: '/guards/import',
            templateFileName: 'guard_template.xlsx',
            entityName: 'พนักงาน รปภ.'
        },
        staff: {
            templateEndpoint: '/staff/template',
            importEndpoint: '/staff/import',
            templateFileName: 'staff_template.xlsx',
            entityName: 'พนักงานภายใน'
        }
    };

    const config = entityConfig[entityType] || entityConfig.sites;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
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
            const response = await api.get(config.templateEndpoint, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', config.templateFileName);
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
            const response = await api.post(config.importEndpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const data = response.data;
            
            let message = '📊 ผลลัพธ์การ Import\n\n';
            message += `✅ อัปใหม่: ${data.imported || 0} รายการ\n`;
            message += `⚠️ รายการซ้ำ: ${data.skipped || 0} รายการ\n`;
            message += `❌ อัปไม่สำเร็จ: ${data.errors || 0} รายการ`;
            
            alert(message);
            
            if (data.imported > 0 || data.success) {
                onSuccess();
                onClose();
            }
            
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
                {/* Header */}
                <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 p-8 text-white">
                    <button onClick={handleClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <Upload className="w-8 h-8" />
                        <div>
                            <h2 className="text-2xl font-bold">{title || `Import ข้อมูล${config.entityName}`}</h2>
                            <p className="text-green-100 text-sm mt-1">นำเข้าข้อมูลจากไฟล์ Excel อย่างรวดเร็ว</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {/* Step 1: Download Template */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                    1
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">ดาวน์โหลด Template</h3>
                                <p className="text-gray-600 text-sm mb-4">ดาวน์โหลดไฟล์ Excel ต้นแบบ เพื่อกรอกข้อมูล{config.entityName}ของคุณ</p>
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="inline-flex items-center px-4 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                                >
                                    <Download className="w-5 h-5 mr-2 animate-bounce" />
                                    ดาวน์โหลด Template
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Upload File */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                    2
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">อัปโหลดไฟล์</h3>
                                <p className="text-gray-600 text-sm mb-4">เลือกไฟล์ Excel ที่กรอกข้อมูลเรียบร้อยแล้ว</p>
                                
                                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center bg-white/50 hover:bg-white/80 transition-all duration-200">
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <Upload className="w-12 h-12 mx-auto text-purple-400 mb-3" />
                                        <p className="text-gray-700 font-medium mb-1">คลิกเพื่อเลือกไฟล์</p>
                                        <p className="text-gray-500 text-sm">รองรับไฟล์ .xlsx, .xls</p>
                                    </label>
                                    {file && (
                                        <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                                            <p className="text-purple-800 font-medium text-sm">📄 {file.name}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800 font-medium">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={uploading}
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center ${
                                !file || uploading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
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
                                    อัปโหลดและ Import
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
