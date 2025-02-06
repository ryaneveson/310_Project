import React, { useState, useEffect } from "react";

function Courses() {
  const [courses, setCourses] = useState([]); // Store all courses
  const [searchTerm, setSearchTerm] = useState(""); // Store search input

  useEffect(() => {
    fetch("http://localhost:5000/courses") // Fetch courses from Flask API
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);

  // Define the filteredCourses function
  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h2>Courses</h2>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-box"
      />

      {/* Display Filtered Courses */}
      <ul>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <li key={course.id}>{course.name}</li>
          ))
        ) : (
          <li>No courses found</li>
        )}
      </ul>
    </div>
  );
}

export default Courses;
