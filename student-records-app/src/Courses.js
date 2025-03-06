import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./frontend/dashboardStyles.css";

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [userRole, setUserRole] = useState(null);

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

    // Fetch courses from the backend
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
    const courseYear = course.courseNum?.[0]; // Extract the first digit of the course number
    const matchesYear = selectedYears.length === 0 || selectedYears.includes(courseYear);
    return matchesSearch && matchesYear;
  });

  const toggleCourseDetails = (index) => {
    setExpandedCourse(expandedCourse === index ? null : index);
  };

  const handleRegister = (course, index) => {
    if (userRole !== "student") {
      alert("Only students can register for courses.");
      return;
    }

    const student_id = "12345"; // Replace with the actual student ID (e.g., from login state)
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
            prerequisites: course.prerequisites,
            registeredCourses: previouslyRegisteredCourses,
          },
        });
      })
      .catch((error) => console.error("Error registering for course:", error));

    const newCourse = {
      course,
      date: dates[index],
      professor: professors[index],
      room: rooms[index],
      description: descriptions[index],
      prerequisites: prerequisites[index],
    };

    const registeredCourses = JSON.parse(localStorage.getItem("registeredCourses")) || [];

    if(registeredCourses.some(course => course.course === newCourse.course)){
      alert("This course is already registered.");
    }else{
      registeredCourses.push(newCourse);
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
              <h3>{course.name}</h3>
              <p>Course Number: {course.courseNum}</p>
              <p>Professor: {course.professor}</p>
              <p>Room: {course.room}</p>
              <p>Description: {course.description}</p>
              <p>Prerequisites: {course.prerequisites}</p>
              {userRole === "student" && (
                <button
                  onClick={() => handleRegister(course, index)}
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