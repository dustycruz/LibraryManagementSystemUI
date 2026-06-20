import axiosInstance from './axiosInstance';

export const getUsers = () => axiosInstance.get('/users');
export const getUserById = (id) => axiosInstance.get(`/users/${id}`);
export const updateUser = (id, data) => axiosInstance.put(`/users/${id}`, data);
export const deactivateUser = (id) => axiosInstance.post(`/users/${id}/deactivate`);
export const getRoles = () => axiosInstance.get('/roles');