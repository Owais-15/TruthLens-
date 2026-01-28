import { useState } from 'react';

interface AccountPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock user data
const MOCK_USER = {
    name: 'Test User',
    email: 'test@truthlens.com',
    tier: 'Free',
    verificationsUsed: 18,
    verificationsLimit: 100
};

export default function AccountPanel({ isOpen, onClose }: AccountPanelProps) {
    const [user] = useState(MOCK_USER);
    const usagePercentage = (user.verificationsUsed / user.verificationsLimit) * 100;

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-bg-primary border-l border-glass-border z-50 animate-slide-in-right shadow-2xl">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-glass-border">
                        <h2 className="text-2xl font-bold text-text-primary">Account</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* User Info */}
                        <div className="bg-bg-secondary rounded-lg p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary">{user.name}</h3>
                                    <p className="text-sm text-text-secondary">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-xs font-semibold rounded-full">
                                    {user.tier} Plan
                                </span>
                                <button className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                                    Upgrade →
                                </button>
                            </div>
                        </div>

                        {/* Usage Stats */}
                        <div className="bg-bg-secondary rounded-lg p-6">
                            <h4 className="text-sm font-semibold text-text-secondary mb-4">USAGE THIS MONTH</h4>

                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-3xl font-bold text-text-primary">{user.verificationsUsed}</span>
                                <span className="text-text-secondary">/ {user.verificationsLimit} verifications</span>
                            </div>

                            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full transition-all duration-500 ${usagePercentage > 80 ? 'bg-red-500' :
                                            usagePercentage > 50 ? 'bg-yellow-500' :
                                                'bg-green-500'
                                        }`}
                                    style={{ width: `${usagePercentage}%` }}
                                />
                            </div>

                            <p className="text-xs text-text-secondary">
                                {user.verificationsLimit - user.verificationsUsed} verifications remaining
                            </p>
                        </div>

                        {/* Account Actions */}
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-4 bg-bg-secondary hover:bg-bg-tertiary rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-text-primary font-medium">Edit Profile</span>
                                </div>
                                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <button className="w-full flex items-center justify-between p-4 bg-bg-secondary hover:bg-bg-tertiary rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    <span className="text-text-primary font-medium">Change Password</span>
                                </div>
                                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <button className="w-full flex items-center justify-between p-4 bg-bg-secondary hover:bg-bg-tertiary rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-text-primary font-medium">Settings</span>
                                </div>
                                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-glass-border">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
