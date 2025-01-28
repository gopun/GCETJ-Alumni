import React from 'react';
import { Outlet } from 'react-router-dom';
import './BlankLayout.css';

const BlankLayout: React.FC = () => {
  return (
    <div className="layout-parent">
      <div className="background"></div> {/* Background image with blur */}
      <div className="layout-main">
        <Outlet /> {/* Your scrollable content, like the login form */}
      </div>
    </div>
  );
};

export default BlankLayout;
