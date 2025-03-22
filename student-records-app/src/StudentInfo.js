import React, { useState, useEffect } from "react";
import axios from "axios";
import "./frontend/studentInfoStyles.css";
import Header from "./Header";

function StudentInformation() {
    const [userInfo, setUserInfo] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        gender: "",
        password: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editedInfo, setEditedInfo] = useState({});
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const studentId = localStorage.getItem("student_id");
                if (!studentId) {
                    window.location.href = "/";
                    return;
                }

                const response = await axios.get(`http://localhost:5000/api/student/studentprofile?student_id=${studentId}`);
                const { student } = response.data;
                
                setUserInfo({
                    username: localStorage.getItem("username") || "",
                    first_name: student.first_name || "",
                    last_name: student.last_name || "",
                    email: student.email || "",
                    gender: student.gender || "",
                    password: "" // Password is not fetched for security
                });
            } catch (err) {
                setMessage({
                    text: "Error fetching user information",
                    type: "error"
                });
            }
        };

        fetchUserInfo();
    }, []);

    const handleEdit = () => {
        setEditedInfo({ ...userInfo });
        setIsEditing(true);
        setMessage({ text: "", type: "" });
    };

    const handleSave = async () => {
        try {
            // Update user information
            const response = await axios.put(`http://localhost:5000/api/user/update`, {
                currentUsername: userInfo.username,
                newInfo: editedInfo
            });

            setUserInfo(editedInfo);
            localStorage.setItem("username", editedInfo.username);
            setIsEditing(false);
            setMessage({
                text: "Information updated successfully!",
                type: "success"
            });
        } catch (err) {
            setMessage({
                text: err.response?.data?.error || "Error updating information",
                type: "error"
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedInfo({});
        setMessage({ text: "", type: "" });
    };

    const handleChange = (e) => {
        setEditedInfo({
            ...editedInfo,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div>
            <Header />
            <div className="student-info-container">
                <h2 className="student-info-header">Personal Information</h2>
                <div className="info-section">
                    <div className="info-grid">
                        {isEditing ? (
                            // Edit Mode
                            <>
                                <div className="info-field">
                                    <label className="info-label">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={editedInfo.username}
                                        onChange={handleChange}
                                        className="info-input"
                                    />
                                </div>
                                <div className="info-field">
                                    <label className="info-label">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={editedInfo.password}
                                        onChange={handleChange}
                                        className="info-input"
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div className="info-field">
                                    <label className="info-label">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={editedInfo.first_name}
                                        onChange={handleChange}
                                        className="info-input"
                                    />
                                </div>
                                <div className="info-field">
                                    <label className="info-label">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={editedInfo.last_name}
                                        onChange={handleChange}
                                        className="info-input"
                                    />
                                </div>
                                <div className="info-field">
                                    <label className="info-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editedInfo.email}
                                        onChange={handleChange}
                                        className="info-input"
                                    />
                                </div>
                                <div className="info-field">
                                    <label className="info-label">Gender</label>
                                    <select
                                        name="gender"
                                        value={editedInfo.gender}
                                        onChange={handleChange}
                                        className="info-input"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </>
                        ) : (
                            // View Mode
                            <>
                                <div className="info-field">
                                    <span className="info-label">Username</span>
                                    <span className="info-value">{userInfo.username}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">First Name</span>
                                    <span className="info-value">{userInfo.first_name}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Last Name</span>
                                    <span className="info-value">{userInfo.last_name}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{userInfo.email}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Gender</span>
                                    <span className="info-value">{userInfo.gender}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="button-container">
                        {isEditing ? (
                            <>
                                <button className="edit-button save-button" onClick={handleSave}>
                                    Save Changes
                                </button>
                                <button className="edit-button cancel-button" onClick={handleCancel}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button className="edit-button" onClick={handleEdit}>
                                Edit Information
                            </button>
                        )}
                    </div>

                    {message.text && (
                        <div className={message.type === "error" ? "error-message" : "success-message"}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentInformation;