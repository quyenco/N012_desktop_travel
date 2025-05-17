import axios, { CustomAxiosResponse } from "../axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// 📌 Lấy danh sách khách hàng
export const getCustomers = async (): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/customers`);
    return res;
  } catch (error: any) {
    toast.error("Không thể tải danh sách khách hàng!");
    console.error("Lỗi lấy danh sách khách hàng:", error);
  }
};

// 🔍 Lấy thông tin chi tiết khách hàng
export const getCustomerById = async (id: number): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/customers/${id}`);
    return res;
  } catch (error: any) {
    toast.error("Không thể tải thông tin khách hàng!");
    console.error("Lỗi lấy thông tin khách hàng:", error);
  }
};

// 🔍 Lấy thông tin user khách hàng
export const getUserByCustomerId = async (id: number): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/customers/user/${id}`);
    return res;
  } catch (error: any) {
    toast.error("Không thể tải thông tin khách hàng!");
    console.error("Lỗi lấy thông tin khách hàng:", error);
  }
};

// ➕ Thêm mới khách hàng
export const createCustomer = async (data: any): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.post(`${API_URL}/api/customers`, data);
    toast.success("🎉 Thêm khách hàng thành công!");
    return res;
  } catch (error: any) {
    toast.error("❌ Không thể thêm khách hàng!");
    console.error("Lỗi thêm khách hàng:", error);
  }
};

// ✏️ Cập nhật thông tin khách hàng
export const updateCustomer = async (id: number, data: any): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    console.log("data:",data);
    const res = await axios.patch(`${API_URL}/api/customers/${id}`, data);
    toast.success("✅ Cập nhật khách hàng thành công!");
    
    return res;
  } catch (error: any) {
    toast.error("❌ Không thể cập nhật khách hàng!");
    console.error("Lỗi cập nhật khách hàng:", error);
  }
};

// 🗑️ Xóa khách hàng
export const deleteCustomer = async (id: number): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.delete(`${API_URL}/api/customers/${id}`);
    toast.success("✅ Xóa khách hàng thành công!");
    return res;
  } catch (error: any) {
    toast.error("❌ Không thể xóa khách hàng!");
    console.error("Lỗi xóa khách hàng:", error);
  }
};

// Lấy danh sách tour booking từ customerId
export const getBookingsByCustomerId = async (customerId: number): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/manage-bookings/customer/${customerId}`);
    // console.log("danh sách booking của khách hàng: ", res)
    return res;
  } catch (error: any) {
    toast.error("Không thể tải danh sách tour booking của khách hàng!");
    console.error("Lỗi lấy danh sách tour booking:", error);
  }
};

// Lấy tour name từ bookingid
export const getTourNameByBookingId = async (bookingId: number): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/bookings/tourName/${bookingId}`);
    console.log("danh sách booking của khách hàng: ", res)
    return res;
  } catch (error: any) {
    toast.error("Không thể tải danh sách tour booking của khách hàng!");
    console.error("Lỗi lấy danh sách tour booking:", error);
  }
};

