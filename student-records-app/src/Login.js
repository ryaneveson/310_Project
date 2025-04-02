import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./frontend/loginStyles.css";
import PageBackground from './components/PageBackground';

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

    try {
      console.log('Attempting database login with:', { username });

      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (data.success) {
        // Clear any existing data first
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("student_id");
        
        // Set the new data
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", username);
        localStorage.setItem("student_id", data.student_id);  // Store student_id
        
        // Verify the data was set correctly
        const storedRole = localStorage.getItem("role");
        const storedStudentId = localStorage.getItem("student_id");
        console.log('Verified stored role:', storedRole);
        console.log('Verified stored student_id:', storedStudentId);
        
        if (storedRole !== data.role || !storedStudentId) {
          setError("Error: Data not stored correctly");
          return;
        }

        // Redirect directly to dashboard after successful login
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Invalid username or password!");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("An error occurred during login. Please try again.");
    }
  };

  return (
    <PageBackground>
      <div className="page-container">
        <div className="content-wrap">
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
              <button type="submit" className="auth-button2">Login</button>
            </form>
            {error && <p className="auth-error">{error}</p>}
            <p className="auth-footer">
              Don't have an account?{" "}
              <Link to="/createUser" className="auth-link">Create one here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </PageBackground>
  );
};

export default Login;
