import axios, { CustomAxiosResponse } from "../axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// 🛠 Lấy danh sách danh mục tour
export const getBookingCount = async (startDate: string, endDate: string): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/reports/count`, {
        params: { startDate, endDate },
      });
    return res;
  } catch (error: any) {
    toast.error("Không thể tải tổng đơn đặt!");
    console.error("Lỗi lấy tổng đơn đặt:", error);
  }
};

// 🛠 Lấy danh sách danh mục tour
export const getBookingTotalRevenue= async (startDate: string, endDate: string): Promise<CustomAxiosResponse<any> | undefined> => {
    try {
      const res = await axios.get(`${API_URL}/api/reports/total-revenue`, {
          params: { startDate, endDate },
        });
      return res;
    } catch (error: any) {
      toast.error("Không thể tải tổng đơn đặt!");
      console.error("Lỗi lấy tổng đơn đặt:", error);
    }
  };

  // 🛠 Lấy danh sách danh mục tour
export const getBookingTotalCancel= async (startDate: string, endDate: string): Promise<CustomAxiosResponse<any> | undefined> => {
    try {
      const res = await axios.get(`${API_URL}/api/reports/total-cancelled-bookings`, {
          params: { startDate, endDate },
        });
      return res;
    } catch (error: any) {
      toast.error("Không thể tải tổng đơn đặt!");
      console.error("Lỗi lấy tổng đơn đặt:", error);
    }
  };

    // 🛠 Lấy danh sách danh mục tour
export const getBookingTotalPaid= async (startDate: string, endDate: string): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    const res = await axios.get(`${API_URL}/api/reports/total-paid-bookings`, {
        params: { startDate, endDate },
      });
    return res;
  } catch (error: any) {
    toast.error("Không thể tải tổng đơn đặt!");
    console.error("Lỗi lấy tổng đơn đặt:", error);
  }
};

 // 🛠 Lấy danh sách danh sách booking theo ngày
 export const getBookingByDate= async (startDate: string, endDate: string): Promise<CustomAxiosResponse<any> | undefined> => {
    try {
      const res = await axios.get(`${API_URL}/api/reports`, {
          params: { startDate, endDate },
        });
      return res;
    } catch (error: any) {
      toast.error("Không thể tải tổng đơn đặt!");
      console.error("Lỗi lấy tổng đơn đặt:", error);
    }
  };

  export const getTopTourBookings= async (startDate: string, endDate: string): Promise<CustomAxiosResponse<any> | undefined> => {
    try {
      const res = await axios.get(`${API_URL}/api/reports/top-tour-bookings`, {
          params: { startDate, endDate },
        });
      return res;
    } catch (error: any) {
      toast.error("Không thể tải tổng đơn đặt!");
      console.error("Lỗi lấy tổng đơn đặt:", error);
    }
  };

  export const getTopTourBookingsRevenue= async (startDate: string, endDate: string): Promise<CustomAxiosResponse<any> | undefined> => {
    try {
      const res = await axios.get(`${API_URL}/api/reports/top-tours-revenue`, {
          params: { startDate, endDate },
        });
      return res;
    } catch (error: any) {
      toast.error("Không thể tải tổng đơn đặt!");
      console.error("Lỗi lấy tổng đơn đặt:", error);
    }
  };

  //lây tổng tour hoàn thành
  export const getBookingTotalCompleted= async (startDate: string, endDate: string): Promise<CustomAxiosResponse<any> | undefined> => {
    try {
      const res = await axios.get(`${API_URL}/api/reports/total-completed-bookings`, {
          params: { startDate, endDate },
        });
      return res;
    } catch (error: any) {
      toast.error("Không thể tải tổng đơn đặt!");
      console.error("Lỗi lấy tổng đơn đặt:", error);
    }
  };

    //lây tổng tour xác nhận
    export const getBookingTotalConfirmed= async (startDate: string, endDate: string): Promise<CustomAxiosResponse<any> | undefined> => {
      try {
        const res = await axios.get(`${API_URL}/api/reports/total-confirmed-bookings`, {
            params: { startDate, endDate },
          });
        return res;
      } catch (error: any) {
        toast.error("Không thể tải tổng đơn đặt!");
        console.error("Lỗi lấy tổng đơn đặt:", error);
      }
    };
    //lây tổng tour dang thực hiện
    export const getBookingTotalProgress= async (startDate: string, endDate: string): Promise<CustomAxiosResponse<any> | undefined> => {
      try {
        const res = await axios.get(`${API_URL}/api/reports/total-progress-bookings`, {
            params: { startDate, endDate },
          });
        return res;
      } catch (error: any) {
        toast.error("Không thể tải tổng đơn đặt!");
        console.error("Lỗi lấy tổng đơn đặt:", error);
      }
    };

        //lây tổng tour xác nhận
    export const getBookingCountByStatus= async (startDate: string, endDate: string): Promise<CustomAxiosResponse<any> | undefined> => {
      try {
        const res = await axios.get(`${API_URL}/api/reports/total-confirmed-bookings`, {
            params: { startDate, endDate },
          });
        return res;
      } catch (error: any) {
        toast.error("Không thể tải tổng đơn đặt!");
        console.error("Lỗi lấy tổng đơn đặt:", error);
      }
    };