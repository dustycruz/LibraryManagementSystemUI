import axiosInstance from './axiosInstance';

export const getDashboardStats = () => axiosInstance.get('/reports/dashboard');
export const getAvailableBooks = () => axiosInstance.get('/reports/available-books');
export const getMostBorrowed = (top = 10) => axiosInstance.get('/reports/most-borrowed', { params: { top } });
export const getOverdueBooks = () => axiosInstance.get('/reports/overdue');
export const getUserActivity = () => axiosInstance.get('/reports/user-activity');