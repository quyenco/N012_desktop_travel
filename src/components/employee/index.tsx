import React, { useEffect, useState } from "react";
import { getEmployees } from "../../api/employee/index";

const Employee = () => {
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getEmployees();
      console.log("Nhân viên:", data);
      setEmployees(data); // Set đúng dữ liệu trả về
    };

    fetchData();
  }, []);

  return (
    <div>
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">👨‍💼 Quản lý nhân viên</h1>
        <button
          // onClick={handleAddEmployee}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Thêm Nhân Viên
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded"
          // value={positionFilter}
          // onChange={(e) => setPositionFilter(e.target.value)}
        >
          <option value="">-- Chọn vị trí --</option>
          <option value="manager">👑 Quản lý</option>
          <option value="staff">👨‍🔧 Nhân viên</option>
        </select>

        <button
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600"
          // onClick={() => setPositionFilter("")}
        >
          🔄 Reset
        </button>
      </div>


      {employees.length > 0 ? (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">#</th>
              <th className="border border-gray-300 p-2">Tên nhân viên</th>
              <th className="border border-gray-300 p-2">CMND/CCCD</th>
              <th className="border border-gray-300 p-2">Ngày sinh</th>
              <th className="border border-gray-300 p-2">SĐT</th>
              <th className="border border-gray-300 p-2">Địa chỉ</th>
              <th className="border border-gray-300 p-2">Giới tính</th>
              <th className="border border-gray-300 p-2">Vị trí</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, index) => (
              <tr key={emp.employeeId} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 p-2">{emp.fullName}</td>
                <td className="border border-gray-300 p-2">{emp.cid}</td>
                <td className="border border-gray-300 p-2 text-center">{emp.dob}</td>
                <td className="border border-gray-300 p-2 text-center">{emp.phongNumber}</td>
                <td className="border border-gray-300 p-2">{emp.address}</td>
                <td className="border border-gray-300 p-2 text-center">{emp.gender ? "Nam" : "Nữ"}</td>
                <td className="border border-gray-300 p-2 text-center">
                  {emp.position ? "👑 Quản lý" : "👨‍🔧 Nhân viên"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center p-4 text-red-500">❌ Không có nhân viên nào!</div>
      )}
    </div>
  );
};

export default Employee;
