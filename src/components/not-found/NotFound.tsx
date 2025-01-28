import React from 'react';
import './NotFound.css';
import notFound from '../../assets/404.png';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-container">
      <img src={notFound} alt="Not Found" className="not-found-image" />
    </div>
  );
};

export default NotFound;
