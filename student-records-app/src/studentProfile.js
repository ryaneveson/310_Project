import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderLoader from "./Header";
import FooterLoader from "./Footer";

export default function StudentProfile() {
    const { studentID } = useParams();

    const [studentData, setStudentData] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!studentID || isNaN(studentID)) {
            setStudentData(null);
            setNotFound(true);
            return;
        }

        // Dummy student data for now
        const data = [
            { id: 1, name: "Bill McGill", gpa: 71, major: "Computer Science" },
            { id: 2, name: "John Jover", gpa: 98, major: "Computer Science" },
            { id: 3, name: "Jane Smith", gpa: 76, major: "Computer Science" },
            { id: 4, name: "Alice Johnson", gpa: 84, major: "Data Science" },
        ];

        const student = data.find(student => student.id === parseInt(studentID));

        if (student) {
            setStudentData(student);
            setNotFound(false); 
        } else {
            setStudentData(null);
            setNotFound(true);
        }
    }, [studentID]);

    return (
        <div>
            <HeaderLoader />
            <h1>Student Profile</h1>
            {notFound ? (
                <p>Student not found.</p>
            ) : studentData ? (
                <div id="student-profile">
                    <p>Name: {studentData.name}</p>
                    <p>ID: {studentData.id}</p>
                    <p>Major: {studentData.major}</p>
                    <p>GPA: {studentData.gpa}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
            <FooterLoader />
        </div>
    );
}
