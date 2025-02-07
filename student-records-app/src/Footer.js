import React, { useEffect, useState } from 'react';
import "./footer.css";

function FooterLoader() {
  const [content, setContent] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetch('/footer.html')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load footer');
        return response.text();
      })
      .then(data => setContent(data))
      .catch(error => console.error('Error loading footer:', error));

    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;
      setIsVisible(scrollPosition >= pageHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ display: isVisible ? "block" : "none" }}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

export default FooterLoader;
