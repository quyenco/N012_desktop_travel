import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, message, Spin, Typography, Space, Divider } from "antd";
import { getEmployeeById, updateEmployee } from "../../../api/employee";
import { useParams, useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const UpdateEmployee: React.FC = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch dữ liệu nhân viên từ API
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        console.log("id employee: ", id);
        setLoading(true);
        const employeeData = await getEmployeeById(id);

        if (employeeData) {
          // Chia dữ liệu Employee và User ra riêng
          const formattedData = {
            // Dữ liệu Employee
            employee: {
              name: employeeData.fullName,
              dob: employeeData.dob,
              phone: employeeData.phoneNumber,
              address: employeeData.address,
              gender: employeeData.gender ? "Nam" : "Nữ",
              position: employeeData.position ? "Quản lý" : "Nhân viên",
              cid: employeeData.cid,
            },
            // Dữ liệu User
            user: {
              email: employeeData.user.email,
              role: employeeData.user.role,
              status: employeeData.user.status,
            },
          };

          // Đổ dữ liệu vào form
          form.setFieldsValue(formattedData);
        } else {
          message.error("Không tìm thấy nhân viên!");
          navigate(-1);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu nhân viên:", error);
        message.error("Không thể tải dữ liệu nhân viên!");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, form, navigate]);

  // Xử lý submit cập nhật
  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // Gom lại dữ liệu employee và user
      const updatedEmployeeData = {
        fullName: values.employee.name,
        dob: values.employee.dob,
        phoneNumber: values.employee.phone,
        address: values.employee.address,
        gender: values.employee.gender === "Nữ",
        position: values.employee.position === "Quản lý",
        cid: values.employee.cid,
      };

      const res = await updateEmployee(id, updatedEmployeeData);
      console.log("kiểm tra", res)
      if (!res) {
        message.success("✅ Cập nhật thông tin nhân viên thành công!");
        navigate(-1);
      } else {
        message.error("⚠️ Cập nhật thất bại. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      message.error("❌ Đã xảy ra lỗi khi cập nhật nhân viên!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200 max-w-2xl mx-auto mt-10">
      <Title level={2} className="text-center mb-4">
        🛠️ Cập nhật thông tin nhân viên
      </Title>

      {loading ? (
        <div className="text-center">
          <Spin size="large" />
        </div>
      ) : (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Thông tin nhân viên */}
          <Title level={4}>📌 Thông tin nhân viên</Title>

          <Form.Item name={["employee", "name"]} label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}>
            <Input placeholder="Nhập họ và tên nhân viên" />
          </Form.Item>

          <Form.Item name={["employee", "dob"]} label="Ngày sinh" rules={[{ required: true, message: "Vui lòng nhập ngày sinh!" }]}>
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item name={["employee", "phone"]} label="Số điện thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item name={["employee", "address"]} label="Địa chỉ">
            <Input placeholder="Nhập địa chỉ nhân viên" />
          </Form.Item>

          <Form.Item name={["employee", "gender"]} label="Giới tính">
            <Select placeholder="Chọn giới tính">
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
            </Select>
          </Form.Item>

          <Form.Item name={["employee", "position"]} label="Vị trí công việc">
            <Select placeholder="Chọn vị trí">
              <Option value="Quản lý">Quản lý</Option>
              <Option value="Nhân viên">Nhân viên</Option>
            </Select>
          </Form.Item>

          <Form.Item name={["employee", "cid"]} label="Số CMND/CCCD">
            <Input placeholder="Nhập số CMND/CCCD" />
          </Form.Item>

          <Divider />

          {/* Thông tin tài khoản */}
          <Title level={4}>🔒 Thông tin tài khoản</Title>

          <Form.Item name={["user", "email"]} label="Email" rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]}>
            <Input placeholder="Nhập email nhân viên" />
          </Form.Item>

          <Form.Item name={["user", "role"]} label="Chức vụ" rules={[{ required: true, message: "Vui lòng chọn chức vụ!" }]}>
            <Select placeholder="Chọn chức vụ">
              <Option value="EMPLOYEE">Nhân viên</Option>
              <Option value="ADMIN">Quản trị viên</Option>
            </Select>
          </Form.Item>

          <Form.Item name={["user", "status"]} label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}>
            <Select placeholder="Chọn trạng thái">
              <Option value="ACTIVE">✅ Đang hoạt động</Option>
              <Option value="DISABLED">⛔ Vô hiệu hóa</Option>
              <Option value="BLOCKED">🔒 Đã khóa</Option>
            </Select>
          </Form.Item>

          {/* Nút hành động */}
          <Form.Item>
            <Space className="w-full flex justify-end gap-2">
              <Button type="default" danger onClick={() => navigate(-1)}>
                ❌ Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                ✅ Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default UpdateEmployee;
