import axios, { CustomAxiosResponse } from "../axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// 🎯 Lấy danh sách tất cả booking
export const getBookings = async (): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/bookings`);
    return res;
  } catch (error: any) {
    toast.error("Không thể tải danh sách booking!");
    console.error("Lỗi lấy danh sách booking:", error);
  }
};

// 🔍 Lấy chi tiết booking theo ID
export const getBookingById = async (id: number): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/bookings/${id}`);
    return res;
  } catch (error: any) {
    toast.error("Không thể tải thông tin booking!");
    console.error("Lỗi lấy thông tin booking:", error);
  }
};

// ➕ Tạo mới booking
export const createBooking = async (bookingData: any): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.post(`${API_URL}/api/bookings`, bookingData);
    toast.success("🎉 Đặt tour thành công!");
    return res.data;
  } catch (error: any) {
    toast.error("❌ Không thể tạo booking!");
    console.error("Lỗi tạo booking:", error);
  }
};

// ✏️ Cập nhật booking
export const updateBooking = async (
  id: number,
  updatedData: any
): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.put(`${API_URL}/api/bookings/${id}`, updatedData);
    toast.success("✅ Cập nhật booking thành công!");
    return res.data;
  } catch (error: any) {
    toast.error("❌ Không thể cập nhật booking!");
    console.error("Lỗi cập nhật booking:", error);
  }
};

// 🗑️ Xóa booking
export const deleteBooking = async (id: number): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.delete(`${API_URL}/api/bookings/${id}`);
    toast.success("✅ Xóa booking thành công!");
    return res.data;
  } catch (error: any) {
    toast.error("❌ Không thể xóa booking!");
    console.error("Lỗi xóa booking:", error);
  }
};
