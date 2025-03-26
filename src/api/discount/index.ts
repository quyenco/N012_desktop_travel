import axios, { CustomAxiosResponse } from "../axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// 🎉 Lấy danh sách khuyến mãi
export const getDiscounts = async (): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/discounts`);
    return res;
  } catch (error: any) {
    toast.error("Không thể tải danh sách khuyến mãi!");
    console.error("Lỗi lấy danh sách khuyến mãi:", error);
  }
};

// 🔍 Lấy thông tin chi tiết của một khuyến mãi
export const getDiscountById = async (id: number): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/discounts/${id}`);
    return res;
  } catch (error: any) {
    toast.error("Không thể tải thông tin khuyến mãi!");
    console.error("Lỗi lấy thông tin khuyến mãi:", error);
  }
};

// ➕ Thêm mới khuyến mãi
export const createDiscount = async (data: any): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.post(`${API_URL}/api/discounts`, data);
    toast.success("🎉 Thêm khuyến mãi thành công!");
    return res;
  } catch (error: any) {
    toast.error("❌ Không thể thêm khuyến mãi!");
    console.error("Lỗi thêm khuyến mãi:", error);
  }
};

// ✏️ Cập nhật thông tin khuyến mãi
export const updateDiscount = async (
  id: number,
  data: any
): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.put(`${API_URL}/api/discounts/${id}`, data);
    toast.success("✅ Cập nhật khuyến mãi thành công!");
    return res;
  } catch (error: any) {
    toast.error("❌ Không thể cập nhật khuyến mãi!");
    console.error("Lỗi cập nhật khuyến mãi:", error);
  }
};

// 🗑️ Xóa khuyến mãi
export const deleteDiscount = async (id: number): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.delete(`${API_URL}/api/discounts/${id}`);
    toast.success("✅ Xóa khuyến mãi thành công!");
    return res;
  } catch (error: any) {
    toast.error("❌ Không thể xóa khuyến mãi!");
    console.error("Lỗi xóa khuyến mãi:", error);
  }
};
