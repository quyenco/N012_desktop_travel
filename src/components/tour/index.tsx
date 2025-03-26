import React, { useEffect, useState } from "react";
import { getTours } from "../../api/tour/index";
import { useNavigate } from "react-router-dom";
import { Table, Button, Input, Select, Pagination, Space } from "antd";
import { PlusCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

const { Option } = Select;

const Tour: React.FC = () => {
  const navigate = useNavigate();

  // State quản lý dữ liệu tours, phân trang, bộ lọc
  const [tours, setTours] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalTours, setTotalTours] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Gọi API lấy danh sách tour kèm phân trang
  const fetchTours = async (page = 1, size = 10, search = "", category = "") => {
    setLoading(true);
    try {
      const res = await getTours();
      const tourData = Array.isArray(res) ? res : []; // Đảm bảo dữ liệu là mảng
      const filteredTours = tourData.filter(
        (tour: any) =>
          tour.name.toLowerCase().includes(search.toLowerCase()) &&
          (category ? tour.tourcategory.categoryName === category : true)
      );

      setTours(filteredTours.slice((page - 1) * size, page * size));
      setTotalTours(filteredTours.length);
    } catch (error) {
      console.error("Lỗi tải danh sách tour:", error);
      toast.error("Không thể tải danh sách tour!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTours(currentPage, pageSize, searchTerm, filterCategory);
  }, [currentPage, pageSize, searchTerm, filterCategory]);

  // Xử lý chọn tour
  const handleSelectTour = (id: number) => {
    navigate(`/dashboard/tours/${id}`);
  };

  // Cấu hình cột cho bảng Tour
  const columns = [
    {
      title: "#",
      dataIndex: "index",
      render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
      align: "center",
    },
    {
      title: "Tên Tour",
      dataIndex: "name",
      render: (text: string, record: any) => (
        <Button type="link" onClick={() => handleSelectTour(record.tourId)}>
          {text}
        </Button>
      ),
    },
    {
      title: "Loại Tour",
      dataIndex: ["tourcategory", "categoryName"],
      align: "center",
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      align: "center",
    },
    {
      title: "Giá",
      dataIndex: "price",
      align: "right",
      render: (price: number) => `${price.toLocaleString()}₫`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status: string) => (
        <span className={status === "ACTIVE" ? "text-green-500" : "text-red-500"}>
          {status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white shadow rounded-md">
      {/* Tiêu đề và nút thêm */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold"> Quản lý Tour</h1>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={() => navigate("/dashboard/tours/add")}
        >
          Thêm Tour
        </Button>
      </div>

      {/* Thanh tìm kiếm và bộ lọc */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="🔍 Tìm kiếm tour..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          suffix={<SearchOutlined />}
        />

        <Select
          placeholder="🗂 Chọn loại tour"
          value={filterCategory}
          onChange={(value) => setFilterCategory(value)}
          style={{ width: 200 }}
        >
          <Option value="">Tất cả loại</Option>
          <Option value="Biển">Biển</Option>
          <Option value="Núi">Núi</Option>
          <Option value="Đảo">Đảo</Option>
        </Select>

        <Button
          onClick={() => {
            setSearchTerm("");
            setFilterCategory("");
          }}
          danger
        >
          🔄 Reset
        </Button>
      </Space>

      {/* Bảng danh sách tour */}
      <Table
        columns={columns}
        dataSource={tours}
        rowKey="tourId"
        loading={loading}
        pagination={false}
      />

      {/* Phân trang */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={totalTours}
        showSizeChanger
        onChange={(page, size) => {
          setCurrentPage(page);
          setPageSize(size);
        }}
        className="mt-4 text-center"
      />

      {/* Thông báo khi không có tour */}
      {tours.length === 0 && !loading && (
        <div className="text-center p-4 text-red-500">❌ Không có tour nào!</div>
      )}
    </div>
  );
};

export default Tour;
