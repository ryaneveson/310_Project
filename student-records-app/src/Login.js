import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./frontend/loginStyles.css";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // Step 1: Login, Step 2: 2FA
  const [code, setCode] = useState("");

  useEffect(() => {
    fetch("/footer.html")
      .then((res) => res.text())
      .then((data) => (document.getElementById("footer").innerHTML = data));
  }, []);

  const users = {
    admin: { username: "admin", password: "adminpass", role: "admin" },
    student: { username: "student", password: "studentpass", role: "student" },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // First check hardcoded users
    if ((username === users.admin.username && password === users.admin.password) ||
        (username === users.student.username && password === users.student.password)) {
      const role = username === users.admin.username ? "admin" : "student";
      localStorage.setItem("role", role);
      localStorage.setItem("username", username);
      setStep(2);
      return;
    }

    // If not hardcoded user, try database
    try {
      console.log('Attempting database login with:', { username });

      const response = await fetch(`${API_URL}/login`, {
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
        localStorage.setItem("role", "student");
        localStorage.setItem("username", username);
        setStep(2);
      } else {
        setError(data.error || "Invalid username or password!");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("An error occurred during login. Please try again.");
    }
  };
  

  const handle2FA = (e) => {
    e.preventDefault();
    if (code === "123456") {
      const role = localStorage.getItem("role");
      console.log(`${role} logged in successfully`);
      
      // Use window.location.href for hard redirect
      if (role === "admin") {
        window.location.href = "/dashboard";
      } else if (role === "student") {
        window.location.href = "/dashboard";
      }
    } else {
      setError("Invalid 2FA code!");
    }
};


  return (
    <div className="page-container">
      <div className="content-wrap">
        <div className="auth-container">
          <div className="auth-box">
            <h2 className="auth-title">{step === 1 ? "Login" : "Enter 2FA Code"}</h2>
            {step === 1 ? (
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
            ) : (
              <form onSubmit={handle2FA}>
                <input
                  type="text"
                  placeholder="Enter 2FA Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="auth-input"
                />
                <button type="submit" className="auth-button">Verify</button>
              </form>
            )}
            {error && <p className="auth-error">{error}</p>}
            {step === 1 && (
              <p className="auth-footer">
                Don't have an account?{" "}
                <Link to="/createUser" className="auth-link">Create one here</Link>
              </p>
            )}
          </div>
        </div>
      </div>
      
      <footer className="footer">
        {/* Your footer content */}
      </footer>
    </div>
  );
};

export default Login;
