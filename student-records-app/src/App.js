import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Courses from "./Courses"; // Import Courses page

function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-800 text-white flex flex-col space-y-4">
        <Link to="/" className="block p-2 bg-gray-700 rounded hover:bg-gray-600">Login</Link>
        <Link to="/dashboard" className="block p-2 bg-gray-700 rounded hover:bg-gray-600">Dashboard</Link>
        <Link to="/courses" className="block p-2 bg-gray-700 rounded hover:bg-gray-600">Courses</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} /> {/* Courses Route */}
      </Routes>
    </Router>
  );
}

export default App;

