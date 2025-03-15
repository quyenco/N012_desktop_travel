// const Tour = () => {
//     return (
//       <div>
//         <h1 className="text-2xl font-bold mb-4">✈️ Quản lý chi tiết tour</h1>
//         <p>Đây là trang chi tiết về từng tour.</p>
//         <ul className="list-disc pl-6">
//           <li>🏖️ Tour Nha Trang - 5 ngày 4 đêm</li>
//           <li>🌲 Tour Đà Lạt - 3 ngày 2 đêm</li>
//           <li>🏔️ Tour Sa Pa - 4 ngày 3 đêm</li>
//         </ul>
//       </div>
//     );
//   };
  
//   export default Tour;

import React, { useState } from 'react';

const Tour = () => {
  // Dữ liệu tour mẫu
  const initialTours = [
    { id: 1, name: '🏖️ Tour Nha Trang', duration: '5 ngày 4 đêm', date: '2025-06-15', price: '5,000,000đ' },
    { id: 2, name: '🌲 Tour Đà Lạt', duration: '3 ngày 2 đêm', date: '2025-07-01', price: '3,500,000đ' },
    { id: 3, name: '🏔️ Tour Sa Pa', duration: '4 ngày 3 đêm', date: '2025-06-20', price: '6,200,000đ' },
  ];

  // State quản lý tour và bộ lọc
  const [tours, setTours] = useState(initialTours);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');

  // Xử lý lọc tour
  const filteredTours = tours.filter(
    (tour) =>
      (selectedDate === '' || tour.date === selectedDate) &&
      (selectedDuration === '' || tour.duration === selectedDuration)
  );

  // Thêm tour mới (demo nhanh)
  const handleAddTour = () => {
    const newTour = {
      id: tours.length + 1,
      name: `🏝️ Tour mới ${tours.length + 1}`,
      duration: '3 ngày 2 đêm',
      date: '2025-08-10',
      price: '4,000,000đ',
    };
    setTours([...tours, newTour]);
  };

  return (
    <div>
      {/* Tiêu đề và nút thêm */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">✈️ Quản lý chi tiết tour</h1>
        <button
          onClick={handleAddTour}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Thêm Tour
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="">-- Chọn ngày khởi hành --</option>
          {initialTours.map((tour) => (
            <option key={tour.id} value={tour.date}>
              {tour.date}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={selectedDuration}
          onChange={(e) => setSelectedDuration(e.target.value)}
        >
          <option value="">-- Chọn thời gian --</option>
          <option value="3 ngày 2 đêm">3 ngày 2 đêm</option>
          <option value="4 ngày 3 đêm">4 ngày 3 đêm</option>
          <option value="5 ngày 4 đêm">5 ngày 4 đêm</option>
        </select>

        {/* Reset bộ lọc */}
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600"
          onClick={() => {
            setSelectedDate('');
            setSelectedDuration('');
          }}
        >
          🔄 Reset
        </button>
      </div>

      {/* Bảng danh sách tour */}
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">#</th>
            <th className="border border-gray-300 p-2">Tên Tour</th>
            <th className="border border-gray-300 p-2">Thời gian</th>
            <th className="border border-gray-300 p-2">Ngày khởi hành</th>
            <th className="border border-gray-300 p-2">Giá</th>
          </tr>
        </thead>
        <tbody>
          {filteredTours.length > 0 ? (
            filteredTours.map((tour, index) => (
              <tr key={tour.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 p-2">{tour.name}</td>
                <td className="border border-gray-300 p-2 text-center">{tour.duration}</td>
                <td className="border border-gray-300 p-2 text-center">{tour.date}</td>
                <td className="border border-gray-300 p-2 text-right">{tour.price}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center p-4 text-red-500">
                ❌ Không tìm thấy tour phù hợp!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Tour;
