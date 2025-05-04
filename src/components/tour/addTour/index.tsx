import React, { useEffect, useState } from "react";
import { createTour, createTourDetail } from "../../../api/tour";
import { getTourCategories } from "../../../api/category"; // Hàm gọi API categories
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, InputNumber, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const FormAddTour = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  // Gọi API lấy danh sách loại tour
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getTourCategories();
        setCategories(res || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách loại tour:", error);
        message.error("Không thể tải danh sách loại tour!");
      }
    };
    fetchCategories();
  }, []);

  // Hàm submit form
  const handleAddTour = async (values: any) => {
    try {
      const selectedCategory = JSON.parse(values.tourcategory);
      const tourData = {
        name: values.name,
        location: values.location,
        price: values.price,
        // tourcategoryId: values.tourcategory,
        availableSlot: values.availableSlot,
        description: values.description,
        status: values.status,
        imageURL: values.imageURL,
      };

      // Gọi API thêm tour
      const tourRes = await createTour(selectedCategory.categoryId,tourData);
      if (tourRes) {
        const tourId = tourRes.data.tourId;

        // Gọi API thêm chi tiết tour
        const detailData = {
          // tourId: tourId,
          includedServices: values.includedServices,
          excludedServices: values.excludedServices,
          startDate: dayjs(values.startDate).format("YYYY-MM-DD"),
          endDate: dayjs(values.endDate).format("YYYY-MM-DD"),
        };

        console.log("tour data: ", detailData);
        console.log("tour id: ", tourId);
        await createTourDetail(tourId,detailData);

        // Chuyển hướng sang tạo lịch trình
        navigate(`/dashboard/tours/${tourId}/schedule`);
        message.success("Thêm tour thành công!");
      }
    } catch (error) {
      console.error("Lỗi thêm tour:", error);
      message.error("Không thể thêm tour!");
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Thêm Tour Mới</h2>
      {/* <Button onClick={() => navigate(`/dashboard/tours/65/schedule`)}>
        chuyển sang schedule
      </Button> */}

      <Form form={form} layout="vertical" onFinish={handleAddTour}>
        {/* Thông tin tour */}
        <Form.Item name="name" label="Tên tour" rules={[{ required: true, message: "Nhập tên tour!" }]}>
          <Input placeholder="Nhập tên tour" />
        </Form.Item>

        <Form.Item name="location" label="Địa điểm" rules={[{ required: true, message: "Nhập địa điểm!" }]}>
          <Input placeholder="Nhập địa điểm" />
        </Form.Item>

        <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true, message: "Nhập giá tour!" }]}>
          <InputNumber className="w-full" min={100000} placeholder="Nhập giá" />
        </Form.Item>

        <Form.Item name="availableSlot" label="Số lượng chỗ" rules={[{ required: true, message: "Nhập số chỗ trống!" }]}>
          <InputNumber className="w-full" min={1} placeholder="Nhập số chỗ" />
        </Form.Item>

        {/* Loại tour (dữ liệu từ API) */}
        <Form.Item name="tourcategory" label="Loại tour" rules={[{ required: true, message: "Chọn loại tour!" }]}>
          <Select placeholder="Chọn loại tour"
          
          >
            {categories.map((category: any) => (
              <Option key={category.categoryId} value={JSON.stringify(category)}>
                {category.categoryName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
        </Form.Item>

        <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
          <Select placeholder="Chọn trạng thái">
          <Option value="ACTIVE">Đang hoạt động</Option>
          <Option value="FULLY_BOOKED">Đã đầy, hết chỗ</Option>
          <Option value="CANCELED">Đã hủy</Option>
          </Select>
        </Form.Item>

        <Form.Item name="imageURL" label="Đường dẫn hình ảnh">
          <Input placeholder="Nhập link ảnh" />
        </Form.Item>

        {/* Thông tin chi tiết tour */}
        <h3 className="text-lg font-semibold mt-4 mb-2">Chi tiết tour</h3>

        <Form.Item name="includedServices" label="Dịch vụ bao gồm" rules={[{ required: true, message: "Nhập dịch vụ bao gồm!" }]}>
          <Input.TextArea rows={2} placeholder="Nhập dịch vụ bao gồm" />
        </Form.Item>

        <Form.Item name="excludedServices" label="Dịch vụ không bao gồm" rules={[{ required: true, message: "Nhập dịch vụ không bao gồm!" }]}>
          <Input.TextArea rows={2} placeholder="Nhập dịch vụ không bao gồm" />
        </Form.Item>

        <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: "Chọn ngày bắt đầu!" }]}>
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true, message: "Chọn ngày kết thúc!" }]}>
          <DatePicker className="w-full" />
        </Form.Item>

        {/* Nút Thêm và Huỷ */}
        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Thêm Tour
          </Button>
          <Button type="default" onClick={() => navigate(-1)} className="w-full mt-2">
            Huỷ
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FormAddTour;
