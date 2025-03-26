import { useState, useEffect } from 'react';
import '../frontend/gradesStyles.css';

// Import the GPA calculation from AcademicDashboard
const gradeToGPAMap = new Map([
    [90, 4.33], [89, 4.30], [88, 4.20], [87, 4.10], [86, 4.00],
    [85, 3.95], [84, 3.90], [83, 3.85], [82, 3.80], [81, 3.75],
    [80, 3.70], [79, 3.60], [78, 3.50], [77, 3.40], [76, 3.30],
    [75, 3.20], [74, 3.10], [73, 3.00], [72, 2.95], [71, 2.90],
    [70, 2.80], [69, 2.70], [68, 2.65], [67, 2.60], [66, 2.55],
    [65, 2.50], [64, 2.40], [63, 2.30], [62, 2.20], [61, 2.10],
    [60, 2.00], [59, 1.90], [58, 1.80], [57, 1.70], [56, 1.60],
    [55, 1.50], [54, 1.40], [53, 1.30], [52, 1.20], [51, 1.10],
    [50, 1.00]
]);

const calculateGPA = (grades) => {
    if (!grades || grades.length === 0) return 0;
    const averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    if (averageGrade < 50) return 0;
    let closestGrade = [...gradeToGPAMap.keys()].reduce((prev, curr) => {
        return Math.abs(curr - averageGrade) < Math.abs(prev - averageGrade) ? curr : prev;
    });
    return gradeToGPAMap.get(closestGrade);
};

const StudentGrades = () => {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudentData = async () => {
            const studentId = localStorage.getItem('student_id');
            if (!studentId) {
                setError('Please log in to view your grades');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/api/student/studentprofile?student_id=${studentId}`);
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                setStudentData(data.student);
            } catch (err) {
                setError('Failed to fetch student data: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!studentData) return <div className="error">No data available</div>;

    return (
        <div className="student-ranking">
            <div className="ranking-container">
                <div className="student-header">
                    <h2>Academic Record</h2>
                    <div className="student-info-card">
                        <div className="info-item">
                            <span>Name:</span> {studentData.first_name} {studentData.last_name}
                        </div>
                        <div className="info-item">
                            <span>Student ID:</span> {studentData.student_id}
                        </div>
                        <div className="info-item">
                            <span>Major:</span> {studentData.major}
                        </div>
                        <div className="info-item">
                            <span>GPA:</span> {calculateGPA([...studentData.registered_courses_grades, ...studentData.completed_courses_grades].map(Number)).toFixed(2)}
                        </div>
                    </div>
                </div>

                <div className="courses-container">
                    <div className="course-section">
                        <h2>Current Courses</h2>
                        <div className="rankings-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Grade</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentData.registered_courses.map((course, index) => (
                                        <tr key={`current-${index}`}>
                                            <td>{course}</td>
                                            <td>{studentData.registered_courses_grades[index] || 'In Progress'}</td>
                                            <td>
                                                <span className="status current">Current</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="course-section">
                        <h2>Completed Courses</h2>
                        <div className="rankings-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Grade</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentData.completed_courses.map((course, index) => (
                                        <tr key={`completed-${index}`}>
                                            <td>{course}</td>
                                            <td>{studentData.completed_courses_grades[index]}</td>
                                            <td>
                                                <span className="status completed">Completed</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentGrades; 