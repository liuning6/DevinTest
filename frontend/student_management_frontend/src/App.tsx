import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/LoginForm';
import { StudentList } from '@/components/StudentList';
import { StudentGrades } from '@/components/StudentGrades';
import { isAuthenticated } from '@/lib/auth';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }
    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Navigate to="/students" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/students"
                    element={
                        <ProtectedRoute>
                            <StudentList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/students/:studentId/grades"
                    element={
                        <ProtectedRoute>
                            <StudentGrades />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
