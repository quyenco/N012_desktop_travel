import React, { useEffect, useState } from "react";
import { getCustomers, deleteCustomer } from "../../api/customer/index";
import { useNavigate } from "react-router-dom";
import { Pagination } from "antd";

const Customer = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10); // Số lượng khách hàng mỗi trang
  const navigate = useNavigate();

  // 🎯 Lấy danh sách khách hàng
  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await getCustomers();
      if (data) setCustomers(data);
    };
    fetchCustomers();
  }, []);

  // 🗑️ Xóa khách hàng
  const handleDeleteCustomer = async (id: number) => {
    if (confirm("Bạn có chắc muốn xóa khách hàng này không?")) {
      const res = await deleteCustomer(id);
      if (res) setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  // Chuyển đến chi tiết khách hàng
  const handleSelectCustomer = (id: number) => {
    navigate(`/dashboard/customers/${id}`);
  };

  // 🎯 Tính toán khách hàng hiện tại của trang
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  // 🛠️ Xử lý khi đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  // if (loading) return <div className="text-center p-4">⏳ Đang tải dữ liệu...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quản lý khách hàng</h1>

      {/* Danh sách khách hàng */}
      {customers.length > 0 ? (
        <>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">#</th>
                <th className="border p-2">Tên</th>
                <th className="border p-2">Ngày sinh</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Địa chỉ</th>
                <th className="border p-2">Giới tính</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map((customer, index) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectCustomer(customer.customerId)}
                >
                  <td className="border p-2 text-center">
                    {indexOfFirstCustomer + index + 1}
                  </td>
                  <td className="border p-2">{customer.fullName}</td>
                  <td className="border p-2">{customer.dob}</td>
                  <td className="border p-2">{customer.user.email}</td>
                  <td className="border p-2">{customer.address}</td>
                  <td className="border p-2">{customer.gender ? "Nam" : "Nữ"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Phân trang */}
          <Pagination
            current={currentPage}
            pageSize={customersPerPage}
            total={customers.length}
            onChange={handlePageChange}
            className="mt-4 text-center"
          />
        </>
      ) : (
        <div className="text-center p-4 text-red-500">❌ Không có khách hàng nào!</div>
      )}
    </div>
  );
};

export default Customer;
