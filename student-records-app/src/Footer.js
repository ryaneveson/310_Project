import React, { useEffect, useState } from 'react';

function FooterLoader() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/footer.html') //Fetch footer.html from public folder
      .then(response => {
        if (!response.ok) throw new Error('Failed to load footer');
        return response.text();
      })
      .then(data => setContent(data))
      .catch(error => console.error('Error loading footer:', error));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

export default FooterLoader;