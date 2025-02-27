import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./frontend/loginStyles.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/footer.html")
      .then((res) => res.text())
      .then((data) => (document.getElementById("footer").innerHTML = data));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Hardcoded credentials with roles
    const users = {
      admin: { username: "admin", password: "adminpass", role: "admin" },
      student: { username: "student", password: "studentpass", role: "student" },
    };

    if (username === users.admin.username && password === users.admin.password) {
      console.log("Admin logged in!");
      localStorage.setItem("role", "admin"); // Store role
      window.location.href = "/dashboard";
    } else if (username === users.student.username && password === users.student.password) {
      console.log("Student logged in!");
      localStorage.setItem("role", "student"); // Store role
      window.location.href = "/dashboard";
    } else {
      setError("Invalid username or password!");
    }
  };

  return (
    <>
      <div className="auth-container">
        <div className="auth-box">
          <h2 className="auth-title">Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" className="auth-button">Login</button>
          </form>
          {error && <p className="auth-error">{error}</p>}
          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/createUser" className="auth-link">Create one here</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
