import React, { useEffect, useState } from "react";
import { Card, Statistic, Row, Col } from "antd";
import { DollarOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Column, Line, Pie } from "@ant-design/charts";
import axios from "axios";

const Report: React.FC = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    bookedTours: 0,
    canceledTours: 0,
    revenueData: [],
    cancelData: [],
    categoryData: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📊 Dashboard Thống Kê</h2>

      {/* Thống kê tổng quan */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng Doanh Thu"
              value={stats.revenue}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tour Đã Đặt"
              value={stats.bookedTours}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tour Bị Hủy"
              value={stats.canceledTours}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ doanh thu theo tháng */}
      <Row gutter={16} className="mt-4">
        <Col span={12}>
          <Card title="📈 Doanh Thu Theo Tháng">
            <Line
              data={stats.revenueData}
              xField="month"
              yField="revenue"
              smooth
              height={300}
              point={{ size: 4, shape: "circle" }}
              color="#3f8600"
            />
          </Card>
        </Col>

        {/* Biểu đồ tỷ lệ hủy tour */}
        <Col span={12}>
          <Card title="🚫 Tỷ Lệ Hủy Tour">
            <Pie
              data={stats.cancelData}
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{ type: "outer", content: "{name} ({percentage})" }}
              height={300}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ phân loại tour theo danh mục */}
      <Card title="🏝️ Tour Theo Danh Mục" className="mt-4">
        <Column
          data={stats.categoryData}
          xField="category"
          yField="count"
          color="#1890ff"
          height={300}
          label={{ position: "middle" }}
        />
      </Card>
    </div>
  );
};

export default Report;
