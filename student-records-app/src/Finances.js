import React, { useEffect, useState } from "react";
import "./finances.css"

function Finances() {
    const [htmlContent, setHtmlContent] = useState("");

    // Fetch the HTML content of finances.html
    useEffect(() => {
    fetch("/finances.html") // Path to finances.html in the public directory
      .then((response) => response.text())
      .then((data) => setHtmlContent(data))
      .catch((error) => console.error("Error loading HTML content:", error));
    }, []);

    return (
        <div className="container">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    
        </div>
      );
}

export default Finances;