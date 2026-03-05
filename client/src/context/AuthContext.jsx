import { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            // Set default header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const { data } = await api.post('/auth/login', { username, password });

            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            return { success: true, role_type: data.user.role_type };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            // Attempt to tell the server to log out for session tracking
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Error during backend logout:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        }
    };

    const updateUserContext = (newFields) => {
        setUser(prevUser => {
            const updated = { ...prevUser, ...newFields };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUserContext }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
