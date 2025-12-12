import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { ToastContext } from '../../context/ToastContext';

// Toast Types & Styles
const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-emerald-500',
        progressColor: 'bg-emerald-300',
        iconBg: 'bg-emerald-600',
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-red-500',
        progressColor: 'bg-red-300',
        iconBg: 'bg-red-600',
    },
    warning: {
        icon: AlertCircle,
        bgColor: 'bg-amber-500',
        progressColor: 'bg-amber-300',
        iconBg: 'bg-amber-600',
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-500',
        progressColor: 'bg-blue-300',
        iconBg: 'bg-blue-600',
    },
};

// Single Toast Component
function ToastItem({ toast, onRemove }) {
    const [isLeaving, setIsLeaving] = useState(false);
    const [progress, setProgress] = useState(100);
    const config = toastConfig[toast.type] || toastConfig.info;
    const Icon = config.icon;
    const duration = toast.duration || 3000;

    useEffect(() => {
        const startTime = Date.now();
        
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
        }, 50);

        const timeout = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(() => onRemove(toast.id), 300);
        }, duration);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [duration, toast.id, onRemove]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    return (
        <div
            className={`
                relative overflow-hidden rounded-xl shadow-2xl 
                transform transition-all duration-300 ease-out
                ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
                ${config.bgColor} text-white min-w-[320px] max-w-[420px]
            `}
        >
            <div className="flex items-start p-4 gap-3">
                {/* Icon */}
                <div className={`${config.iconBg} p-2 rounded-lg flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                    {toast.title && (
                        <p className="font-bold text-sm">{toast.title}</p>
                    )}
                    <p className={`text-sm ${toast.title ? 'opacity-90' : 'font-medium'}`}>
                        {toast.message}
                    </p>
                </div>
                
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1 bg-black/20">
                <div
                    className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
}

// Toast Provider
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, message, options = {}) => {
        const id = Date.now() + Math.random();
        const toast = {
            id,
            type,
            message,
            title: options.title,
            duration: options.duration || 3000,
        };
        setToasts((prev) => [...prev, toast]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = {
        success: (message, options) => addToast('success', message, options),
        error: (message, options) => addToast('error', message, options),
        warning: (message, options) => addToast('warning', message, options),
        info: (message, options) => addToast('info', message, options),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}
