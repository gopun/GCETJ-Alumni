import React from 'react';
import './NewsUpdate.css'; // Import CSS for styling

interface NewsUpdateProps {
  news: string[];
}

const NewsUpdate: React.FC<NewsUpdateProps> = ({ news }) => {
  return (
    <div className="news-top-container">
      <span className="highlights">News Highlights:</span>
      <div className="news-container">
        <div className="news-marquee">
          {news.map((item, index) => (
            <span key={index} className="news-item">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsUpdate;
