import React, { useEffect, useState } from "react";

function editGrades() {
  const [editGrades, seteditGrades] = useState([]);

  useEffect(() => {
    fetch("/editGrades.html") // Path to editGrades file
      .then(response => response.text())
      .then(data => seteditGrades(data))
      .catch(error => console.error("Error loading editGrades:", error));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: editGrades }} />;
}

export default editGrades;