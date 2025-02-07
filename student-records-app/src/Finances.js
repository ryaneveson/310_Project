import React, { useEffect, useState } from "react";
import "./finances.css";

function Finances() {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    fetch("/finances.html") // path to finances.html in the public directory
      .then((response) => response.text())
      .then((data) => {
        setHtmlContent(data);
      })
      .catch((error) => console.error("Error loading HTML content:", error));
  }, []);

  useEffect(() => {
    if (htmlContent) {
      executeScripts(); // only execute scripts after content is fully loaded
    }
  }, [htmlContent]); // runs again when htmlContent updates

  // function to execute any scripts within the fetched HTML
  const executeScripts = () => {
    const container = document.getElementById("finances");

    if (!container) return;

    const scripts = container.getElementsByTagName("script");
    for (let script of scripts) {
      const newScript = document.createElement("script");
      if (script.src) {
        newScript.src = script.src; // copy external script source
        newScript.async = true; // ensure non-blocking execution
      } else {
        newScript.textContent = script.textContent; // copy inline script content
      }
      document.body.appendChild(newScript); // execute script in document scope
    }
  };

  return (
    <div className="container" id="finances">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}

export default Finances;
