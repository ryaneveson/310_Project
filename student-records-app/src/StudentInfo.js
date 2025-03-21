import React, { useState, useEffect } from "react";
import axios from "axios";
import "./frontend/dashboardStyles.css";
import Header from "./Header";

function StudentInformation() {
    const [username, setUsername] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState("");

    useEffect(() => {
        const currentUsername = localStorage.getItem("username");
        if (!currentUsername) {
            window.location.href = "/";
            return;
        }
        setUsername(currentUsername);
    }, []);

    const handleEdit = () => {
        setNewUsername(username);
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            console.log('Attempting to update username...');
            const response = await axios.put(`http://localhost:5000/api/user/update`, {
                currentUsername: username,
                newUsername: newUsername
            });
            console.log('Response:', response.data);
            
            localStorage.setItem("username", newUsername);
            setUsername(newUsername);
            setIsEditing(false);
            alert("Username updated successfully!");
        } catch (err) {
            console.error("Error updating username:", err.response?.data || err.message);
            alert(err.response?.data?.error || "Error updating username");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setNewUsername(username);
    };

    return (
        <div>
            <Header />
            <div className="dashboard-container">
                <h2>Personal Information</h2>
                <div className="dashboard-section">
                    {isEditing ? (
                        <div className="form-group">
                            <label>New Username:</label>
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="form-control"
                            />
                            <div className="button-group">
                                <button className="primary-button" onClick={handleSave}>Save</button>
                                <button className="secondary-button" onClick={handleCancel}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="info-display">
                            <p><strong>Username:</strong> {username}</p>
                            <button className="primary-button" onClick={handleEdit}>Change Username</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentInformation;