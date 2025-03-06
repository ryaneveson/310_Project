import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./frontend/dashboardStyles.css";

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYears, setSelectedYears] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);

    fetch("http://localhost:5000/api/courses")
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  if (!userRole) {
    return <div>Loading...</div>;
  }

  const handleYearChange = (year) => {
    setSelectedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const courseYear = course.courseNum?.[0];
    const matchesYear = selectedYears.length === 0 || selectedYears.includes(courseYear);
    return matchesSearch && matchesYear;
  });

  const toggleCourseDetails = (index) => {
    setExpandedCourse(expandedCourse === index ? null : index);
  };

  const handleRegister = (course) => {
    if (userRole !== "student") {
      alert("Only students can register for courses.");
      return;
    }

    const student_id = "12345";
    fetch("http://localhost:5000/api/register-course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_id: student_id,
        course_name: course.name,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(`You have registered for ${course.name}!`);
        navigate("/verify-registration", {
          state: {
            course: course.name,
            courseNum: course.courseNum,
            date: course.date,
            professor: course.professor,
            room: course.room,
            description: course.description,
            prerequisites: course.prerequisites
          },
        });
      })
      .catch((error) => console.error("Error registering for course:", error));

    const registeredCourses = JSON.parse(localStorage.getItem("registeredCourses")) || [];

    if(registeredCourses.some(regCourse => regCourse.name === course.name)){
      alert("This course is already registered.");
    } else {
      registeredCourses.push(course);
      localStorage.setItem("registeredCourses", JSON.stringify(registeredCourses));
      window.location.href = "/verify-registration";
    }
  };

  return (
    <div className="dashboard-container">
      <div className="hero">
        <h2>{userRole === "admin" ? "Course Management" : "Course Registration"}</h2>
      </div>

      <div className="dashboard-content">
        <div className="courses-list">
          {courses.map((course, index) => (
            <div key={index} className="course-card">
              <div className="course-header">
                <h3>{course.name}</h3>
                <p>Course Number: {course.courseNum}</p>
                <p>Professor: {course.professor}</p>
                <p>Room: {course.room}</p>
                <p>Description: {course.description}</p>
                <p>Prerequisites: {course.prerequisites}</p>
                {userRole === "student" && (
                  <button
                    onClick={() => handleRegister(course)}
                    className="app-button"
                  >
                    Register
                  </button>
                )}
                {userRole === "admin" && (
                  <div className="admin-actions">
                    <button className="app-button">Edit Course</button>
                    <button className="app-button">Delete Course</button>
                  </div>
                )}
              </div>
              <div
                className={`course-details ${
                  expandedCourse === index ? "open" : ""
                }`}
              >
                {expandedCourse === index && (
                  <>
                    <p>
                      <strong>Date:</strong> {course.date}
                    </p>
                    <p>
                      <strong>Professor:</strong> {course.professor}
                    </p>
                    <p>
                      <strong>Room:</strong> {course.room}
                    </p>
                    <p>
                      <strong>Description:</strong> {course.description}
                    </p>
                    <p>
                      <strong>Pre-requisites:</strong> {course.prerequisites}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Courses;