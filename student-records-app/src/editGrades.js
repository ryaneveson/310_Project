import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom/client';
import HeaderLoader from './Header'; 
import FooterLoader from './Footer'; 

function EditGrades() {
  const [editGrades, setEditGrades] = useState("");

  useEffect(() => {
    fetch("/editGrades.html")
      .then(response => response.text())
      .then(data => setEditGrades(data))
      .catch(error => console.error("Error loading editGrades:", error));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: editGrades }} />;
}

// Render the EditGrades component inside the #edit-grades div
const editGradesElement = document.getElementById('edit-grades');
if (editGradesElement) {
  const editGradesRoot = ReactDOM.createRoot(editGradesElement);
  editGradesRoot.render(
    <React.StrictMode>
      <EditGrades />
    </React.StrictMode>
  );
}

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

// Render the footer inside the #footer div
const footerElement = document.getElementById('footer');
if (footerElement) {
  const footerRoot = ReactDOM.createRoot(footerElement);
  footerRoot.render(
    <React.StrictMode>
      <FooterLoader />
    </React.StrictMode>
  );
}

function saveGrades() {
    const inputs = document.querySelectorAll('.grade-input');
    let updatedGrades = {};

    inputs.forEach((input, index) => {
        let subject = document.querySelectorAll("td:first-child")[index].innerText;
        updatedGrades[subject] = input.value;
    });

    alert("Updated Grades: " + JSON.stringify(updatedGrades, null, 2));
    console.log(updatedGrades); // For debugging
}

export default EditGrades;
