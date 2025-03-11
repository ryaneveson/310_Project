import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderLoader from "./Header";
import FooterLoader from "./Footer";

export default function StudentProfile() {
    const { studentID } = useParams();
    const navigate = useNavigate();
    const alertShown = useRef(false);   //keeps track of whether the alert for an invalid id has been shown, keeps the alert from being shown twice

    const [studentData, setStudentData] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //verify that student ID is valid
        if (!studentID ) {
            setStudentData(null);
            if (!alertShown.current) {
                alert("Invalid student ID.");
                alertShown.current = true;
            }
            navigate(-1); //navigate back to the previous page if id invalid
            return;
        }

        fetchStudentProfile();
    }, [studentID, navigate]);

    const fetchStudentProfile = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/student/studentprofile?student_id=${studentID}`);
            setStudentData(response.data);
            setNotFound(false);
            alertShown.current = false; // Reset alertShown when student is found
        } catch (err) {
            setStudentData(null);
            setNotFound(true);
            if(!alertShown.current){
                alert("Student ID does not exist.");
                alertShown.current = true;
            }
            navigate(-1); //navigate back to the previous page if id invalid
        } finally {
            setLoading(false);
        }
    }

    //display student's profile data
    //TODO: add more student data fields later depending on what we want to display
    return (
        <div>
            <HeaderLoader />
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
            <FooterLoader />
        </div>
    );
}