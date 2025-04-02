import React from 'react';
import ubcoImage from '../frontend/img/UBCO2.jpg';
import '../frontend/pageBackgroundStyles.css';

const PageBackground = ({ children }) => {
  return (
    <div className="page-container">
      <div className="page-background">
        <img src={ubcoImage} alt="UBCO Campus" />
      </div>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageBackground; 