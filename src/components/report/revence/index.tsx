import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Button, DatePicker, Select, Statistic, Tag } from 'antd';
import { Column } from '@ant-design/charts';
import dayjs from 'dayjs';
import {
  getBookingByDate,
  getBookingCount,
  getBookingTotalRevenue,
  getBookingTotalCancel,
  getBookingTotalCompleted,
  getBookingTotalConfirmed,
  getBookingTotalPaid,
  getBookingTotalProgress,
} from '../../../api/report';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ReloadOutlined } from '@ant-design/icons';
import TopToursLineChart from './linechart';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
dayjs.extend(quarterOfYear);

const COLORS = [
  '#1890ff', '#f5222d', '#52c41a', '#fa8c16', '#722ed1',
  '#eb2f96', '#13c2c2', '#faad14', '#2f54eb', '#fadb14',
];

const BookingReport = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [orderData, setOrderData] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCancelled: 0,
    totalCompleted: 0,
    totalPaid: 0,
    totalConfirmed: 0,
    totalInProgress:0,
  });
  const [dateRange, setDateRange] = useState([dayjs().subtract(4, 'day'), dayjs()]);
  const [timeMode, setTimeMode] = useState('day');

  useEffect(() => {
    if (dateRange.length === 2) {
      const [startDate, endDate] = dateRange.map((date) => date.format('YYYY-MM-DD'));

      // Lấy tổng số đơn đặt
      getBookingCount(startDate, endDate)
        .then((data) => {
          const totalOrders = data;
          setStats((prev) => ({ ...prev, totalOrders }));

          // Lấy các dữ liệu khác
          getBookingTotalCancel(startDate, endDate)
            .then((cancelData) => {
              const totalCancelled = cancelData;
              setStats((prev) => {
                const newStats = { ...prev, totalCancelled };
                const totalCancelledPercentage = ((newStats.totalCancelled / newStats.totalOrders) * 100).toFixed(1);
                newStats.totalCancelledPercentage = totalCancelledPercentage;
                return newStats;
              });
            })
            .catch(console.error);

          getBookingTotalCompleted(startDate, endDate)
            .then((completedData) => {
              const totalCompleted = completedData;
              setStats((prev) => {
                const newStats = { ...prev, totalCompleted };
                const totalCompletedPercentage = ((newStats.totalCompleted / newStats.totalOrders) * 100).toFixed(1);
                newStats.totalCompletedPercentage = totalCompletedPercentage;
                return newStats;
              });
            })
            .catch(console.error);

          getBookingTotalConfirmed(startDate, endDate)
            .then((confirmedData) => {
              const totalConfirmed = confirmedData;
              setStats((prev) => {
                const newStats = { ...prev, totalConfirmed };
                const totalConfirmedPercentage = ((newStats.totalConfirmed / newStats.totalOrders) * 100).toFixed(1);
                newStats.totalConfirmedPercentage = totalConfirmedPercentage;
                return newStats;
              });
            })
            .catch(console.error);

          getBookingTotalPaid(startDate, endDate)
            .then((paidData) => {
              const totalPaid = paidData;
              setStats((prev) => {
                const newStats = { ...prev, totalPaid };
                const totalPaidPercentage = ((newStats.totalPaid / newStats.totalOrders) * 100).toFixed(1);
                newStats.totalPaidPercentage = totalPaidPercentage;
                return newStats;
              });
            })
            .catch(console.error);
            
            getBookingTotalProgress(startDate, endDate)
            .then((progressData) => {
              const totalInProgress = progressData;
              setStats((prev) => {
                const newStats = { ...prev, totalInProgress };
                const totalProgressPercentage = ((newStats.totalInProgress / newStats.totalOrders) * 100).toFixed(1);
                newStats.totalProgressPercentage = totalProgressPercentage;
                return newStats;
              });
            })
            .catch(console.error);
        })
        .catch(console.error);

      // Lấy danh sách đơn đặt
      getBookingByDate(startDate, endDate, statusFilter).then(setOrderData).catch(console.error);

      // Lấy tổng doanh thu
      getBookingTotalRevenue(startDate, endDate)
        .then((data) => setStats((prev) => ({ ...prev, totalRevenue: data })))
        .catch(console.error);
    }
  }, [dateRange, statusFilter]);

  useEffect(() => {
    const now = dayjs();
    if (timeMode === 'day') {
      setDateRange([now.subtract(4, 'day'), now]);
    } else if (timeMode === 'month') {
      const currentMonth = now.month();
      const startMonth = Math.max(currentMonth - 2, 0);
      const start = now.month(startMonth).startOf('month');
      const end = now.endOf('month');
      setDateRange([start, end]);
    } else if (timeMode === 'quarter') {
      const currentQuarter = Math.floor(now.month() / 3) + 1;
      const startQuarter = Math.max(currentQuarter - 2, 1);
      const start = dayjs().quarter(startQuarter).startOf('quarter');
      const end = now.endOf('quarter');
      setDateRange([start, end]);
    } else if (timeMode === 'year') {
      const currentYear = now.year();
      const start = now.year(currentYear - 2).startOf('year');
      const end = now.endOf('year');
      setDateRange([start, end]);
    }
  }, [timeMode]);

  const statusMapping = {
    CONFIRMED: 'Đã xác nhận',
    CANCELED: 'Đã hủy',
    COMPLETED: 'Hoàn thành',
    PAID: 'Đã thanh toán',
    IN_PROGRESS: 'Đang diễn ra',
  };

  const statusColors = {
    CONFIRMED: 'blue',
    CANCELED: 'red',
    COMPLETED: 'green',
    PAID: 'gold',
    IN_PROGRESS: 'purple',
  };
  

  const columns = [
    { title: 'Tên khách hàng', dataIndex: 'customerFullName', key: 'customerFullName' },
    { title: 'Tour', dataIndex: 'tourName', key: 'tourName' },
    {
      title: 'Ngày đặt',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    { title: 'Số lượng', dataIndex: 'numberPeople', key: 'numberPeople' },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `₫${price.toLocaleString()}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]} style={{ fontWeight: 'bold', fontSize: '13px', padding: '4px 8px' }}>
          {statusMapping[status] || 'Không xác định'}
        </Tag>
      ),
    },
  ];

  // Dữ liệu biểu đồ cột
  const getGroupedData = (data, dateRange, groupByOption) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('No valid data for grouped chart');
      return [];
    }

    const groupedData = data.reduce((acc, item) => {
      if (!item.bookingDate) {
        return acc;
      }

      let formattedDate;
      if (groupByOption === 'day') {
        formattedDate = dayjs(item.bookingDate).format('DD-MM-YYYY');
      } else if (groupByOption === 'week') {
        const weekOfYear = dayjs(item.bookingDate).week();
        formattedDate = `${dayjs(item.bookingDate).year()}-W${weekOfYear.toString().padStart(2, '0')}`;
      } else if (groupByOption === 'month') {
        formattedDate = dayjs(item.bookingDate).format('MM-YYYY');
      } else if (groupByOption === 'quarter') {
        const quarter = dayjs(item.bookingDate).quarter();
        formattedDate = `${dayjs(item.bookingDate).year()}-Q${quarter}`;
      } else if (groupByOption === 'year') {
        formattedDate = dayjs(item.bookingDate).format('YYYY');
      } else {
        formattedDate = dayjs(item.bookingDate).format('DD-MM-YYYY');
      }

      acc[formattedDate] = (acc[formattedDate] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(groupedData)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => {
        if (groupByOption === 'day') {
          return dayjs(a.date, 'DD-MM-YYYY').isBefore(dayjs(b.date, 'DD-MM-YYYY')) ? -1 : 1;
        } else if (groupByOption === 'week') {
          const [yearA, weekA] = a.date.split('-W');
          const [yearB, weekB] = b.date.split('-W');
          return yearA === yearB ? parseInt(weekA) - parseInt(weekB) : yearA - yearB;
        } else if (groupByOption === 'month') {
          return dayjs(a.date, 'MM-YYYY').isBefore(dayjs(b.date, 'MM-YYYY')) ? -1 : 1;
        } else if (groupByOption === 'quarter') {
          const [yearA, qA] = a.date.split('-Q');
          const [yearB, qB] = b.date.split('-Q');
          return yearA === yearB ? parseInt(qA) - parseInt(qB) : yearA - yearB;
        } else if (groupByOption === 'year') {
          return parseInt(a.date) - parseInt(b.date);
        }
        return 0;
      });
  };

  const columnChartData = getGroupedData(orderData, dateRange, timeMode);

  // Dữ liệu biểu đồ tròn
  const total = stats.totalOrders;
  const pieChartData = [
    {
      type: 'Đã hủy',
      value: stats.totalCancelled,
      percent: total > 0 ? stats.totalCancelled / total : 0,
    },
    {
      type: 'Hoàn thành',
      value: stats.totalCompleted,
      percent: total > 0 ? stats.totalCompleted / total : 0,
    },
    {
      type: 'Xác nhận',
      value: stats.totalConfirmed,
      percent: total > 0 ? stats.totalConfirmed / total : 0,
    },
    {
      type: 'Đã thanh toán',
      value: stats.totalPaid,
      percent: total > 0 ? stats.totalPaid / total : 0,
    },
    {
      type: 'Đang thực hiện',
      value: stats.totalInProgress,
      percent: total > 0 ? stats.totalInProgress / total : 0,
    },
  ];

  const handleReset = () => {
    const defaultRange = getDefaultRange(timeMode);
    setDateRange(defaultRange);
  };

  const getDefaultRange = (mode) => {
    const now = dayjs();
    if (mode === 'day') {
      return [now.subtract(4, 'day'), now];
    } else if (mode === 'month') {
      return [now.startOf('month'), now.endOf('month')];
    } else if (mode === 'quarter') {
      return [now.startOf('quarter'), now.endOf('quarter')];
    } else if (mode === 'year') {
      return [now.startOf('year'), now.endOf('year')];
    }
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '10px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
        Báo cáo Đơn Đặt Tour
      </Title>

      <Row gutter={8}>
        <Col span={7}>
          <Card title="Lọc theo" style={{ height: '100%' }}>
            <div style={{ marginBottom: 16 }}>
              <span>Chọn thời gian</span>
              <Select style={{ width: '100%' }} value={timeMode} onChange={(value) => setTimeMode(value)}>
                <Option value="day">Theo ngày</Option>
                <Option value="month">Tháng</Option>
                <Option value="quarter">Theo quý</Option>
                <Option value="year">Theo năm</Option>
              </Select>
              {timeMode === 'day' && (
                <RangePicker
                  style={{ width: '100%', marginTop: 10 }}
                  value={dateRange}
                  // defaultValue={[dayjs().subtract(4, 'day'), dayjs()]}
                  format={(value) => value.format('DD-MM-YYYY')}
                  onChange={(dates) => setDateRange(dates || [dayjs(), dayjs()])}
                />
              )}
              {timeMode === 'month' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <DatePicker.MonthPicker
                    placeholder="Từ tháng"
                    value={dateRange[0]}
                    onChange={(date) => setDateRange([date, dateRange[1]])}
                  />
                  <DatePicker.MonthPicker
                    placeholder="Đến tháng"
                    value={dateRange[1]}
                    onChange={(date) => setDateRange([dateRange[0], date])}
                  />
                </div>
              )}
              {timeMode === 'quarter' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <DatePicker.QuarterPicker
                    placeholder="Từ quý"
                    value={dateRange[0]}
                    onChange={(date) => setDateRange([date, dateRange[1]])}
                  />
                  <DatePicker.QuarterPicker
                    placeholder="Đến quý"
                    value={dateRange[1]}
                    onChange={(value) => {
                      const endQuarter = dayjs().quarter(value).endOf('quarter');
                      setDateRange([dateRange[0] || endQuarter.startOf('quarter'), endQuarter]);
                    }}
                  />
                </div>
              )}
              {timeMode === 'year' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <DatePicker.YearPicker
                    placeholder="Từ năm"
                    value={dateRange[0]}
                    onChange={(date) => setDateRange([date, dateRange[1]])}
                  />
                  <DatePicker.YearPicker
                    placeholder="Đến năm"
                    value={dateRange[1]}
                    onChange={(date) => setDateRange([dateRange[0], date])}
                  />
                </div>
              )}
            </div>
            <div>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                Reset
              </Button>
            </div>
          </Card>
        </Col>

        <Col span={17}>
          <Card title="Tổng quan" style={{ marginBottom: '20px' }}>
            <Row gutter={16}>
              <Col span={7}>
                <Statistic title="Tổng số đơn" value={stats.totalOrders} valueStyle={{ color: '#1890ff' }} />
              </Col>
              <Col span={7}>
                <Statistic
                  title="Số đơn hủy"
                  value={`${stats.totalCancelled} `}
                  valueStyle={{ color: '#ff4d4f' }}
                  suffix={
                    <span style={{ fontSize: '16px', fontWeight: 'normal' }}>({stats.totalCancelledPercentage}%)</span>
                  }
                />
              </Col>
              <Col span={7}>
                <Statistic
                  title="Số đơn xác nhận"
                  value={`${stats.totalConfirmed} `}
                  valueStyle={{ color: '#3f8600' }}
                  suffix={
                    <span style={{ fontSize: '16px', fontWeight: 'normal' }}>({stats.totalConfirmedPercentage}%)</span>
                  }
                />
              </Col>
              <Col span={7}>
                <Statistic
                  title="Số đơn hoàn thành"
                  value={`${stats.totalCompleted} `}
                  valueStyle={{ color: '#3f8600' }}
                  suffix={
                    <span style={{ fontSize: '16px', fontWeight: 'normal' }}>({stats.totalCompletedPercentage}%)</span>
                  }
                />
              </Col>
              <Col span={7}>
                <Statistic
                  title="Số đơn đang thực hiện"
                  value={`${stats.totalInProgress} `}
                  valueStyle={{ color: '#3f8600' }}
                  suffix={
                    <span style={{ fontSize: '16px', fontWeight: 'normal' }}>({stats.totalProgressPercentage}%)</span>
                  }
                />
              </Col>
              <Col span={7}>
                <Statistic
                  title="Số đơn đã thanh toán"
                  value={`${stats.totalPaid} `}
                  valueStyle={{ color: '#3f8600' }}
                  suffix={
                    <span style={{ fontSize: '16px', fontWeight: 'normal' }}>({stats.totalPaidPercentage}%)</span>
                  }
                />
              </Col>
            </Row>
          </Card>

          <Card title="Danh sách đơn đặt tour">
            <Table
              columns={columns}
              dataSource={orderData}
              rowKey="orderId"
              pagination={false}
              size="small"
              style={{ fontSize: '14px', lineHeight: '1.2' }}
              scroll={{ y: 400 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ cột */}
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Xu hướng đơn đặt theo thời gian">
            <Column
              data={columnChartData}
              xField="date"
              yField="count"
              label={{
                style: { fill: '#FFFFFF', opacity: 0.6 },
              }}
              xAxis={{
                label: {
                  autoHide: true,
                  autoRotate: true,
                  formatter: (text) => {
                    if (timeMode === 'day') return text;
                    if (timeMode === 'week') return text;
                    if (timeMode === 'month') return text;
                    if (timeMode === 'quarter') return text;
                    if (timeMode === 'year') return text;
                    return text;
                  },
                },
              }}
              meta={{
                date: {
                  alias:
                    timeMode === 'day'
                      ? 'Ngày'
                      : timeMode === 'week'
                      ? 'Tuần'
                      : timeMode === 'month'
                      ? 'Tháng'
                      : timeMode === 'quarter'
                      ? 'Quý'
                      : 'Năm',
                },
                count: { alias: 'Số lượng đơn' },
              }}
              height={300}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ tròn */}
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Tỉ lệ trạng thái đơn">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent, type }) => `${type}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const { payload } = props;
                      return [`${value} đơn`, payload.type];
                    }}
                  />
                  <Legend
                    payload={pieChartData.map((item, index) => ({
                      value: item.type,
                      type: 'square',
                      id: item.type,
                      color: COLORS[index % COLORS.length],
                    }))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ đường */}
      <TopToursLineChart dateRange={dateRange} timeMode={timeMode} />
    </div>
  );
};

export default BookingReport;