import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Button, Modal, List, Typography } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { getTopTourBookings } from '../../../api/report';
import { BarChartOutlined } from '@ant-design/icons';

dayjs.extend(quarterOfYear);

const COLORS = [
  '#1890ff',
  '#f5222d',
  '#52c41a',
  '#fa8c16',
  '#722ed1',
  '#eb2f96',
  '#13c2c2',
  '#faad14',
  '#2f54eb',
  '#fadb14',
];

const TopToursLineChart = ({ dateRange, timeMode }) => {
  const [topTourData, setTopTourData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Lấy top 10 tour được đặt nhiều
  useEffect(() => {
    if (dateRange.length === 2) {
      const [startDate, endDate] = dateRange.map((date) => date.format('YYYY-MM-DD'));
      getTopTourBookings(startDate, endDate)
        .then((data) => {
          const validData = data.filter(
            (tour) => tour.tourName && Array.isArray(tour.bookingData) && tour.bookingData.length > 0
          );
          if (validData.length === 0) {
            console.warn('No valid top tour data received');
          }
          console.log('Top Tour Data:', validData);
          setTopTourData(validData);
        })
        .catch((error) => console.error('Error fetching top tour data:', error));
    }
  }, [dateRange]);

  // Định nghĩa colorMap
  const colorMap = {};
  topTourData.forEach((tour, index) => {
    if (tour.tourName) {
      colorMap[tour.tourName] = COLORS[index % COLORS.length];
    }
  });

  // Xử lý dữ liệu top tour
  const lineChartData = topTourData
    .map((tour) => {
      if (!tour.tourName || !Array.isArray(tour.bookingData)) {
        console.warn(`Invalid tour data for tour: ${tour.tourName}`);
        return null;
      }

      const [startDate, endDate] = dateRange.map((date) => date.format('YYYY-MM-DD'));
      const validBookingData = tour.bookingData
        .map((booking) => {
          if (!booking.bookingDate || booking.totalPeople === undefined || isNaN(booking.totalPeople)) {
            console.warn(`Invalid booking data for tour ${tour.tourName}:`, booking);
            return null;
          }
          const bookingDate = dayjs(booking.bookingDate).format('YYYY-MM-DD');
          if (dayjs(bookingDate).isBefore(startDate) || dayjs(bookingDate).isAfter(endDate)) {
            return null;
          }
          return {
            date: bookingDate,
            count: Number(booking.totalPeople),
          };
        })
        .filter((item) => item !== null);

      if (validBookingData.length === 0) {
        console.warn(`No valid booking data for tour ${tour.tourName} within dateRange`);
        return null;
      }

      return {
        tourName: tour.tourName,
        data: validBookingData.sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1)),
      };
    })
    .filter((tour) => tour !== null);

  // Hàm formatChartData cho Recharts
  const formatChartData = (lineChartData, dateRange, timeMode) => {
    if (!Array.isArray(lineChartData) || lineChartData.length === 0) {
      console.warn('No valid data for line chart');
      return [];
    }

    if (!dateRange || dateRange.length !== 2 || !dateRange[0] || !dateRange[1]) {
      console.warn('Invalid dateRange:', dateRange);
      return [];
    }

    const [startDate, endDate] = dateRange.map((date) => date.format('YYYY-MM-DD'));
    const allTimePoints = [];
    let currentDate = dayjs(startDate);
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      if (timeMode === 'day') {
        allTimePoints.push(currentDate.format('DD-MM-YYYY'));
        currentDate = currentDate.add(1, 'day');
      } else if (timeMode === 'month') {
        allTimePoints.push(currentDate.format('MM-YYYY'));
        currentDate = currentDate.add(1, 'month').startOf('month');
      } else if (timeMode === 'quarter') {
        allTimePoints.push(`${currentDate.year()}-Q${currentDate.quarter()}`);
        currentDate = currentDate.add(1, 'quarter').startOf('quarter');
      } else if (timeMode === 'year') {
        allTimePoints.push(currentDate.format('YYYY'));
        currentDate = currentDate.add(1, 'year').startOf('year');
      }
    }

    const dataMap = {};
    lineChartData.forEach((tour) => {
      const { tourName, data: bookingData } = tour;
      if (!tourName || !Array.isArray(bookingData)) {
        console.warn(`Invalid tour data: ${tourName}`);
        return;
      }

      bookingData.forEach((booking) => {
        if (!booking.date || booking.count === undefined || isNaN(booking.count)) {
          console.warn(`Invalid booking data for tour ${tourName}:`, booking);
          return;
        }

        let formattedTime;
        if (timeMode === 'day') {
          formattedTime = dayjs(booking.date).format('DD-MM-YYYY');
        } else if (timeMode === 'month') {
          formattedTime = dayjs(booking.date).format('MM-YYYY');
        } else if (timeMode === 'quarter') {
          formattedTime = `${dayjs(booking.date).year()}-Q${dayjs(booking.date).quarter()}`;
        } else if (timeMode === 'year') {
          formattedTime = dayjs(booking.date).format('YYYY');
        }

        if (!dataMap[formattedTime]) {
          dataMap[formattedTime] = { date: formattedTime };
        }
        dataMap[formattedTime][tourName] = (dataMap[formattedTime][tourName] || 0) + booking.count;
      });
    });

    const formattedData = allTimePoints.map((timePoint) => {
      const dataPoint = { date: timePoint };
      lineChartData.forEach((tour) => {
        dataPoint[tour.tourName] = Number(dataMap[timePoint]?.[tour.tourName] ?? 0);
      });
      return dataPoint;
    });

    const hasValidData = formattedData.some((dataPoint) =>
      Object.keys(dataPoint).some((key) => key !== 'date' && dataPoint[key] > 0)
    );
    if (!hasValidData) {
      console.warn('No valid non-zero data in formattedData');
    } else {
      console.log('Valid data found in formattedData:', formattedData);
    }

    return formattedData;
  };

  // Tính toán chartData cho Recharts
  const chartData = formatChartData(lineChartData, dateRange, timeMode);

  // Hàm phân tích dữ liệu để đưa ra gợi ý tổng quát
  const getRecommendations = () => {
    if (!lineChartData || lineChartData.length === 0) {
      return [
        {
          title: 'Không đủ dữ liệu',
          description: 'Không có dữ liệu tour để phân tích. Vui lòng chọn khoảng thời gian dài hơn hoặc kiểm tra API.',
        },
      ];
    }

    const recommendations = [];
    const totalPeopleByTour = lineChartData.map((tour) => {
      const totalPeople = tour.data.reduce((sum, booking) => sum + (Number(booking.count) || 0), 0);
      return { tourName: tour.tourName, totalPeople, data: tour.data };
    });

    // Sắp xếp để xác định top tour
    const sortedTours = [...totalPeopleByTour].sort((a, b) => b.totalPeople - a.totalPeople);
    const totalAllTours = totalPeopleByTour.reduce((sum, tour) => sum + tour.totalPeople, 0);
    const avgPeoplePerTour = totalAllTours / (totalPeopleByTour.length || 1);

    // 1. Tour cần quảng cáo (ít người đặt)
    const lowThreshold = Math.max(10, avgPeoplePerTour * 0.2); // Ngưỡng động: 10 hoặc 20% trung bình
    totalPeopleByTour.forEach((tour) => {
      if (tour.totalPeople < lowThreshold) {
        recommendations.push({
          title: `Tour "${tour.tourName}" cần quảng cáo`,
          description: `Chỉ có ${tour.totalPeople} người đặt, thấp hơn mức trung bình (${Math.round(avgPeoplePerTour)}). Tăng cường quảng cáo trên mạng xã hội, SEO, hoặc hợp tác với influencer.`,
        });
      }
    });

    // 2. Tour cần thúc đẩy (xu hướng giảm)
    lineChartData.forEach((tour) => {
      const bookings = tour.data;
      if (bookings.length >= 3) {
        const counts = bookings.map((b) => b.count);
        const isDecreasing = counts.every((count, index) => index === 0 || count <= counts[index - 1]);
        if (isDecreasing) {
          recommendations.push({
            title: `Tour "${tour.tourName}" cần thúc đẩy`,
            description: `Số lượng đặt giảm dần (${counts.join(' -> ')} người). Xem xét chương trình khuyến mãi, giảm giá theo nhóm, hoặc cải thiện nội dung tour (thêm hoạt động độc đáo).`,
          });
        }
      }
    });

    // 3. Tour hiệu quả cao (top 3 và ổn định/tăng)
    sortedTours.slice(0, 3).forEach((tour) => {
      const bookings = tour.data;
      if (bookings.length >= 3) {
        const counts = bookings.map((b) => b.count);
        const isStableOrIncreasing = counts.every((count, index) => index === 0 || count >= counts[index - 1] * 0.8);
        if (isStableOrIncreasing) {
          recommendations.push({
            title: `Tour "${tour.tourName}" hiệu quả cao`,
            description: `Tour có ${tour.totalPeople} người đặt, thuộc top tour với xu hướng ổn định/tăng (${counts.join(' -> ')} người). Tăng cường khai thác bằng cách thêm lịch trình hoặc nhắm đến khách hàng cao cấp.`,
          });
        }
      } else if (tour.totalPeople > avgPeoplePerTour) {
        recommendations.push({
          title: `Tour "${tour.tourName}" hiệu quả cao`,
          description: `Tour có ${tour.totalPeople} người đặt, vượt mức trung bình (${Math.round(avgPeoplePerTour)}). Cân nhắc mở rộng quy mô hoặc tạo các biến thể tour mới.`,
        });
      }
    });

    // 4. Tối ưu hóa lịch trình tour
    lineChartData.forEach((tour) => {
      const bookings = tour.data;
      const dates = bookings.map((b) => dayjs(b.date));
      const isLowOnWeekdays =
        bookings.length > 0 &&
        dates.every((date) => date.day() >= 1 && date.day() <= 5); // Chỉ đặt vào thứ 2-6
      if (isLowOnWeekdays) {
        recommendations.push({
          title: `Tối ưu lịch trình tour "${tour.tourName}"`,
          description: `Tour chủ yếu được đặt vào ngày thường (${bookings.length} booking). Thử nghiệm lịch trình cuối tuần hoặc tour ngắn ngày để thu hút khách đi cuối tuần.`,
        });
      }
    });

    // 5. Phân tích mùa vụ
    const allDates = lineChartData.flatMap((tour) =>
      tour.data.map((booking) => ({ date: dayjs(booking.date), count: booking.count }))
    );
    if (allDates.length > 0) {
      const byMonth = allDates.reduce((acc, { date, count }) => {
        const month = date.format('MM');
        acc[month] = (acc[month] || 0) + count;
        return acc;
      }, {});
      const sortedMonths = Object.entries(byMonth).sort((a, b) => b[1] - a[1]);
      if (sortedMonths.length > 0) {
        const topMonth = sortedMonths[0][0];
        const lowMonth = sortedMonths[sortedMonths.length - 1][0];
        recommendations.push({
          title: 'Phân tích mùa vụ',
          description: `Tháng ${topMonth} có nhiều booking nhất (${byMonth[topMonth]} người). Tăng cường quảng cáo trước tháng này. Tháng ${lowMonth} thấp điểm (${byMonth[lowMonth]} người), cân nhắc khuyến mãi hoặc tour đặc biệt.`,
        });
      }
    }

    // 6. Chiến lược giá cả
    const highBookingThreshold = avgPeoplePerTour * 1.5;
    const lowBookingTours = totalPeopleByTour.filter((tour) => tour.totalPeople < avgPeoplePerTour);
    if (lowBookingTours.length > 0) {
      recommendations.push({
        title: 'Điều chỉnh chiến lược giá cả',
        description: `Có ${lowBookingTours.length} tour dưới mức trung bình (${Math.round(avgPeoplePerTour)} người), như ${lowBookingTours[0]?.tourName}. Thử nghiệm giảm giá tạm thời, tạo gói combo, hoặc ưu đãi cho nhóm lớn để tăng booking.`,
      });
    }

    // 7. Mở rộng đối tượng khách hàng
    if (sortedTours[0]?.totalPeople > totalAllTours * 0.5) {
      recommendations.push({
        title: 'Mở rộng đối tượng khách hàng',
        description: `Tour "${sortedTours[0].tourName}" chiếm phần lớn booking (${sortedTours[0].totalPeople}/${totalAllTours} người). Thiết kế các phiên bản tour dành cho gia đình, khách quốc tế, hoặc khách trẻ để đa dạng hóa thị trường.`,
      });
    }

    // 8. Tăng cường kênh phân phối
    if (totalAllTours < 50) { // Ngưỡng thấp cho tất cả tour
      recommendations.push({
        title: 'Tăng cường kênh phân phối',
        description: `Tổng cộng chỉ có ${totalAllTours} người đặt, khá thấp. Hợp tác với các nền tảng OTA (Agoda, Booking.com), đẩy mạnh bán hàng qua TikTok/Instagram, hoặc tạo chương trình giới thiệu khách hàng.`,
      });
    }

    // 9. Phân tích cạnh tranh
    const decliningTours = lineChartData.filter((tour) => {
      const bookings = tour.data;
      if (bookings.length < 3) return false;
      const counts = bookings.map((b) => b.count);
      return counts.every((count, index) => index === 0 || count <= counts[index - 1]);
    });
    if (decliningTours.length > 1) {
      recommendations.push({
        title: 'Phân tích cạnh tranh',
        description: `Có ${decliningTours.length} tour (như ${decliningTours[0]?.tourName}) đang giảm booking. Nghiên cứu các tour tương tự từ đối thủ, cải thiện điểm khác biệt như độc quyền điểm đến hoặc trải nghiệm đặc biệt.`,
      });
    }

    // 10. Tăng cường dữ liệu và phân tích
    if (lineChartData.length < 5 || totalAllTours < 20) {
      recommendations.push({
        title: 'Tăng cường dữ liệu và phân tích',
        description: `Dữ liệu hiện tại (${lineChartData.length} tour, ${totalAllTours} booking) chưa đủ để đưa ra quyết định chính xác. Thu thập thêm phản hồi khách hàng qua khảo sát hoặc kéo dài thời gian phân tích để có cái nhìn toàn diện.`,
      });
    }

    // Nếu không có gợi ý nào
    if (recommendations.length === 0) {
      recommendations.push({
        title: 'Không có gợi ý cụ thể',
        description: 'Dữ liệu hiện tại ổn định nhưng chưa đủ chi tiết. Cân nhắc phân tích thêm dữ liệu khách hàng hoặc so sánh với đối thủ.',
      });
    }

    return recommendations;
  };

  // Xử lý hiển thị modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card
            title="Top 10 Tour được đặt nhiều"
            extra={
              <Button type="primary" icon={<BarChartOutlined />} onClick={showModal}>
                Xem gợi ý chiến lược
              </Button>
            }
          >
            {chartData.length === 0 || lineChartData.length === 0 ? (
              <div>Không có dữ liệu để hiển thị</div>
            ) : (
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(text) => {
                        if (timeMode === 'day') return text;
                        if (timeMode === 'month') return `Tháng ${text.split('-')[0]}/${text.split('-')[1]}`;
                        if (timeMode === 'quarter') return `Quý ${text.split('-Q')[1]} ${text.split('-Q')[0]}`;
                        if (timeMode === 'year') return text;
                        return text;
                      }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      label={{ value: 'Số người', angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => `${value} người`}
                    />
                    <Tooltip
                      formatter={(value, name) => [`${value} người`, name]}
                      labelFormatter={(label) => {
                        if (timeMode === 'day') return label;
                        if (timeMode === 'month') return `Tháng ${label.split('-')[0]}/${label.split('-')[1]}`;
                        if (timeMode === 'quarter') return `Quý ${label.split('-Q')[1]} ${label.split('-Q')[0]}`;
                        if (timeMode === 'year') return label;
                        return label;
                      }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    {lineChartData.map((tour) => (
                      <Line
                        key={tour.tourName}
                        type="monotone"
                        dataKey={tour.tourName}
                        stroke={colorMap[tour.tourName] || '#888888'}
                        strokeWidth={2}
                        dot={{ r: 5 }}
                        name={tour.tourName}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Gợi ý chiến lược tối ưu hóa tour"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        <List
          dataSource={getRecommendations()}
          renderItem={(item) => (
            <List.Item style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
              <List.Item.Meta
                title={<Typography.Text strong style={{ color: '#1890ff' }}>{item.title}</Typography.Text>}
                description={<Typography.Text>{item.description}</Typography.Text>}
              />
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default TopToursLineChart;