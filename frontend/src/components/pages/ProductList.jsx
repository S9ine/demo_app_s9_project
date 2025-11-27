import React, { useState } from 'react';
import { initialProducts } from '../../data/mockData';
import ConfirmationModal from '../modals/ConfirmationModal';
import ProductFormModal from '../modals/ProductFormModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';

export default function ProductList() {
    const [products, setProducts] = useState(initialProducts);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const openDeleteConfirm = (product) => {
        setProductToDelete(product);
        setIsConfirmOpen(true);
    };

    const handleDelete = () => {
        if (productToDelete) {
            setProducts(products.filter(p => p.id !== productToDelete.id));
            setIsConfirmOpen(false);
            setProductToDelete(null);
        }
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleSave = (productData) => {
        if (productData.id) {
            setProducts(products.map(p => p.id === productData.id ? productData : p));
        } else {
            const newProduct = {
                ...productData,
                id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1
            };
            setProducts([...products, newProduct]);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">ข้อมูลสินค้า</h1>
                <button
                    onClick={handleAdd}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มสินค้า
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3">รหัสสินค้า</th>
                            <th className="text-left p-3">ชื่อสินค้า</th>
                            <th className="text-left p-3">หมวดหมู่</th>
                            <th className="text-right p-3">ราคา</th>
                            <th className="text-left p-3 pl-6">การกระทำ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 border-b">
                                <td className="p-3">{p.code}</td>
                                <td className="p-3">{p.name}</td>
                                <td className="p-3"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{p.category}</span></td>
                                <td className="p-3 text-right">{p.price.toLocaleString()}</td>
                                <td className="p-3 pl-6 flex space-x-2">
                                    <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700"><Edit className="w-5 h-5" /></button>
                                    <button onClick={() => openDeleteConfirm(p)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <PaginationControls
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={products.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                }}
            />

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                product={selectedProduct}
            />

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="ยืนยันการลบสินค้า"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${productToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />
        </div>
    );
}
