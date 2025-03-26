import React, {useState} from 'react';
import {updateDiscount} from '../../../api/discount/index';
import {message, Modal, Input, DatePicker, Button, Select} from 'antd';
import dayjs from 'dayjs';

const {Option} = Select;

const UpdatePromotionForm = ({promotion, onClose, onSuccess}: any) => {
  const [formData, setFormData] = useState({
    description: promotion.description,
    code: promotion.code,
    startDate: dayjs(promotion.startDate),
    endDate: dayjs(promotion.endDate),
    discountPercent: promotion.discountPercent,
    discountType: promotion.discountType || 'FIRST_TOUR',
    minOrderValue: promotion.minOrderValue || 0,
    quantity: promotion.quantity || 1,
  });

  const handleChange = (e: any) => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleDateChange = (name: string, date: any) => {
    setFormData({...formData, [name]: date});
  };

  const handleSelectChange = (value: string) => {
    setFormData({...formData, discountType: value});
  };

  const handleSubmit = async () => {
    try {
      const updatedData = {
        ...formData,
        startDate: formData.startDate.format('YYYY-MM-DD'),
        endDate: formData.endDate.format('YYYY-MM-DD'),
      };

      const response = await updateDiscount(promotion.discountId, updatedData);
      console.log("sửa",response)

      if (response) {
        message.success(`✅ Cập nhật khuyến mãi thành công!`);
        onSuccess(response);
        onClose();
      } else {
        message.error('⚠️ Cập nhật thất bại!');
      }
    } catch (error: any) {
      console.error('Lỗi khi cập nhật khuyến mãi:', error);
      message.error('❌ Lỗi khi cập nhật khuyến mãi!');
    }
  };

  return (
    <Modal title=" Cập nhật khuyến mãi" open={true} onCancel={onClose} footer={null}>
      <div className="flex flex-col gap-4 p-4">
        <div>
          <label className="font-semibold"> Mô tả khuyến mãi:</label>
          <Input
            name="description"
            placeholder="Nhập mô tả khuyến mãi"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="font-semibold"> Mã khuyến mãi (không chỉnh sửa):</label>
          <Input
            name="code"
            placeholder="Mã khuyến mãi"
            value={formData.code}
            disabled // Khóa trường code
          />
        </div>

        <div>
          <label className="font-semibold"> Ngày bắt đầu:</label>
          <DatePicker
            placeholder="Chọn ngày bắt đầu"
            value={formData.startDate}
            onChange={(date) => handleDateChange('startDate', date)}
          />
        </div>

        <div>
          <label className="font-semibold"> Ngày kết thúc:</label>
          <DatePicker
            placeholder="Chọn ngày kết thúc"
            value={formData.endDate}
            onChange={(date) => handleDateChange('endDate', date)}
          />
        </div>

        <div>
          <label className="font-semibold"> Phần trăm giảm giá:</label>
          <Input
            type="number"
            name="discountPercent"
            placeholder="Nhập phần trăm giảm giá"
            value={formData.discountPercent}
            onChange={handleChange}
            min={0}
            max={100}
          />
        </div>

        <div>
          <label className="font-semibold"> Loại giảm giá:</label>
          <Select value={formData.discountType} onChange={handleSelectChange} className="w-full">
            <Option value="FIRST_TOUR"> Giảm giá lần đầu</Option>
            <Option value="LOYAL_CUSTOMER"> Khách hàng thân thiết</Option>
            <Option value="SEASONAL"> Giảm giá theo mùa</Option>
          </Select>
        </div>

        <div>
          <label className="font-semibold"> Giá trị đơn hàng tối thiểu:</label>
          <Input
            type="number"
            name="minOrderValue"
            placeholder="Nhập giá trị tối thiểu"
            value={formData.minOrderValue}
            onChange={handleChange}
            min={0}
          />
        </div>

        <div>
          <label className="font-semibold"> Số lượng mã giảm giá:</label>
          <Input
            type="number"
            name="quantity"
            placeholder="Nhập số lượng mã"
            value={formData.quantity}
            onChange={handleChange}
            min={1}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose} type="default">
            Hủy
          </Button>
          <Button onClick={handleSubmit} type="primary">
            Cập nhật
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UpdatePromotionForm;
