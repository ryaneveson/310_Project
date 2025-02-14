import React, { useState, useEffect } from "react";
import HeaderLoader from "./Header";
import FooterLoader from "./Footer";

function StudentRanking() {
  const [students, setStudents] = useState([]);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    // Dummy student data for now
    // TODO: get data from database instead
    const studentData = [
      { name: "Bill McGill", gpa: 71 },
      { name: "John Jover", gpa: 98 },
      { name: "Jane Smith", gpa: 76 },
      { name: "Alice Johnson", gpa: 84 },
    ];

    // Sort students by gpa desc
    const sortedStudents = sortStudents(studentData);

    // Update the state with sorted student ranking
    setStudents(sortedStudents);

    // Fetch the HTML content from studentRanking.html
    fetch("/studentRanking.html")
      .then((response) => response.text())
      .then((data) => {
        setHtmlContent(data);
      })
      .catch((error) => console.error("Error loading HTML content:", error));
  }, []);

  // Function to sort students by gpa desc
  function sortStudents(students) {
    return students.sort((a, b) => b.gpa - a.gpa);
  }

  return (
    <div>
      <HeaderLoader />
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      <table border="1">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>GPA</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{student.name}</td>
              <td>{student.gpa}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <FooterLoader />
    </div>
  );
}

export default StudentRanking;