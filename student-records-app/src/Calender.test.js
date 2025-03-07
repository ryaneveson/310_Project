import React from "react";
import { render, screen } from "@testing-library/react";
import Calendar from "./Calendar";
const axios = require("axios");

jest.mock("axios");

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const hours = Array.from({ length: 25 }, (_, i) => 8 + i * 0.5); // 8:00 - 20:00 in 30-min increments

const testEvents = [
  { day: "Monday", startTime: "9:00", endTime: "11:00", classCode: "COSC 111", room: "COM 201" },
  { day: "Tuesday", startTime: "13:00", endTime: "14:30", classCode: "MATH 101", room: "COM 202" },
  { day: "Thursday", startTime: "15:30", endTime: "17:00", classCode: "COSC 304", room: "COM 203" },
  { day: "Friday", startTime: "11:00", endTime: "12:00", classCode: "COSC 310", room: "COM 204" },
];

describe("Calendar Component", () => {
  test("renders all time slots from 8:00 to 20:00", () => {
    render(<Calendar mockEvents={testEvents}/>);
    
    hours.forEach((hour) => {
      const timeString = `${Math.floor(hour)}:${hour % 1 === 0 ? "00" : "30"}`;
      expect(screen.getByText(timeString)).toBeInTheDocument();
    });
  });

  test("renders all events with correct labels", () => {
    render(<Calendar mockEvents={testEvents}/>);
    
    testEvents.forEach(({ classCode, room }) => {
        expect(screen.getByText(new RegExp(classCode, "i"))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(room, "i"))).toBeInTheDocument()
    });
  });

  test("ensures events are in correct grid locations", () => {
    render(<Calendar mockEvents={testEvents}/>);
    
    testEvents.forEach(({ day, startTime, endTime, classCode }) => {
      const eventElement = screen.getByText(new RegExp(classCode, "i")).closest(".event-block");
      expect(eventElement).toBeInTheDocument();

      const dayIndex = days.indexOf(day) + 2; // calendar grid starts from column 2
      const startHour = parseFloat(startTime.split(":")[0]) + (parseFloat(startTime.split(":")[1]) / 60);
      const endHour = parseFloat(endTime.split(":")[0]) + (parseFloat(endTime.split(":")[1]) / 60);
      
      const expectedGridColumn = `${dayIndex}`;
      const top = `${(((startHour - 8) * 80) + 50) + "px"}`; // mapping hour to grid row
      const height = `${((endHour - startHour) * 80) + "px"}`; //mapping duration to height

      // check if styles are correctly applied
      expect(eventElement).toHaveStyle(`grid-column-start: ${expectedGridColumn}`);
      expect(eventElement).toHaveStyle(`top: ${top}`);
      expect(eventElement).toHaveStyle(`height: ${height}`)
    });
  });
});
