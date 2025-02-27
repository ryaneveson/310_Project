import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Calendar from "./Calendar";
import EditGrades from "./editGrades";
import Courses from "./Courses";
import Finances from "./Finances";
import MakePayment from "./MakePayment";
import StudentRanking from './studentRanking';
import CreateUser from "./createUser.js";
import StudentSearch from "./StudentSearch";
import VerifyRegistration from "./VerifyRegistration";
import AcademicDashboard from "./AcademicDashboard"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editGrades" element={<EditGrades />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/finances" element={<Finances />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/makePayment" element={<MakePayment />} />
        <Route path="/studentRanking" element={<StudentRanking />} />
        <Route path="/studentSearch" element={<StudentSearch />} />
        <Route path="/verify-registration" element={<VerifyRegistration />} />
        <Route path="/academicdashboard" element={<AcademicDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
