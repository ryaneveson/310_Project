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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    // Hardcoded login credentials
    const hardcodedUsername = "testuser";
    const hardcodedPassword = "mypassword";
  
    if (username === hardcodedUsername && password === hardcodedPassword) {
      localStorage.setItem("token", "hardcoded-token");
      window.location.href = "/dashboard";
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      } else {
        alert("Password or username is incorrect!");
        setError(data.error);
      }
    } catch (err) {
      setError("Error connecting to server");
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