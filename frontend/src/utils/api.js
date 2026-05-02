import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies with requests
    timeout: 3000, // Prevent infinite loading if backend hangs
});

export const checkAuth = async () => {
    try {
        const { data } = await api.get('/auth/me');
        return data.user;
    } catch {
        return null; // Return null gracefully
    }
};

export const loginUser = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
};

export const registerUser = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
};

export const socialLoginUser = async (providerData) => {
    const { data } = await api.post('/auth/social', providerData);
    return data;
};

export const logoutUser = async () => {
    const { data } = await api.post('/auth/logout');
    return data;
};

export const getRecentPublicUsers = async () => {
    try {
        const { data } = await api.get('/users/public/recent');
        return data;
    } catch {
        return null;
    }
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};

export default api;
