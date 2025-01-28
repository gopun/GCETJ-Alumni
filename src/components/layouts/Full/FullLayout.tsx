import React from 'react';
import { Outlet } from 'react-router-dom';
import './FullLayout.css';
import Header from '../../header/Header';
import Footer from '../../footer/Footer';

const FullLayout: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Ensures the outer container takes full screen height
      }}
    >
      <Header />
      <main
        style={{
          flex: '1 0 auto', // Make the main section grow to fill remaining space
          marginTop: '80px', // Height of the header (adjust if needed)
          marginBottom: '50px', // Height of the footer (adjust if needed)
          padding: '20px',
          overflowY: 'auto', // Allows scrolling if the content overflows
          boxSizing: 'border-box', // Ensures padding doesn't cause overflow
        }}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default FullLayout;
