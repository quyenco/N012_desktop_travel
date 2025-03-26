import axios, {CustomAxiosResponse} from '../axiosConfig';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ✏️ Cập nhật thông tin user status
export const updateUserStatus = async (id: number, data: any): Promise<CustomAxiosResponse<any> | undefined> => {
  try {
    console.log('data:', data);
    const res = await axios.patch(`${API_URL}/api/users/status/${id}`, {status:data});
    toast.success('✅ Cập nhật user status thành công!');

    return res;
  } catch (error: any) {
    toast.error('❌ Không thể cập nhật user status!');
    console.error('Lỗi cập nhật user status:', error);
  }
};
