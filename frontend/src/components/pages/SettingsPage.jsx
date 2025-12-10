// frontend/src/components/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { ALL_PAGES } from '../../data/mockData';
import ConfirmationModal from '../modals/ConfirmationModal';
import { Users, List, Shield, KeyRound, PlusCircle, Edit, Trash2, Eye, EyeOff } from 'lucide-react'; // เพิ่ม Eye, EyeOff

// ... (BankFormModal และ RoleFormModal เหมือนเดิม ไม่ต้องแก้) ...

// Form Modal สำหรับ 'เพิ่ม' หรือ 'แก้ไข' ข้อมูลธนาคาร
function BankFormModal({ isOpen, onClose, onSave, bank }) {
    const [formData, setFormData] = useState({ code: '', name: '', shortNameEN: '' });

    useEffect(() => {
        setFormData(bank ? { code: bank.code, name: bank.name, shortNameEN: bank.shortNameEN } : { code: '', name: '', shortNameEN: '' });
    }, [bank, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ id: bank?.id, ...formData });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-bold mb-4">{bank ? 'แก้ไขข้อมูลธนาคาร' : 'เพิ่มธนาคารใหม่'}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Code ธนาคาร</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                                disabled={!!bank}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ชื่อธนาคาร</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">อักษรย่อ (EN)</label>
                            <input type="text" name="shortNameEN" value={formData.shortNameEN} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
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
    const [roleName, setRoleName] = useState('');
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (roleName.trim()) {
            onSave(roleName.trim());
            setRoleName('');
            onClose();
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

// --- ส่วนที่แก้ไข UserFormModal ---
function UserFormModal({ isOpen, onClose, onSave, user, roles }) {
    const [formData, setFormData] = useState({ username: '', password: '', roleId: '', firstName: '', lastName: '', email: '' });
    // เพิ่ม State สำหรับปุ่มดูรหัสผ่าน
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                password: '',
                roleId: user.roleId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            });
        } else {
            setFormData({
                username: '',
                password: '',
                roleId: roles[0]?.id || '',
                firstName: '',
                lastName: '',
                email: ''
            });
        }
        // รีเซ็ตการแสดงรหัสผ่านทุกครั้งที่เปิด Modal
        setShowPassword(false);
    }, [user, isOpen, roles]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...user, ...formData });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-bold mb-4">{user ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>

                        {/* ช่อง Password พร้อมปุ่ม Toggle */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">Password {user && <span className="text-gray-400 text-xs">(เว้นว่างหากไม่ต้องการเปลี่ยน)</span>}</label>
                            <input
                                type={showPassword ? "text" : "password"} // สลับ type
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md pr-10" // pr-10 เว้นที่ให้ไอคอน
                                required={!user}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select name="roleId" value={formData.roleId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                                {roles.map(role => (<option key={role.id} value={role.id}>{role.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First name</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last name</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="text" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
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

// ... (ส่วนที่เหลือของ SettingsPage เหมือนเดิมทุกประการ) ...

// Component สำหรับจัดการ Role, สิทธิ์ และ User
function UserSettings() {
    // State
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Modal States
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isRoleConfirmOpen, setIsRoleConfirmOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [isUserConfirmOpen, setIsUserConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Initial Fetch
    const fetchUsersAndRoles = async () => {
        setIsLoading(true);
        try {
            const [rolesRes, usersRes] = await Promise.all([
                api.get('/users/roles/all'),
                api.get('/users')
            ]);
            setRoles(rolesRes.data);
            setUsers(usersRes.data);

            // Set selected role logic
            if (!selectedRole && rolesRes.data.length > 0) {
                // Default to Admin or first role
                setSelectedRole(rolesRes.data.find(r => r.name === 'Admin') || rolesRes.data[0]);
            } else if (selectedRole) {
                // Keep selected role updated
                const updatedRole = rolesRes.data.find(r => r.id === selectedRole.id);
                if (updatedRole) setSelectedRole(updatedRole);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersAndRoles();
    }, []);

    // --- Role & Permissions Handlers ---

    const handlePermissionChange = (pageId, isChecked) => {
        if (!selectedRole) return;

        setSelectedRole(prevRole => {
            const newPermissions = isChecked
                ? [...prevRole.permissions, pageId]
                : prevRole.permissions.filter(p => p !== pageId);
            return { ...prevRole, permissions: newPermissions };
        });
    };

    const handleSaveRolePermissions = async () => {
        if (!selectedRole) return;
        try {
            await api.put(`/users/roles/${selectedRole.id}`, {
                name: selectedRole.name,
                permissions: selectedRole.permissions
            });
            alert("บันทึกสิทธิ์เรียบร้อยแล้ว");
            fetchUsersAndRoles();
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกสิทธิ์');
        }
    };

    const handleSaveRole = async (roleName) => {
        try {
            await api.post('/users/roles', { name: roleName, permissions: [] });
            fetchUsersAndRoles();
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการสร้าง Role');
        }
    };

    const openDeleteRoleConfirm = (role) => {
        if (role.name === 'Admin') {
            alert('ไม่สามารถลบ Role "Admin" ได้');
            return;
        }
        setRoleToDelete(role);
        setIsRoleConfirmOpen(true);
    };

    const confirmDeleteRole = async () => {
        if (roleToDelete) {
            try {
                await api.delete(`/users/roles/${roleToDelete.id}`);
                fetchUsersAndRoles();
                if (selectedRole?.id === roleToDelete.id) setSelectedRole(null);
                setIsRoleConfirmOpen(false);
                setRoleToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบ Role');
            }
        }
    };

    // --- User Handlers ---

    const handleSaveUser = async (userData) => {
        try {
            const payload = {
                username: userData.username,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email || null,
                roleId: userData.roleId,
                isActive: userData.isActive !== undefined ? userData.isActive : true
            };

            // Only send password if provided (for update) or required (for create)
            if (userData.password) {
                payload.password = userData.password;
            }

            if (userData.id) {
                await api.put(`/users/${userData.id}`, payload);
            } else {
                await api.post('/users', payload);
            }
            fetchUsersAndRoles();
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกผู้ใช้');
        }
    };

    const openUserModal = (user = null) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const openDeleteUserConfirm = (user) => {
        if (user.username === 'admin') {
            alert('ไม่สามารถลบผู้ใช้ "admin" ได้');
            return;
        }
        setUserToDelete(user);
        setIsUserConfirmOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (userToDelete) {
            try {
                await api.delete(`/users/${userToDelete.id}`);
                fetchUsersAndRoles();
                setIsUserConfirmOpen(false);
                setUserToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
            }
        }
    };

    if (isLoading) return <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>;

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
                                    <td className="p-2"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">{user.role}</span></td>
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

            <UserFormModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={handleSaveUser} user={editingUser} roles={roles} />
            <RoleFormModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} onSave={handleSaveRole} />
            <ConfirmationModal isOpen={isRoleConfirmOpen} onClose={() => setIsRoleConfirmOpen(false)} onConfirm={confirmDeleteRole} title="ยืนยันการลบ Role" message={`คุณแน่ใจหรือไม่ว่าต้องการลบ Role "${roleToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`} />
            <ConfirmationModal isOpen={isUserConfirmOpen} onClose={() => setIsUserConfirmOpen(false)} onConfirm={confirmDeleteUser} title="ยืนยันการลบผู้ใช้" message={`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "${userToDelete?.username}"?`} />
        </div>
    );
}

// Component สำหรับจัดการข้อมูล Dropdown ต่างๆ
function DropdownSettings() {
    const [banks, setBanks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [bankToDelete, setBankToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBanks = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/banks');
            setBanks(response.data);
        } catch (error) {
            console.error('Error fetching banks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    const handleOpenModal = (bank = null) => { setEditingBank(bank); setIsModalOpen(true); };
    const handleCloseModal = () => { setEditingBank(null); setIsModalOpen(false); };

    const handleSaveBank = async (bankData) => {
        try {
            if (bankData.id) {
                await api.put(`/banks/${bankData.id}`, bankData);
            } else {
                await api.post('/banks', bankData);
            }
            fetchBanks();
        } catch (error) {
            alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleOpenDeleteConfirm = (bank) => { setBankToDelete(bank); setIsConfirmOpen(true); };

    const handleDeleteBank = async () => {
        if (bankToDelete) {
            try {
                await api.delete(`/banks/${bankToDelete.id}`);
                fetchBanks();
                setIsConfirmOpen(false);
                setBankToDelete(null);
            } catch (error) {
                alert(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    if (isLoading) return <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>;

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

            <BankFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveBank} bank={editingBank} />
            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDeleteBank} title="ยืนยันการลบธนาคาร" message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล "${bankToDelete?.name}"?`} />
        </div>
    );
}

// =================================================================================
// Main Component (ส่วนประกอบหลักของหน้านี้)
// =================================================================================

const TABS = {
    USER_SETTINGS: 'ตั้งค่า User',
    DROPDOWN_SETTINGS: 'ตั้งค่า Dropdown',
};

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState(TABS.USER_SETTINGS);

    const TabButton = ({ label, icon: Icon, isActive }) => (
        <button
            onClick={() => setActiveTab(label)}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${isActive
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">ตั้งค่าระบบ</h1>
            {/* ส่วนแสดงปุ่ม Tab */}
            <div className="flex space-x-4 border-b mb-6">
                <TabButton label={TABS.USER_SETTINGS} icon={Users} isActive={activeTab === TABS.USER_SETTINGS} />
                <TabButton label={TABS.DROPDOWN_SETTINGS} icon={List} isActive={activeTab === TABS.DROPDOWN_SETTINGS} />
            </div>
            {/* ส่วนแสดงเนื้อหาของ Tab ที่เลือก */}
            <div>
                {activeTab === TABS.USER_SETTINGS && <UserSettings />}
                {activeTab === TABS.DROPDOWN_SETTINGS && <DropdownSettings />}
            </div>
        </div>
    );
}