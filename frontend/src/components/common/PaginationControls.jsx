import React from 'react';

export default function PaginationControls({
    currentPage,
    itemsPerPage,
    totalItems,
    onPageChange,
    onItemsPerPageChange
}) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
                แสดง {startItem} ถึง {endItem} จาก {totalItems} รายการ
            </div>
            <div className="flex items-center space-x-2">
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="border rounded-lg px-2 py-1 text-sm"
                >
                    <option value={10}>10 / หน้า</option>
                    <option value={20}>20 / หน้า</option>
                    <option value={50}>50 / หน้า</option>
                    <option value={100}>100 / หน้า</option>
                </select>
                <div className="flex space-x-1">
                    <button
                        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                        &lt;
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`px-3 py-1 border rounded-lg ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    );
}
