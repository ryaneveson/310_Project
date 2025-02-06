import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import HeaderLoader from './Header'; // Import HeaderLoader
import FooterLoader from './Footer'; // Import FooterLoader

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
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

