// =================================================================================
// ส่วนของการ Import
// =================================================================================
import React, { useState, useEffect } from 'react';
// - useState: Hook สำหรับสร้างและจัดการ state ภายใน Component
// - useEffect: Hook สำหรับจัดการ Side Effect เช่น การ fetch ข้อมูล หรือการทำงานหลังจากที่ Component render เสร็จ

import { ALL_PAGES, initialRoles, initialUsers, initialBanks } from '../../data/mockData';
// - นำเข้าข้อมูลจำลอง (Mock Data) มาใช้ เพื่อให้เห็นภาพการทำงานโดยไม่ต้องต่อ API จริง

import { Users, List, Shield, KeyRound, PlusCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';
// - นำเข้าไอคอนสวยๆ จาก Library ที่ชื่อว่า lucide-react เพื่อใช้ประกอบ UI

// =================================================================================
// Reusable Components (ส่วนประกอบที่ใช้ซ้ำ)
// =================================================================================

// Component นี้คือ Modal ยืนยันการกระทำต่างๆ เช่น การลบข้อมูล
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
    // ถ้า prop 'isOpen' เป็น false, Component จะไม่แสดงผลอะไรเลย (return null)
    // เป็น Pattern ที่ดีในการควบคุมการแสดงผล
    if (!isOpen) return null;

    return (
        // `z-[60]` ทำให้ Modal แสดงอยู่ชั้นบนสุด
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-start">
                    {/* ไอคอนเตือนเพื่อดึงดูดสายตา */}
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    {/* แสดง Title และ Message ที่ได้รับมาจาก props */}
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                        <div className="mt-2"><p className="text-sm text-gray-500">{message}</p></div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    {/* ปุ่ม 'ยืนยัน' จะเรียกใช้ฟังก์ชัน onConfirm ที่ส่งเข้ามา */}
                    <button type="button" onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">ยืนยัน</button>
                    {/* ปุ่ม 'ยกเลิก' จะเรียกใช้ฟังก์ชัน onClose เพื่อปิด Modal */}
                    <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">ยกเลิก</button>
                </div>
            </div>
        </div>
    );
}

// =================================================================================
// Local Components (ส่วนประกอบย่อยที่ใช้เฉพาะในหน้านี้)
// =================================================================================

// Form Modal สำหรับ 'เพิ่ม' หรือ 'แก้ไข' ข้อมูลธนาคาร
function BankFormModal({ isOpen, onClose, onSave, bank }) {
    // State สำหรับเก็บข้อมูลในฟอร์ม
    const [formData, setFormData] = useState({ code: '', name: '', shortNameEN: '' });

    // useEffect จะทำงานเมื่อ prop 'bank' หรือ 'isOpen' เปลี่ยนแปลง
    // - ถ้ามีการส่ง 'bank' เข้ามา (ตอนแก้ไข) -> จะ set formData เป็นข้อมูลของธนาคารนั้น
    // - ถ้าไม่ (ตอนเพิ่มใหม่) -> จะ set formData เป็นค่าว่าง
    // - การใส่ isOpen ใน dependency array ([bank, isOpen]) ทำให้ฟอร์มถูกรีเซ็ตทุกครั้งที่ Modal เปิดขึ้นมาใหม่
    useEffect(() => {
        setFormData(bank ? { code: bank.code, name: bank.name, shortNameEN: bank.shortNameEN } : { code: '', name: '', shortNameEN: '' });
    }, [bank, isOpen]);

    if (!isOpen) return null;

    // ฟังก์ชันสำหรับอัปเดต state เมื่อผู้ใช้พิมพ์ใน input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ฟังก์ชันเมื่อกด Submit Form
    const handleSubmit = (e) => {
        e.preventDefault(); // ป้องกันการ reload หน้าเว็บ
        onSave({ ...bank, ...formData }); // ส่งข้อมูลที่อัปเดตแล้วกลับไปให้ Component แม่ ผ่านฟังก์ชัน onSave
        onClose(); // ปิด Modal
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    {/* แสดงหัวเรื่องตามเงื่อนไข ว่าเป็นการ 'แก้ไข' หรือ 'เพิ่ม' */}
                    <h2 className="text-xl font-bold mb-4">{bank ? 'แก้ไขข้อมูลธนาคาร' : 'เพิ่มธนาคารใหม่'}</h2>
                    {/* Input fields ต่างๆ */}
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700">Code ธนาคาร</label><input type="text" name="code" value={formData.code} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700">ชื่อธนาคาร</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700">อักษรย่อ (EN)</label><input type="text" name="shortNameEN" value={formData.shortNameEN} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">ยกเลิก</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Form Modal สำหรับ 'เพิ่ม' Role ใหม่
function RoleFormModal({ isOpen, onClose, onSave }) {
    // State สำหรับเก็บชื่อ Role ที่กำลังจะเพิ่ม
    const [roleName, setRoleName] = useState('');
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // trim() เพื่อตัดช่องว่างหน้า-หลัง ออกจากชื่อ Role
        if (roleName.trim()) {
            onSave(roleName.trim()); // ส่งชื่อ Role ใหม่ไปบันทึก
            setRoleName(''); // เคลียร์ input
            onClose(); // ปิด Modal
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-bold mb-4">เพิ่ม Role ใหม่</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ชื่อ Role</label>
                        <input type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required autoFocus />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">ยกเลิก</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Form Modal สำหรับ 'เพิ่ม' หรือ 'แก้ไข' ผู้ใช้งาน
function UserFormModal({ isOpen, onClose, onSave, user, roles }) {
    // State สำหรับเก็บข้อมูลในฟอร์ม
    const [formData, setFormData] = useState({ username: '', password: '', roleId: '', firstName: '', lastName: '', email: '' });

    // useEffect ทำงานคล้ายกับ BankFormModal
    // - ถ้ามี 'user' (แก้ไข) -> set state ตามข้อมูล user
    // - ถ้าไม่มี 'user' (เพิ่มใหม่) -> set state เป็นค่าว่าง และกำหนด roleId เริ่มต้นเป็น Role แรกที่มีในระบบ
    useEffect(() => {
        if (user) {
            setFormData({ username: user.username, password: user.password, roleId: user.roleId, firstName: user.firstName, lastName: user.lastName, email: user.email });
        } else {
            setFormData({ username: '', password: '', roleId: roles[0]?.id || '', firstName: '', lastName: '', email: '' });
        }
    }, [user, isOpen, roles]);

    if (!isOpen) return null;

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); onSave({ ...user, ...formData }); onClose(); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-bold mb-4">{user ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</h2>
                    <div className="space-y-4">
                        {/* Input fields ต่างๆ */}
                        <div><label className="block text-sm font-medium text-gray-700">Username</label><input type="text" name="username" value={formData.username} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
                        {/* Dropdown สำหรับเลือก Role โดยดึงข้อมูลมาจาก prop 'roles' */}
                        <div><label className="block text-sm font-medium text-gray-700">Role</label><select name="roleId" value={formData.roleId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">{roles.map(role => (<option key={role.id} value={role.id}>{role.name}</option>))}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700">First name</label><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Last name</label><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="text" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">ยกเลิก</button><button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">บันทึก</button></div>
                </form>
            </div>
        </div>
    );
}

// =================================================================================
// Feature Components (ส่วนประกอบหลักของแต่ละฟีเจอร์)
// =================================================================================

// Component สำหรับจัดการ Role, สิทธิ์ และ User
function UserSettings() {
    // --- State Management ---
    // state ทั้งหมดที่ใช้ในส่วนนี้ ถูกจัดการที่นี่ที่เดียว ซึ่งเป็นวิธีที่ดี
    const [roles, setRoles] = useState(initialRoles);
    const [users, setUsers] = useState(initialUsers);
    const [selectedRole, setSelectedRole] = useState(roles[0]); // เก็บ Role ที่กำลังถูกเลือก
    // state สำหรับควบคุมการเปิด-ปิด Modal ต่างๆ
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // เก็บข้อมูล user ที่กำลังจะแก้ไข
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isRoleConfirmOpen, setIsRoleConfirmOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null); // เก็บข้อมูล role ที่กำลังจะลบ
    const [isUserConfirmOpen, setIsUserConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null); // เก็บข้อมูล user ที่กำลังจะลบ

    // --- Handler Functions ---
    // ฟังก์ชันจัดการเมื่อมีการติ๊ก checkbox เปลี่ยนสิทธิ์
    const handlePermissionChange = (pageId, isChecked) => {
        setSelectedRole(prevRole => {
            const newPermissions = isChecked
                ? [...prevRole.permissions, pageId] // ถ้าติ๊กถูก -> เพิ่ม pageId เข้าไปใน array
                : prevRole.permissions.filter(p => p !== pageId); // ถ้าติ๊กออก -> เอา pageId ออก
            return { ...prevRole, permissions: newPermissions };
        });
    };

    // ฟังก์ชันบันทึกสิทธิ์ของ Role ที่เลือก
    const handleSaveRolePermissions = () => {
        // อัปเดต state 'roles' โดยหา role ที่มี id ตรงกับ 'selectedRole' แล้วแทนที่ด้วยข้อมูลใหม่
        setRoles(prevRoles => prevRoles.map(r => r.id === selectedRole.id ? selectedRole : r));
        alert("บันทึกสิทธิ์เรียบร้อยแล้ว");
    };

    // ฟังก์ชันบันทึกข้อมูล User (ทั้งเพิ่มใหม่และแก้ไข)
    const handleSaveUser = (userData) => {
        if (userData.id) { // ถ้ามี id -> แก้ไข
            setUsers(users.map(u => u.id === userData.id ? userData : u));
        } else { // ถ้าไม่มี id -> เพิ่มใหม่
            setUsers([...users, { ...userData, id: Date.now() }]); // ใช้ Date.now() เป็น id ชั่วคราว
        }
    };

    // ฟังก์ชันเปิด Modal สำหรับจัดการ User
    const openUserModal = (user = null) => {
        setEditingUser(user); // ถ้ามี user คือการแก้ไข, ถ้าเป็น null คือการเพิ่มใหม่
        setIsUserModalOpen(true);
    };

    // ฟังก์ชันบันทึก Role ใหม่
    const handleSaveRole = (roleName) => {
        const newRole = { id: Date.now(), name: roleName, permissions: [] };
        setRoles([...roles, newRole]);
    };

    // ฟังก์ชันเปิด Modal ยืนยันการลบ Role
    const openDeleteRoleConfirm = (role) => {
        // ป้องกันการลบ Role 'Admin'
        if (role.name === 'Admin') {
            alert('ไม่สามารถลบ Role "Admin" ได้');
            return;
        }
        // ตรวจสอบว่ามี User คนไหนใช้ Role นี้อยู่หรือไม่
        const isRoleInUse = users.some(user => user.roleId === role.id);
        if (isRoleInUse) {
            alert(`ไม่สามารถลบ Role "${role.name}" ได้ เนื่องจากมีผู้ใช้งานอยู่ใน Role นี้`);
            return;
        }
        setRoleToDelete(role);
        setIsRoleConfirmOpen(true);
    };

    // ฟังก์ชันยืนยันการลบ Role
    const confirmDeleteRole = () => {
        if (roleToDelete) {
            // กรอง Role ที่จะลบออกจาก array
            setRoles(roles.filter(role => role.id !== roleToDelete.id));
            // ถ้า Role ที่ลบเป็น Role ที่กำลังเลือกอยู่ ให้เปลี่ยนไปเลือก Role แรกแทน
            if (selectedRole.id === roleToDelete.id) {
                setSelectedRole(roles[0] || null);
            }
        }
        setIsRoleConfirmOpen(false);
        setRoleToDelete(null);
    };

    // ฟังก์ชันเปิด Modal ยืนยันการลบ User
    const openDeleteUserConfirm = (user) => {
        // ป้องกันการลบ User 'admin'
        if (user.username === 'admin') {
            alert('ไม่สามารถลบผู้ใช้ "admin" ได้');
            return;
        }
        setUserToDelete(user);
        setIsUserConfirmOpen(true);
    };

    // ฟังก์ชันยืนยันการลบ User
    const confirmDeleteUser = () => {
        if (userToDelete) {
            setUsers(users.filter(user => user.id !== userToDelete.id));
        }
        setIsUserConfirmOpen(false);
        setUserToDelete(null);
    };

    // --- JSX Rendering ---
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {/* ส่วนจัดการ Role */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <h2 className="text-xl font-semibold flex items-center"><Shield className="w-6 h-6 mr-2 text-indigo-600" />จัดการ Role และสิทธิ์</h2>
                    <button onClick={() => setIsRoleModalOpen(true)} className="flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-600 text-sm rounded-md hover:bg-indigo-200"><PlusCircle className="w-4 h-4 mr-1" /> เพิ่ม Role</button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {/* คอลัมน์แสดงรายชื่อ Role */}
                    <div className="col-span-1 border-r pr-4">
                        <h3 className="font-semibold mb-2">เลือก Role</h3>
                        <div className="space-y-1">
                            {roles.map(role => (
                                <div key={role.id} className="flex items-center group">
                                    <button onClick={() => setSelectedRole(role)} className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedRole?.id === role.id ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100'}`}>
                                        {role.name}
                                    </button>
                                    {/* ปุ่มลบจะแสดงเมื่อเอาเมาส์ไปชี้ และจะไม่แสดงสำหรับ Role 'Admin' */}
                                    {role.name !== 'Admin' && (
                                        <button onClick={() => openDeleteRoleConfirm(role)} className="ml-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* คอลัมน์แสดงสิทธิ์ของ Role ที่เลือก */}
                    {selectedRole && (
                        <div className="col-span-2">
                            <h3 className="font-semibold mb-2">กำหนดสิทธิ์สำหรับ: <span className="text-indigo-600">{selectedRole.name}</span></h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                {ALL_PAGES.map(page => (
                                    <label key={page.id} className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={selectedRole.permissions.includes(page.id)}
                                            onChange={(e) => handlePermissionChange(page.id, e.target.checked)}
                                        />
                                        <span className="ml-3 text-sm text-gray-700">{page.label}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-4 text-right">
                                <button onClick={handleSaveRolePermissions} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">บันทึกสิทธิ์</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* ส่วนจัดการ User */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <h2 className="text-xl font-semibold flex items-center"><KeyRound className="w-6 h-6 mr-2 text-gray-600" />จัดการผู้ใช้งาน</h2>
                    <button onClick={() => openUserModal()} className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200"><PlusCircle className="w-4 h-4 mr-1" /> เพิ่มผู้ใช้</button>
                </div>
                {/* ตารางแสดงรายชื่อ User */}
                <div className="max-h-80 overflow-y-auto">
                    <table className="w-full">
                        <thead><tr className="border-b"><th className="text-left p-2 text-sm font-medium text-gray-500">Username</th><th className="text-left p-2 text-sm font-medium text-gray-500">Role</th><th className="text-left p-2 text-sm font-medium text-gray-500">การกระทำ</th></tr></thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 border-b">
                                    <td className="p-2">{user.username}</td>
                                    <td className="p-2"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">{roles.find(r => r.id === user.roleId)?.name}</span></td>  
                                    <td className="p-2 flex space-x-2">
                                        <button onClick={() => openUserModal(user)} className="text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => openDeleteUserConfirm(user)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* เรียกใช้ Modal ต่างๆ และส่ง props ที่จำเป็นเข้าไป */}
            <UserFormModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={handleSaveUser} user={editingUser} roles={roles} />
            <RoleFormModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} onSave={handleSaveRole} />
            <ConfirmationModal isOpen={isRoleConfirmOpen} onClose={() => setIsRoleConfirmOpen(false)} onConfirm={confirmDeleteRole} title="ยืนยันการลบ Role" message={`คุณแน่ใจหรือไม่ว่าต้องการลบ Role "${roleToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`} />
            <ConfirmationModal isOpen={isUserConfirmOpen} onClose={() => setIsUserConfirmOpen(false)} onConfirm={confirmDeleteUser} title="ยืนยันการลบผู้ใช้" message={`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "${userToDelete?.username}"?`} />
        </div>
    );
}

// Component สำหรับจัดการข้อมูล Dropdown ต่างๆ
function DropdownSettings() {
    // State Management สำหรับส่วนนี้
    const [banks, setBanks] = useState(initialBanks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [bankToDelete, setBankToDelete] = useState(null);

    // --- Handler Functions --- (ทำงานคล้ายกับ UserSettings)
    const handleOpenModal = (bank = null) => { setEditingBank(bank); setIsModalOpen(true); };
    const handleCloseModal = () => { setEditingBank(null); setIsModalOpen(false); };
    const handleSaveBank = (bankData) => {
        if (bankData.id) { // แก้ไข
            setBanks(banks.map(b => b.id === bankData.id ? bankData : b));
        } else { // เพิ่มใหม่
            setBanks([...banks, { ...bankData, id: Date.now() }]);
        }
    };
    const handleOpenDeleteConfirm = (bank) => { setBankToDelete(bank); setIsConfirmOpen(true); };
    const handleDeleteBank = () => {
        if (bankToDelete) {
            setBanks(banks.filter(b => b.id !== bankToDelete.id));
        }
        setIsConfirmOpen(false);
        setBankToDelete(null);
    };

    // --- JSX Rendering ---
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {/* ส่วนจัดการข้อมูลธนาคาร */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <h2 className="text-xl font-semibold">จัดการข้อมูลธนาคาร</h2>
                    <button onClick={() => handleOpenModal()} className="flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-600 text-sm rounded-md hover:bg-indigo-200"><PlusCircle className="w-4 h-4 mr-1" /> เพิ่มธนาคาร</button>
                </div>
                {/* ตารางแสดงรายชื่อธนาคาร */}
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                        <thead><tr className="border-b"><th className="text-left p-2 text-sm font-medium text-gray-500">Code</th><th className="text-left p-2 text-sm font-medium text-gray-500">ชื่อธนาคาร</th><th className="text-left p-2 text-sm font-medium text-gray-500">อักษรย่อ EN</th><th className="text-left p-2 text-sm font-medium text-gray-500">การกระทำ</th></tr></thead>
                        <tbody>
                            {banks.map(bank => (
                                <tr key={bank.id} className="hover:bg-gray-50 border-b">
                                    <td className="p-2">{bank.code}</td>
                                    <td className="p-2">{bank.name}</td>
                                    <td className="p-2">{bank.shortNameEN}</td>
                                    <td className="p-2 flex space-x-2">
                                        <button onClick={() => handleOpenModal(bank)} className="text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleOpenDeleteConfirm(bank)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* ส่วน Placeholder สำหรับฟีเจอร์ในอนาคต */}
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
                <h2 className="text-xl font-semibold text-gray-400">จัดการคำนำหน้าชื่อ...</h2>
                <p className="text-gray-400 mt-2">เร็วๆ นี้</p>
            </div>
            {/* เรียกใช้ Modal */}
            <BankFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveBank} bank={editingBank} />
            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDeleteBank} title="ยืนยันการลบธนาคาร" message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล "${bankToDelete?.name}"?`} />
        </div>
    );
}

// =================================================================================
// Main Component (ส่วนประกอบหลักของหน้านี้)
// =================================================================================

// สร้าง Object 'TABS' เพื่อเก็บชื่อแท็บ ช่วยลดการ hardcode string และทำให้แก้ไขง่าย
const TABS = {
    USER_SETTINGS: 'ตั้งค่า User',
    DROPDOWN_SETTINGS: 'ตั้งค่า Dropdown',
};

// Component หลักของหน้า Settings
export default function SettingsPage() {
    // State สำหรับเก็บว่าแท็บไหนกำลังถูกเลือกอยู่
    const [activeTab, setActiveTab] = useState(TABS.USER_SETTINGS);

    // สร้างเป็น Sub-component ย่อยสำหรับปุ่ม Tab เพื่อให้โค้ดส่วน return หลักดูสะอาดตา
    const TabButton = ({ label, icon: Icon, isActive }) => (
        <button
            onClick={() => setActiveTab(label)}
            // การใช้ Template literals (``) เพื่อกำหนด class แบบมีเงื่อนไข
            // ถ้า 'isActive' เป็น true จะใช้ class ของแท็บที่ถูกเลือก
            // ถ้าเป็น false จะใช้ class ของแท็บปกติ
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
            <Icon className="w-5 h-5 mr-2" />
            <span>{label}</span>
        </button>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">ตั้งค่าระบบ</h1>
            {/* ส่วนแสดงปุ่ม Tab */}
            <div className="flex space-x-4 border-b mb-6">
                <TabButton label={TABS.USER_SETTINGS} icon={Users} isActive={activeTab === TABS.USER_SETTINGS} />
                <TabButton label={TABS.DROPDOWN_SETTINGS} icon={List} isActive={activeTab === TABS.DROPDOWN_SETTINGS} />
            </div>
            {/* ส่วนแสดงเนื้อหาของ Tab ที่เลือก */}
            <div>
                {/* ใช้ Conditional Rendering: ถ้า activeTab ตรงกับ USER_SETTINGS ก็ให้แสดง Component UserSettings */}
                {activeTab === TABS.USER_SETTINGS && <UserSettings />}
                {activeTab === TABS.DROPDOWN_SETTINGS && <DropdownSettings />}
            </div>
        </div>
    );
}