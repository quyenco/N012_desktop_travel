import axios, { CustomAxiosResponse } from "../axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Lấy danh sách tất cả nhân viên
export const getTours = async (): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/tours`);
    return res;
  } catch (error: any) {
    toast.error("Không thể tải danh sách tour!");
    console.error("Lỗi lấy danh sách tour:", error);
  }
};


// Thêm tour mới (demo nhanh)
export const createTour = async (categoryId,tourData) => {
    try {
      console.log("loại id", categoryId);
      console.log("tour data", tourData);
      const res = await axios.post(`${API_URL}/api/tours/category/${categoryId}`, tourData);
      toast.success("Thêm tour mới thành công!");
      return res;
    } catch (error: any) {
      console.error("Lỗi thêm tour:", error);
      toast.error("Không thể thêm tour mới!");
    }
  };

  //them tour detail
  export const createTourDetail = async (tourId, tourData) => {
    try {
      // Gọi API POST, truyền tourId vào đúng endpoint
      console.log("tourId",tourData)
      const res = await axios.post(`${API_URL}/api/tour-details/tour/${tourId}`, tourData);
  
      toast.success("Thêm chi tiết tour thành công!");
      return res.data;
    } catch (error) {
      console.error("Lỗi thêm chi tiết tour:", error);
      toast.error("Không thể thêm chi tiết tour!");
      return null; // Trả về null nếu lỗi
    }
  };

  export const createTourSchedule = async (tourId, tourData) => {
    try {
      // Gọi API POST, truyền tourId vào đúng endpoint
      console.log("tourId",tourData)
      const res = await axios.post(`${API_URL}/api/schedules/tour/${tourId}`, tourData);
  
      toast.success("Thêm chi tiết tour thành công!");
      return res;
    } catch (error) {
      console.error("Lỗi thêm chi tiết tour:", error);
      toast.error("Không thể thêm chi tiết tour!");
      return null; // Trả về null nếu lỗi
    }
  };
  

  // Lấy thông tin chi tiết của 1 tour
export const getTourById = async (id: number): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/tours/${id}`);
    return res;
  } catch (error: any) {
    toast.error("Không thể tải thông tin tour!");
    console.error("Lỗi lấy thông tin tour:", error);
  }
};

  // Lấy thông tin chi tiết của 1 tour
  export const getTourDetailById = async (id: number): Promise<CustomAxiosResponse<any> | undefined> => {
    try {
      const res = await axios.get(`${API_URL}/api/tour-details/tour/${id}`);
      return res;
    } catch (error: any) {
      toast.error("Không thể tải thông tin tour detail!");
      console.error("Lỗi lấy thông tin tour detail:", error);
    }
  };

  // Lấy thông tin lịch trình của 1 tour
  export const getTourScheduleById = async (id: number): Promise<CustomAxiosResponse<any> | undefined> => {
    try {
      const res = await axios.get(`${API_URL}/api/schedules/tour/${id}`);
      return res;
    } catch (error: any) {
      toast.error("Không thể tải thông tin lịch trình tour!");
      console.error("Lỗi lấy thông tin lịch trình tour:", error);
    }
  };

// để tạm lấy category
  export const getTourCategories = async () => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  };

  // 🗑️ Xóa danh mục tour
export const deleteTour = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/tour/${id}`);
    toast.success("Xóa tour thành công!");
  } catch (error: any) {
    toast.error("Không thể xóa tour!");
    console.error("Lỗi xóa :", error);
  }
};

  // 🗑️ Xóa schedule
  export const deleteSchedule = async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/api/schedules/${id}`);
      toast.success("Xóa tour thành công!");
    } catch (error: any) {
      toast.error("Không thể xóa tour!");
      console.error("Lỗi xóa :", error);
    }
  };

//cập nhật tour
export const updateTour = async (id: number, data: any): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    console.log("data:",data);
    const res = await axios.put(`${API_URL}/api/tours/update/${id}`, data);
    toast.success("✅ Cập nhật tour thành công!");
    
    return res;
  } catch (error: any) {
    toast.error("❌ Không thể cập nhật tour!");
    console.error("Lỗi cập nhật tour:", error);
  }
};

//cập nhật tour detail
export const updateTourDetail = async (id: number, data: any): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    console.log("data:",data);
    const res = await axios.patch(`${API_URL}/api/tour-details/tour/${id}`, data);
    toast.success("✅ Cập nhật tour detail thành công!");
    
    return res;
  } catch (error: any) {
    toast.error("❌ Không thể cập nhật tour detail!");
    console.error("Lỗi cập nhật tour detail:", error);
  }
};

//cập nhật schedule
export const updateTourSchedule = async (id: number, data: any): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    console.log("data:",data);
    const res = await axios.patch(`${API_URL}/api/schedules/${id}`, data);
    toast.success("✅ Cập nhật tour schedule thành công!");
    
    return res;
  } catch (error: any) {
    toast.error("❌ Không thể cập nhật tour schedule!");
    console.error("Lỗi cập nhật tour schedule:", error);
  }
};