import React from 'react';
import Carousel from '../../components/carousel/Carousel';
import objectiveImg from '../../assets/images/objectives.jpg';
import './Home.css';
import NewsUpdate from '../news-update/NewsUpdate';

const Home: React.FC = () => {
  const news = ['To be updated soon'];
  return (
    <>
      <div className="news-update">
        <NewsUpdate news={news} />
      </div>
      <Carousel />
      <div className="objective-div">
        <img src={objectiveImg} alt="Objectives" className="objective-img" />
      </div>
    </>
  );
};

export default Home;
