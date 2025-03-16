import { useState } from "react";
import "./frontend/loginStyles.css";

const CreateUser = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const verifyStudent = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!studentId) {
      setError("Please enter a student ID");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ student_id: studentId })
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (data.success) {
        setIsVerified(true);
        setError("");
      } else {
        setError(data.error || "Student verification failed");
        setIsVerified(false);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError("An error occurred during verification. Please try again.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, student_id: studentId })
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (response.ok) {
        // Redirect to login page after successful registration
        window.location.href = "/";
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError("An error occurred during registration. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Create Student Account</h2>
        
        {!isVerified ? (
          <form onSubmit={verifyStudent} className="verification-form">
            <p className="auth-instruction">Please enter your student ID to begin:</p>
            <input
              type="text"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" className="auth-button">
              Verify Student ID
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="registration-form">
            <p className="auth-instruction">Create your account credentials:</p>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" className="auth-button">
              Create Account
            </button>
          </form>
        )}

        {error && <p className="auth-error">{error}</p>}
        
        <p className="auth-footer">
          Already have an account?{" "}
          <a href="/" className="auth-link">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default CreateUser;
