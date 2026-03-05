import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, default as AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddLabourCase from './pages/AddLabourCase';
import LabourList from './pages/LabourList';
import AddPatient from './pages/AddPatient';
import ManageUsers from './pages/ManageUsers';

// A simple PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router basename="/sankalplr">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-case"
            element={
              <PrivateRoute>
                <AddLabourCase />
              </PrivateRoute>
            }
          />
          <Route
            path="/list"
            element={
              <PrivateRoute>
                <LabourList />
              </PrivateRoute>
            }
          />

          <Route
            path="/add-patient"
            element={
              <PrivateRoute>
                <AddPatient />
              </PrivateRoute>
            }
          />
          <Route
            path="/manage-users"
            element={
              <PrivateRoute>
                <ManageUsers />
              </PrivateRoute>
            }
          />

          {/* Default redirect based on auth status */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
