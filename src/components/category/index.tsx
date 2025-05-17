import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Space, notification, Spin } from "antd";
import { toast } from "react-toastify";
import { 
  getTourCategories, 
  createTourCategory, 
  updateTourCategory, 
  deleteTourCategory 
} from "../../api/category/index";
import { EditOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";

const TourCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 🛠️ Lấy danh sách danh mục từ API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getTourCategories();
      setCategories(res);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục tour:", error);
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🎯 Hàm mở modal thêm/sửa
  const showModal = (category: any = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
    form.setFieldsValue(
      category
        ? { categoryName: category.categoryName, description: category.description }
        : { categoryName: "", description: "" }
    );
  };

  // 🔍 Kiểm tra trùng tên danh mục (dành cho cả thêm & sửa)
  const isDuplicateCategory = (name: string, currentId?: number) => {
    return categories.some(
      (cat) =>
        cat.categoryName.trim().toLowerCase() === name.trim().toLowerCase() &&
        cat.categoryId !== currentId
    );
  };

  // 🛠️ Xử lý thêm/sửa danh mục
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Kiểm tra trùng lặp tên danh mục
      if (isDuplicateCategory(values.categoryName, editingCategory?.categoryId)) {
        form.setFields([
          {
            name: "categoryName",
            errors: ["Tên danh mục đã tồn tại! Vui lòng nhập tên khác."],
          },
        ]);
        return;
      }

      // Xử lý Thêm/Sửa
      if (editingCategory) {
        await updateTourCategory(editingCategory.categoryId, values);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await createTourCategory(values);
        toast.success("Thêm danh mục mới thành công!");
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error("Lỗi khi lưu danh mục:", error);

      // Xử lý lỗi từ backend
      if (error.response?.status === 400) {
        form.setFields([
          {
            name: "categoryName",
            errors: [error.response.data.message || "Dữ liệu không hợp lệ!"],
          },
        ]);
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    }
  };

  // 🗑️ Xử lý xóa danh mục
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Xác nhận xoá",
      content: "Bạn có chắc muốn xoá danh mục này không?",
      okText: "Xoá",
      cancelText: "Huỷ",
      onOk: async () => {
        try {
          // 🛠️ Đảm bảo hàm này ném lỗi ra ngoài nếu có lỗi từ backend
          await deleteTourCategory(id);
  
          // ✅ Chỉ chạy thông báo này khi chắc chắn xoá thành công
          notification.success({
            message: "Thành công",
            description: "Xoá danh mục thành công!",
          });
  
          fetchCategories(); // Load lại danh sách
        } catch (error: any) {
          console.error("Lỗi khi xoá danh mục:", error);
  
          // ❗ Xử lý lỗi từ backend (ví dụ: danh mục đang được dùng)
          notification.error({
            message: "Lỗi",
            description:
              error.response?.data.message || "Danh mục có tour đang sử dụng!",
          });
        }
      },
    });
  };
  
  

  // 🎯 Cấu hình cột cho bảng danh mục tour
  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Hành động",
      key: "action",
      render: (record: any) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>
            Sửa
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.categoryId)}>
            Xoá
          </Button>
        </Space>
      ),
    },
  ];

  if(loading) return <Spin tip="⏳ Đang tải dữ liệu..." className="block mx-auto mt-10" size="large" />;


  return (
    <div className="p-4 bg-white shadow rounded-md">
      <h2 className="text-lg font-semibold mb-4">Quản lý danh mục tour</h2>

      <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => showModal()}>
        Thêm danh mục
      </Button>

      {/* Bảng danh mục tour */}
      <Table dataSource={categories} columns={columns} rowKey="categoryId" className="mt-4" />

      {/* Modal Thêm / Sửa danh mục */}
      <Modal
        title={editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText="Lưu"
        cancelText="Huỷ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên danh mục"
            name="categoryName"
            rules={[
              { required: true, message: "Tên danh mục không được để trống!" },
              { max: 50, message: "Tên danh mục không được quá 50 ký tự!" },
            ]}
            hasFeedback
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Nhập mô tả danh mục" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TourCategoryManagement;
