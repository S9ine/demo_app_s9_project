import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import ConfirmationModal from '../modals/ConfirmationModal';
import ProductFormModal from '../modals/ProductFormModal';
import { FullPageLoading } from '../common/LoadingSpinner';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import PaginationControls from '../common/PaginationControls';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAdd = async () => {
        try {
            // Generate next product code
            const maxCode = products.reduce((max, p) => {
                const match = p.code.match(/PRD-(\d+)/);
                if (match) {
                    const num = parseInt(match[1]);
                    return num > max ? num : max;
                }
                return max;
            }, 0);
            const nextCode = `PRD-${String(maxCode + 1).padStart(3, '0')}`;
            
            setSelectedProduct({ code: nextCode });
            setIsModalOpen(true);
            console.log('Generated product code:', nextCode);
        } catch (error) {
            console.error('Error generating code:', error);
            setSelectedProduct(null);
            setIsModalOpen(true);
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleSave = async (productData) => {
        try {
            // แปลงข้อมูลให้ตรงกับ Schema Backend
            const payload = {
                code: productData.code,
                name: productData.name,
                category: productData.category,
                price: parseFloat(productData.price),
                isActive: productData.status === 'Active' // แปลงจาก Dropdown เป็น Boolean
            };

            if (productData.id) {
                await api.put(`/products/${productData.id}`, payload);
            } else {
                await api.post('/products', payload);
            }
            fetchProducts();
            setIsModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const openDeleteConfirm = (product) => {
        setProductToDelete(product);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (productToDelete) {
            try {
                await api.delete(`/products/${productToDelete.id}`);
                fetchProducts();
                setIsConfirmOpen(false);
                setProductToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">ข้อมูลสินค้า</h1>
                <button onClick={handleAdd} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <PlusCircle className="w-5 h-5 mr-2" /> เพิ่มสินค้า
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                {isLoading ? (
                    <FullPageLoading text="กำลังโหลดข้อมูลสินค้า" />
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-left p-3 font-semibold">รหัสสินค้า</th>
                                <th className="text-left p-3 font-semibold">ชื่อสินค้า</th>
                                <th className="text-left p-3 font-semibold">หมวดหมู่</th>
                                <th className="text-right p-3 font-semibold">ราคา</th>
                                <th className="text-left p-3 font-semibold">สถานะ</th>
                                <th className="text-left p-3 pl-6 font-semibold">การกระทำ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 border-b">
                                    <td className="p-3">{p.code}</td>
                                    <td className="p-3">{p.name}</td>
                                    <td className="p-3"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{p.category}</span></td>
                                    <td className="p-3 text-right">{p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {p.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                        </span>
                                    </td>
                                    <td className="p-3 pl-6 flex space-x-2">
                                        <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700"><Edit className="w-5 h-5" /></button>
                                        <button onClick={() => openDeleteConfirm(p)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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
