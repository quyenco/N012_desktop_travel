import React, { useEffect, useState } from "react";
import { getEmployees } from "../../api/employee/index";
import AddEmployeeForm from "../../components/employee/addEmployee/index";
import { useNavigate } from "react-router-dom";
import { Input, Spin } from "antd";

const Employee = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [filters, setFilters] = useState({
    searchText: "",
    position: "",
    status: "",
    gender: "",
  });
  const [loading, setLoading] = useState<boolean>(false);


  const navigate = useNavigate();

  // 🛠️ Giả lập lấy role người dùng từ localStorage
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // 🔄 Bắt đầu loading
    try {
      const data = await getEmployees();
      console.log("Nhân viên:", data);
      setEmployees(data);
    } catch (error) {
      console.error("Lỗi khi tải nhân viên:", error);
    } finally {
      setLoading(false); // ✅ Dừng loading dù thành công hay lỗi
    }
  };

    fetchData();
  }, []);

  const handleAddSuccess = (newEmp: any) => {
    setEmployees([...employees, newEmp]);
    setShowAddForm(false);
  };

  // 🎯 Hàm cập nhật bộ lọc
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // 📌 Hàm lọc nhân viên theo nhiều tiêu chí
  const filteredEmployees = employees.filter((emp) => {
    const matchName = emp.fullName.toLowerCase().includes(filters.searchText.toLowerCase());
    const matchPosition = filters.position ? emp.position === (filters.position === "manager") : true;
    const matchStatus = filters.status ? emp.user.status === filters.status : true;
    const matchGender = filters.gender ? (emp.gender ? "male" : "female") === filters.gender : true;

    return matchName && matchPosition && matchStatus && matchGender;
  });

  // 📌 Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  // update
  const handleUpdate = (employee: any) => {
    navigate(`/dashboard/employees/update/${employee.employeeId}`, { state: { employee } });
  };
  const handleAddEmployee = () => {
    navigate(`/dashboard/employees/add`);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // 🎯 Loading spinner
  if (loading) return <Spin tip="⏳ Đang tải dữ liệu..." className="block mx-auto mt-10" size="large" />;
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">👨‍💼 Quản lý nhân viên</h1>
        {/* {userRole === "ADMIN" && (
        <button
        onClick={handleAddEmployee}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ➕ Thêm Nhân Viên
      </button>
        )} */}
      </div>

      {/* {showAddForm && (
        <AddEmployeeForm
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddSuccess}
        />
      )} */}

      {/* Bộ lọc nâng cao */}
      <div className="flex gap-4 mb-4">
        <Input
          name="searchText"
          placeholder="🔍 Tìm kiếm theo tên..."
          value={filters.searchText}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />

        <select
          name="position"
          className="border p-2 rounded"
          value={filters.position}
          onChange={handleFilterChange}
        >
          <option value="">-- Chọn vị trí --</option>
          <option value="manager">Quản lý</option>
          <option value="staff">Nhân viên</option>
        </select>

        <select
          name="status"
          className="border p-2 rounded"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">-- Chọn trạng thái --</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="DISABLED">Vô hiệu hóa</option>
          <option value="BLOCKED">Bị khóa</option>
        </select>

        <select
          name="gender"
          className="border p-2 rounded"
          value={filters.gender}
          onChange={handleFilterChange}
        >
          <option value="">-- Chọn giới tính --</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
        </select>

        <button
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600"
          onClick={() => setFilters({ searchText: "", position: "", status: "", gender: "" })}
        >
          🔄 Reset
        </button>
      </div>

      {/* Danh sách nhân viên */}
      {currentEmployees.length > 0 ? (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">#</th>
              <th className="border border-gray-300 p-2">Tên nhân viên</th>
              <th className="border border-gray-300 p-2">CMND/CCCD</th>
              <th className="border border-gray-300 p-2">Ngày sinh</th>
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">SĐT</th>
              <th className="border border-gray-300 p-2">Địa chỉ</th>
              <th className="border border-gray-300 p-2">Giới tính</th>
              <th className="border border-gray-300 p-2">Vị trí</th>
              <th className="border border-gray-300 p-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((emp, index) => (
              <tr
                key={emp.employeeId}
                className="hover:bg-gray-100"
                onClick={() =>
                  handleUpdate(emp)
                }
              >
                <td className="border border-gray-300 p-2 text-center">
                  {index + 1}
                </td>
                <td className="border border-gray-300 p-2">{emp.fullName}</td>
                <td className="border border-gray-300 p-2">{emp.cid}</td>
                <td className="border border-gray-300 p-2 text-center">{emp.dob}</td>
                <td className="border border-gray-300 p-2 text-center">{emp.user.email}</td>
                <td className="border border-gray-300 p-2 text-center">{emp.phoneNumber}</td>
                <td className="border border-gray-300 p-2">{emp.address}</td>
                <td className="border border-gray-300 p-2 text-center">
                  {emp.gender ? "Nam" : "Nữ"}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {emp.position === true ? " Quản lý" : " Nhân viên"}
                </td>
                <td
                  className={`border border-gray-300 p-2 text-center ${
                    emp.user.status === "ACTIVE"
                      ? "text-green-500 font-semibold"
                      : emp.user.status === "DISABLED"
                      ? "text-yellow-500 font-semibold"
                      : "text-red-500 font-semibold"
                  }`}
                >
                  {emp.user.status === "ACTIVE"
                    ? "Hoạt động"
                    : emp.user.status === "DISABLED"
                    ? "Vô hiệu hóa"
                    : "Bị khóa"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center p-4 text-red-500">❌ Không có nhân viên nào!</div>
      )}

      {/* Phân trang */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(filteredEmployees.length / itemsPerPage) }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`mx-1 p-2 ${
              currentPage === index + 1 ? "bg-blue-400" : "bg-gray-200"
            } hover:bg-blue-600 rounded`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Employee;
