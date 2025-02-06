import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

function HeaderLoader() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/header.html') // Path to header file
      .then(response => response.text())
      .then(data => setContent(data))
      .catch(error => console.error('Error loading header:', error));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

const header = ReactDOM.createRoot(document.getElementById('header'));
header.render(
  <React.StrictMode>
    <HeaderLoader />
  </React.StrictMode>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
