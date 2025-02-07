import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      setUsername("User"); // Replace this with actual username logic
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    navigate("/"); 
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Welcome, {username}!</h2>
      <p>You are now logged in.</p>
      <button onClick={handleLogout} style={{ padding: "10px", fontSize: "16px" }}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
