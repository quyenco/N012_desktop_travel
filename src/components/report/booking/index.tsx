import React, {useState, useEffect} from 'react';
import {Card, Row, Col, Typography, Table, Button, DatePicker, Select, Statistic, Tag} from 'antd';
import {Bar, Column} from '@ant-design/charts';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import {PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import {DownloadOutlined, ReloadOutlined} from '@ant-design/icons';
import {
  getBookingByDate,
  getBookingTotalRevenue,
  getBookingTotalCancel,
  getBookingCountByStatus,
  getTopTourBookings,
  getTopTourBookingsRevenue,
} from '../../../api/report'; // Giả định các API tương tự từ BookingReport
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {FilePdfOutlined} from '@ant-design/icons';

const {Title} = Typography;
const {RangePicker} = DatePicker;
const {Option} = Select;
dayjs.extend(quarterOfYear);

const COLORS = ['#52c41a', '#fa8c16', '#722ed1']; // Màu cho COMPLETED, PAID, IN_PROGRESS

const OrderReport = () => {
  const [statusFilter, setStatusFilter] = useState(['PAID', 'COMPLETED', 'IN_PROGRESS']); // Chỉ tính trạng thái có doanh thu
  const [orderData, setOrderData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgRevenuePerOrder: 0,
    totalCancelled: 0,
    cancelPercentage: 0,
  });
  const [dateRange, setDateRange] = useState([dayjs().subtract(4, 'day'), dayjs()]);
  const [timeMode, setTimeMode] = useState('day');

  // Hàm lấy dữ liệu từ API
  useEffect(() => {
    if (dateRange.length === 2) {
      const [startDate, endDate] = dateRange.map((date) => date.format('YYYY-MM-DD'));

      // Lấy tổng doanh thu
      getBookingTotalRevenue(startDate, endDate, statusFilter)
        .then((totalRevenue) => {
          setStats((prev) => ({...prev, totalRevenue}));

          // Lấy số đơn có doanh thu (PAID, COMPLETED, IN_PROGRESS)
          getBookingCountByStatus(startDate, endDate, statusFilter)
            .then((totalOrders) => {
              const avgRevenuePerOrder = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;
              setStats((prev) => ({...prev, totalOrders, avgRevenuePerOrder}));

              // Lấy số đơn hủy
              getBookingTotalCancel(startDate, endDate)
                .then((totalCancelled) => {
                  const cancelPercentage =
                    totalOrders > 0 ? ((totalCancelled / (totalOrders + totalCancelled)) * 100).toFixed(1) : 0;
                  setStats((prev) => ({...prev, totalCancelled, cancelPercentage}));
                })
                .catch(console.error);
            })
            .catch(console.error);
        })
        .catch(console.error);

      // Lấy danh sách đơn đặt
      getBookingByDate(startDate, endDate, statusFilter).then(setOrderData).catch(console.error);
    }
  }, [dateRange, statusFilter]);

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

  // Lấy top tour và doanh thu theo tour
  const [tourRevenueData, setTourRevenueData] = useState([]);
  useEffect(() => {
    const [startDate, endDate] = dateRange.map((date) => date.format('YYYY-MM-DD'));

    getTopTourBookingsRevenue(startDate, endDate)
      .then((data) => {
        const tourData = data.map((tour, index) => {
          console.log('tour doanh thu:', tour);
          const totalBookings = tour.totalBookings;
          const totalRevenue = tour.totalRevenue;
          const totalCancelled = tour.totalCancelled;
          const avgRevenuePerBooking = tour.avgRevenuePerBooking;

          return {
            key: index + 1, // Assuming each tour has a unique tourId
            tourName: tour.tourName,
            totalBookings,
            totalCancelled,
            totalRevenue,
            avgRevenuePerBooking,
          };
        });

        setTourRevenueData(tourData);
      })
      .catch(console.error);
  }, [dateRange]);

  // Dữ liệu biểu đồ cột (doanh thu theo tháng/quý)
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

  // Dữ liệu biểu đồ tròn (tỷ lệ doanh thu theo trạng thái)
  const pieChartData = [
    {
      type: 'Hoàn thành',
      value: orderData
        .filter((order) => order.status === 'COMPLETED')
        .reduce((sum, order) => sum + order.totalPrice, 0),
    },
    {
      type: 'Đã thanh toán',
      value: orderData.filter((order) => order.status === 'PAID').reduce((sum, order) => sum + order.totalPrice, 0),
    },
    {
      type: 'Đang diễn ra',
      value: orderData
        .filter((order) => order.status === 'IN_PROGRESS')
        .reduce((sum, order) => sum + order.totalPrice, 0),
    },
  ].filter((entry) => entry.value > 0);

  // Cột bảng doanh thu theo tour
  const columns = [
    {title: 'STT', dataIndex: 'key', key: 'key'},
    {title: 'Tên tour', dataIndex: 'tourName', key: 'tourName'},
    {title: 'Số lượt đặt', dataIndex: 'totalBookings', key: 'totalBookings'},
    {title: 'Số hủy', dataIndex: 'totalCancelled', key: 'totalCancelled'},
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (revenue) => `₫${revenue.toLocaleString()}`,
    },
    {
      title: 'Doanh thu TB/đơn',
      dataIndex: 'avgRevenuePerBooking',
      key: 'avgRevenuePerBooking',
      render: (revenue) => `₫${parseFloat(revenue).toLocaleString()}`,
    },
    // {
    //   title: 'Trạng thái phổ biến',
    //   dataIndex: 'mostCommonStatus',
    //   key: 'mostCommonStatus',
    //   render: (status) => (
    //     <Tag
    //       color={status === 'COMPLETED' ? 'green' : status === 'PAID' ? 'gold' : 'purple'}
    //       style={{ fontWeight: 'bold' }}
    //     >
    //       {status === 'COMPLETED' ? 'Hoàn thành' : status === 'PAID' ? 'Đã thanh toán' : 'Đang diễn ra'}
    //     </Tag>
    //   ),
    // },
    // {
    //   title: 'Hành động',
    //   key: 'action',
    //   render: (_, record) => (
    //     <a href={`/bookings?tour=${record.tourName}`}>Chi tiết</a>
    //   ),
    // },
  ];

  //xuất báo cáo
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Set font to support Unicode (Vietnamese characters)
    doc.setFont('helvetica'); // You may need to add a custom font for Vietnamese support
    doc.setFontSize(14);

    // Title
    doc.text('🧾 BÁO CÁO DOANH THU TOUR DU LỊCH', pageWidth / 2, 15, {align: 'center'});

    // General Information
    doc.setFontSize(12);
    doc.text('📅 Thông tin chung:', 14, 30);
    doc.setFontSize(10);
    const startDate = dateRange[0]?.format('DD/MM/YYYY') || 'N/A';
    const endDate = dateRange[1]?.format('DD/MM/YYYY') || 'N/A';
    const reportDate = dayjs().format('DD/MM/YYYY');
    const timeModeText = {
      day: 'Theo ngày',
      month: 'Theo tháng',
      quarter: `Theo quý – Quý ${dateRange[0]?.quarter()} năm ${dateRange[0]?.year()}`,
      year: 'Theo năm',
    }[timeMode];

    doc.text(`Khoảng thời gian báo cáo: Từ ${startDate} đến ${endDate}`, 14, 40);
    doc.text(`Chế độ lọc: ${timeModeText}`, 14, 50);
    doc.text(`Ngày tạo báo cáo: ${reportDate}`, 14, 60);

    // Detailed Revenue by Tour
    doc.setFontSize(12);
    doc.text('📊 Chi tiết doanh thu theo tour:', 14, 80);

    const tableData = tourRevenueData.map((tour, index) => [
      index + 1,
      tour.tourName,
      tour.totalBookings,
      tour.totalCancelled,
      `₫${tour.totalRevenue.toLocaleString()}`,
    ]);

    // Add total row
    const totalBookings = tourRevenueData.reduce((sum, tour) => sum + tour.totalBookings, 0);
    const totalCancelled = tourRevenueData.reduce((sum, tour) => sum + tour.totalCancelled, 0);
    const totalRevenue = tourRevenueData.reduce((sum, tour) => sum + tour.totalRevenue, 0);
    tableData.push(['Tổng cộng', '', totalBookings, totalCancelled, `₫${totalRevenue.toLocaleString()}`]);

    autoTable(doc, {
      startY: 90,
      head: [['STT', 'Tên tour', 'Số lượt đặt', 'Số lượt hủy', 'Doanh thu (₫)']],
      body: tableData,
      theme: 'grid',
      styles: {fontSize: 10, cellPadding: 2},
      headStyles: {fillColor: [22, 160, 133], textColor: [255, 255, 255]},
      columnStyles: {
        0: {cellWidth: 15},
        1: {cellWidth: 80},
        2: {cellWidth: 30},
        3: {cellWidth: 30},
        4: {cellWidth: 45},
      },
    });

    // Summary
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('📌 Tóm tắt:', 14, finalY);
    doc.setFontSize(10);

    const cancelPercentage = stats.cancelPercentage || 0;
    const topRevenueTour = tourRevenueData.reduce((max, tour) => (tour.totalRevenue > max.totalRevenue ? tour : max), {
      totalRevenue: 0,
      tourName: 'N/A',
    });
    const topBookingTour = tourRevenueData.reduce(
      (max, tour) => (tour.totalBookings > max.totalBookings ? tour : max),
      {totalBookings: 0, tourName: 'N/A'}
    );

    doc.text(`Tỷ lệ hủy tour: ${cancelPercentage}%`, 14, finalY + 10);
    doc.text(`Tour có doanh thu cao nhất: ${topRevenueTour.tourName}`, 14, finalY + 20);
    doc.text(`Tour có lượt đặt nhiều nhất: ${topBookingTour.tourName}`, 14, finalY + 30);
    doc.text(`Tổng doanh thu: ₫${totalRevenue.toLocaleString()}`, 14, finalY + 40);

    // Reporter Information
    doc.setFontSize(12);
    doc.text('👤 Người lập báo cáo:', 14, finalY + 60);
    doc.setFontSize(10);
    doc.text('Nguyễn Văn A', 14, finalY + 70);
    doc.text('Phòng Kinh Doanh – Công ty Du lịch ABC', 14, finalY + 80);

    // Save the PDF
    // doc.save(`BaoCaoDoanhThu_${reportDate.replace(/\//g, "-")}.pdf`);
    try {
      const pdfData = doc.output('arraybuffer');
      fs.writeFileSync(filePath, Buffer.from(pdfData));
      console.log(`PDF saved to ${filePath}`);
    } catch (error) {
      console.error('Error saving PDF:', error);
      // Optionally show an error message to the user
      // You can use antd's message component or Electron's dialog
      // Example: message.error('Lỗi khi lưu file PDF!');
    }
  };
  //hỗ trợ xuất báo cáo

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
    <div style={{backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '10px'}}>
      <Title level={2} style={{textAlign: 'center', marginBottom: '20px'}}>
        Báo cáo Doanh thu
      </Title>

      <Row gutter={8}>
        <Col span={7}>
          <Card title="Lọc theo" style={{height: '100%'}}>
            <div style={{marginBottom: 16}}>
              <span>Chọn thời gian</span>
              <Select style={{width: '100%'}} value={timeMode} onChange={(value) => setTimeMode(value)}>
                <Option value="day">Theo ngày</Option>
                <Option value="month">Theo tháng</Option>
                <Option value="quarter">Theo quý</Option>
                <Option value="year">Theo năm</Option>
              </Select>
              {timeMode === 'day' && (
                <RangePicker
                  style={{width: '100%', marginTop: 10}}
                  value={dateRange}
                  format="DD-MM-YYYY"
                  onChange={(dates) => setDateRange(dates || [dayjs(), dayjs()])}
                />
              )}
              {timeMode === 'month' && (
                <div style={{display: 'flex', gap: 8, marginTop: 10}}>
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
                <div style={{display: 'flex', gap: 8, marginTop: 10}}>
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
                <div style={{display: 'flex', gap: 8, marginTop: 10}}>
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
            <Button icon={<FilePdfOutlined />} onClick={exportToPDF} type="primary" danger>
              Xuất PDF
            </Button>
          </Card>
        </Col>

        <Col span={17}>
          <Card title="Tổng quan" style={{marginBottom: '20px'}}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Tổng doanh thu"
                  value={stats.totalRevenue}
                  valueStyle={{color: '#1890ff'}}
                  prefix="₫"
                  formatter={(value) => value.toLocaleString()}
                />
              </Col>
              <Col span={6}>
                <Statistic title="Tổng số đơn" value={stats.totalOrders} valueStyle={{color: '#3f8600'}} />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Doanh thu TB/đơn"
                  value={stats.avgRevenuePerOrder}
                  valueStyle={{color: '#fa8c16'}}
                  // prefix="₫"
                  formatter={(value) => `₫${Number(value).toLocaleString()}`}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Tỷ lệ hủy"
                  value={stats.cancelPercentage}
                  valueStyle={{color: '#ff4d4f'}}
                  suffix="%"
                />
              </Col>
            </Row>
          </Card>

          <Card title="Doanh thu theo tour">
            <Table
              columns={columns}
              dataSource={tourRevenueData}
              rowKey="key"
              pagination={false}
              size="small"
              scroll={{y: 400}}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ cột */}
      <Row gutter={16} style={{marginTop: 20}}>
        <Col span={24}>
          <Card title="Doanh thu theo thời gian">
            <Column
              data={revenueChartData}
              xField="date"
              yField="revenue"
              label={{
                position: 'middle',
                style: {fill: '#FFFFFF', opacity: 0.6},
              }}
              xAxis={{label: {autoHide: true, autoRotate: false}}}
              meta={{
                date: {alias: 'Thời gian'},
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

      {/* Biểu đồ tròn */}
      <Row gutter={16} style={{marginTop: 20}}>
        <Col span={24}>
          <Card title="Tỷ lệ doanh thu theo trạng thái">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({percent, type}) => `${type}: ${(percent * 100).toFixed(1)}%`}
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
                    value: item.type, // Hiển thị tên đúng
                    type: 'circle', // Kiểu hình trong chú thích (có thể là 'line', 'circle', 'square')
                    id: item.type,
                    color: COLORS[index % COLORS.length], // Màu đúng theo biểu đồ
                  }))}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Ghi chú */}
      <Row style={{marginTop: 20}}>
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
