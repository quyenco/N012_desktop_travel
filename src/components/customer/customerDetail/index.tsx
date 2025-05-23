import React, {useEffect, useState} from 'react';
import {getCustomers, getCustomerById, getBookingsByCustomerId,updateCustomer, getUserByCustomerId, getTourNameByBookingId} from '../../../api/customer/index';
import {updateUserStatus} from '../../../api/user/index';
import {useNavigate, useParams} from 'react-router-dom';
import {notification,Button, Form, Input, Modal, Select, message} from 'antd';
const { Option } = Select;

const CustomerDetail = () => {
  const {id} = useParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingTourNames, setBookingTourNames] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 🎯 Khởi tạo form từ hook Ant Design
  const [form] = Form.useForm();
  

  //  Lấy danh sách khách hàng khi lần đầu load trang
  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await getCustomers();
      if (data) setCustomers(data);
    };
    fetchCustomers();
  }, []);

  //   Lấy chi tiết khách hàng mỗi lần "id" thay đổi
  useEffect(() => {
    const fetchCustomerDetail = async () => {
      setLoading(true);
      if (id) {
        const detail = await getCustomerById(id);
        if (detail) {
          setSelectedCustomer(detail);
          const userData = await getUserByCustomerId(id);
          if (userData) {
            setSelectedUser(userData);
          } else {
            setSelectedUser(null);
          }
        }
        // 🔥 Lấy luôn danh sách tour booking của khách hàng này
        const bookingData = await getBookingsByCustomerId(id);
        if (bookingData) {
          setBookings(bookingData);
          const tourNames: { [key: number]: string } = {};
          // for (const booking of bookingData) {
          //   const tourNameRes = await getTourNameByBookingId(booking.bookingId);
          //   console.log(`Tên tour cho booking ${booking.bookingId}:`, tourNameRes);
          //   tourNames[booking.bookingId] = tourNameRes;
          // }
          setBookingTourNames(tourNames);
        }
        else setSelectedCustomer(null);
        
      }
      setLoading(false);
    };
    fetchCustomerDetail();
  }, [id]); //  đảm bảo luôn load lại khi id thay đổi

  //  Lấy thông tin chi tiết của khách hàng khi click
  const handleSelectCustomer = async (id: number) => {
    const res = await getCustomerById(id);
    if (res) {
      setSelectedCustomer(res);
          const userData = await getUserByCustomerId(id);
          if (userData) {
            setSelectedUser(userData);
          } else {
            setSelectedUser(null);
          }

      // Cập nhật form ngay khi đổi khách hàng
      form.setFieldsValue({
        fullName: res.fullName,
        address: res.address,
        dob: res.dob,
        gender: res.gender ? "true" : "false",
      });
      
    const bookingData = await getBookingsByCustomerId(id);
    if (bookingData) setBookings(bookingData);
    }
  };

  //  Tính tổng tiền từ danh sách đơn hàng
  const calculateTotalPrice = () => {
    return bookings.reduce((total, booking) => total + booking.totalPrice, 0);
  };

  //  Hiển thị modal cập nhật
  const showModal = () => {
    setIsModalOpen(true);
  
    // Set giá trị mới cho form mỗi khi mở modal
    form.setFieldsValue({
      fullName: selectedCustomer.fullName,
      address: selectedCustomer.address,
      dob: selectedCustomer.dob,
      gender: selectedCustomer.gender ? "true" : "false",
    });
  };

  //  Đóng modal
  const handleCancel = () => setIsModalOpen(false);

  //  Xử lý cập nhật thông tin khách hàng
  const handleUpdateCustomer = async (values: any) => {
    try {
      const updatedData = {
        ...selectedCustomer,
        ...values,
        gender: values.gender === "true",
      };
  
      console.log("Dữ liệu cập nhật:", updatedData);
  
      const res = await updateCustomer(selectedCustomer.customerId, updatedData);
  
      if (res) {
        notification.success({
          message: 'Cập nhật thành công!',
          description: 'Thông tin khách hàng đã được cập nhật.',
        });
  
        // Cập nhật danh sách khách hàng
        const updatedCustomerList = await getCustomers();
        setCustomers(updatedCustomerList);
  
        // Cập nhật thông tin khách hàng
        const updatedCustomer = await getCustomerById(selectedCustomer.customerId);
        if (!updatedCustomer) {
          notification.error({
            message: 'Lỗi',
            description: 'Không thể tải lại thông tin khách hàng!',
          });
          return;
        }
        console.log('Updated customer:', updatedCustomer);
        setSelectedCustomer(updatedCustomer);
  
        // Cập nhật form để đồng bộ
        form.setFieldsValue({
          fullName: updatedCustomer.fullName,
          address: updatedCustomer.address,
          dob: updatedCustomer.dob,
          gender: updatedCustomer.gender ? "true" : "false",
        });
  
        setIsEditing(false);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Lỗi cập nhật khách hàng:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Cập nhật thất bại. Vui lòng thử lại!',
      });
    }
  };
  
  const handleChangeStatus = (newStatus: string) => {
    Modal.confirm({
      title: "Xác nhận cập nhật trạng thái",
      content: `Bạn có chắc chắn muốn đổi trạng thái khách hàng sang ${
        newStatus === "ACTIVE"
          ? "Đang hoạt động"
          : newStatus === "DISABLED"
          ? "Đã bị vô hiệu hóa"
          : "Đã bị chặn"
      } không?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      async onOk() {
        try {
          const res = await updateUserStatus(selectedUser.id, newStatus);
          console.log("status cập nhật:", res);
  
          // Cập nhật thông tin người dùng
          const userData = await getUserByCustomerId(selectedCustomer.customerId);
          if (userData) {
            setSelectedUser(userData);
          } else {
            throw new Error("Không thể tải thông tin người dùng");
          }
  
          // Cập nhật thông tin khách hàng (nếu cần)
          const updatedCustomer = await getCustomerById(selectedCustomer.customerId);
          if (updatedCustomer) {
            setSelectedCustomer(updatedCustomer);
          } else {
            throw new Error("Không thể tải thông tin khách hàng");
          }
  
          notification.success({
            message: "Cập nhật thành công!",
            description: `Khách hàng đã được đổi trạng thái thành ${
              newStatus === "ACTIVE"
                ? "Đang hoạt động"
                : newStatus === "DISABLED"
                ? "Đã bị vô hiệu hóa"
                : "Đã bị chặn"
            }.`,
          });
        } catch (error) {
          console.error("Lỗi cập nhật trạng thái:", error);
          notification.error({
            message: "Lỗi",
            description:
              error.response?.data?.message || "Cập nhật trạng thái thất bại. Vui lòng thử lại!",
          });
        }
      },
    });
  };
  

  if (loading) return <div className="text-center p-4">⏳ Đang tải dữ liệu...</div>;

  return (
    <div className="flex h-full">
      {/*  Danh sách khách hàng bên trái */}
      <div className="w-1/5 border-r border-gray-300 p-2 overflow-auto">
        <h2 className="text-lg font-bold mb-2"> Danh sách khách hàng</h2>
        <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Tên</th>
              {/* <th className="border p-2">Email</th> */}
            </tr>
          </thead>
          <tbody>
            {customers.map((cus) => (
              <tr
                key={cus.customerId}
                className={`cursor-pointer hover:bg-gray-200 ${
                  selectedCustomer?.customerId === cus.customerId ? 'bg-blue-100 font-bold' : ''
                }`}
                onClick={() => handleSelectCustomer(cus.customerId)}
              >
                <td className="border p-2">{cus.fullName}</td>
                {/* <td className="border p-2">{cus.user.email}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*  Chi tiết khách hàng bên phải (2/3 màn hình) */}
      <div className="w-4/5 p-4 overflow-auto">
        {selectedCustomer ? (
          <>
          <div className="flex items-center gap-2 mb-4">
            {/* Nút mở Modal cập nhật */}
          <Button type="primary" style={{ height: 40, lineHeight: '40px', marginTop:'8px' }} onClick={showModal} className="mb-2">
           Cập nhật
          </Button>
            {/* Select trạng thái */}
            <Select
              value={selectedUser.status}
              style={{
                width: 200,
                height: 42, // Đảm bảo chiều cao khớp với button
                lineHeight: '40px', // Căn chỉnh chữ giữa
                color:
                  selectedUser.status === 'ACTIVE'
                    ? 'green'
                    : selectedUser.status === 'DISABLED'
                    ? 'orange'
                    : 'red',
              }}
              onChange={(value={selectedUser}) => {
                console.log("status cập nhật:", value);
                handleChangeStatus(value)
                
              }}
            >
              <Option value="ACTIVE" style={{ color: 'green' }}>🟢 Đang hoạt động</Option>              
              <Option value="BLOCKED" style={{ color: 'red' }}>🔴 Đã bị chặn</Option>
              <Option value="DISABLED" style={{ color: 'orange' }}>🟡 Vô hiệu hóa</Option>
            </Select>
            
          </div>
          
            {/*  Thông tin chi tiết khách hàng */}
            <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-md shadow-sm">
              <div className="grid grid-cols-[120px_1fr] gap-y-2 gap-x-4 text-sm">
                <div className="font-semibold text-gray-600">Họ tên:</div>
                <div className="text-gray-800">{selectedCustomer.fullName}</div>

                <div className="font-semibold text-gray-600">Ngày sinh:</div>
                <div className="text-gray-800">{selectedCustomer.dob}</div>

                <div className="font-semibold text-gray-600">Email:</div>
                <div className="text-gray-800">
                  {selectedUser.email}
                </div>

                <div className="font-semibold text-gray-600">Địa chỉ:</div>
                <div className="text-gray-800">{selectedCustomer.address}</div>

                <div className="font-semibold text-gray-600">Giới tính:</div>
                <div className="text-gray-800">{selectedCustomer.gender ? 'Nam' : 'Nữ'}</div>

                <div className="font-semibold text-gray-600">Trạng thái:</div>
                <div
                  className={`${
                    selectedUser.status === 'ACTIVE'
                      ? 'text-green-600'
                      : selectedUser.status === 'DISABLED'
                      ? 'text-yellow-500'
                      : 'text-red-500'
                  }`}
                >
                  {selectedUser.status === 'ACTIVE'
                    ? 'Đang hoạt động'
                    : selectedUser.status === 'DISABLED'
                    ? 'Đã bị vô hiệu hóa'
                    : 'Đã bị chặn'}
                </div>
              </div>          
            </div>

          {/* 🎯 Modal cập nhật thông tin khách hàng */}
          <Modal
            title=" Cập nhật thông tin khách hàng"
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateCustomer}
            >
              <Form.Item
                label="Họ tên"
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Ngày sinh"
                name="dob"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
              >
                <Input type="date" />
              </Form.Item>

              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
              >
                <Select>
                  <Option value="true">Nam</Option>
                  <Option value="false">Nữ</Option>
                </Select>
              </Form.Item>

              <Form.Item className="text-right">
                <Button type="default" onClick={handleCancel} className="mr-2">
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Modal>
            

            {/*  Danh sách tour booking */}
            <div className="p-4 mb-4 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
              <h3 className="text-xl font-bold mb-2"> Danh sách tour đã đặt</h3>
              {bookings.length > 0 ? (
                <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2">Ngày đặt</th>
                      <th className="border p-2">Tên tour</th>
                      <th className="border p-2">Số người</th>
                      <th className="border p-2">Tổng giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="border p-2 text-center">{booking.bookingDate}</td>
                        <td className="border p-2">{booking.tourName}</td>
                        <td className="border p-2 text-center">{booking.numberPeople}</td>
                        <td className="border p-2 text-right">{booking.totalPrice.toLocaleString()} ₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center p-4 text-red-500"> Không có đơn hàng nào!</div>
              )}
            </div>

            {/*  Tổng tiền */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-md shadow-sm text-right">
              <p className="text-lg font-bold text-green-700">Tổng tiền: {calculateTotalPrice().toLocaleString()} ₫</p>
            </div>
          </>
        ) : (
          <div className="text-center p-4 text-red-500">⚠️ Không tìm thấy khách hàng!</div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
