import axios from 'axios';

// File cấu hình Axios trung tâm (Bước 6 trong tài liệu Lab 3)
// baseURL tự động đọc từ biến môi trường NEXT_PUBLIC_API_URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor xử lý lỗi hoặc logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log lỗi để dễ debug trong tab Console DevTools
    console.error('API Error:', error.response?.data?.error || error.message);
    return Promise.reject(error);
  }
);

export default api;
