/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { checkAuth, loginUser, registerUser, logoutUser, socialLoginUser } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const userData = await checkAuth();
                if (userData) {
                    setUser(userData);
                    setIsAuthenticated(true);
                }
            } catch {
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, []);

    const login = async (credentials) => {
        const data = await loginUser(credentials);
        setUser(data.user || data);
        setIsAuthenticated(true);
        return data;
    };

    const socialLogin = async (providerData) => {
        const data = await socialLoginUser(providerData);
        setUser(data.user || data);
        setIsAuthenticated(true);
        return data;
    };

    const register = async (userData) => {
        const data = await registerUser(userData);
        return data;
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, socialLogin, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
