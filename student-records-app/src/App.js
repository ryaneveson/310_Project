import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Calendar from "./StudentPages/Calendar.js";
import EditGrades from "./AdminPages/editGrades";
import Courses from "./StudentPages/Courses.js";
import Finances from "./FinancePages/Finances.js";
import MakePayment from "./FinancePages/MakePayment.js";
import StudentRanking from './AdminPages/studentRanking';
import CreateUser from "./StudentPages/createUser.js";
import StudentSearch from "./AdminPages/StudentSearch";
import StudentProfileInput from "./AdminPages/studentProfileInput";
import StudentProfile from "./AdminPages/studentProfile";
import AcademicDashboard from "./StudentPages/AcademicDashboard.js"
import AddPaymentMethod from "./FinancePages/addPaymentMethod.js";
import PaymentHistory from "./FinancePages/PaymentHistory.js";
import UpcomingDue from "./FinancePages/UpcomingDue";
import AddFee from "./FinancePages/AddFee.js";
import ManageStudents from "./AdminPages/ManageStudents";
import StudentInformation from './AdminPages/StudentInfo';
import StudentGrades from './StudentPages/StudentGrades.js';  

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
        <Route path="/studentProfileInput" element={<StudentProfileInput />} />
        <Route path="/studentProfile/:studentID" element={<StudentProfile />} />
        <Route path="/studentProfile" element={<StudentProfile />} />
        <Route path="/academicdashboard" element={<AcademicDashboard />} />
        <Route path="/addPaymentMethod" element={<AddPaymentMethod />} />
        <Route path="/createUser" element={<CreateUser />} />
        <Route path="/paymentHistory" element={<PaymentHistory />} />
        <Route path="/upcomingDue" element={<UpcomingDue />} />
        <Route path="/addFee" element={<AddFee />} />
        <Route path="/manageStudents" element={<ManageStudents />} />
        <Route path="/StudentInfo" element={<StudentInformation />} />
        <Route path="/grades" element={<StudentGrades />} />
      </Routes>
    </Router>
  );
}

export default App;
