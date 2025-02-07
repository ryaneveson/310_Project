import React, { useState } from "react";
import "./calendar.css";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const hours = Array.from({ length: 25 }, (_, i) => 8 + i * 0.5); // 8 AM - 8 PM in 30-min increments

function Calendar() {
    const [events, setEvents] = useState([
        {day: "Monday", startTime: "9", endTime: "11", title: "Team Meeting"},
        {day: "Tuesday", startTime: "13", endTime: "14", title: "Client Call"},
        {day: "Thursday", startTime: "16", endTime: "17", title: "Project Review"},
        {day: "Friday", startTime: "11", endTime: "12", title: "Lunch Break"},
      ]);

  return (
    <div className="calendar-container">
      <div className="calendar-grid">
        {/* render column headers */}
        <div className="time-column"></div>
        {days.map((day) => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}

        {/* render time slots */}
        {hours.map((hour) => (
          <div key={hour} className="time-slot">
            {Math.floor(hour)}:{hour % 1 === 0 ? "00" : "30"}
          </div>
        ))}

        {/* render schedule cells */}
        {days.map((day) => (
          <div key={day} className="day-column">
            {hours.map((hour) => (
              <div key={`${day}-${hour}`} className="hour-cell"></div>
            ))}
          </div>
        ))}

        {/* render event blocks */}
        {events.map((event, index) => {
          const { day, startTime, endTime, title } = event;
          const dayIndex = days.indexOf(day);
          const startHour = parseFloat(startTime);
          const endHour = parseFloat(endTime);
          const topPosition = (((startHour - 8) * 40) + 5) + "px";
          const height = (((endHour - startHour) * 100) - 10) + "px";

          return (
            <div
              key={index}
              className="event-block"
              style={{
                gridColumnStart: dayIndex + 2,
                gridRowStart: (startHour - 7.5) * 2,
                height,
                top: topPosition,
              }}
            >
              {title}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
