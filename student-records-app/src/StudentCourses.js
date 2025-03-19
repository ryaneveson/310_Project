import React, { useState, useEffect } from "react";
import axios from "axios";
import "./frontend/StudentCourses.css";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const hours = Array.from({ length: 25 }, (_, i) => 8 + i * 0.5); // 8:00 - 20:00 PM in 30-min increments

function StudentCourses({ mockEvents = null, compact = false }) {
  const [events, setEvents] = useState([]);
  const [hoveredEvents, setHoveredEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [allClasses, setAllClasses] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);

    if (mockEvents) {
      setEvents(mockEvents);
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
          classes: student.classes
        }));
        setStudents(formattedStudents);
        setLoading(false);
      } catch (err) {
        alert("error fetching students");
      }
    };

    const fetchAllCourses = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/courses`);
        const courseData = response.data;

        const dayMap = {
          "Mon": "Monday",
          "Tue": "Tuesday",
          "Wed": "Wednesday",
          "Thu": "Thursday",
          "Fri": "Friday"
        };

        const formattedCourses = courseData.map(course => {
          const [daysPart, timePart] = course.date.split(" ");
          const daysArr = daysPart.split("-").map(d => dayMap[d] || d);
          const [startTime, endTime] = timePart.split("-");

          const events = daysArr.map(day => ({
            day,
            startTime,
            endTime,
            classCode: `${course.dept} ${course.courseNum}`,
            room: course.room 
          }));

          return {
            name: `${course.dept} ${course.courseNum}`,
            events
          };
        });

        setAllClasses(formattedCourses);
      } catch (err) {
        alert("error fetching all courses");
      }
    };

    fetchStudents();
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;

    const fetchCourses = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/student/courses?student_id=${selectedStudent.studentNumber}`);
        const courseData = response.data.courses;
        const dayMap = {
          "Mon": "Monday",
          "Tue": "Tuesday",
          "Wed": "Wednesday",
          "Thu": "Thursday",
          "Fri": "Friday"
        };

        const formattedEvents = courseData.map(course => ({
          day: dayMap[course.day] || course.day,
          startTime: course.startTime,
          endTime: course.endTime,
          classCode: course.classCode,
          room: course.room
        }));

        setEvents(formattedEvents);
        setLoading(false);
      } catch (err) {
        alert("Error fetching courses.");
      }
    };

    fetchCourses();
  }, [selectedStudent]);

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours + (minutes / 60);
  };

  const checkOverlap = (hoveredEvent) => {
    return events.some(existingEvent => {
      return hoveredEvent.day === existingEvent.day &&
        parseTime(hoveredEvent.startTime) < parseTime(existingEvent.endTime) &&
        parseTime(hoveredEvent.endTime) > parseTime(existingEvent.startTime);
    });
  };

  if (loading) return <div>Loading...</div>;

  const toggleClasses = () => setSidebarVisible(!isSidebarVisible);

  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  if (!userRole) return <div>Loading...</div>;

  if (userRole !== "admin") {
    return (
      <div className="dashboard-container">
        <h2>Access Denied</h2>
        <p>This page is only accessible to administrators.</p>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  const handleChange = (e) => {
    setSelectedStudent(JSON.parse(e.target.value));
  };

  const handleRegister = (course) => {
    hoveredEvents.map((event) => {
        if(checkOverlap(event)){
            alert("Error: can not register as it overlaps with already registred class.");
            return;
        }
        fetch("http://localhost:5000/api/register-course", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              student_id: selectedStudent.studentNumber,
              course_name: course.name,
            }),
        })
        .then((response) => response.json())
        .then((data) => {
            alert(`You have registered for ${course.name}!`);
        })
        .catch((error) => console.error("Error registering for course:", error));
    });
};

  return (
    <article id="student-courses-container">
      <div id="select-student">
        <h2>Select a student:</h2>
        <select id="selectedStudent" onChange={handleChange}>
          <option value={null}>-Select a student-</option>
          {students.map((student, index) => (
            <option key={index} value={JSON.stringify(student)}>
              {student.studentNumber}, {student.name} {student.lastName}
            </option>
          ))}
        </select>
      </div>

      <section id="data-container">
        <div data-testid="calendar-container" className="calendar-container">
          <div className="calendar-grid">
            <div className="time-column">Weekly Schedule</div>
            {days.map((day) => <div key={day} className="day-header">{day}</div>)}
            {hours.map((hour) => (
              <div key={hour} className="time-slot">
                {Math.floor(hour)}:{hour % 1 === 0 ? "00" : "30"}
              </div>
            ))}
            {days.map((day) => (
              <div key={day} className="day-column">
                {hours.map((hour) => (
                  <div key={`${day}-${hour}`} className="hour-cell"></div>
                ))}
              </div>
            ))}

            {hoveredEvents.map((event, index) => {
              const { day, startTime, endTime, classCode } = event;
              const overlaps = checkOverlap(event);
              const top = (((parseTime(startTime) - 8) * 80) + 50) + "px";
              const height = ((parseTime(endTime) - parseTime(startTime)) * 80) + "px";
              return (
                <div
                  key={`hovered-${index}`}
                  className={`event-block hovered-event ${overlaps ? 'overlap' : ''}`}
                  style={{
                    gridColumnStart: days.indexOf(day) + 2,
                    top,
                    height,
                    zIndex: 10,
                  }}
                >
                  {classCode} <br /> {event.room}
                </div>
              );
            })}

            {events.map((event, index) => {
              const { day, startTime, endTime, classCode, room } = event;
              const top = (((parseTime(startTime) - 8) * 80) + 50) + "px";
              const height = ((parseTime(endTime) - parseTime(startTime)) * 80) + "px";
              return (
                <div
                  key={index}
                  className="event-block"
                  style={{
                    gridColumnStart: days.indexOf(day) + 2,
                    top,
                    height,
                    zIndex: 1,
                  }}
                >
                  {classCode} <br /> {room}
                </div>
              );
            })}
          </div>
        </div>

        <div id="classes">
          <button id="toggle-btn" className="btn" onClick={toggleClasses}>
            {isSidebarVisible ? 'Collapse' : 'Expand'}
          </button>
          <h3>Classes</h3>
          <div className="register" data-testid="register" style={{
            height: isSidebarVisible ? 'auto' : '0',
            transition: 'width 0.3s ease',
            overflow: 'hidden'
          }}>
            {allClasses.map((course) => (
              <div key={course.name}>
                <label>
                  {course.name}
                  <button
                    id="className"
                    className="btn"
                    onClick={handleRegister(course)}
                    onMouseEnter={() => {
                      const hoveredCourse = allClasses.find(c => c.name === course.name);
                      setHoveredEvents(hoveredCourse?.events || []);
                    }}
                    onMouseLeave={() => {
                      setHoveredEvents([]);
                    }}
                  >
                    Register
                  </button>
                </label>
                <br />
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}

export default StudentCourses;
