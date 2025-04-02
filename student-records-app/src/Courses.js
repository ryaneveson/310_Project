import React, { useState, useEffect } from "react";
import "./frontend/courses.css";
import PageBackground from './components/PageBackground';
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
  const [courseLevel, setCourseLevel] = useState("all");
  const [userRole, setUserRole] = useState(null);
  const [studentId, setStudentId] = useState(""); // For admin use
  const [searchStudentId, setSearchStudentId] = useState(""); // For admin to search students

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);

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
    const student_id = userRole === "admin" ? studentId : localStorage.getItem("student_id");
    
    if (userRole === "admin" && !student_id) {
      alert("Please enter a student ID first");
      return;
    }

    fetch("http://localhost:5000/api/register-course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_id: student_id,
        course_id: course.id,
        course_dept: course.dept,
        course_num: course.courseNum,
        course_capacity: course.capacity,
        waitlist_capacity: course.waitlist,
        lecture_time: course.date
      }),
    })
      .then((response) => {
        // Store the status code before parsing the JSON
        const status = response.status;
        return response.json().then(data => ({data, status}));
      })
      .then(({data, status}) => {
        if (data.error) {
          alert(data.error);
        } else {
          // Different messages based on status code
          if (status === 202) {
            alert(`Successfully added to Waitlist for ${course.name}`);
          } else {
            alert(`Successfully registered for ${course.name}!`);
          }
          if (userRole === "student") {
            window.location.href = "/academicdashboard";
          }
        }
      })
      .catch((error) => {
        console.error("Error registering for course:", error);
        alert("An error occurred while registering for the course. Please try again.");
      });
  };

  const handleStudentSearch = () => {
    if (!searchStudentId.trim()) {
      alert("Please enter a student ID");
      return;
    }
    setStudentId(searchStudentId);
  };

  return (
    <PageBackground>
    <div className="container">
      <h2>Available Courses</h2>

      {/* Admin student search section */}
      {userRole === "admin" && (
        <div className="admin-controls">
          <h3>Register Student for Course</h3>
          <div className="student-search2">
            <input
              type="text"
              placeholder="Enter Student ID..."
              value={searchStudentId}
              onChange={(e) => setSearchStudentId(e.target.value)}
              className="search-box"
            />
            <button onClick={handleStudentSearch} className="search-button">
              Set Student
            </button>
          </div>
          {studentId && (
            <div className="selected-student">
              Currently selecting courses for Student ID: {studentId}
              <button 
                onClick={() => setStudentId("")} 
                className="clear-button"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Course search bar */}
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
                      {userRole === "admin" ? "Register Student" : "Register"}
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
    </PageBackground>
  );
}

export default Courses;