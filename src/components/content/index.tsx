import React, { useEffect, useState } from 'react';
import hinh1 from '../../assets/images/tour.jpg'
import hinh2 from '../../assets/images/tour2.png'
import hinh3 from '../../assets/images/tour3.jpg'

const sliderImages = [hinh1,hinh2,hinh3];

const Content: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
    }, 5000); // chuyển ảnh mỗi 3s

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div>
      <div className="overflow-hidden w-full h-64 rounded-lg shadow-lg relative h-[300px]">
        <div
          className="flex transition-transform duration-1000"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {sliderImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Slide ${index}`}
              className="w-full flex-shrink-0 h-64 object-cover h-[300px]"
            />
          ))}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
              {sliderImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    currentIndex === index ? 'bg-white' : 'bg-gray-400'
                  }`}
                ></div>
              ))}
            </div>
        </div>
      </div>
      <br></br>
      <h1 className="text-3xl font-bold mb-4 text-center" >Chào mừng đến với du lịch TADA</h1>

    </div>
  );
};

export default Content;
