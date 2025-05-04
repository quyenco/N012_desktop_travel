import React, { useEffect, useState } from "react";
import { getBookings } from "../../api/booking";
import { useNavigate } from "react-router-dom";
import { Input, Pagination, Select, Button, Spin } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";

const { Option } = Select;

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 🎯 Bộ lọc tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchPaymentStatus, setSearchPaymentStatus] = useState("");

  const navigate = useNavigate();

  // 🎯 Trạng thái và style
  const statusStyles: Record<string, { color: string; label: string }> = {
    CONFIRMED: { color: "text-green-600", label: "✅ Đã xác nhận" },
    CANCELED: { color: "text-red-500", label: "❌ Đã hủy" },
    COMPLETED: { color: "text-blue-600", label: "✔️ Đã hoàn thành" },
    PAID: { color: "text-purple-600", label: "💸 Đã thanh toán" },
    IN_PROGRESS: { color: "text-yellow-500", label: "🔧 Đang thực hiện" },
    // PENDING: { color: "text-gray-500", label: "⏳ Đang chờ" },
  };

  // 🛠️ Lấy danh sách booking từ API
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await getBookings();
        setBookings(data);
      } catch (error) {
        console.error("Lỗi khi tải booking:", error);
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  // 🎯 Chuyển đến trang chi tiết booking
  const handleBookingClick = (bookingId: number) => {
    navigate(`/dashboard/booking/${bookingId}`);
  };

  // 🎯 Lọc dữ liệu theo nhiều tiêu chí
  const filteredBookings = bookings.filter((booking) => {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    // Chuyển mọi thứ về string để đảm bảo so sánh không lỗi
  const bookingIdString = String(booking.bookingId);
  const customerName = String(booking.customer?.fullName || "").toLowerCase();
  const tourName = String(booking.tour?.name || "").toLowerCase();

    return (
      
      // Tìm theo mã đơn, tên khách hàng, tên tour
      (bookingIdString.includes(lowerSearchTerm) ||
      customerName.includes(lowerSearchTerm) ||
      tourName.includes(lowerSearchTerm)) &&
      // Tìm theo trạng thái booking
      (searchStatus ? booking.status === searchStatus : true) &&
      // Tìm theo trạng thái thanh toán
      (searchPaymentStatus ? booking.paymentStatus === searchPaymentStatus : true)
    );
  });

  // 🎯 Phân trang
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  // 🎯 Nút reset bộ lọc
  const handleReset = () => {
    setSearchTerm("");
    setSearchStatus("");
    setSearchPaymentStatus("");
    setCurrentPage(1);
  };

  // 🎯 Loading spinner
  if (loading) return <Spin tip="⏳ Đang tải dữ liệu..." className="block mx-auto mt-10" size="large" />;

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">📌 Danh sách Booking</h2>

      {/* 🎯 Thanh tìm kiếm đa tiêu chí + bộ lọc */}
      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          placeholder="🔍 Tìm kiếm mã đơn, khách hàng, tour..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/3"
        />

        <Select
          placeholder="📌 Trạng thái đặt chỗ"
          value={searchStatus}
          onChange={(value) => setSearchStatus(value)}
          className="w-1/4"
          allowClear
        >
          {Object.keys(statusStyles).map((key) => (
            <Option key={key} value={key}>
              {statusStyles[key].label}
            </Option>
          ))}
        </Select>

        {/* <Select
          placeholder="💸 Trạng thái thanh toán"
          value={searchPaymentStatus}
          onChange={(value) => setSearchPaymentStatus(value)}
          className="w-1/4"
          allowClear
        >
          <Option value="PAID">💰 Đã thanh toán</Option>
          <Option value="UNPAID">💸 Chưa thanh toán</Option>
        </Select> */}

        <Button type="default" onClick={handleReset} icon={<ReloadOutlined />} className="bg-red-500 text-white">
          Reset
        </Button>
      </div>

      {/* 🛠️ Bảng danh sách booking */}
      <table className="table-auto w-full border-collapse border border-gray-300 text-sm shadow-lg">
        <thead className="bg-blue-100 text-blue-700">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">👤 Tên khách hàng</th>
            <th className="border p-2">📍 Tour</th>
            <th className="border p-2">📅 Ngày đặt</th>
            <th className="border p-2">👥 Số lượng</th>
            <th className="border p-2">💰 Tổng tiền</th>
            <th className="border p-2">📌 Trạng thái</th>
          </tr>
        </thead>

        <tbody>
          {paginatedBookings.length > 0 ? (
            paginatedBookings.map((booking, index) => (
              <tr
                key={booking.bookingId}
                className="hover:bg-blue-50 cursor-pointer transition-all duration-200"
                onClick={() => handleBookingClick(booking.bookingId)}
              >
                <td className="border p-2 text-center font-medium text-gray-700">{index + 1}</td>
                <td className="border p-2 font-semibold">{booking.customerName}</td>
                <td className="border p-2">{booking.tourName}</td>
                <td className="border p-2 text-center">{booking.bookingDate}</td>
                <td className="border p-2 text-center">{booking.numberPeople}</td>
                <td className="border p-2 text-right font-semibold text-green-700">
                  {booking.totalPrice.toLocaleString()} ₫
                </td>
                <td className={`border p-2 text-center font-bold ${statusStyles[booking.status]?.color || "text-gray-500"}`}>
                  {statusStyles[booking.status]?.label || "⏳ Đang chờ"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center p-4 text-red-500 font-semibold">
                ❌ Không có booking nào phù hợp!
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 📌 Phân trang */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredBookings.length}
        onChange={handlePageChange}
        className="mt-4 text-center"
        showSizeChanger
      />
    </div>
  );
};

export default BookingList;
