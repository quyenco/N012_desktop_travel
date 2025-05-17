import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Button, DatePicker, Select, Statistic, Tag, notification } from 'antd';
import { Bar, Column } from '@ant-design/charts';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DownloadOutlined, ReloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import {
  getBookingByDate,
  getBookingTotalRevenue,
  getBookingTotalCancel,
  getBookingCountByStatus,
  getTopTourBookings,
  getTopTourBookingsRevenue,
  getBookingCount,
  getToursRevenue,
} from '../../../api/report';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { DejaVuSansBase64 } from '../../../font/font';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
dayjs.extend(quarterOfYear);

const COLORS = ['#52c41a', '#fa8c16', '#722ed1']; // Màu cho COMPLETED, PAID, IN_PROGRESS

const OrderReport = () => {
  const [statusFilter, setStatusFilter] = useState(['PAID', 'COMPLETED', 'IN_PROGRESS']);
  const [orderData, setOrderData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgRevenuePerOrder: 0,
    totalCancelled: 0,
    cancelPercentage: 0,
    totalBooking: 0,
  });
  const [bookingTotal, setBookingTotal] = useState(null);
  const [cancelTotal, setCancelTotal] = useState(null);
  const [dateRange, setDateRange] = useState([dayjs().subtract(4, 'day'), dayjs()]);
  const [timeMode, setTimeMode] = useState('day');
  const [tourRevenueData, setTourRevenueData] = useState([]);
  const [tableToursRvenue, setTableTourRvenu] = useState([]);

  // Hàm lấy dữ liệu từ API
  useEffect(() => {
    if (dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const [startDate, endDate] = dateRange.map((date) => date.format('YYYY-MM-DD'));

      if (dayjs(startDate).isAfter(dayjs(endDate))) {
        notification.error({
          message: 'Lỗi',
          description: 'Ngày bắt đầu không được sau ngày kết thúc!',
        });
        return;
      }

      const fetchData = async () => {
        try {
          const totalRevenue = await getBookingTotalRevenue(startDate, endDate, statusFilter);
          setStats((prev) => ({ ...prev, totalRevenue }));

          const tong = await getBookingCount(startDate, endDate);
          setBookingTotal(tong);

          const huy = await getBookingTotalCancel(startDate, endDate);
          setCancelTotal(huy);

          const totalOrders = await getBookingCountByStatus(startDate, endDate, statusFilter);
          const avgRevenuePerOrder = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;
          setStats((prev) => ({ ...prev, totalOrders, avgRevenuePerOrder }));

          const tourList = await getToursRevenue(startDate, endDate);
          setTableTourRvenu(tourList);

          const bookingList = await getBookingByDate(startDate, endDate, statusFilter);
          setOrderData(bookingList);
          console.log("boking:", orderData);
        } catch (error) {
          console.error('Lỗi khi lấy dữ liệu:', error);
          notification.error({
            message: 'Lỗi',
            description: 'Không thể tải một hoặc nhiều dữ liệu!',
          });
        }
      };

      fetchData();
    }

    console.log("tour list: ", tableToursRvenue);
  }, [dateRange, statusFilter]);

  // Lấy top tour và doanh thu theo tour
  useEffect(() => {
    if (dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const [startDate, endDate] = dateRange.map((date) => date.format('YYYY-MM-DD'));

      getTopTourBookingsRevenue(startDate, endDate)
        .then((data) => {
          console.log('Phản hồi getTopTourBookingsRevenue:', data);
          if (!data || !Array.isArray(data)) {
            console.warn('Dữ liệu tour không hợp lệ:', data);
            setTourRevenueData([]);
            return;
          }

          const tourData = data.map((tour, index) => {
            return {
              key: tour.tourId || index + 1,
              tourName: tour.tourName || 'N/A',
              totalBookings: tour.totalBookings || 0,
              totalCancelled: tour.totalCancelled || 0,
              totalRevenue: tour.totalRevenue || 0,
              avgRevenuePerBooking: tour.avgRevenuePerBooking || 0,
            };
          });

          setTourRevenueData(tourData);
        })
        .catch((error) => {
          console.error('Lỗi lấy doanh thu tour:', error);
          setTourRevenueData([]);
          notification.error({
            message: 'Lỗi',
            description: 'Không thể lấy dữ liệu doanh thu tour!',
          });
        });
    }
  }, [dateRange]);

  // Cập nhật khoảng thời gian dựa trên timeMode
  useEffect(() => {
    const now = dayjs();
    if (timeMode === 'day') {
      setDateRange([now.subtract(4, 'day'), now]);
    } else if (timeMode === 'month') {
      const start = now.startOf('month');
      const end = now.endOf('month');
      setDateRange([start, end]);
    } else if (timeMode === 'quarter') {
      const start = now.startOf('quarter');
      const end = now.endOf('quarter');
      setDateRange([start, end]);
    } else if (timeMode === 'year') {
      const start = now.startOf('year');
      const end = now.endOf('year');
      setDateRange([start, end]);
    }
  }, [timeMode]);

  // Dữ liệu biểu đồ cột
  const getRevenueChartData = (data, dateRange, groupByOption) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('No valid data for revenue chart');
      return [];
    }

    const groupedData = data.reduce((acc, item) => {
      if (!item.bookingDate || !item.totalPrice) return acc;

      let formattedDate;
      if (groupByOption === 'day') {
        formattedDate = dayjs(item.bookingDate).format('DD-MM-YYYY');
      } else if (groupByOption === 'month') {
        formattedDate = dayjs(item.bookingDate).format('MM-YYYY');
      } else if (groupByOption === 'quarter') {
        const quarter = dayjs(item.bookingDate).quarter();
        formattedDate = `${dayjs(item.bookingDate).year()}-Q${quarter}`;
      } else if (groupByOption === 'year') {
        formattedDate = dayjs(item.bookingDate).format('YYYY');
      }

      acc[formattedDate] = (acc[formattedDate] || 0) + item.totalPrice;
      return acc;
    }, {});

    return Object.entries(groupedData)
      .map(([date, revenue]) => ({
        date,
        revenue,
      }))
      .sort((a, b) => {
        if (groupByOption === 'day') {
          return dayjs(a.date, 'DD-MM-YYYY').isBefore(dayjs(b.date, 'DD-MM-YYYY')) ? -1 : 1;
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

  const revenueChartData = getRevenueChartData(orderData, dateRange, timeMode === 'day' ? 'day' : timeMode);

  // Dữ liệu biểu đồ tròn
  const pieChartData = [
    {
      type: 'Hoàn thành',
      value: orderData
        .filter((order) => order.status === 'COMPLETED')
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
    },
    {
      type: 'Đã thanh toán',
      value: orderData
        .filter((order) => order.status === 'PAID')
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
    },
    {
      type: 'Đang diễn ra',
      value: orderData
        .filter((order) => order.status === 'IN_PROGRESS')
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
    },
  ].filter((entry) => entry.value > 0);

  // Cột bảng doanh thu theo tour
  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (text, record, index) => index + 1,
    },
    { title: 'Tên tour', dataIndex: 'tourName', key: 'tourName', render: (text) => text || 'N/A' },
    { title: 'Số lượt đặt', dataIndex: 'totalBookings', key: 'totalBookings', render: (value) => value || 0 },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (revenue) => `₫${(revenue || 0).toLocaleString()}`,
    },
    {
      title: 'Doanh thu TB/đơn',
      key: 'avgRevenuePerBooking',
      render: (_, record) => {
        const average = (record.totalRevenue || 0) / (record.totalBookings || 1); // tránh chia cho 0
        return `₫${average.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      },
    },
  ];

  // Xuất báo cáo PDF
  const exportToPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Thêm font DejaVuSans để hỗ trợ tiếng Việt
    try {
      doc.addFileToVFS('DejaVuSans.ttf', DejaVuSansBase64);
      doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
      doc.setFont('DejaVuSans');
    } catch (error) {
      console.error('Lỗi khi thêm font DejaVuSans:', error);
      notification.warning({
        message: 'Cảnh báo',
        description: 'Không thể tải font tiếng Việt, một số ký tự có thể hiển thị sai!',
      });
    }

    // Tiêu đề
    doc.setFontSize(14);
    doc.text('🧾 BÁO CÁO DOANH THU TOUR DU LỊCH', pageWidth / 2, 15, { align: 'center' });

    // Thông tin chung
    doc.setFontSize(12);
    doc.text('📅 Thông tin chung:', 14, 30);
    doc.setFontSize(10);
    const startDate = dateRange[0]?.format('DD/MM/YYYY') || 'Không xác định';
    const endDate = dateRange[1]?.format('DD/MM/YYYY') || 'Không xác định';
    const reportDate = dayjs().format('DD/MM/YYYY');
    const timeModeText = {
      day: 'Theo ngày',
      month: 'Theo tháng',
      quarter: `Theo quý – Quý ${dateRange[0]?.quarter() || 'N/A'} năm ${dateRange[0]?.year() || 'N/A'}`,
      year: 'Theo năm',
    }[timeMode];

    doc.text(`Khoảng thời gian báo cáo: Từ ${startDate} đến ${endDate}`, 14, 40);
    doc.text(`Chế độ lọc: ${timeModeText}`, 14, 50);
    doc.text(`Ngày tạo báo cáo: ${reportDate}`, 14, 60);

    // Thống kê tổng quan
    doc.setFontSize(12);
    doc.text('📈 Thống kê tổng quan:', 14, 80);
    doc.setFontSize(10);
    doc.text(`Tổng doanh thu: ₫${(stats.totalRevenue || 0).toLocaleString()}`, 14, 90);
    doc.text(`Tổng số đơn: ${bookingTotal || 0}`, 14, 100);
    doc.text(
      `Doanh thu trung bình/đơn: ₫${Math.floor(bookingTotal > 0 ? stats.totalRevenue / bookingTotal : 0).toLocaleString()}`,
      14,
      110
    );
    doc.text(`Tổng đơn hủy: ${cancelTotal || 0}`, 14, 120);

    // Chi tiết doanh thu theo tour
    doc.setFontSize(12);
    doc.text('📊 Chi tiết doanh thu theo tour:', 14, 140);

    const tableData = tableToursRvenue.map((tour, index) => [
      index + 1,
      tour.tourName || 'Không xác định',
      tour.totalBookings || 0,
      `₫${(tour.totalRevenue || 0).toLocaleString()}`,
      `₫${((tour.totalRevenue || 0) / (tour.totalBookings || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    ]);

    // Thêm dòng tổng
    const totalBookings = tableToursRvenue.reduce((sum, tour) => sum + (tour.totalBookings || 0), 0);
    const totalRevenue = tableToursRvenue.reduce((sum, tour) => sum + (tour.totalRevenue || 0), 0);
    const avgRevenuePerBooking = totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(0) : 0;
    tableData.push([
      'Tổng cộng',
      '',
      totalBookings,
      `₫${totalRevenue.toLocaleString()}`,
      `₫${avgRevenuePerBooking.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 150,
      head: [['STT', 'Tên tour', 'Số lượt đặt', 'Doanh thu', 'Doanh thu TB/đơn']],
      body: tableData,
      theme: 'grid',
      styles: { font: 'DejaVuSans', fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 80 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
      },
    });

    // Tóm tắt
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('📌 Tóm tắt:', 14, finalY);
    doc.setFontSize(10);

    const topRevenueTour = tableToursRvenue.reduce(
      (max, tour) => (tour.totalRevenue > max.totalRevenue ? tour : max),
      { totalRevenue: 0, tourName: 'Không có dữ liệu' }
    );
    const topBookingTour = tableToursRvenue.reduce(
      (max, tour) => (tour.totalBookings > max.totalBookings ? tour : max),
      { totalBookings: 0, tourName: 'Không có dữ liệu' }
    );

    doc.text(`Tour có doanh thu cao nhất: ${topRevenueTour.tourName}`, 14, finalY + 10);
    doc.text(`Tour có lượt đặt nhiều nhất: ${topBookingTour.tourName}`, 14, finalY + 20);
    doc.text(`Tổng doanh thu: ₫${totalRevenue.toLocaleString()}`, 14, finalY + 30);

    // Thông tin người lập
    doc.setFontSize(12);
    doc.text('👤 Người lập báo cáo:', 14, finalY + 50);
    doc.setFontSize(10);
    doc.text('Nguyễn Văn A', 14, finalY + 60);
    doc.text('Phòng Kinh Doanh – Công ty Du lịch ABC', 14, finalY + 70);

    // Lưu PDF với dialog chọn vị trí và tên file
    try {
      if (window.showSaveFilePicker) {
        const suggestedName = `BaoCaoDoanhThu_${reportDate.replace(/\//g, '-')}.pdf`;
        const handle = await window.showSaveFilePicker({
          suggestedName,
          types: [
            {
              description: 'PDF Files',
              accept: { 'application/pdf': ['.pdf'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        const pdfBytes = doc.output('arraybuffer');
        await writable.write(pdfBytes);
        await writable.close();
        notification.success({
          message: 'Thành công',
          description: 'File PDF đã được lưu!',
        });
      } else {
        doc.save(`BaoCaoDoanhThu_${reportDate.replace(/\//g, '-')}.pdf`);
        notification.info({
          message: 'Thông báo',
          description: 'File PDF đã được lưu vào thư mục mặc định của trình duyệt!',
        });
      }
    } catch (error) {
      console.error('Lỗi lưu PDF:', error);
      if (error.name !== 'AbortError') {
        notification.error({
          message: 'Lỗi',
          description: 'Không thể lưu file PDF!',
        });
      }
    }
  };

  // Reset bộ lọc
  const handleReset = () => {
    const now = dayjs();
    let defaultRange = [now.subtract(4, 'day'), now];
    if (timeMode === 'month') {
      defaultRange = [now.startOf('month'), now.endOf('month')];
    } else if (timeMode === 'quarter') {
      defaultRange = [now.startOf('quarter'), now.endOf('quarter')];
    } else if (timeMode === 'year') {
      defaultRange = [now.startOf('year'), now.endOf('year')];
    }
    setDateRange(defaultRange);
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '10px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
        Báo cáo Doanh thu
      </Title>

      <Row gutter={8}>
        <Col span={7}>
          <Card title="Lọc theo" style={{ height: '100%' }}>
            <div style={{ marginBottom: 16 }}>
              <span>Chọn thời gian</span>
              <Select style={{ width: '100%' }} value={timeMode} onChange={(value) => setTimeMode(value)}>
                <Option value="day">Theo ngày</Option>
                <Option value="month">Theo tháng</Option>
                <Option value="quarter">Theo quý</Option>
                <Option value="year">Theo năm</Option>
              </Select>
              {timeMode === 'day' && (
                <RangePicker
                  style={{ width: '100%', marginTop: 10 }}
                  value={dateRange}
                  format="DD-MM-YYYY"
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
                    onChange={(date) => setDateRange([dateRange[0], date])}
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
            <Button onClick={handleReset} icon={<ReloadOutlined />}>
              Reset
            </Button>
            <Button icon={<FilePdfOutlined />} onClick={exportToPDF} type="primary" style={{ marginLeft: 8 }}>
              Xuất PDF
            </Button>
          </Card>
        </Col>

        <Col span={17}>
          <Card title="Tổng quan" style={{ marginBottom: '20px' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Tổng doanh thu"
                  value={stats.totalRevenue}
                  valueStyle={{ color: '#1890ff' }}
                  prefix="₫"
                  formatter={(value) => value.toLocaleString()}
                />
              </Col>
              <Col span={6}>
                <Statistic title="Tổng số đơn" value={bookingTotal} valueStyle={{ color: '#3f8600' }} />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Doanh thu TB/đơn"
                  value={Math.floor(bookingTotal > 0 ? stats.totalRevenue / bookingTotal : 0)}
                  valueStyle={{ color: '#fa8c16' }}
                  formatter={(value) => `₫${Number(value).toLocaleString()}`}
                />
              </Col>
              <Col span={6}>
                <Statistic title="Tổng đơn hủy" value={cancelTotal} valueStyle={{ color: '#ff4d4f' }} />
              </Col>
            </Row>
          </Card>

          <Card title="Doanh thu theo tour">
            {tableToursRvenue.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#ff4d4f', padding: '20px' }}>
                Không có dữ liệu doanh thu tour trong khoảng thời gian này!
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={tableToursRvenue}
                rowKey="tourName"
                pagination={false}
                size="small"
                scroll={{ y: 400 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Doanh thu theo thời gian">
            <Column
              data={revenueChartData}
              xField="date"
              yField="revenue"
              label={{
                position: 'middle',
                style: { fill: '#FFFFFF', opacity: 0.6 },
              }}
              xAxis={{ label: { autoHide: true, autoRotate: false } }}
              meta={{
                date: { alias: 'Thời gian' },
                revenue: {
                  alias: 'Doanh thu',
                  formatter: (v) => `₫${v.toLocaleString()}`,
                },
              }}
              tooltip={{
                formatter: (datum) => ({
                  name: 'Doanh thu',
                  value: `₫${datum.revenue.toLocaleString()}`,
                }),
              }}
              height={300}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Tỷ lệ doanh thu theo trạng thái">
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
                <Tooltip formatter={(value, name, props) => [`₫${value.toLocaleString()}`, props.payload.type]} />
                <Legend
                  payload={pieChartData.map((item, index) => ({
                    value: item.type,
                    type: 'circle',
                    id: item.type,
                    color: COLORS[index % COLORS.length],
                  }))}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Ghi chú">
            <ul>
              <li>Chỉ các booking có trạng thái PAID, COMPLETED, IN_PROGRESS được tính doanh thu.</li>
              <li>Nếu trạng thái PAID bị hủy, doanh thu sẽ được trừ (giả định hoàn tiền).</li>
              <li>Doanh thu được tính dựa trên số tiền đã thanh toán thực tế.</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderReport;