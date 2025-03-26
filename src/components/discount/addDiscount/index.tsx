import React, { useState } from "react";
import { Modal, message } from "antd";
import { createDiscount } from "../../../api/discount/index";

const AddPromotionForm = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (promo: any) => void;
}) => {
  // Khởi tạo state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountPercent: "",
    discountType: "FIRST_TOUR",
    startDate: "",
    endDate: "",
    minOrderValue: "",
    quantity: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý nhập liệu
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newPromo = await createDiscount(formData);

      if (newPromo) {
        message.success("🎉 Thêm khuyến mãi thành công!");
        onSuccess(newPromo);

        // Hiển thị modal thông báo
        Modal.success({
          title: "Thành công!",
          content: `Khuyến mãi "${formData.code}" đã được tạo thành công.`,
          onOk() {
            window.location.reload(); // Reload trang sau khi thêm xong
          },
        });
      }
    } catch (error) {
      message.error("❌ Lỗi khi thêm khuyến mãi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] relative animate-fadeIn">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Thêm Khuyến Mãi Mới</h2>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            name="code"
            placeholder="Mã khuyến mãi"
            value={formData.code}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:outline-blue-400"
            required
          />

          <input
            name="description"
            placeholder="Mô tả khuyến mãi"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:outline-blue-400"
            required
          />

          <input
            name="discountPercent"
            placeholder="Phần trăm giảm (%)"
            value={formData.discountPercent}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:outline-blue-400"
            type="number"
            required
          />

          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:outline-blue-400"
          >
            <option value="FIRST_TOUR">Giảm giá cho chuyến đầu tiên</option>
            <option value="LOYAL_CUSTOMER">Giảm giá khách hàng thân thiết</option>
            <option value="SEASONAL">Giảm giá mùa vụ</option>
          </select>

          <input
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:outline-blue-400"
            required
          />

          <input
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:outline-blue-400"
            required
          />

          <input
            name="minOrderValue"
            placeholder="Giá trị đơn hàng tối thiểu (VNĐ)"
            value={formData.minOrderValue}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:outline-blue-400"
            type="number"
            required
          />

          <input
            name="quantity"
            placeholder="Số lượng khuyến mãi"
            value={formData.quantity}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:outline-blue-400"
            type="number"
            required
          />

          {/* Nút Thêm & Hủy */}
          <div className="flex justify-between mt-2 gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${
                isSubmitting ? "bg-gray-300" : "bg-blue-500 hover:bg-blue-600"
              } text-white py-2 rounded w-1/2 transition`}
            >
              {isSubmitting ? "Đang xử lý..." : "Thêm"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white py-2 rounded w-1/2 hover:bg-gray-500 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPromotionForm;
