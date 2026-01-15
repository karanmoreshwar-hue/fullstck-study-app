import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                }
            } catch {
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    const login = async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await api.post('/auth/token', formData);
        const { access_token } = response.data;

        localStorage.setItem('token', access_token);
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);
        return userResponse.data;
    };

    const register = async (username, email, password, role = 'student') => {
        await api.post('/auth/register', { username, email, password, role });
        // Auto login after register? Or redirect to login.
        // Let's return true to indicate success
        return true;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
