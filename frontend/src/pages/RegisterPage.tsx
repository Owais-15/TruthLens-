import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const { register, error, isLoading, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            setLocalError('Password must be at least 8 characters');
            return;
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            setLocalError('Password must contain uppercase, lowercase, and number');
            return;
        }

        try {
            await register(email, password, name || undefined);
            navigate('/');
        } catch (err) {
            // Error is handled by store
        }
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card p-8 w-full max-w-md animate-slide-up">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-2">
                        TruthLens
                    </h1>
                    <p className="text-text-secondary">Create your account</p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                            Name (Optional)
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-bg-secondary border border-glass-border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all text-white placeholder-gray-400"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-bg-secondary border border-glass-border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all text-white placeholder-gray-400"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-bg-secondary border border-glass-border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all text-white placeholder-gray-400"
                            placeholder="••••••••"
                        />
                        <p className="text-xs text-text-secondary mt-1">
                            Must be 8+ characters with uppercase, lowercase, and number
                        </p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-bg-secondary border border-glass-border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all text-white placeholder-gray-400"
                            placeholder="••••••••"
                        />
                    </div>

                    {displayError && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {displayError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full"
                    >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center mt-6 text-text-secondary">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
