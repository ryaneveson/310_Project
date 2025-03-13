import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderLoader from "./Header";
import FooterLoader from "./Footer";

export default function StudentProfile() {
    const navigate = useNavigate();
    const alertShown = useRef(false);   //keeps track of whether the alert for an invalid id has been shown, keeps the alert from being shown twice

    const [studentData, setStudentData] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);
    const pathParts = window.location.pathname.split("/");
    const studentId = pathParts[pathParts.length - 1];


    useEffect(() => {
        //verify that student ID is valid
        if (!studentId || pathParts.length<3) {
            setStudentData(null);
            if(!alertShown.current){
                alert("Error, try again.");
                alertShown.current = true;
            }
            window.location.href = "/studentProfileInput";
            return;
        }
        else if (studentId.length !== 8) {
            setStudentData(null);
            if (!alertShown.current) {
                alert("Invalid student ID.");
                alertShown.current = true;
            }
            window.location.href = "/studentProfileInput";
            return;
        }

        //TODO: pull from database instead of dummy data
        //dummy student data for now
        /*const data = [
            { id: 1, name: "Bill McGill", gpa: 71, major: "Computer Science" },
            { id: 2, name: "John Jover", gpa: 98, major: "Computer Science" },
            { id: 3, name: "Jane Smith", gpa: 76, major: "Computer Science" },
            { id: 4, name: "Alice Johnson", gpa: 84, major: "Data Science" },
        ];

        //find the student, from dummy data for now
        const student = data.find(student => student.id === parseInt(studentId));
        */

        //Working: finding student in database
        fetchStudentProfile();
    }, []);

        const fetchStudentProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/student/studentprofile?student_id=${studentId}`);
                setStudentData(response.data);
            } catch (err) {
                setStudentData(null);
                if (!alertShown.current) {
                    alert("Error fetching student profile.");
                    alertShown.current = true;
                }
                window.location.href = "/studentProfileInput";
            }

            setNotFound(false);
            alertShown.current = false; // Reset alertShown when student is found
            setLoading(false);
        }
    
    //display student's profile data
    //TODO: add more student data fields later depending on what we want to display
    return (
        <div>
            <h1>Student Profile</h1>
            {loading ? (
                <p>Loading...</p>
            ) : studentData ? (
                <div id="student-profile">
                    <p>Name: {studentData.name}</p>
                    <p>ID: {studentData.student_id}</p>
                    <p>Major: {studentData.major}</p>
                </div>
            ) : (
                <p>Student not found.</p>
            )}
        </div>
    );
}