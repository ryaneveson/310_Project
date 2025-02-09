import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import EditGrades from './editGrades';
import Courses from "./Courses"; 
import Finances from "./Finances";
import MakePayment from "./MakePayment";
import CreateUser from "./createUser";
import StudentSearch from "./StudentSearch";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editGrades" element={<EditGrades />} />
        <Route path="/courses" element={<Courses />} /> 
        <Route path="/finances" element={<Finances />} />
        <Route path="/makePayment" element={<MakePayment />} />
        <Route path="/studentSearch" element={<StudentSearch />} />
      </Routes>
    </Router>
  );
}

export default App;

