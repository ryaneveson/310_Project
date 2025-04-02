import React, { useState, useEffect } from "react";
import "./frontend/studentProfileInput.css";
import PageBackground from './components/PageBackground';

function StudentProfileInput() {
    const [userRole, setUserRole] = useState(null);
    const [studentID, setStudentID] = useState("");

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (!role) {
            window.location.href = "/";
            return;
        }
        setUserRole(role);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("role");
        window.location.href = "/";
    };

    const handleSubmit = () => {
        if (studentID.trim()) {
            window.location.href = `/studentProfile/${encodeURIComponent(studentID)}`;
        } else {
            alert("Please enter a student ID.");
        }
    };

    if (!userRole) {
        return <div>Loading...</div>;
    }

    if (userRole !== "admin") {
        return (
            <div className="profile-search-container">
                <div className="access-denied">
                    <h2>Access Denied</h2>
                    <p>This page is only accessible to administrators.</p>
                    <button className="profile-logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <PageBackground>
        <div className="profile-search-container">
            <div className="profile-search-header">
                <h2>Student Profile Search</h2>
                <p>Enter a student ID to view their profile</p>
            </div>

            <div className="profile-search-form">
                <input
                    type="text"
                    placeholder="Enter Student ID"
                    value={studentID}
                    onChange={(e) => setStudentID(e.target.value)}
                    className="profile-search-input"
                />
                <button id="profileInput-submit" onClick={handleSubmit} className="profile-search-button">
                    <label htmlFor="profileInput-submit">View Profile</label>
                </button>
            </div>
        </div>
        </PageBackground>
    );
}

export default StudentProfileInput;