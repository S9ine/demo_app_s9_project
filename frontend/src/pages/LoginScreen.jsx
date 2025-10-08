import React from 'react';

// เพิ่ม props `isLoading` เข้ามา
export default function LoginScreen({ handleLogin, username, setUsername, password, setPassword, error, isLoading }) {
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
                                disabled={isLoading} // disable input ขณะ loading
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 tracking-wide">รหัสผ่าน</label>
                            <input
                                className="w-full content-center text-base px-4 py-2 border-b border-gray-400 focus:outline-none rounded-2xl focus:border-indigo-500"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading} // disable input ขณะ loading
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div>
                        <button 
                            type="submit" 
                            className="w-full flex justify-center bg-indigo-600 text-gray-100 p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-indigo-700 disabled:bg-indigo-400"
                            disabled={isLoading} // disable ปุ่มขณะ loading
                        >
                            {/* เปลี่ยนข้อความในปุ่มตามสถานะ isLoading */}
                            {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}