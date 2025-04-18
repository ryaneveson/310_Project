import React, { useState, useEffect } from "react";
import axios from "axios";
import "./frontend/addFee.css";
import PageBackground from './components/PageBackground';
function AddFee({ mockStudents = null }) {
    const [userRole, setUserRole] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [allClasses, setAllClasses] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState(""); 
    const [isSidebarVisible, setSidebarVisible] = useState(true);
    const [feeName, setFeeName] = useState("");
    const [feeAmount, setFeeAmount] = useState("");
    const [feeDate, setFeeDate] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (!role) {
            window.location.href = "/";
            return;
        }
        setUserRole(role);

        if(mockStudents){
            setStudents(mockStudents);
            const allUniqueClasses = [
                ...new Set(
                    mockStudents
                        .flatMap(student => student.classes)
                        .filter(className => /^[A-Z]{4} [0-9]{3}$/.test(className)) //excludes all courses that dont follow the standard naming convention
                )
            ].sort();
            setAllClasses(allUniqueClasses);
            setLoading(false);
            return;
        }

        const fetchStudents = async () => {
            try {
              const response = await axios.get(`http://localhost:5000/api/student`);
              const studentData = response.data.students;
              const formattedStudents = studentData.map(student => ({
                name: student.name,
                lastName: student.lastName,
                studentNumber: student.studentNumber,
                gpa: student.gpa,
                classes: student.classes
              }));
              setStudents(formattedStudents);

              const allUniqueClasses = [
                ...new Set(
                    formattedStudents
                        .flatMap(student => student.classes)
                        .filter(className => /^[A-Z]{4} [0-9]{3}$/.test(className)) //excludes all courses that dont follow the standard naming convention
                )
            ].sort();
              setAllClasses(allUniqueClasses);
              setLoading(false);
            } catch (err) {
              alert("error fetching students");
            }
          };
          fetchStudents();
    }, []);

    if(loading){
        return <div>Loading...</div>;
    }

    const handleLogout = () => {
        localStorage.removeItem("role");
        window.location.href = "/";
    };

    const handleClassSelection = (className) => {
        setSelectedClasses((prev) => {
            const newSelectedClasses = new Set(prev);
            if (newSelectedClasses.has(className)) {
                newSelectedClasses.delete(className);
            } else {
                newSelectedClasses.add(className);
            }
            return newSelectedClasses;
        });
    };

    const filteredStudents = students.filter(student =>
        selectedClasses.size === 0 ||
        [...selectedClasses].every(className => student.classes.includes(className))
    ).filter(student =>
        searchTerm === "" ||
        `${student.name} ${student.lastName} ${student.studentNumber}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    const toggleClasses = () => {
        setSidebarVisible(!isSidebarVisible);
    };

    const reset = () => {
        setSelectedClasses(new Set());
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    const exportSelectedToJson = async () => {
        try {
            // Get fees for each selected student
            const feesPromises = selectedStudents.map(student => 
                axios.get(`http://localhost:5000/api/student/finances?student_id=${student.studentNumber}`)
            );
            
            const responses = await Promise.all(feesPromises);
            
            // Format the data to only include fees and paid status
            const exportData = responses.reduce((acc, response, index) => {
                if (response.data.finances) {
                    acc.push({
                        student_number: selectedStudents[index].studentNumber,
                        student_name: `${selectedStudents[index].name} ${selectedStudents[index].lastName}`,
                        fees: response.data.finances.map(finance => ({
                            item_name: finance.item_name,
                            amount: finance.amount,
                            is_paid: finance.is_paid
                        }))
                    });
                }
                return acc;
            }, []);

            // Export to JSON file
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileDefaultName = 'student_fees.json';

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        } catch (error) {
            alert('Error exporting fees data: ' + error.message);
        }
    };

    if (!userRole) {
        return <div>Loading...</div>;
    }

    if (userRole !== "admin") {
        return (
            <div className="dashboard-container">
                <h2>Access Denied</h2>
                <p>This page is only accessible to administrators.</p>
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        );
    }

    //function to validate currency input
    const validateCurrencyInput = (event) => {
        let value = event.target.value;
        //remove non-numeric characters except for the first '.'
        value = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
        //prevent multiple leading zeros
        value = value.replace(/^0+(\d)/, "$1");
        //allow only two decimal places
        const parts = value.split(".");
        if (parts.length === 2) {
        parts[1] = parts[1].slice(0, 2);
        value = parts.join(".");
        }
        setFeeAmount(value);
    };

    const handleBlur = () => {
        if (feeAmount) {
          const numericValue = parseFloat(feeAmount);
          if (!isNaN(numericValue)) {
            setFeeAmount(numericValue.toFixed(2));
          }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!feeName || !feeAmount || !feeDate || selectedStudents.length === 0) {
            alert("All fields are required and at least one student must be selected.");
            return;
        }

        const studentsData = selectedStudents.map(student => ({
            student_id: student.studentNumber,
            item_name: feeName,
            amount: parseFloat(feeAmount),
            due_date: feeDate,
        }));
        fetch("http://localhost:5000/api/add-fee", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ students: studentsData }),
        })
        .then(async (response) => {
            const data = await response.json();
            if (response.ok) {
                alert('Fees added successfully for selected students.');
                window.location.href="/addFee";
            } else {
                alert(`Error adding fees: ${data.error}`);
            }
        })
        .catch((error) => alert(`Error adding fees: ${error}`));
    };

    return (
        <PageBackground>
        <div id="studentSearch">
            <aside className="sidebar" id="sidebar">
                <div className="button-container">
                    <button id="reset-btn" className="btn" data-testid="reset" onClick={reset}>Reset All</button>
                    <button id="toggle-btn" className="btn" onClick={toggleClasses}>
                        {isSidebarVisible ? 'Collapse' : 'Expand'}
                    </button>
                </div>
                <h3>Classes</h3>
                <div className="checkboxes" data-testid="checkboxes" style={{
                    height: isSidebarVisible ? 'auto' : '0',
                    transition: 'width 0.3s ease',
                    overflow: 'hidden'
                }}>
                    {allClasses.map((className) => (
                        <div key={className} >
                            <label>
                                {className}
                                <button className="btn" onClick={() => {
                    const studentsInClass = students.filter(student => student.classes.includes(className));
                    setSelectedStudents(prev => {
                        const uniqueStudents = [...prev, ...studentsInClass].filter(
                            (student, index, self) =>
                                self.findIndex(s => s.studentNumber === student.studentNumber) === index
                        );
                        return uniqueStudents;
                    });
                }}>Select Students in Class</button>
                                <input
                                    type="checkbox"
                                    data-testid={className}
                                    checked={selectedClasses.has(className)}
                                    onChange={() => handleClassSelection(className)}
                                />
                            </label>
                            <br />
                        </div>
                    ))}
                </div>
            </aside>
            <article>
                <div id="search">
                    <label>Search for a student:<br />
                        <input
                            type="text"
                            placeholder="Search for a student..."
                            value={searchTerm}
                            id="search-term"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-box"
                        />
                    </label>
                    <button id="clear-btn" className="btn" onClick={clearSearch}>Clear</button>
                </div>
                <div id="results">
                    <h2>Filtered Students</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Student Number</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <tr key={index}>
                                    <td>{student.name}</td>
                                    <td>{student.lastName}</td>
                                    <td>{student.studentNumber}</td>
                                    <td>
                                        <button className="btn" onClick={() => setSelectedStudents(prev => [...prev, student])}>
                                            Select Student
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </article>
            <article id="fee-container">
            <form id="fee-form" onSubmit={handleSubmit}>
                <h2>Fee details</h2><br></br>
                    <label>Fee Name:<br />
                        <input
                            type="text"
                            placeholder="Fee's Name . . ."
                            id="fee-name"
                            onChange={(e) => setFeeName(e.target.value)}
                            className="fee-box"
                        />
                    </label>
                    <label>Fee Amount:<br />
                        <input
                            type="text"
                            placeholder="0.00"
                            id="fee-amount"
                            onChange={validateCurrencyInput}
                            onBlur={handleBlur}
                            className="fee-box"
                        />
                    </label>
                    <label>Fee Due Date:<br />
                        <input
                            type="date"
                            placeholder="YYYY-MM-DD"
                            id="fee-date"
                            onChange={(e) => setFeeDate(e.target.value)}
                            className="fee-box"
                        />
                    </label>
                    <button id="fee-submit" type="submit">Submit Fee</button>
                </form>
                <div id="selected-students">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2>Selected Students</h2>
                        <button className="btn" onClick={exportSelectedToJson}>Export to JSON</button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Student Number</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedStudents.map((student, index) => (
                                <tr key={index}>
                                    <td>{student.name}</td>
                                    <td>{student.lastName}</td>
                                    <td>{student.studentNumber}</td>
                                    <td>
                                        <button className="btn" onClick={() => setSelectedStudents(prev => prev.filter(s => s.studentNumber !== student.studentNumber))}>
                                            Remove Student
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </article>
        </div>
        </PageBackground>
    );
}

export default AddFee;