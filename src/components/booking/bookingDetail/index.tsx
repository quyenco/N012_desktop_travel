import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {getBookingById, getCustomerByBookingId, getTourByBookingId} from '../../../api/booking/index';
import {
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  MoneyCollectOutlined,
  CheckCircleOutlined,
  TagOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  GiftOutlined,
} from '@ant-design/icons';

const BookingDetail = () => {
  const {id} = useParams();
  const [booking, setBooking] = useState<any>(null);
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [tour, setTour] = useState<any>(null);

  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        const data = await getBookingById(id);
        if (data) {
          setBooking(data);
  
          // Gọi API customer & tour ngay sau khi setBooking xong
          const [customerData, tourData] = await Promise.all([
            getCustomerByBookingId(data.bookingId),
            getTourByBookingId(data.bookingId),
          ]);
  
          setCustomer(customerData);
          setTour(tourData);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };
  
    fetchBookingDetail();
  }, [id]);
  

  if (!booking) return <div className="text-center p-4">⏳ Đang tải chi tiết đơn đặt...</div>;

  // Định nghĩa style cho trạng thái đơn
  const statusStyles: Record<string, {color: string; label: string}> = {
    CONFIRMED: {color: 'bg-green-200 text-green-700', label: ' Đã xác nhận'},
    CANCELED: {color: 'bg-red-200 text-red-700', label: ' Đã hủy'},
    COMPLETED: {color: 'bg-blue-200 text-blue-700', label: ' Đã hoàn thành'},
    PAID: {color: 'bg-purple-200 text-purple-700', label: ' Đã thanh toán'},
    IN_PROGRESS: {color: 'bg-yellow-200 text-yellow-700', label: ' Đang thực hiện'},
    PENDING: {color: 'bg-gray-200 text-gray-700', label: ' Đang chờ'},
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg border border-gray-300">
      <h2 className="text-4xl font-bold mb-6 flex items-center gap-3 text-blue-700">
        <InfoCircleOutlined /> Chi tiết đơn đặt tour
      </h2>

      {/* 🧍 Thông tin khách hàng */}
      {customer&&
      <div className="bg-white shadow-lg p-6 rounded-lg border border-gray-200 mb-4 hover:scale-[1.02] transition-all">
        <h3 className="text-2xl font-semibold mb-4 text-blue-600">Thông tin khách hàng</h3>
        
        <p><strong>Họ và tên:</strong> {customer?.fullName || "Đang cập nhật"}</p>
        <p>
          <UserOutlined /> <strong>Họ và tên:</strong> {customer.fullName}
        </p>
        <p>
          <CalendarOutlined /> <strong>Ngày sinh:</strong> {customer.dob}
        </p>
        <p>
          <EnvironmentOutlined /> <strong>Địa chỉ:</strong> {customer.address}
        </p>
       
        {/* <p>
          <strong>Email:</strong> {customer.user.email}
        </p> */}
      </div>
    }

      {/* 🏖️ Thông tin tour */}
      {tour && (
      <div className="bg-white shadow-lg p-6 rounded-lg border border-gray-200 mb-4 hover:scale-[1.02] transition-all">
        <h3 className="text-2xl font-semibold mb-4 text-blue-600"> Thông tin tour</h3>
        
        <p>
          <strong>Tên tour:</strong> {tour.name}
        </p>
         <p>
          <EnvironmentOutlined /> <strong>Địa điểm:</strong> {tour.location}
        </p>
        <p>
          <FileTextOutlined /> <strong>Mô tả:</strong> {tour.description}
        </p>
        <p>
          <TagOutlined /> <strong>Loại tour:</strong> {tour.tourcategory.categoryName}
        </p>
        <p>
          <strong>Giá gốc:</strong> {tour.price.toLocaleString()} ₫
        </p> 
        
      </div>
      )}
      {/* 📋 Thông tin đơn đặt */}
      <div className="bg-white shadow-lg p-6 rounded-lg border border-gray-200 mb-4 hover:scale-[1.02] transition-all">
        <h3 className="text-2xl font-semibold mb-4 text-blue-600"> Thông tin đơn đặt</h3>
        <p>
          <CalendarOutlined /> <strong>Ngày đặt:</strong> {booking.bookingDate}
        </p>
        <p>
          <TeamOutlined /> <strong>Số người:</strong> {booking.numberPeople}
        </p>
        <p>
          <MoneyCollectOutlined /> <strong>Tổng tiền:</strong> {booking.totalPrice.toLocaleString()} ₫
        </p>
        <p
          className={`text-lg font-bold px-3 py-1 rounded-full ${
            statusStyles[booking.status]?.color || 'text-gray-500 bg-gray-100'
          }`}
        >
          <CheckCircleOutlined /> {statusStyles[booking.status]?.label || '⏳ Đang chờ'}
        </p>
      </div>

      {/* 🎁 Khuyến mãi (nếu có) */}
      {booking.discount && (
        <div className="bg-yellow-50 shadow-lg p-6 rounded-lg border border-yellow-200 mb-4 hover:scale-[1.02] transition-all">
          <h3 className="text-2xl font-semibold mb-4 text-yellow-600"> Khuyến mãi</h3>
          <p>
            <GiftOutlined /> <strong>Mã giảm giá:</strong> {booking.discount.code}
          </p>
          <p>
            <strong>Mô tả:</strong> {booking.discount.description}
          </p>
          <p>
            <strong>Giảm giá:</strong> {booking.discount.discountPercent}%
          </p>
        </div>
      )}

      {/* 🔙 Nút quay lại */}
      <div className="mt-6 flex justify-end gap-2">
        <button
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200 font-semibold"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftOutlined /> Quay lại
        </button>
      </div>
    </div>
  );
};

export default BookingDetail;
