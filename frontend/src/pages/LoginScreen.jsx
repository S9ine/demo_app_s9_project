import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // นำเข้าไอคอน

export default function LoginScreen({ handleLogin, username, setUsername, password, setPassword, error, isLoading }) {
    // State สำหรับสลับการแสดงรหัสผ่าน
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">ระบบบริหารงานพรีเมี่ยม</h1>
                    <p className="mt-2 text-gray-600">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-600 tracking-wide">ชื่อผู้ใช้</label>
                            <input
                                className="w-full content-center text-base px-4 py-2 border-b border-gray-400 focus:outline-none rounded-2xl focus:border-indigo-500"
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="relative">
                            <label className="text-sm font-bold text-gray-600 tracking-wide">รหัสผ่าน</label>
                            <input
                                className="w-full content-center text-base px-4 py-2 border-b border-gray-400 focus:outline-none rounded-2xl focus:border-indigo-500 pr-10" // เพิ่ม pr-10 เว้นที่ให้ไอคอน
                                type={showPassword ? "text" : "password"} // สลับ type
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                            {/* ปุ่มกดดูรหัสผ่าน */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center bg-indigo-600 text-gray-100 p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-indigo-700 disabled:bg-indigo-400"
                            disabled={isLoading}   >
                            {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}