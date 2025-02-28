import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import HeaderLoader from "./Header";
import FooterLoader from "./Footer";

export default function StudentProfile() {
    const { studentID } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const alertShown = useRef(false);   //keeps track of whether the alert for an invalid id has been shown, keeps the alert from being shown twice
    

    const [studentData, setStudentData] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        //verify that student ID is valid
        if (!studentID || isNaN(studentID)) {
            setStudentData(null);
            if (!alertShown.current) {
                alert("Invalid student ID.");
                alertShown.current = true;
            }
            navigate(-1); //navigate back to the previous page if id invalid
            return;
        }

        //TODO: pull from database instead of dummy data
        // Dummy student data for now
        const data = [
            { id: 1, name: "Bill McGill", gpa: 71, major: "Computer Science" },
            { id: 2, name: "John Jover", gpa: 98, major: "Computer Science" },
            { id: 3, name: "Jane Smith", gpa: 76, major: "Computer Science" },
            { id: 4, name: "Alice Johnson", gpa: 84, major: "Data Science" },
        ];

        // Find the student, from dummy data for now
        const student = data.find(student => student.id === parseInt(studentID));

        if (student) {
            setStudentData(student); //set student data if student is found
            setNotFound(false);
            alertShown.current = false; //reset alertShown when student is found
        } else {
            setStudentData(null);
            setNotFound(true);
            if (!alertShown.current) {  //show the alert if the alert has not been shown
                alert("Student ID does not exist.");
                alertShown.current = true;
            }
            navigate(-1);  //navigate back if not found
        }
    }, [studentID, navigate]);

    //display student's profile data
    //TODO: add more student data fields later depending on what we want to display
    return (
        <div>
            <HeaderLoader />
            <h1>Student Profile</h1>
            {studentData ? (
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