import React, { useState } from "react";
import "./frontend/header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <header>
      <h1>Werkday</h1>
      <button className={`menu-button ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
        <div></div>
        <div></div>
        <div></div>
      </button>
      <ul className={`dropdown-menu ${menuOpen ? "open" : ""}`}>
        <li><a href="/Dashboard">Home</a></li>
        <li><a href="/Finances">Financial Dashboard</a></li>
        <li><a href="/academicdashboard">Academic Dashboard</a></li>
        <li><a href="/studentInfo">Personal Information</a></li>
        <li><button onClick={handleLogout} className="logout-menu-item">Logout</button></li>
      </ul>
    </header>
  );
};

export default Header;
