import React from "react";
import { Form, Input, Select, DatePicker, Button, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const AddEmployeeForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleFinish = (values: any) => {
    console.log("Dữ liệu nhân viên mới:", values);
    message.success("Thêm nhân viên thành công!");
    navigate("/dashboard/employees");
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">➕ Thêm Nhân Viên</h2>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}> 
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}> 
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}> 
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}> 
          <DatePicker className="w-full" format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}> 
          <Select placeholder="Chọn giới tính">
            <Option value="male">Nam</Option>
            <Option value="female">Nữ</Option>
          </Select>
        </Form.Item>

        <Form.Item name="position" label="Vị trí" rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}> 
          <Select placeholder="Chọn vị trí">
            <Option value="manager">Quản lý</Option>
            <Option value="staff">Nhân viên</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <div className="flex gap-4">
            <Button type="primary" htmlType="submit">Thêm Nhân Viên</Button>
            <Button onClick={() => navigate("/dashboard/employees")} danger>Hủy</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddEmployeeForm;
