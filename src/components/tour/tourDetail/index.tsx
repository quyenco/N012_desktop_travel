import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
  getTourById,
  getTourDetailById,
  getTourScheduleById,
  updateTour,
  updateTourDetail,
  createTourDetail,
  updateTourSchedule,
  createTourSchedule,
  deleteSchedule
} from '../../../api/tour/index';
import {getTourCategories} from '../../../api/category'; // Hàm gọi API categories
import {Descriptions, Card, Image, Table, Button, Timeline, Spin, Tag,DatePicker } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CompassOutlined,
  CarOutlined,
  ForkOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import tourImage from '../../../assets/images/tour.jpg';
import {Form, Modal, Input, InputNumber, Select, message} from 'antd';
import dayjs from "dayjs";
import { toast } from 'react-toastify';

const TourDetail = () => {
  const {id} = useParams();
  const [tour, setTour] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState('');
  const [form] = Form.useForm();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTourDetail = async () => {
      try {
        const data = await getTourById(id);
        const detailData = await getTourDetailById(id);
        const scheduleData = await getTourScheduleById(id);

        if (data) setTour(data);
        if (detailData?.length > 0) setDetail(detailData[0]);
        if (Array.isArray(scheduleData)) setSchedule(scheduleData);
        // console.log("detail: ",detailData);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết tour:', error);
        setLoading(false);
      }
    };
    fetchTourDetail();
  }, [id]);

  //hàm load lại dữ liệu
  const fetchTourData = async () => {
    try {
      setLoading(true);
      const data = await getTourById(id);
      const detailData = await getTourDetailById(id);
      const scheduleData = await getTourScheduleById(id);
  
      if (data) setTour(data);
      if (detailData?.length > 0) setDetail(detailData[0]);
      if (Array.isArray(scheduleData)) setSchedule(scheduleData);
  
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết tour:', error);
      setLoading(false);
    }
  };
  
  // Gọi khi component load lần đầu
  useEffect(() => {
    fetchTourData();
  }, [id]);
  
  // Hàm mở modal chỉnh sửa
  const showEditModal = (cardType: string) => {
    setEditingCard(cardType);
    if (cardType === 'tour') {
      form.setFieldsValue({
        ...tour,
        tourcategory: tour?.tourcategory?.categoryId, // Gán đúng giá trị categoryId
      });
    } else if (cardType === 'detail') {
      form.setFieldsValue({
        ...detail,
    startDate: detail?.startDate ? dayjs(detail.startDate) : null,
    endDate: detail?.endDate ? dayjs(detail.endDate) : null,
      });
    } else if (cardType === 'schedule') {
      form.setFieldsValue({
        schedule: schedule.map((s) => ({
          ...s,
        })),
      });
    }
    
  
    setIsModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

      if (editingCard === 'tour') {
        // Chỉ giữ lại trường cần thiết, bỏ dư thừa
        const updatedTour = {
          name: values.name,
          location: values.location,
          price: values.price,
          availableSlot: values.availableSlot,
          tourcategoryId: values.tourcategory,
          description: values.description,
          status: values.status,
          imageURL: values.imageURL,
        };

        await updateTour(id, updatedTour);
        setTour(updatedTour);
        message.success('Cập nhật thông tin tour thành công!');
      }

      if (editingCard === 'detail') {
        const updatedDetail = {
          includedServices: values.includedServices,
          excludedServices: values.excludedServices,
          startDate: values.startDate.format("YYYY-MM-DD"),
          endDate: values.endDate.format("YYYY-MM-DD"),
        };

        try {
          // Kiểm tra trước nếu chưa có detail thì tạo mới luôn
          console.log("detail:", detail)
          if (!detail ) {
            console.log('Chi tiết tour chưa có, tiến hành tạo mới!');
            await createTourDetail(id, updatedDetail);
            message.success('Đã tạo mới chi tiết tour!');
          } else {
            await updateTourDetail(id, updatedDetail);
            message.success('Cập nhật chi tiết tour thành công!');
          }
          setDetail(updatedDetail);
        } catch (error) {
          console.error('Lỗi khi cập nhật/ tạo mới chi tiết tour:', error);
          message.error('Cập nhật thất bại, thử lại!');
        }
      }else if (editingCard === 'schedule') {
        const updatedSchedules = form.getFieldValue('schedule');
        // console.log("lịch trình:",updatedSchedule);
        if (updatedSchedules && updatedSchedules.length > 0) {
          updatedSchedules.forEach(async (schedule) => {
            try {
              const formattedSchedule = {
                dayNumber: schedule.dayNumber || schedule + 1,
                location: schedule.location || "",
                stransport: schedule.stransport || "",
                activities: schedule.activities || "",
                arrivalTime: schedule.arrivalTime || "00:00:00",
                departureTime: schedule.departureTime || "00:00:00",
                meal: schedule.meal || ""
              };
              console.log("schedule:", formattedSchedule);
              if (schedule.scheduleId) {
                // Cập nhật nếu đã có scheduleId
                await updateTourSchedule(schedule.scheduleId, formattedSchedule);
                console.log(`✅ Đã cập nhật lịch trình ngày ${schedule.dayNumber}`);
              } else {
                // Thêm mới nếu chưa có scheduleId
                const newSchedule = await createTourSchedule(id, schedule);
                console.log(`✅ Đã thêm lịch trình ngày ${schedule.dayNumber}`, newSchedule);
              }
            } catch (error) {
              console.error(`❌ Lỗi xử lý lịch trình ngày ${schedule.dayNumber}`, error);
              message.error(`Không thể xử lý lịch trình ngày ${schedule.dayNumber}`);
            }
          });
      
          message.success("Cập nhật toàn bộ lịch trình thành công!");
        } else {
          message.warning("Không có lịch trình nào để cập nhật!");
        }
        
      }
      

      setIsModalVisible(false);
      fetchTourData();
    } catch (error) {
      console.error('Cập nhật thất bại:', error);
      message.error('Cập nhật thất bại, thử lại!');
    }
  };

  // Gọi API lấy danh sách loại tour
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getTourCategories();
        setCategories(res || []);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách loại tour:', error);
        message.error('Không thể tải danh sách loại tour!');
      }
    };
    fetchCategories();
  }, []);

  // Hàm thêm lịch trình mới
const handleAddSchedule = () => {
  const currentSchedules = form.getFieldValue('schedule') || [];
  const newSchedule = {
    dayNumber: currentSchedules.length + 1,
    location: '',
    activities: '',
    stransport: '',
    meal: '',
    arrivalTime: '',
    departureTime: '',
  };
  const updatedSchedules = [...currentSchedules, newSchedule];
  form.setFieldsValue({ schedule: updatedSchedules });
  setSchedule(updatedSchedules); // Cập nhật luôn state
};

// Hàm xoá lịch trình
const handleRemoveSchedule =async (index: number) => {
  const currentSchedules = form.getFieldValue("schedule") || [];
  const scheduleToDelete = currentSchedules[index];

  try {
    // Gọi API xóa nếu schedule đã có ID (đã lưu trong DB)
    if (scheduleToDelete.scheduleId) {
      await deleteSchedule(scheduleToDelete.scheduleId);
    }

    // Cập nhật state và form
    const updatedSchedules = currentSchedules.filter((_, i) => i !== index);
    console.log("✅ Đã xóa lịch trình:", updatedSchedules);

    form.setFieldsValue({ schedule: updatedSchedules });
    setSchedule(updatedSchedules); // Cập nhật state luôn
  } catch (error) {
    console.error("❌ Lỗi khi xóa lịch trình:", error);
    toast.error("Không thể xóa lịch trình!");
  }

  // const updatedSchedules = currentSchedules.filter((_, i) => i !== index);
  // form.setFieldsValue({ schedule: updatedSchedules });
   
  // setSchedule(updatedSchedules); // Cập nhật state luôn
};


  if (loading) return <Spin className="flex justify-center items-center h-96" size="large" />;

  return (
    <div className="p-4 space-y-4">
      {/* Thông tin tour */}
      <Card
        title="Thông tin tour"
        className="shadow-md"
        extra={
          <Button type="link" onClick={() => showEditModal('tour')}>
            Cập nhật
          </Button>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tên tour">{tour?.name}</Descriptions.Item>
          <Descriptions.Item label="Địa điểm">
            <EnvironmentOutlined /> {tour?.location}
          </Descriptions.Item>
          <Descriptions.Item label="Loại tour">{tour?.tourcategory?.categoryName}</Descriptions.Item>
          <Descriptions.Item label="Giá tour">
            <DollarCircleOutlined /> {tour?.price.toLocaleString()} ₫
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {tour?.status === 'ACTIVE' ? (
              <Tag color="green">Đang mở</Tag>
            ) : tour?.status === 'FULLY_BOOKED' ? (
              <Tag color="orange">Đã đầy</Tag>
            ) : (
              <Tag color="red">Đã hủy</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Số chỗ còn trống">{tour?.availableSlot}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Chi tiết tour */}
      <Card
        title="Chi tiết dịch vụ"
        className="shadow-md"
        extra={
          <Button type="link" onClick={() => showEditModal('detail')}>
            Cập nhật
          </Button>
        }
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Dịch vụ bao gồm">{detail?.includedServices || 'Chưa cập nhật'}</Descriptions.Item>
          <Descriptions.Item label="Dịch vụ không bao gồm">
            {detail?.excludedServices || 'Chưa cập nhật'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày khởi hành">
            <CalendarOutlined /> {new Date(detail?.startDate).toLocaleDateString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc">
            <CalendarOutlined /> {new Date(detail?.endDate).toLocaleDateString('vi-VN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Hình ảnh tour */}
      <Card className="shadow-md">
        <h3 className="text-lg font-semibold mb-2">Hình ảnh tour</h3>

        <Image
          // src={tour?.imageURL || "https://via.placeholder.com/600x400"}
          src={tourImage}
          alt={tour?.name}
          className="w-full h-64 object-cover rounded-md"
        />
      </Card>

      {/* Lịch trình chi tiết */}
      <Card
        title="📌 Lịch trình chi tiết"
        className="shadow-md"
        extra={
          <Button type="link" onClick={() => showEditModal('schedule')}>
            Cập nhật
          </Button>
        }
      >
        {schedule && schedule.length > 0 ? (
          <Timeline>
            {schedule.map((day: any, index: number) => (
              <Timeline.Item key={index} dot={<ClockCircleOutlined style={{fontSize: '16px'}} />}>
                <h4 className="font-semibold text-blue-600">
                  🗓️ Ngày {day.dayNumber}: {day.location}
                </h4>
                <p>
                  <CompassOutlined /> <strong>Hoạt động:</strong> {day.activities}
                </p>
                <p>
                  <CarOutlined /> <strong>Phương tiện:</strong> {day.stransport}
                </p>
                <p>
                  <ForkOutlined /> <strong>Bữa ăn:</strong> {day.meal}
                </p>
                <p>
                  ⏰ <strong>Giờ đến:</strong> {day.arrivalTime} | <strong>Giờ đi:</strong> {day.departureTime}
                </p>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <p className="text-gray-500">Chưa có lịch trình cụ thể.</p>
        )}
      </Card>

      {/* Nút quay lại */}
      <div className="flex justify-end gap-2">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>

      {/* Modal Form Cập Nhật */}
      <Modal
        title={`Cập nhật ${editingCard === 'tour' ? 'Thông tin Tour' : 'Chi tiết dịch vụ'}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleUpdate}
        width={editingCard === 'schedule' ? 1000 :600}
      >
        <Form form={form} layout="vertical" 
        >
          {editingCard === 'tour' && (
            <>
              <Form.Item name="name" label="Tên tour" rules={[{required: true, message: 'Nhập tên tour!'}]}>
                <Input placeholder="Nhập tên tour" />
              </Form.Item>

              <Form.Item name="location" label="Địa điểm" rules={[{required: true, message: 'Nhập địa điểm!'}]}>
                <Input placeholder="Nhập địa điểm" />
              </Form.Item>

              <Form.Item name="price" label="Giá (VNĐ)" rules={[{required: true, message: 'Nhập giá tour!'}]}>
                <InputNumber className="w-full" min={100000} placeholder="Nhập giá" />
              </Form.Item>

              <Form.Item
                name="availableSlot"
                label="Số lượng chỗ"
                rules={[{required: true, message: 'Nhập số chỗ trống!'}]}
              >
                <InputNumber className="w-full" min={1} placeholder="Nhập số chỗ" />
              </Form.Item>

              {/* Loại tour (dữ liệu từ API) */}
              <Form.Item name="tourcategory" label="Loại tour" rules={[{required: true, message: 'Chọn loại tour!'}]}>
                <Select placeholder="Chọn loại tour">
                  {categories.map((category: any) => (
                    <Select.Option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
              </Form.Item>

              <Form.Item name="status" label="Trạng thái" rules={[{required: true}]}>
                <Select placeholder="Chọn trạng thái">
                  <Option value="ACTIVE">Đang hoạt động</Option>
                  <Option value="FULLY_BOOKED">Đã đầy, hết chỗ</Option>
                  <Option value="CANCELED">Đã hủy</Option>
                </Select>
              </Form.Item>

              <Form.Item name="imageURL" label="Đường dẫn hình ảnh">
                <Input placeholder="Nhập link ảnh" />
              </Form.Item>
            </>
          )}

          {editingCard === 'detail' && (
            <>
              <Form.Item name="includedServices" label="Dịch vụ bao gồm">
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item name="excludedServices" label="Dịch vụ không bao gồm">
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item
                name="startDate"
                label="Ngày khởi hành"
                rules={[{ required: true, message: 'Chọn ngày khởi hành!' }]}
              >
                <DatePicker format="DD/MM/YYYY" className="w-full" />
              </Form.Item>

              <Form.Item
                name="endDate"
                label="Ngày kết thúc"
                rules={[{ required: true, message: 'Chọn ngày kết thúc!' }]}
              >
                <DatePicker format="DD/MM/YYYY" className="w-full" />
              </Form.Item>

            </>
          )}
          {editingCard === 'schedule' && (
            <Table
              dataSource={form.getFieldValue('schedule')}
              rowKey={(record) => record.dayNumber}
              pagination={false}
              bordered
            >
              <Table.Column
                title="Ngày số"
                dataIndex="dayNumber"
                key="dayNumber"
                render={(text, record, index) => (
                  <Form.Item
                    name={['schedule', index, 'dayNumber']}
                    rules={[{ required: true, message: 'Nhập số ngày!' }]}
                  >
                    <InputNumber min={1} />
                  </Form.Item>
                )}
              />

              <Table.Column
                title="Địa điểm"
                dataIndex="location"
                key="location"
                render={(text, record, index) => (
                  <Form.Item
                    name={['schedule', index, 'location']}
                    rules={[{ required: true, message: 'Nhập địa điểm!' }]}
                  >
                    <Input placeholder="Nhập địa điểm" />
                  </Form.Item>
                )}
              />

              <Table.Column
                title="Hoạt động"
                dataIndex="activities"
                key="activities"
                render={(text, record, index) => (
                  <Form.Item
                    name={['schedule', index, 'activities']}
                  >
                    <Input.TextArea placeholder="Nhập hoạt động" />
                  </Form.Item>
                )}
              />

              <Table.Column
                title="Phương tiện"
                dataIndex="stransport"
                key="stransport"
                render={(text, record, index) => (
                  <Form.Item name={['schedule', index, 'stransport']}>
                    <Input placeholder="Nhập phương tiện" />
                  </Form.Item>
                )}
              />

              <Table.Column
                title="Bữa ăn"
                dataIndex="meal"
                key="meal"
                render={(text, record, index) => (
                  <Form.Item name={['schedule', index, 'meal']}>
                    <Input placeholder="Nhập bữa ăn" />
                  </Form.Item>
                )}
              />

              <Table.Column
                title="Giờ đến"
                dataIndex="arrivalTime"
                key="arrivalTime"
                render={(text, record, index) => (
                  <Form.Item name={['schedule', index, 'arrivalTime']}>
                    <Input placeholder="Giờ đến" />
                  </Form.Item>
                )}
              />

              <Table.Column
                title="Giờ đi"
                dataIndex="departureTime"
                key="departureTime"
                render={(text, record, index) => (
                  <Form.Item name={['schedule', index, 'departureTime']}>
                    <Input placeholder="Giờ đi" />
                  </Form.Item>
                )}
              />

              <Table.Column
                title="Hành động"
                key="action"
                render={(_, record, index) => (
                  <Button danger type="link" onClick={() => handleRemoveSchedule(index)}>
                    Xóa
                  </Button>
                )}
              />
            </Table>
          )}

                   {/* Nút Thêm Lịch Trình */}
        <Button 
        onClick={handleAddSchedule} block style={{ marginTop: 16 }}
        >
          + Thêm lịch trình mới
        </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default TourDetail;
