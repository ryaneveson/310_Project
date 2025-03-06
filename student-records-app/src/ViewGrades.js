import React, { useEffect, useState } from "react";
import "./frontend/dashboardStyles.css";

const ViewGrades = () => {
  const [userRole, setUserRole] = useState(null);
  const [grades] = useState({
    currentSemester: [
      {
        course: "Intro to Programming",
        code: "CS101",
        grade: 92,
        credits: 3,
        status: "In Progress"
      },
      {
        course: "Data Structures",
        code: "CS201",
        grade: 89,
        credits: 3,
        status: "In Progress"
      },
      {
        course: "Web Development",
        code: "CS301",
        grade: 85,
        credits: 3,
        status: "In Progress"
      }
    ],
    previousSemester: [
      {
        course: "Software Engineering",
        code: "CS401",
        grade: 90,
        credits: 3,
        status: "Completed"
      },
      {
        course: "Computer Networks",
        code: "CS402",
        grade: 95,
        credits: 3,
        status: "Completed"
      },
      {
        course: "Database Systems",
        code: "CS403",
        grade: 88,
        credits: 3,
        status: "Completed"
      }
    ]
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

  const calculateGPA = (courses) => {
    if (courses.length === 0) return 0;
    const totalPoints = courses.reduce((sum, course) => sum + course.grade, 0);
    return (totalPoints / courses.length).toFixed(2);
  };

  if (!userRole) {
    return <div>Loading...</div>;
  }

  if (userRole !== "student") {
    return (
      <div className="dashboard-container">
        <h2>Access Denied</h2>
        <p>This page is only accessible to students.</p>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="hero">
        <h2>Academic Record</h2>
        <p>Student ID: 12345</p>
      </div>

      <div className="dashboard-content">
        <div className="info-cards">
          <div className="card">
            <h3>Current Semester GPA</h3>
            <p className="gpa">{calculateGPA(grades.currentSemester)}</p>
            <p>Credits In Progress: {grades.currentSemester.reduce((sum, course) => sum + course.credits, 0)}</p>
          </div>
          <div className="card">
            <h3>Cumulative GPA</h3>
            <p className="gpa">
              {calculateGPA([...grades.currentSemester, ...grades.previousSemester])}
            </p>
            <p>Total Credits: {
              [...grades.currentSemester, ...grades.previousSemester]
                .reduce((sum, course) => sum + course.credits, 0)
            }</p>
          </div>
        </div>

        <div className="grades-section">
          <h3>Current Semester</h3>
          <table className="grades-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {grades.currentSemester.map((course, index) => (
                <tr key={index}>
                  <td>{course.code}</td>
                  <td>{course.course}</td>
                  <td>{course.credits}</td>
                  <td>{course.grade}%</td>
                  <td>{course.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Previous Semester</h3>
          <table className="grades-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {grades.previousSemester.map((course, index) => (
                <tr key={index}>
                  <td>{course.code}</td>
                  <td>{course.course}</td>
                  <td>{course.credits}</td>
                  <td>{course.grade}%</td>
                  <td>{course.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default ViewGrades; 