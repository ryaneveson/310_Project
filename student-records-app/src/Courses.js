import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./frontend/courses.css";

function Courses() {
  const navigate = useNavigate();
  const location = useLocation();
  const previouslyRegisteredCourses = location.state?.registeredCourses || [];

  const allCourses = [
    "Introduction to Programming",
    "Data Structures",
    "Web Development",
    "Database Management",
    "Machine Learning"
  ];

  const professors = ["Scott Fazackerley", "Ramon Lawrence", "John Hopkinson", "Abdallah Mohamed", "Dr. John Doe"];
  const dates = ["Tue-Thu 9:30-11:00", "Mon-Wed 8:00-9:30", "Wed-Fri 3:30-5:00", "Tue-Thu 6:30-8:00", "Wed-Fri 12:30-2:00"];
  const rooms = ["ART 103", "COM 201", "SCI 114", "ASC 140", "LIB 305"];
  const descriptions = [
    "None"
  ];

  const prerequisites = [
    "None",
    "COSC 111",
    "COSC 222, COSC 211",
    "COSC 416",
    "MATH 100, MATH 101, COSC 111, COSC 121"
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCourse, setExpandedCourse] = useState(null);

  const filteredCourses = allCourses.filter(course =>
    course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCourseDetails = (index) => {
    setExpandedCourse(expandedCourse === index ? null : index);
  };

  const handleRegister = (course, index) => {
    navigate("/verify-registration", {
      state: {
        course,
        date: dates[index],
        professor: professors[index],
        room: rooms[index],
        description: descriptions[index],
        prerequisites: prerequisites[index],
        registeredCourses: previouslyRegisteredCourses, 
      },
    });
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
                <span className="course-name">{course}</span>
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
                      <strong>Date:</strong> {dates[index]}
                    </p>
                    <p>
                      <strong>Professor:</strong> {professors[index]}
                    </p>
                    <p>
                      <strong>Room:</strong> {rooms[index]}
                    </p>
                    <p>
                      <strong>Description:</strong> {descriptions[index]}
                    </p>
                    <p>
                      <strong>Pre-requisites:</strong> {prerequisites[index]}
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
