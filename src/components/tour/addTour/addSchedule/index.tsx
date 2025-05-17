import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Button, InputNumber, TimePicker, message,Table  } from "antd";
import { createTourSchedule, getTourScheduleById,  } from "../../../../api/tour/index";
import dayjs from "dayjs";

const ScheduleForm = () => {
  const { tourId } = useParams(); // Lấy tourId từ URL
  const [form] = Form.useForm();
  const [schedules, setSchedules] = useState([]);
  const navigate = useNavigate();

  // Lấy danh sách lịch trình theo tourId
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await getTourScheduleById(tourId);
        setSchedules(res || []);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách lịch trình:", error);
        message.error("Không thể tải danh sách lịch trình!");
      }
    };
    fetchSchedules();
  }, [tourId]);

  // Hàm xử lý thêm lịch trình
  const handleAddSchedule = async (values: any) => {
    try {
      const scheduleData = {
        // tourId: Number(tourId), // ID tour
        dayNumber: values.dayNumber,
        location: values.location,
        stransport: values.stransport,
        activities: values.activities,
        meal: values.meal,
        arrivalTime: dayjs(values.arrivalTime).format("HH:mm:ss"),
        departureTime: dayjs(values.departureTime).format("HH:mm:ss"),
      };

      console.log("sheduleData:", scheduleData)
      const res = await createTourSchedule(tourId,scheduleData);
      console.log("resdate:",res)
      if (res) {
        message.success("✅ Lịch trình đã được thêm!");
        
        setSchedules([...schedules, res]); // Cập nhật danh sách lịch trình
        form.resetFields(); // Xóa dữ liệu form sau khi thêm
        
      }
    } catch (error) {
      console.error("❌ Lỗi khi thêm lịch trình:", error);
      message.error("Không thể thêm lịch trình!");
    }
  };
  const columns = [
    {
      title: "Ngày số",
      dataIndex: "dayNumber",
      key: "dayNumber",
      width: 80,
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Phương tiện",
      dataIndex: "stransport",
      key: "stransport",
    },
    {
      title: "Hoạt động",
      dataIndex: "activities",
      key: "activities",
    },
    {
      title: "Bữa ăn",
      dataIndex: "meal",
      key: "meal",
      width: 120,
    },
    {
      title: "Giờ đến",
      dataIndex: "arrivalTime",
      key: "arrivalTime",
      width: 120,
    },
    {
      title: "Giờ đi",
      dataIndex: "departureTime",
      key: "departureTime",
      width: 120,
    },
  ];
  // Hàm điều hướng về trang tours
  const handleFinish = () => {
    navigate("/dashboard/tours"); // Điều hướng về trang danh sách tour
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Thêm Lịch Trình Cho Tour</h2>

      {/* Form thêm lịch trình */}
      <Form form={form} layout="vertical" onFinish={handleAddSchedule}>
        <Form.Item name="dayNumber" label="Ngày số" rules={[{ required: true, message: "Nhập ngày số!" }]}>
          <InputNumber className="w-full" min={1} placeholder="Nhập số ngày" />
        </Form.Item>

        <Form.Item name="location" label="Địa điểm" rules={[{ required: true, message: "Nhập địa điểm!" }]}>
          <Input placeholder="Nhập địa điểm" />
        </Form.Item>

        <Form.Item name="stransport" label="Phương tiện" rules={[{ required: true, message: "Nhập phương tiện!" }]}>
          <Input placeholder="Nhập phương tiện di chuyển" />
        </Form.Item>

        <Form.Item name="activities" label="Hoạt động" rules={[{ required: true, message: "Nhập hoạt động!" }]}>
          <Input.TextArea rows={2} placeholder="Nhập các hoạt động" />
        </Form.Item>

        <Form.Item name="meal" label="Bữa ăn" rules={[{ required: true, message: "Nhập thông tin bữa ăn!" }]}>
          <Input placeholder="Nhập bữa ăn (Sáng, Trưa, Tối)" />
        </Form.Item>

        <Form.Item name="arrivalTime" label="Giờ đến" rules={[{ required: true, message: "Chọn giờ đến!" }]}>
          <TimePicker className="w-full" format="HH:mm" />
        </Form.Item>

        <Form.Item name="departureTime" label="Giờ đi" rules={[{ required: true, message: "Chọn giờ đi!" }]}>
          <TimePicker className="w-full" format="HH:mm" />
        </Form.Item>

        {/* Nút Thêm */}
        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Thêm Lịch Trình
          </Button>
        </Form.Item>
      </Form>

      {/* Danh sách lịch trình */}
      <h3 className="text-lg font-semibold mt-6 mb-2">Danh sách lịch trình</h3>
      {schedules.length > 0 ? (
      <Table
        dataSource={schedules.map((item) => ({ ...item, key: item.scheduleId }))}
        columns={columns}
        pagination={false} // Không phân trang
        bordered
      />
    ) : (
      <p>Chưa có lịch trình nào.</p>
    )}

     {/* Nút Hoàn thành */}
     <Button 
        type="default" 
        className="mt-4 w-full" 
        onClick={handleFinish} // 🛠 Gọi hàm điều hướng
      >
        Hoàn thành
      </Button>
    </div>
  );
};

export default ScheduleForm;
