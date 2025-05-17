import React, { useEffect, useState } from "react";
import { getTours } from "../../api/tour/index";
import { useNavigate } from "react-router-dom";
import { Table, Button, Input, Pagination, Space } from "antd";
import { PlusCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { getTourCategories } from "../../api/category";

const Tour: React.FC = () => {
  const navigate = useNavigate();

  const [allTours, setAllTours] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalTours, setTotalTours] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const categoryData = await getTourCategories();
      setCategories(categoryData);

      const res = await getTours();
      const tourData = Array.isArray(res) ? res : [];

      setAllTours(tourData); // chỉ set 1 lần duy nhất
    } catch (error) {
      console.error("Lỗi tải danh sách tour:", error);
      toast.error("Không thể tải danh sách tour!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lọc và phân trang dữ liệu
  useEffect(() => {
    const filtered = allTours.filter((tour) =>
      tour.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setTotalTours(filtered.length);
    setTours(filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize));
  }, [searchTerm, currentPage, pageSize, allTours]);

  const handleSelectTour = (id: number) => {
    navigate(`/dashboard/tours/${id}`);
  };

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      render: (_: any, __: any, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
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
      dataIndex: ["category", "categoryName"],
      align: "center",
      filters: categories.map((cat) => ({
        text: cat.categoryName,
        value: cat.categoryName,
      })),
      onFilter: (value: string, record: any) =>
        record.category?.categoryName === value,
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý Tour</h1>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={() => navigate("/dashboard/tours/add")}
        >
          Thêm Tour
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="🔍 Tìm kiếm tour..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset về trang 1 khi tìm
          }}
          suffix={<SearchOutlined />}
        />
        <Button onClick={() => setSearchTerm("")} danger>
          🔄 Reset
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={tours}
        rowKey="tourId"
        loading={loading}
        pagination={false}
      />

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

      {tours.length === 0 && !loading && (
        <div className="text-center p-4 text-red-500">❌ Không có tour nào!</div>
      )}
    </div>
  );
};

export default Tour;
