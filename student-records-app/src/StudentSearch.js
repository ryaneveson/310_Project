import React, { useState } from "react";
import "./frontend/studentSearch.css";

function StudentSearch() {
    const students = [
        {name: "Alice",gpa: 3.8,classes: ["Math 101", "History 201", "Science 301", "Art 101", "English 102"]},
        {name: "Bob",gpa: 3.2,classes: ["Math 101", "Biology 201", "Physics 301", "Chemistry 102", "Philosophy 103"]},
        {name: "Charlie",gpa: 3.6,classes: ["Math 101", "History 201", "Economics 101", "Art 101", "English 103"]},
        {name: "David",gpa: 3.4,classes: ["Math 201", "History 101", "Psychology 301", "Music 102", "Biology 103"]},
        {name: "Eva",gpa: 4.0,classes: ["Chemistry 101", "Math 301", "Physics 101", "Art 101", "Literature 102"]},
        {name: "Frank",gpa: 2.9,classes: ["History 101", "Computer Science 201", "Math 301", "Philosophy 102", "Sociology 103"]},
        {name: "Grace",gpa: 3.5,classes: ["Physics 101", "Biology 102", "Math 101", "History 102", "Psychology 101"]},
        {name: "Hannah",gpa: 3.1,classes: ["Chemistry 101", "History 103", "Math 101", "Philosophy 104", "Biology 201"]},
        {name: "Isaac",gpa: 3.9,classes: ["Computer Science 101", "Math 301", "Physics 101", "Art 102", "Literature 103"]},
        {name: "Jack",gpa: 2.8,classes: ["Music 101", "Math 201", "Biology 102", "Art 101", "Sociology 104"]}
    ];
    const allClasses = [...new Set(students.flatMap(student => student.classes))];
    const [searchTerm, setSearchTerm] = useState(""); 

    const filterClasses = allClasses.filter((className) =>
        className.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const filteredStudents = students.filter(student =>
        student.classes.some(className => filterClasses.includes(className))
    );


    return ( 
        <aside class="sidebar" id="sidebar">
        <button class="toggle-btn" onclick="toggleSidebar()">Toggle Sidebar</button>
        <div class="checkboxes">
            <label><input type="checkbox" /> Option 1</label>
            <label><input type="checkbox" /> Option 2</label>
            <label><input type="checkbox" /> Option 3</label>
            <label><input type="checkbox" /> Option 4</label>
            <label><input type="checkbox" /> Option 5</label>
        </div>
        </aside>

    );
}

export default StudentSearch;