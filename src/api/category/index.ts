import axios, { CustomAxiosResponse } from "../axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// 🛠 Lấy danh sách danh mục tour
export const getTourCategories = async (): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/categories`);
    return res;
  } catch (error: any) {
    toast.error("Không thể tải danh sách danh mục tour!");
    console.error("Lỗi lấy danh sách danh mục:", error);
  }
};

//  Thêm mới danh mục tour
export const createTourCategory = async (categoryData: any): Promise<any> => {
  try {
    console.log("thêm category", categoryData);
    // console.log("api thêm category",`${API_URL}/api/categories`, categoryData/)
    const res = await axios.post(`${API_URL}/api/categories`, categoryData);
    toast.success("Thêm danh mục tour mới thành công!");
    return res;
  } catch (error: any) {
    toast.error("Không thể thêm danh mục tour mới!");
    console.error("Lỗi thêm danh mục tour:", error);
  }
};

// 🔍 Lấy chi tiết một danh mục tour
export const getTourCategoryById = async (id: number): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/categories/${id}`);
    return res;
  } catch (error: any) {
    toast.error("Không thể tải thông tin chi tiết danh mục!");
    console.error("Lỗi lấy chi tiết danh mục:", error);
  }
};

// 📝 Cập nhật danh mục tour
export const updateTourCategory = async (id: number, categoryData: any): Promise<any> => {
  try {
    const res = await axios.put(`${API_URL}/api/categories/${id}`, categoryData);
    toast.success("Cập nhật danh mục tour thành công!");
    return res.data;
  } catch (error: any) {
    toast.error("Không thể cập nhật danh mục tour!");
    console.error("Lỗi cập nhật danh mục:", error);
  }
};

// 🗑️ Xóa danh mục tour
export const deleteTourCategory = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/categories/${id}`);
    toast.success("Xóa danh mục tour thành công!");
  } catch (error: any) {
    toast.error("Không thể xóa danh mục tour!");
    console.error("Lỗi xóa danh mục:", error);
    throw error;
  }
};
