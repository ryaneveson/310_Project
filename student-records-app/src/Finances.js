import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
import "./frontend/finances.css";

function Finances() {
  const [htmlContent, setHtmlContent] = useState("");
  const navigate = useNavigate(); // Initialize navigation

  useEffect(() => {
    fetch("/finances.html")
      .then((response) => response.text())
      .then((data) => {
        setHtmlContent(data);
      })
      .catch((error) => console.error("Error loading HTML content:", error));
  }, []);

  return (
    <div className="container">
      {/* Render original finances page */}
      <div id="finances" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}

export default Finances;