import React, { useEffect, useState } from 'react'


const Carousel = ({ imageList = [], autoPlay = 5 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
  
    useEffect(() => {
      if (autoPlay > 0) {
        const interval = setInterval(() => {
          setCurrentIndex((prevIndex) =>
            prevIndex === imageList.length - 1 ? 0 : prevIndex + 1
          );
        }, autoPlay * 1000);
        return () => clearInterval(interval);
      }
    }, [autoPlay, imageList.length]);
  
    const handlePrevious = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? imageList.length - 1 : prevIndex - 1
      );
    };
  
    const handleNext = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === imageList.length - 1 ? 0 : prevIndex + 1
      );
    };
  
    return (
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Carousel Images */}
        <div className="overflow-hidden ">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {imageList.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full object-cover"
              />
            ))}
          </div>
        </div>
  
        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-700 text-white p-2 shadow-md hover:bg-gray-800 focus:outline-none"
        >
          {'<'}
        </button>
        <button
          onClick={handleNext}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-700 text-white p-2 shadow-md hover:bg-gray-800 focus:outline-none"
        >
          {">"}
        </button>
  
        {/* Dots for navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {imageList.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full ${
                currentIndex === index ? "bg-gray-700" : "bg-gray-400"
              }`}
            ></button>
          ))}
        </div>
      </div>
    );
  };

export default Carousel;