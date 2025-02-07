import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Courses from "./Courses"; // Import Courses page
import EditGrades from './editGrades';
import CreateUser from "./createUser";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} /> {/* Courses Route */}
        <Route path="/editGrades" element={<EditGrades />} />
      </Routes>
    </Router>
  );
}

export default App;

