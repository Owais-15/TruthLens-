import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth.store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import TestVerificationPage from './pages/TestVerificationPage';

function App() {
    const { isAuthenticated, isLoading, loadUser } = useAuthStore();

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Test route - no auth required */}
                <Route path="/test" element={<TestVerificationPage />} />

                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
                />
                <Route
                    path="/register"
                    element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />}
                />
                <Route
                    path="/"
                    element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/history"
                    element={isAuthenticated ? <HistoryPage /> : <Navigate to="/login" />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
