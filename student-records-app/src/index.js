import React from 'react';
import ReactDOM from 'react-dom/client';
import './frontend/index.css';
import App from './App';
import HeaderLoader from './Header'; 
import FooterLoader from './Footer'; 

import reportWebVitals from './reportWebVitals';

// Render the header inside the #header div
const headerElement = document.getElementById('header');
if (headerElement) {
  const headerRoot = ReactDOM.createRoot(headerElement);
  headerRoot.render(
    <React.StrictMode>
      <HeaderLoader />
    </React.StrictMode>
  );
}
// Render the header inside the #header div
const footerElement = document.getElementById('footer');
if (footerElement) {
  const footerRoot = ReactDOM.createRoot(footerElement);
  footerRoot.render(
    <React.StrictMode>
      <FooterLoader />
    </React.StrictMode>
  );
}

//render the main root App
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

