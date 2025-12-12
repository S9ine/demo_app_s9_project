import React from 'react';
import { Shield } from 'lucide-react';

// Loading Spinner Component with Security Shield Animation
export default function LoadingSpinner({ size = 'md', text = 'กำลังโหลดข้อมูล...' }) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-10 h-10'
    };

    return (
        <div className="flex flex-col items-center justify-center py-8">
            {/* Animated Shield Container */}
            <div className="relative">
                {/* Outer rotating ring */}
                <div className={`${sizeClasses[size]} rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin`}></div>
                
                {/* Inner Shield Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Shield 
                        className={`${iconSizes[size]} text-blue-600 animate-pulse`}
                        strokeWidth={2.5}
                    />
                </div>
            </div>

            {/* Loading Text */}
            {text && (
                <p className="mt-4 text-gray-600 font-medium animate-pulse">{text}</p>
            )}
        </div>
    );
}

// Inline Loading Spinner (for buttons)
export function InlineLoadingSpinner({ text = 'กำลังประมวลผล...' }) {
    return (
        <div className="flex items-center justify-center">
            <div className="relative w-5 h-5 mr-2">
                <div className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                <Shield className="absolute inset-0 w-3 h-3 m-auto text-white/80" strokeWidth={2.5} />
            </div>
            <span>{text}</span>
        </div>
    );
}

// Full Page Loading (for page transitions)
export function FullPageLoading({ text = 'กำลังโหลด...' }) {
    return (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
                {/* Large Animated Shield */}
                <div className="relative inline-block">
                    {/* Multiple rotating rings */}
                    <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-blue-100 border-t-blue-400 animate-spin"></div>
                    <div className="absolute inset-2 w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                    
                    {/* Center Shield */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <Shield className="w-12 h-12 text-blue-600 animate-pulse" strokeWidth={2} />
                    </div>
                </div>
                
                {/* Loading Text */}
                <p className="mt-6 text-xl font-semibold text-gray-700 animate-pulse">{text}</p>
                <p className="mt-2 text-sm text-gray-500">โปรดรอสักครู่...</p>
            </div>
        </div>
    );
}
