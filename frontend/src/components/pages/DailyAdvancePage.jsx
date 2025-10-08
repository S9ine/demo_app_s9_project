import React, { useState, useEffect, useMemo } from 'react';
import { initialGuards, initialUsers, initialAdvanceDocuments } from '../../data/mockData';
import { PlusCircle, Edit, Trash2, X, FileText, User, Clock, Share2, Download } from 'lucide-react';

// Component for Creating/Editing Documents
function AdvanceBatchModal({ isOpen, onClose, onSave, guards, document, advanceType, currentUser, getUserFullName }) {
    const [docData, setDocData] = useState({});
    const [entryRows, setEntryRows] = useState([]);
    const [searchTerms, setSearchTerms] = useState({});
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        if (isOpen) {
            if (document) {
                setDocData(document);
                const rows = document.items.map(item => {
                    const guard = guards.find(g => g.id === item.guardId);
                    if (guard) {
                       setSearchTerms(prev => ({ ...prev, [item.guardId]: `${guard.guardId} - ${guard.name}` }));
                    }
                    return { tempId: item.guardId, ...item };
                });
                setEntryRows(rows);
            } else {
                const today = new Date();
                const dateStr = today.toISOString().split('T')[0];
                const prefix = advanceType === 'advance' ? 'ADV' : 'CASH';
                const docNumber = `${prefix}-${dateStr.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;

                setDocData({ docNumber, date: dateStr, type: advanceType, createdBy: currentUser.username });
                setEntryRows([{ tempId: Date.now(), guardId: '', amount: '', reason: '' }]);
                setSearchTerms({});
            }
        }
    }, [isOpen, document, guards, advanceType, currentUser]);

    const summary = useMemo(() => {
        const totalAmount = entryRows.reduce((sum, row) => {
            const amount = parseFloat(row.amount);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        const totalItems = entryRows.length;
        return { totalAmount, totalItems };
    }, [entryRows]);

    const handleAddRow = () => {
        setEntryRows([...entryRows, { tempId: Date.now(), guardId: '', amount: '', reason: '' }]);
    };

    const handleRemoveRow = (tempId) => {
        setEntryRows(entryRows.filter(row => row.tempId !== tempId));
    };

    const handleRowChange = (tempId, field, value) => {
        setEntryRows(entryRows.map(row => row.tempId === tempId ? { ...row, [field]: value } : row));
    };

    const handleGuardSearch = (tempId, term) => {
        setSearchTerms({ ...searchTerms, [tempId]: term });
        handleRowChange(tempId, 'guardId', '');
        setActiveDropdown(tempId);
    };

    const handleGuardSelect = (tempId, guard) => {
        handleRowChange(tempId, 'guardId', guard.id);
        setSearchTerms({ ...searchTerms, [tempId]: `${guard.guardId} - ${guard.name}` });
        setActiveDropdown(null);
    };

    const handleSave = (status) => {
        const validItems = entryRows
            .filter(row => row.guardId && parseFloat(row.amount) > 0)
            .map(({ tempId, ...item }) => ({...item, amount: parseFloat(item.amount)}));

        if (validItems.length === 0) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วนอย่างน้อย 1 รายการ (ต้องเลือกพนักงานและระบุจำนวนเงิน)");
            return;
        }

        const finalDocument = {
            ...docData,
            id: document?.id || Date.now(),
            status,
            items: validItems,
            createdBy: document?.createdBy || currentUser.username,
        };

        onSave(finalDocument);
        onClose();
    };

    const getFilteredGuards = (tempId) => {
        const term = searchTerms[tempId]?.toLowerCase() || '';
        if (!term) return [];
        return guards.filter(g =>
            g.name.toLowerCase().includes(term) ||
            g.guardId.toLowerCase().includes(term)
        ).slice(0, 5);
    };

    if (!isOpen) return null;

    const creatorName = document
        ? getUserFullName(document.createdBy)
        : `${currentUser.firstName} ${currentUser.lastName}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold">{document ? 'แก้ไขเอกสารเบิก' : 'สร้างเอกสารเบิกใหม่'}</h2>
                    <button type="button" onClick={onClose}><X className="w-6 h-6 text-gray-500 hover:text-gray-600"/></button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
                    <div><span className="font-semibold">เลขที่เอกสาร:</span> {docData.docNumber}</div>
                    <div><span className="font-semibold">วันที่:</span> {new Date(docData.date || Date.now()).toLocaleDateString('th-TH')}</div>
                    <div className="col-span-2"><span className="font-semibold">ผู้สร้าง:</span> {creatorName}</div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 bg-gray-100 p-3 rounded-lg">
                    {entryRows.map((row, index) => (
                        <div key={row.tempId} className="bg-white p-4 rounded-lg shadow-sm border relative">
                            <div className="flex items-start space-x-4">
                                <span className="font-bold text-lg text-indigo-600 mt-2">{index + 1}.</span>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                                    <div className="relative md:col-span-2">
                                        <label className="text-xs font-medium text-gray-600">พนักงาน (รหัส หรือ ชื่อ)</label>
                                        <input
                                            type="text"
                                            placeholder="ค้นหาพนักงาน..."
                                            value={searchTerms[row.tempId] || ''}
                                            onChange={(e) => handleGuardSearch(row.tempId, e.target.value)}
                                            className="w-full p-2 border rounded-md mt-1"
                                        />
                                        {activeDropdown === row.tempId && getFilteredGuards(row.tempId).length > 0 && (
                                            <div className="absolute z-20 w-full bg-white border rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                                                {getFilteredGuards(row.tempId).map(guard => (
                                                    <div key={guard.id} onClick={() => handleGuardSelect(row.tempId, guard)} className="p-2 hover:bg-indigo-100 cursor-pointer text-sm">
                                                        {guard.guardId} - {guard.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="text-xs font-medium text-gray-600">จำนวนเงิน</label>
                                        <input
                                            type="number"
                                            value={row.amount}
                                            onChange={(e) => handleRowChange(row.tempId, 'amount', e.target.value)}
                                            className="w-full p-2 border rounded-md mt-1"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-medium text-gray-600">เหตุผลการเบิก</label>
                                        <input
                                            type="text"
                                            value={row.reason}
                                            onChange={(e) => handleRowChange(row.tempId, 'reason', e.target.value)}
                                            className="w-full p-2 border rounded-md mt-1"
                                            placeholder="เช่น ค่าเดินทาง, เบิกล่วงหน้า"
                                        />
                                    </div>
                                </div>
                                <button onClick={() => handleRemoveRow(row.tempId)} className="text-red-500 hover:text-red-700 mt-2 p-1">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                     <button onClick={handleAddRow} className="w-full flex items-center justify-center mt-2 px-3 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 border-2 border-dashed border-gray-300 transition-colors text-sm font-semibold">
                        <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มรายการ
                    </button>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center font-semibold">
                     <p className="text-gray-600">
                        ทั้งหมด: <span className="text-indigo-600">{summary.totalItems}</span> รายการ
                     </p>
                     <p className="text-gray-800 text-lg">
                        ยอดรวม: <span className="text-green-600">{summary.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span> บาท
                     </p>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={() => handleSave('Draft')} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">บันทึกแบบร่าง</button>
                    <button type="button" onClick={() => handleSave('Pending')} className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">ยืนยันส่งเบิก</button>
                </div>
            </div>
        </div>
    );
}

// Component for Previewing and Saving Image
function AdvanceDocumentPreviewModal({ isOpen, onClose, document, getGuardName, getUserFullName }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isScriptReady, setIsScriptReady] = useState(false);

    useEffect(() => {
        if (isOpen && !window.html2canvas) {
            const scriptId = 'html2canvas-script';
            let script = document.getElementById(scriptId);

            if (!script) {
                script = document.createElement('script');
                script.id = scriptId;
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
                script.async = true;
                
                script.onload = () => {
                    console.log("html2canvas script loaded successfully.");
                    setIsScriptReady(true);
                };
                
                document.body.appendChild(script);
            }
        } else if (window.html2canvas) {
            setIsScriptReady(true);
        }
    }, [isOpen]);

    const handleSaveImage = () => {
        setIsLoading(true);
        const captureElement = document.getElementById('capture-area');

        window.html2canvas(captureElement)
            .then(canvas => {
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = image;
                link.download = `${document.docNumber}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error during html2canvas capture:", err);
                alert("เกิดข้อผิดพลาดขณะสร้างรูปภาพ โปรดตรวจสอบ Console");
                setIsLoading(false);
            });
    };

    if (!isOpen) return null;

    if (!document || !document.items) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl">กำลังโหลดข้อมูล...</div>
        </div>
      );
    }

    const totalAmount = document.items.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold">ตัวอย่างเอกสาร</h2>
                    <button type="button" onClick={onClose}><X className="w-6 h-6 text-gray-500"/></button>
                </div>
                <div id="capture-area" className="bg-white p-4 border rounded-md mb-4 flex-1 overflow-y-auto">
                    <h3 className="text-lg font-bold text-center mb-2">รายการเบิกจ่าย</h3>
                    <div className="grid grid-cols-2 gap-x-4 text-sm mb-4">
                        <p><span className="font-semibold">เลขที่เอกสาร:</span> {document.docNumber}</p>
                        <p><span className="font-semibold">ผู้สร้าง:</span> {getUserFullName(document.createdBy)}</p>
                        <p><span className="font-semibold">วันที่:</span> {new Date(document.date).toLocaleDateString('th-TH')}</p>
                        <p><span className="font-semibold">ประเภท:</span> {document.type === 'advance' ? 'เบิกรายวัน (หักเงินเดือน)' : 'เงินควง (จ่ายเงินสด)'}</p>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left">#</th>
                                <th className="p-2 text-left">พนักงาน</th>
                                <th className="p-2 text-right">จำนวนเงิน</th>
                                <th className="p-2 text-left">หมายเหตุ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {document.items.map((item, index) => (
                                <tr key={index} className="border-b">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{getGuardName(item.guardId)}</td>
                                    <td className="p-2 text-right">{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    <td className="p-2">{item.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold bg-gray-50">
                                <td colSpan="2" className="p-2 text-right">ยอดรวม</td>
                                <td className="p-2 text-right">{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="flex justify-end">
                    <button 
                        onClick={handleSaveImage} 
                        disabled={!isScriptReady || isLoading} 
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        {isLoading 
                            ? 'กำลังสร้างรูป...' 
                            : !isScriptReady 
                                ? 'กำลังเตรียม...' 
                                : 'บันทึกเป็นรูปภาพ'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main Page Component
export default function DailyAdvancePage({ user }) {
    const [documents, setDocuments] = useState(initialAdvanceDocuments);
    const [guards] = useState(initialGuards);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const [activeTab, setActiveTab] = useState('advance');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [documentToPreview, setDocumentToPreview] = useState(null);

    const handleSaveDocument = (docData) => {
        const docIndex = documents.findIndex(doc => doc.id === docData.id);
        if (docIndex > -1) {
            const updatedDocs = [...documents];
            updatedDocs[docIndex] = docData;
            setDocuments(updatedDocs);
        } else {
            setDocuments(prev => [docData, ...prev]);
        }

        if (docData.status === 'Pending') {
            handleOpenPreview(docData);
        }
    };

    const handleOpenModal = (doc = null) => {
        setEditingDocument(doc);
        setIsModalOpen(true);
    };

    const handleOpenPreview = (doc) => {
        setDocumentToPreview(doc);
        setIsPreviewModalOpen(true);
    };

    const getGuardName = (guardId) => {
        const guard = guards.find(g => g.id === guardId);
        return guard ? `${guard.name} (${guard.guardId})` : 'ไม่พบข้อมูล';
    };

    const getUserFullName = (username) => {
        const foundUser = initialUsers.find(u => u.username === username);
        return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : username;
    };

    const statusStyles = {
        Draft: 'bg-gray-100 text-gray-800',
        Pending: 'bg-yellow-100 text-yellow-800',
        Approved: 'bg-green-100 text-green-800',
        Rejected: 'bg-red-100 text-red-800',
    };

    const statusText = {
        Draft: 'แบบร่าง',
        Pending: 'รออนุมัติ',
        Approved: 'อนุมัติแล้ว',
        Rejected: 'ปฏิเสธ',
    };

    const filteredDocuments = useMemo(() => {
        if (!user) return []; // Safety check
        return documents
            .filter(doc =>
                doc.type === activeTab &&
                doc.date === currentDate &&
                (user.role === 'Admin' || doc.createdBy === user.username)
            )
            .sort((a, b) => b.id - a.id);
    }, [documents, activeTab, currentDate, user]);

    const TabButton = ({ label, type, isActive }) => (
        <button onClick={() => setActiveTab(type)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${isActive ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
            {label}
        </button>
    );
    
    if (!user) {
        return <div className="p-6 text-center text-red-500">ไม่พบข้อมูลผู้ใช้!</div>
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800">รายการเบิกจ่ายรายวัน</h1>
                <div className="flex items-center space-x-4">
                     <div className="flex items-center space-x-2">
                        <label htmlFor="date-filter" className="text-sm font-medium">วันที่:</label>
                        <input type="date" id="date-filter" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg"/>
                    </div>
                    <button onClick={() => handleOpenModal(null)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        <PlusCircle className="w-5 h-5 mr-2" /> สร้างเอกสารเบิก
                    </button>
                </div>
            </div>

            <div className="flex border-b">
                <TabButton label="เบิกรายวัน (หักเงินเดือน)" type="advance" isActive={activeTab === 'advance'} />
                <TabButton label="เงินควง (จ่ายเงินสด)" type="cash" isActive={activeTab === 'cash'} />
            </div>

            <div className="mt-6 space-y-4">
                {filteredDocuments.map(doc => (
                    <div key={doc.id} className="bg-white p-4 rounded-lg shadow-md border flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                            <div>
                                <p className="font-semibold text-gray-800">{doc.docNumber}</p>
                                <p className="text-sm text-gray-500">
                                    <span className="mr-4"><User className="w-3 h-3 inline -mt-1 mr-1"/>{getUserFullName(doc.createdBy)}</span>
                                    <Clock className="w-3 h-3 inline -mt-1 mr-1"/>{doc.items.length} รายการ
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[doc.status]}`}>
                                {statusText[doc.status]}
                            </span>
                            {doc.status === 'Draft' && doc.createdBy === user.username && (
                                <button onClick={() => handleOpenModal(doc)} className="text-blue-500 hover:text-blue-700" title="แก้ไข"><Edit className="w-5 h-5" /></button>
                            )}
                            <button onClick={() => handleOpenPreview(doc)} className="text-green-500 hover:text-green-700" title="ส่งออกเป็นรูปภาพ"><Share2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}
                 {filteredDocuments.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
                        <p>ไม่มีเอกสารที่คุณสร้างในวันที่เลือก</p>
                    </div>
                )}
            </div>
            
            <AdvanceBatchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDocument}
                guards={guards}
                document={editingDocument}
                advanceType={activeTab}
                currentUser={user}
                getUserFullName={getUserFullName}
            />
            <AdvanceDocumentPreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                document={documentToPreview}
                guards={guards}
                getGuardName={getGuardName}
                getUserFullName={getUserFullName}
            />
        </div>
    );
}
