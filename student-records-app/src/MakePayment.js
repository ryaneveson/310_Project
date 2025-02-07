import React, { useEffect, useState } from "react";

function MakePayment() {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    fetch("/makePayment.html") // Path to finances.html in the public directory
      .then((response) => response.text())
      .then((data) => {
        setHtmlContent(data);
      })
      .catch((error) => console.error("Error loading HTML content:", error));
  }, []);

  /*useEffect(() => {
    if (htmlContent) {
      executeScripts(); // Only execute scripts after content is fully loaded
    }
  }, [htmlContent]); // Runs again when htmlContent updates

  // Function to execute any scripts within the fetched HTML
  const executeScripts = () => {
    const container = document.getElementById("finances");

    if (!container) return;

    const scripts = container.getElementsByTagName("script");
    for (let script of scripts) {
      const newScript = document.createElement("script");
      if (script.src) {
        newScript.src = script.src; // Copy external script source
        newScript.async = true; // Ensure non-blocking execution
      } else {
        newScript.textContent = script.textContent; // Copy inline script content
      }
      document.body.appendChild(newScript); // Execute script in document scope
    }
  };*/

  return (
    <div className="container" id="makePayment">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}

export default MakePayment;