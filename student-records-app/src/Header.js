import React, { useEffect, useState } from 'react';
import "./frontend/header.css";

function HeaderLoader() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/header.html') //Fetch header.html from public folder
      .then(response => {
        if (!response.ok) throw new Error('Failed to load header');
        return response.text();
      })
      .then(data => setContent(data))
      .catch(error => console.error('Error loading header:', error));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

export default HeaderLoader;
