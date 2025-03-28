import React, { useState, useEffect } from "react";
import "./frontend/courses.css";

// Constants
const COURSE_LEVELS = [
  { value: "all", label: "All Levels" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" }
];

const YEAR_LEVELS = [1, 2, 3, 4, 5];

const FilterBox = ({ title, children }) => (
  <div className="filter-box">
    <h3>{title}</h3>
    <div className="filter-content">
      {children}
    </div>
  </div>
);

function Courses({ mockCourses = null }) {

  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYears, setSelectedYears] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseLevel, setCourseLevel] = useState("all"); // New state for course level filter

  // Fetch courses from the backend
  useEffect(() => {
    if (mockCourses) {
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
        course_num: course.courseNum,
        course_capacity: course.capacity,
        waitlist_capacity: course.waitlist
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          // Display the error message from the backend
          alert(data.error);
        } else {
          // Display the success message
          alert(`You have registered for ${course.name}!`);
          window.location.href = "/academicdashboard";
        }
      })
      .catch((error) => {
        console.error("Error registering for course:", error);
        alert("An error occurred while registering for the course. Please try again.");
      });
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

      <div className="main-layout">
        <div className="filters">

          <FilterBox title="Filter by Year">
            <div className="year-filter">
              {YEAR_LEVELS.map(year => (
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
          </FilterBox>

          <FilterBox title="Filter by Level">
            <div className="level-filter">
              {COURSE_LEVELS.map(level => (
                <label key={level.value}>
                  <input
                    type="radio"
                    name="courseLevel"
                    value={level.value}
                    checked={courseLevel === level.value}
                    onChange={() => setCourseLevel(level.value)}
                  />
                  {level.label}
                </label>
              ))}
            </div>
          </FilterBox>

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
                      className={`course-toggle ${expandedCourse === index ? "expanded" : ""
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
                    className={`course-details ${expandedCourse === index ? "open" : ""
                      }`}
                  >
                    {expandedCourse === index && (
                      <>
                        <p> <strong>Date:</strong> {course.date} </p>
                        <p> <strong>Professor:</strong> {course.professor} </p>
                        <p> <strong>Room:</strong> {course.room} </p>
                        <p> <strong>Description:</strong> {course.description} </p>
                        <p> <strong>Pre-requisites:</strong> {course.prerequisites} </p>
                        <p> <strong>Capacity:</strong> {course.capacity}/150      <strong>Waitlist:</strong> {course.waitlist.length}/5 </p>
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