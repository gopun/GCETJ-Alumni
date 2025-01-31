import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import './Carousel.css';

// Carousel Component
const Carousel: React.FC = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // Enables autoplay
    autoplaySpeed: 3000, // 3 seconds per slide
    accessibility: true, // Enables keyboard navigation (this might help avoid some issues)
    focusOnSelect: true, // Ensures focus stays within the visible slide
    pauseOnHover: true, // Pauses the carousel on hover to prevent focus issues during auto-scroll
    // beforeChange: (current: number, next: number) => {
    // },
  };

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Dynamically import all images from the assets folder
    const imagesGlob = import.meta.glob<{ default: string }>(
      '../../assets/images/departments/*.{png,jpg,jpeg,svg}',
    );
    const loadImages = async () => {
      const imagePaths = await Promise.all(
        Object.keys(imagesGlob).map(async (key) => {
          const mod = await imagesGlob[key]();
          return mod.default;
        }),
      );
      setImages(imagePaths);
    };

    loadImages();
  }, []);

  return (
    <div className="slider-corousel">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index}>
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="slider-image"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
