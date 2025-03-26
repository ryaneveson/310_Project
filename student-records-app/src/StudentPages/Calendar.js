import React, { useState, useEffect } from "react";
import axios from "axios";
import "../frontend/calendar.css";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const hours = Array.from({ length: 25 }, (_, i) => 8 + i * 0.5); // 8:00 - 20:00 PM in 30-min increments

const dayMap = {
  "Mon": "Monday",
  "Tue": "Tuesday",
  "Wed": "Wednesday",
  "Thu": "Thursday",
  "Fri": "Friday"
};

function Calendar({ mockEvents = null, compact = false }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mockEvents) {
      setEvents(mockEvents);
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      try {
        const studentId = localStorage.getItem("student_id");
        if (!studentId) {
          setError("No student ID found");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/student/courses?student_id=${studentId}`);
        
        if (response.data.error) {
          setError(response.data.error);
          setLoading(false);
          return;
        }

        const courseData = response.data.courses;
        
        // Transform the data for calendar display
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
        console.error("Error fetching courses:", err);
        setError(err.response?.data?.error || "Error fetching courses");
        setLoading(false);
      }
    };

    fetchCourses();
  }, [mockEvents]);

  if (loading) return <div>Loading calendar...</div>;
  if (error) return <div>Error: {error}</div>;
  if (events.length === 0) return <div>No courses scheduled</div>;

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours + (minutes / 60);
  };

  return (
    <div data-testid="calendar-container" className={`calendar-container ${compact ? 'calendar-compact' : ''}`}>
      <div className="calendar-grid">
        {/* column headers */}
        <div className="time-column">Weekly Schedule</div>
        {days.map((day) => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}

        {/* time slots */}
        {hours.map((hour) => (
          <div key={hour} className="time-slot">
            {Math.floor(hour)}:{hour % 1 === 0 ? "00" : "30"}
          </div>
        ))}

        {/* schedule Grid */}
        {days.map((day) => (
          <div key={day} className="day-column">
            {hours.map((hour) => (
              <div key={`${day}-${hour}`} className="hour-cell"></div>
            ))}
          </div>
        ))}

        {events.map((event, index) => {
          const { day, startTime, endTime, classCode, room } = event;
          const dayIndex = days.indexOf(day);
          const startHour = parseTime(startTime);
          const endHour = parseTime(endTime);
          
          if (compact) {
            const topPosition = ((startHour - 8) * 40) + 30 + "px";
            const height = (endHour - startHour) * 40 + "px";

            return (
              <div
                key={index}
                className="event-block"
                data-testid="event-block"
                style={{
                  left: `${(dayIndex + 1) * 100 + 60}px`,
                  top: topPosition,
                  height: height,
                }}
              >
                {classCode} <br />
                {room}
              </div>
            );
          } else {
            const topPosition = (((startHour - 8) * 80) + 50) + "px";
            const height = ((endHour - startHour) * 80) + "px";

            return (
              <div
                key={index}
                className="event-block"
                style={{
                  gridColumnStart: dayIndex + 2,
                  top: topPosition,
                  height: height,
                }}
              >
                {classCode} <br />
                {room}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

export default Calendar;
