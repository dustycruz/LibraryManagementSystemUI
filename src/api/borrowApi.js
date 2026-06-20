import axiosInstance from './axiosInstance';

export const borrowBook = (data) => axiosInstance.post('/borrow/borrow', data);
export const returnBook = (borrowId) => axiosInstance.post(`/borrow/return/${borrowId}`);
export const getAllBorrows = (params) => axiosInstance.get('/borrow/all', { params });
export const getMyHistory = () => axiosInstance.get('/borrow/my-history');
export const getUserHistory = (userId) => axiosInstance.get(`/borrow/user/${userId}/history`);