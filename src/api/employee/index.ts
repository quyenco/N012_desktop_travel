import axios, { CustomAxiosResponse } from "../axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Lấy danh sách tất cả nhân viên
export const getEmployees = async (): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/employees`);
    console.log("api employee: ",res);
    return res;
  } catch (error: any) {
    toast.error("Không thể tải danh sách nhân viên!");
    console.error("Lỗi lấy danh sách nhân viên:", error);
  }
};

// Lấy thông tin chi tiết của 1 nhân viên
export const getEmployeeById = async (id: number): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/employees/${id}`);
    return res;
  } catch (error: any) {
    toast.error("Không thể tải thông tin nhân viên!");
    console.error("Lỗi lấy thông tin nhân viên:", error);
  }
};

// Thêm nhân viên mới
export const createEmployee = async (data: any): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.post(`${API_URL}/api/employees`, data);
    toast.success("Thêm nhân viên thành công!");
    return res;
  } catch (error: any) {
    toast.error("Không thể thêm nhân viên!");
    console.error("Lỗi thêm nhân viên:", error);
  }
};

// Cập nhật thông tin nhân viên
export const updateEmployee = async (
  id: number,
  data: any
): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.put(`${API_URL}/api/employees/${id}`, data);
    toast.success("Cập nhật nhân viên thành công!");
    return res;
  } catch (error: any) {
    toast.error("Không thể cập nhật nhân viên!");
    console.error("Lỗi cập nhật nhân viên:", error);
  }
};

// Xóa nhân viên
export const deleteEmployee = async (id: number): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.delete(`${API_URL}/api/employees/${id}`);
    toast.success("Xóa nhân viên thành công!");
    return res;
  } catch (error: any) {
    toast.error("Không thể xóa nhân viên!");
    console.error("Lỗi xóa nhân viên:", error);
  }
};
