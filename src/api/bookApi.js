import axiosInstance from './axiosInstance';

export const getBooks = (params) => axiosInstance.get('/books', { params });
export const getBookById = (id) => axiosInstance.get(`/books/${id}`);
export const createBook = (data) => axiosInstance.post('/books', data);
export const updateBook = (id, data) => axiosInstance.put(`/books/${id}`, data);
export const deleteBook = (id) => axiosInstance.delete(`/books/${id}`);