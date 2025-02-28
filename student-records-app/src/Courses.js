import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./frontend/courses.css";

function Courses() {
  const navigate = useNavigate();
  const location = useLocation();
  const previouslyRegisteredCourses = location.state?.registeredCourses || [];

  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYears, setSelectedYears] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);

  // Fetch courses from the backend
  useEffect(() => {
    fetch("http://localhost:5000/api/courses")
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);

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
  };

  return (
    <div className="container">
      <h2>Available Courses</h2>

      <input
        type="text"
        placeholder="Search for a course..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-box"
      />

      <div className="year-filter">
        {[1, 2, 3, 4, 5].map((year) => (
          <label key={year}>
            <input
              type="checkbox"
              checked={selectedYears.includes(year.toString())}
              onChange={() => handleYearChange(year.toString())}
            />
            Year {year}
          </label>
        ))}
      </div>

      <ul className="courses-list">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => (
            <li key={index} className="course-item">
              <div className="course-header">
                <button
                  onClick={() => toggleCourseDetails(index)}
                  className={`course-toggle ${
                    expandedCourse === index ? "expanded" : ""
                  }`}
                >
                  <div className="triangle"></div>
                </button>
                <span className="course-name">
                  {course.name} <span className="course-number">({course.courseNum})</span>
                </span>
                <button
                  onClick={() => handleRegister(course, index)}
                  className="auth-button"
                >
                  Register
                </button>
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
            </li>
          ))
        ) : (
          <li>No courses found</li>
        )}
      </ul>
    </div>
  );
}

export default Courses;