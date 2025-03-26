import React, { useEffect, useState } from "react";
import { getDiscounts, deleteDiscount } from "../../api/discount";
import AddPromotionForm from "../../components/discount/addDiscount";
import UpdatePromotionForm from "../../components/discount/updateDiscount";
import { EditOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Modal, message, Button } from "antd";

const Discount = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDiscounts();
        console.log("Danh sách khuyến mãi:", data);
        setPromotions(data);
      } catch (error) {
        console.error("Lỗi khi tải khuyến mãi:", error);
      }
    };

    fetchData();
  }, []);

  // Xử lý thêm khuyến mãi thành công
  const handleAddSuccess = (newPromo: any) => {
    setPromotions([...promotions, newPromo]);
    setShowAddForm(false);
  };

  // Xử lý cập nhật thành công
  const handleUpdateSuccess = (updatedPromo: any) => {
    const updatedPromotions = promotions.map((promo) =>
      promo.discountId === updatedPromo.discountId ? updatedPromo : promo
    );
    setPromotions(updatedPromotions);
    setShowUpdateForm(false);
  };


  // Hàm gọi lại API để lấy danh sách mới nhất
const fetchData = async () => {
  try {
    const data = await getDiscounts();
    setPromotions(data);
  } catch (error) {
    console.error("Lỗi khi tải khuyến mãi:", error);
  }
};
  // Hàm xử lý xóa khuyến mãi
  const handleDelete = (promo: any) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa khuyến mãi "${promo.code}" không?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      async onOk() {
        try {
          // Gọi API xóa khuyến mãi
        const response = await deleteDiscount(promo.discountId);

        // Kiểm tra phản hồi từ server
        if (!response.status === 400 || !response.status === 403) {
          message.success(`✅ Đã xóa khuyến mãi "${promo.code}" thành công!`);
          fetchData(); // Cập nhật lại danh sách khuyến mãi
        } else {
          throw new Error("Xóa không thành công!");
        }
      } catch (error: any) {
        console.error("Lỗi khi xóa khuyến mãi:", error);

        // Kiểm tra chi tiết lỗi từ backend
        if (error.response && error.response.data && error.response.data.message) {
          message.error(`❌ ${error.response.data.message}`);
        } else {
          message.error("❌ Không thể xóa khuyến mãi, vui lòng thử lại!");
        }
      }
      },
    });
  };
  

  

  // Lọc khuyến mãi theo trạng thái
  const filteredPromotions = promotions.filter(
    (promo) => !statusFilter || promo.status === statusFilter
  );

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPromotions = filteredPromotions.slice(indexOfFirstItem, indexOfLastItem);

  const getStatus = (startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    if (today < start) return "🔜 Sắp diễn ra";
    if (today > end) return "❌ Hết hạn";
    return "✅ Đang hoạt động";
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-700">🎉 Quản lý khuyến mãi</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <PlusCircleOutlined /> Thêm Khuyến Mãi
        </button>
      </div>

      {showAddForm && <AddPromotionForm onClose={() => setShowAddForm(false)} onSuccess={handleAddSuccess} />}

      {showUpdateForm && (
        <UpdatePromotionForm
          promotion={currentPromotion}
          onClose={() => setShowUpdateForm(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Bộ lọc trạng thái */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">-- Chọn trạng thái --</option>
          <option value="active">✅ Đang hoạt động</option>
          <option value="expired">❌ Đã hết hạn</option>
          <option value="upcoming">🔜 Sắp diễn ra</option>
        </select>

        <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={() => setStatusFilter("")}>
          🔄 Reset
        </button>
      </div>

      {/* Hiển thị danh sách khuyến mãi */}
      {currentPromotions.length > 0 ? (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border border-gray-300">#</th>
              <th className="p-2 border border-gray-300">Tên khuyến mãi</th>
              <th className="p-2 border border-gray-300">Mã khuyến mãi</th>
              <th className="p-2 border border-gray-300">Ngày bắt đầu</th>
              <th className="p-2 border border-gray-300">Ngày kết thúc</th>
              <th className="p-2 border border-gray-300">Phần trăm giảm</th>
              <th className="p-2 border border-gray-300">Trạng thái</th>
              <th className="p-2 border border-gray-300">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentPromotions.map((promo, index) => (
              <tr 
              key={promo.discountId} 
              className="hover:bg-gray-100 text-center"
              
              >
                <td className="p-2 border border-gray-300">{index + 1}</td>
                <td className="p-2 border border-gray-300">{promo.description}</td>
                <td className="p-2 border border-gray-300">{promo.code}</td>
                <td className="p-2 border border-gray-300">{promo.startDate}</td>
                <td className="p-2 border border-gray-300">{promo.endDate}</td>
                <td className="p-2 border border-gray-300">{promo.discountPercent}%</td>
                <td className="p-2 border border-gray-300">
                  {getStatus(promo.startDate, promo.endDate)}
                </td>
                <td className="p-2 border border-gray-300 flex justify-center gap-2">
  <button
    onClick={() => {
      setShowUpdateForm(true);
      setCurrentPromotion(promo);
    }}
    className="text-yellow-500"
  >
    <EditOutlined />
  </button>
  <button onClick={() => handleDelete(promo)} className="text-red-500">
    <DeleteOutlined />
  </button>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center p-4 text-red-500">❌ Không có khuyến mãi nào!</div>
      )}

      {/* Phân trang */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(filteredPromotions.length / itemsPerPage) }, (_, index) => (
          <button key={index} onClick={() => paginate(index + 1)} className="mx-1 p-2 bg-gray-200 hover:bg-blue-400 rounded">
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Discount;
