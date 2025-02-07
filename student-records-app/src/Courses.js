import React, { useState } from "react";

function Courses() {
  // Hardcoded courses list
  const allCourses = [
    "Introduction to Programming",
    "Data Structures",
    "Web Development",
    "Database Management",
    "Machine Learning",
    "Software Engineering",
    "Cybersecurity Basics",
    "Cloud Computing",
    "Computer Networks",
  ];

  const [searchTerm, setSearchTerm] = useState(""); // Store search input

  // Filter courses based on search input
  const filteredCourses = allCourses.filter((course) =>
    course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h2>Available Courses</h2>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search for a course..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-box"
      />

      {/* Display Filtered Courses */}
      <ul>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => (
            <p key={index}>{course}</p>
          ))
        ) : (
          <li>No courses found</li>
        )}
      </ul>
    </div>
  );
}

export default Courses;
