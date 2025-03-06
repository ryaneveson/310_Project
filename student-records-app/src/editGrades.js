import React, { useEffect, useState } from "react";
import "./frontend/dashboardStyles.css";
import ReactDOM from "react-dom/client";
import HeaderLoader from "./Header";
import FooterLoader from "./Footer";

//function called when "Save Changes: button is clicked, returns"
const EditGrades = () => {
  const [userRole, setUserRole] = useState(null);
  const [studentId, setStudentId] = useState("");
  // State to store grades
  const [grades, setGrades] = useState({
    "Intro to Programming": 92,
    "Data Structures": 89,
    "Web Development": 85,
    "Software Engineering": 90,
    "Computer Networks": 95,
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  // Function to handle input changes
  function handleInputChange(subject, value) {
    setGrades((prevGrades) => ({
      ...prevGrades,
      [subject]: Number(value),
    }));
  }

  const handleStudentIdChange = (e) => {
    setStudentId(e.target.value);
  };

  // Function to save updated grades
  function saveGrades() {
    if (!studentId) {
      alert("Please enter a Student ID");
      return;
    }
    console.log("Updated Grades:", grades);
    alert(`Grades saved successfully for student ID: ${studentId}`);
  }

  if (!userRole) {
    return <div>Loading...</div>;
  }

  if (userRole !== "admin") {
    return (
      <div className="dashboard-container">
        <h2>Access Denied</h2>
        <p>This page is only accessible to administrators.</p>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="hero">
        <h2>Grade Management</h2>
        <p>Update and manage student grades</p>
      </div>
      <div className="dashboard-content">
        <div className="grades-section">
          <div className="student-search">
            <div className="search-container">
              <label htmlFor="student-id">Student ID:</label>
              <input
                type="text"
                id="student-id"
                value={studentId}
                onChange={handleStudentIdChange}
                placeholder="Enter Student ID"
                className="student-id-input"
              />
            </div>
          </div>

          <div className="grades-table-container">
            <table className="grades-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Current Grade (%)</th>
                  <th>New Grade</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grades).map(([subject, grade]) => (
                  <tr key={subject}>
                    <td>{subject}</td>
                    <td>{grade}%</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="grade-input"
                        value={grade}
                        onChange={(e) => handleInputChange(subject, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="actions-container">
            <button onClick={saveGrades} className="save-button">
              Save Changes
            </button>
          </div>
        </div>
      </div>
      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

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