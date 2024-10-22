import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import FindFoodTruck from './pages/FindFoodTruck';
import BusinessDashboard from './pages/BusinessDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/Header';
import VerifyEmail from './pages/VerifyEmail';
import { useAuth } from './context/AuthContext';

const App = () => {
    const { emailVerified, userRole } = useAuth();

    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/find-food-truck" element={<FindFoodTruck />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />

                {/* Protected Route for Business Dashboard */}
                {emailVerified && userRole === 'business' ? (
                    <Route path="/business-dashboard" element={<BusinessDashboard />} />
                ) : (
                    <Route path="/business-dashboard" element={<Navigate to="/" />} />
                )}

                {/* Protected Route for Admin Dashboard */}
                {emailVerified && userRole === 'admin' ? (
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                ) : (
                    <Route path="/admin-dashboard" element={<Navigate to="/" />} />
                )}
            </Routes>
        </>
    );
};

export default App;