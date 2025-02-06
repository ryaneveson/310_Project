import React, { useEffect, useState } from "react";

function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("/courses.html") // Path to courses file
      .then(response => response.text())
      .then(data => setCourses(data))
      .catch(error => console.error("Error loading courses:", error));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: courses }} />;
}

export default Courses;

