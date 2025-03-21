import React, { useState, useEffect } from "react";
import "./frontend/courses.css";

function Courses({ mockCourses = null}) {

  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYears, setSelectedYears] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseLevel, setCourseLevel] = useState("all"); // New state for course level filter

  // Fetch courses from the backend
  useEffect(() => {
    if(mockCourses){
      setCourses(mockCourses);
      return;
    }
    fetch("http://localhost:5000/api/courses")
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);

  const handleYearChange = (year) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const handleCourseLevelChange = (level) => {
    setCourseLevel(level);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const courseYear = course.courseNum?.[0]; // Extract the first digit of the course number
    const matchesYear = selectedYears.length === 0 || selectedYears.includes(courseYear);

    // New logic for course level filter
    const matchesLevel =
      courseLevel === "all" ||
      (courseLevel === "undergraduate" && courseYear < 5) ||
      (courseLevel === "graduate" && courseYear >= 5);

    return matchesSearch && matchesYear && matchesLevel;
  });

  const toggleCourseDetails = (index) => {
    setExpandedCourse(expandedCourse === index ? null : index);
  };

  const handleRegister = (course, index) => {
    const student_id = localStorage.getItem("student_id");
    fetch("http://localhost:5000/api/register-course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_id: student_id,
        course_dept: course.dept,
        course_num: course.courseNum
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(`You have registered for ${course.name}!`);
        window.location.href="/academicdashboard"
      })
      .catch((error) => console.error("Error registering for course:", error));
  };

  return (
    <div className="container">
      <h2>Available Courses</h2>

      {/* Search bar at the top */}
      <input
        type="text"
        placeholder="Search for a course..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-box"
      />

      {/* Filters and course list side by side */}
      <div className="main-layout">
        {/* Filters on the left side */}
        <div className="filters">
          {/* Filter by Year in its own box */}
          <div className="filter-box">
            <h3>Filter by Year</h3>
            <div className="year-filter">
              {[1, 2, 3, 4, 5].map((year) => (
                <label key={year}>
                  <input
                    type="checkbox"
                    checked={selectedYears.includes(year.toString())}
                    onChange={() => handleYearChange(year.toString())}
                  />
                  {year}00 Level
                </label>
              ))}
            </div>
          </div>

          {/* Filter by Level in its own box */}
          <div className="filter-box">
            <h3>Filter by Level</h3>
            <div className="level-filter">
              <label>
                <input
                  type="radio"
                  name="courseLevel"
                  value="all"
                  checked={courseLevel === "all"}
                  onChange={() => handleCourseLevelChange("all")}
                />
                All Levels
              </label>
              <label>
                <input
                  type="radio"
                  name="courseLevel"
                  value="undergraduate"
                  checked={courseLevel === "undergraduate"}
                  onChange={() => handleCourseLevelChange("undergraduate")}
                />
                Undergraduate
              </label>
              <label>
                <input
                  type="radio"
                  name="courseLevel"
                  value="graduate"
                  checked={courseLevel === "graduate"}
                  onChange={() => handleCourseLevelChange("graduate")}
                />
                Graduate
              </label>
            </div>
          </div>
        </div>
        {/* Course list on the right side */}
        <div className="course-list">
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
                      {course.dept} {course.courseNum} - {course.name}
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
                        <p>
                          <strong>Capacity:</strong> {course.capacity}/150
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
      </div>

    </div>
  );
}

export default Courses;