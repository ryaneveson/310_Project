import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import HeaderLoader from "./Header";
import FooterLoader from "./Footer";


//function called when "Save Changes: button is clicked, returns"
function EditGrades() {
    // State to store grades
    //later these will come from database
    const [grades, setGrades] = useState({
      "Intro to Programming": 92,
      "Data Structures": 89,
      "Web Development": 85,
      "Software Engineering": 90,
      "Computer Networks": 95,
    });
  
    // Function to handle input changes
    //updates new grade value for a class while preserving the previous data
    function handleInputChange(subject, value) {
      setGrades((prevGrades) => ({
        ...prevGrades,
        [subject]: Number(value),
      }));
    }
  
    // Function to save updated grades
    function saveGrades() {
      console.log("Updated Grades:", grades);
      alert("Grades saved successfully!\n");
    }
  
    return (
      //hand back html with grade values inserted
      //eventually I want to save grades to database, and then pull them again in the html file to display
      <div>
        <h2>Student: John Doe</h2>
        <h3>Grade Report</h3>

    
    <label for="student-id">Enter Student ID:</label>
    <input type="text" id="student-id" placeholder="Enter Student ID"></input>
  
        <table border="1">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Grade (%)</th>
              <th>Edit Grade</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grades).map(([subject, grade]) => (
              <tr key={subject}>
                <td>{subject}</td>
                <td>{grade}</td>
                <td>
                  <input
                    type="number"
                    className="grade-input"
                    value={grade}
                    onChange={(e) => handleInputChange(subject, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        <button onClick={saveGrades}>Save Changes</button>
      </div>
    );
  }

// Render the EditGrades component inside the #edit-grades div
const editGradesElement = document.getElementById("edit-grades");
if (editGradesElement) {
  const editGradesRoot = ReactDOM.createRoot(editGradesElement);
  editGradesRoot.render(
    <React.StrictMode>
      <EditGrades />
    </React.StrictMode>
  );
}

// Render the header inside the #header div
const headerElement = document.getElementById("header");
if (headerElement) {
  const headerRoot = ReactDOM.createRoot(headerElement);
  headerRoot.render(
    <React.StrictMode>
      <HeaderLoader />
    </React.StrictMode>
  );
}

// Render the footer inside the #footer div
const footerElement = document.getElementById("footer");
if (footerElement) {
  const footerRoot = ReactDOM.createRoot(footerElement);
  footerRoot.render(
    <React.StrictMode>
      <FooterLoader />
    </React.StrictMode>
  );
}

export default EditGrades;