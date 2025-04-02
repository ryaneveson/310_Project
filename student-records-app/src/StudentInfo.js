import React, { useState, useEffect } from "react";
import axios from "axios";
import "./frontend/studentInfoStyles.css";
import PageBackground from './components/PageBackground';

function StudentInformation() {
    const initialUserState = {
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        gender: "",
        password: ""
    };

    const [userInfo, setUserInfo] = useState(initialUserState);
    const [isEditing, setIsEditing] = useState(false);
    const [editedInfo, setEditedInfo] = useState({});
    const [message, setMessage] = useState({ text: "", type: "" });

    // create a helper method for api calls
    const apiService = {
        fetchStudentInfo: async (studentId) => {
            const response = await axios.get(`http://localhost:5000/api/student/studentprofile?student_id=${studentId}`);
            return response.data.student;
        },
        updateUserInfo: async (currentUsername, newInfo) => {
            return await axios.put(`http://localhost:5000/api/user/update`, {
                currentUsername,
                newInfo
            });
        }
    };

    // create a helper method for message handling
    const showMessage = (text, type = "error") => {
        setMessage({ text, type });
    };

    // create a helper method for form rendering
    const renderFormField = (label, name, type = "text", options = null) => {
        if (type === "select") {
            return (
                <div className="info-field2">
                    <label className="info-label2">{label}</label>
                    <select
                        name={name}
                        value={editedInfo[name]}
                        onChange={handleChange}
                        className="info-input2"
                    >
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            );
        }

        return (
            <div className="info-field2">
                <label className="info-label2">{label}</label>
                <input
                    type={type}
                    name={name}
                    value={editedInfo[name]}
                    onChange={handleChange}
                    className="info-input2"
                    placeholder={type === "password" ? "Enter new password" : ""}
                />
            </div>
        );
    };

    // create a helper method for info display
    const renderInfoField = (label, value) => (
        <div className="info-field2">
            <span className="info-label2">{label}</span>
            <span className="info-value2">{value}</span>
        </div>
    );

    // create a helper method for form validation
    const validateForm = () => {
        const requiredFields = ['username', 'first_name', 'last_name', 'email'];
        for (const field of requiredFields) {
            if (!editedInfo[field]) {
                showMessage(`${field.replace('_', ' ')} is required`);
                return false;
            }
        }
        if (editedInfo.email && !editedInfo.email.includes('@')) {
            showMessage('Invalid email format');
            return false;
        }
        return true;
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const studentId = localStorage.getItem("student_id");
                if (!studentId) {
                    window.location.href = "/";
                    return;
                }

                const student = await apiService.fetchStudentInfo(studentId);
                setUserInfo({
                    username: localStorage.getItem("username") || "",
                    first_name: student.first_name || "",
                    last_name: student.last_name || "",
                    email: student.email || "",
                    gender: student.gender || "",
                    password: ""
                });
            } catch (err) {
                showMessage("Error fetching user information");
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
            if (!validateForm()) return;

            await apiService.updateUserInfo(userInfo.username, editedInfo);
            setUserInfo(editedInfo);
            localStorage.setItem("username", editedInfo.username);
            setIsEditing(false);
            showMessage("Information updated successfully!", "success");
        } catch (err) {
            showMessage(err.response?.data?.error || "Error updating information");
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
        <PageBackground>
            <div className="student-info-container2">
                <h2 className="student-info-header2">Personal Information</h2>
                <div className="info-section2">
                    <div className="info-grid2">
                        {isEditing ? (
                            <>
                                {renderFormField("Username", "username")}
                                {renderFormField("Password", "password", "password")}
                                {renderFormField("First Name", "first_name")}
                                {renderFormField("Last Name", "last_name")}
                                {renderFormField("Email", "email", "email")}
                                {renderFormField("Gender", "gender", "select", ["", "Male", "Female", "Other"])}
                            </>
                        ) : (
                            <>
                                {renderInfoField("Username", userInfo.username)}
                                {renderInfoField("First Name", userInfo.first_name)}
                                {renderInfoField("Last Name", userInfo.last_name)}
                                {renderInfoField("Email", userInfo.email)}
                                {renderInfoField("Gender", userInfo.gender)}
                            </>
                        )}
                    </div>

                    <div className="button-container2">
                        {isEditing ? (
                            <>
                                <button className="edit-button2 save-button2" onClick={handleSave}>
                                    Save Changes
                                </button>
                                <button className="edit-button2 cancel-button2" onClick={handleCancel}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button className="edit-button2" onClick={handleEdit}>
                                Edit Information
                            </button>
                        )}
                    </div>

                    {message.text && (
                        <div className={message.type === "error" ? "error-message2" : "success-message2"}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </PageBackground>
    );
}

export default StudentInformation;