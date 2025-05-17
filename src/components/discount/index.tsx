import React, { useEffect, useState } from "react";
import { getDiscounts, deleteDiscount } from "../../api/discount";
import AddPromotionForm from "../../components/discount/addDiscount";
import UpdatePromotionForm from "../../components/discount/updateDiscount";
import { EditOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Modal, message, Button, Spin } from "antd";

const Discount = () => {
  const [promotions, setPromotions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDiscounts();
      console.log("Danh sách khuyến mãi:", data);
      setPromotions(data);
    } catch (error) {
      console.error("Lỗi khi tải khuyến mãi:", error);
      message.error("❌ Lỗi khi tải danh sách khuyến mãi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSuccess = () => {
    fetchData(); // Tải lại danh sách từ server
    setShowAddForm(false);
  };

  const handleUpdateSuccess = (updatedPromo) => {
    fetchData(); // Tải lại danh sách từ server
    setShowUpdateForm(false);
  };

  const handleDelete = (promo) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa khuyến mãi "${promo.code}" không?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      async onOk() {
        try {
          await deleteDiscount(promo.discountId);
          message.success(`✅ Đã xóa khuyến mãi "${promo.code}" thành công!`);
          fetchData();
        } catch (error) {
          console.error("Lỗi khi xóa khuyến mãi:", error);
          if (error.response?.data?.message) {
            message.error(`❌ ${error.response.data.message}`);
          } else {
            message.error("❌ Không thể xóa khuyến mãi, vui lòng thử lại!");
          }
        }
      },
    });
  };

  const getStatusCode = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (today < start) return "upcoming";
    if (today > end) return "expired";
    return "active";
  };

  const filteredPromotions = promotions.filter(
    (promo) => !statusFilter || getStatusCode(promo.startDate, promo.endDate) === statusFilter
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPromotions = filteredPromotions.slice(indexOfFirstItem, indexOfLastItem);

  const getStatus = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (today < start) return "🔜 Sắp diễn ra";
    if (today > end) return "❌ Hết hạn";
    return "✅ Đang hoạt động";
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <Spin tip="⏳ Đang tải dữ liệu..." className="block mx-auto mt-10" size="large" />;

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
              <tr key={promo.discountId} className="hover:bg-gray-100 text-center">
                <td className="p-2 border border-gray-300">{index + 1}</td>
                <td className="p-2 border border-gray-300">{promo.description || "N/A"}</td>
                <td className="p-2 border border-gray-300">{promo.code || "N/A"}</td>
                <td className="p-2 border border-gray-300">{promo.startDate || "N/A"}</td>
                <td className="p-2 border border-gray-300">{promo.endDate || "N/A"}</td>
                <td className="p-2 border border-gray-300">{promo.discountPercent ? `${promo.discountPercent}%` : "N/A"}</td>
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