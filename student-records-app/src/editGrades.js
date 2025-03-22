import React, { useEffect, useState } from "react";
import axios from "axios";
import "./frontend/dashboardStyles.css";
import ReactDOM from "react-dom/client";
import HeaderLoader from "./Header";
import FooterLoader from "./Footer";

//function called when "Save Changes: button is clicked, returns"
const EditGrades = () => {
  const [userRole, setUserRole] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [grades, setGrades] = useState({
    registered: [],    // [{course: "COSC 310", grade: "85"}, ...]
    completed: []      // [{course: "COSC 304", grade: "90"}, ...]
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`http://localhost:5000/api/student/studentprofile?student_id=${studentId}`);
      const { student } = response.data;

      if (!student) {
        setError("Student not found");
        setGrades({ registered: [], completed: [] });
        setStudentName("");
        return;
      }

      setStudentName(`${student.first_name} ${student.last_name}`);
      
      // Format grades data
      const registeredCourses = student.registered_courses.map((course, index) => ({
        course: typeof course === 'string' ? course : course.course_code || 'Unknown Course',
        grade: student.registered_courses_grades[index] || ""
      }));

      const completedCourses = student.completed_courses.map((course, index) => ({
        course: typeof course === 'string' ? course : course.course_code || 'Unknown Course',
        grade: student.completed_courses_grades[index] || ""
      }));

      setGrades({
        registered: registeredCourses,
        completed: completedCourses
      });

    } catch (err) {
      setError(err.response?.data?.error || "Error fetching student data");
      setGrades({ registered: [], completed: [] });
      setStudentName("");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const handleStudentIdChange = (e) => {
    setStudentId(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (studentId) {
      fetchStudentData();
    }
  };

  const handleGradeChange = (courseType, index, newGrade) => {
    setGrades(prev => ({
      ...prev,
      [courseType]: prev[courseType].map((item, i) => 
        i === index ? { ...item, grade: newGrade } : item
      )
    }));
  };

  const saveGrades = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/update-grades', {
        student_id: studentId,
        registered_courses_grades: grades.registered.map(g => g.grade),
        completed_courses_grades: grades.completed.map(g => g.grade)
      });

      alert("Grades updated successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Error updating grades");
    }
  };

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
            <form onSubmit={handleSearch} className="search-container">
              <label htmlFor="student-id">Student ID:</label>
              <input
                type="text"
                id="student-id"
                value={studentId}
                onChange={handleStudentIdChange}
                placeholder="Enter Student ID"
                className="student-id-input"
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </form>
          </div>

          {loading && <div className="loading">Loading student data...</div>}
          {error && <div className="error-message">{error}</div>}

          {studentName && (
            <div className="student-info">
              <h3>Student: {studentName}</h3>
            </div>
          )}

          {(grades.registered.length > 0 || grades.completed.length > 0) && (
            <div className="grades-tables">
              {grades.registered.length > 0 && (
                <div className="grades-table-container">
                  <h4>Registered Courses</h4>
                  <table className="grades-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Current Grade</th>
                        <th>New Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.registered.map((item, index) => (
                        <tr key={`registered-${index}`}>
                          <td>{item.course}</td>
                          <td>{item.grade || 'N/A'}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="grade-input"
                              value={item.grade}
                              onChange={(e) => handleGradeChange('registered', index, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {grades.completed.length > 0 && (
                <div className="grades-table-container">
                  <h4>Completed Courses</h4>
                  <table className="grades-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Current Grade</th>
                        <th>New Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.completed.map((item, index) => (
                        <tr key={`completed-${index}`}>
                          <td>{item.course}</td>
                          <td>{item.grade || 'N/A'}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="grade-input"
                              value={item.grade}
                              onChange={(e) => handleGradeChange('completed', index, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="actions-container">
                <button onClick={saveGrades} className="save-button">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
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