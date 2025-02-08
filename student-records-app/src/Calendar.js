import React, { useState } from "react";
import "./calendar.css";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const hours = Array.from({ length: 25 }, (_, i) => 8 + i * 0.5); // 8:00 - 20:00 PM in 30-min increments

function Calendar() {
  const [events, setEvents] = useState([
    { day: "Monday", startTime: "9:00", endTime: "11:00", classCode: "COSC 111", room: "COM 201" },
    { day: "Tuesday", startTime: "13:00", endTime: "14:30", classCode: "MATH 101", room: "COM 201" },
    { day: "Thursday", startTime: "15:30", endTime: "17:00", classCode: "COSC 304", room: "COM 201" },
    { day: "Friday", startTime: "11:00", endTime: "12:00", classCode: "COSC 310", room: "COM 201" },
  ]);

  // function to convert "HH:MM" to decimal hours
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours + minutes / 60;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-grid">
        {/* column headers */}
        <div className="time-column"></div>
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

        {/* event Blocks */}
        {events.map((event, index) => {
          const { day, startTime, endTime, classCode, room } = event;
          const dayIndex = days.indexOf(day);
          const startHour = parseTime(startTime);
          const endHour = parseTime(endTime);

          const topPosition = (((startHour - 8) * 80) + 50) + "px"; // each hour = 80px (2x 40px for half-hour) + 50 to account for day header
          const height = ((endHour - startHour) * 80) + "px"; // dynamic height based on duration

          return (
            <div
              key={index}
              className="event-block"
              style={{
                gridColumnStart: dayIndex + 2, // align event to correct day
                top: topPosition, // correct vertical position
                height: height, // correct event duration
              }}
            >
              {classCode} <br />
              {room}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
