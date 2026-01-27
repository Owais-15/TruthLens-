/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Brand colors
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                // Verification states
                verified: {
                    light: '#d1fae5',
                    DEFAULT: '#10b981',
                    dark: '#059669',
                },
                contradicted: {
                    light: '#fee2e2',
                    DEFAULT: '#ef4444',
                    dark: '#dc2626',
                },
                neutral: {
                    light: '#fef3c7',
                    DEFAULT: '#f59e0b',
                    dark: '#d97706',
                },
                unverified: {
                    light: '#e5e7eb',
                    DEFAULT: '#6b7280',
                    dark: '#4b5563',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            },
            boxShadow: {
                'premium': '0 10px 40px rgba(0, 0, 0, 0.1)',
                'glow': '0 0 20px rgba(14, 165, 233, 0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
