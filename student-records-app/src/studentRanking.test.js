import React from "react";
import { render, screen } from "@testing-library/react";
import StudentRanking from "./studentRanking";

//test UI elements
test("renders student ranking table", async () => {
  render(<StudentRanking />);

  //check if the table headers are rendered
  expect(screen.getByText("Rank")).toBeInTheDocument();
  expect(screen.getByText("Name")).toBeInTheDocument();
  expect(screen.getByText("GPA")).toBeInTheDocument();

  //check if the student data is rendered
  const studentNames = ["Bill McGill", "John Jover", "Jane Smith", "Alice Johnson"];
  for (const name of studentNames) {
    expect(await screen.findByText(name)).toBeInTheDocument();
  }

  //check if the students are displayed by gpa desc
  const rows = screen.getAllByRole("row");
  const gpas = rows.slice(1).map(row => parseFloat(row.cells[2].textContent));
  const sortedGpas = [...gpas].sort((a, b) => b - a);
  expect(gpas).toEqual(sortedGpas);
});

//test the sortStudents function
test("students are sorted by GPA descending", () => {
  const studentData = [
    { name: "Bill McGill", gpa: 71 },
    { name: "John Jover", gpa: 98 },
    { name: "Jane Smith", gpa: 76 },
    { name: "Alice Johnson", gpa: 84 },
  ];

  const sortedStudents = studentData.sort((a, b) => b.gpa - a.gpa);
  const expectedSortedStudents = [
    { name: "John Jover", gpa: 98 },
    { name: "Alice Johnson", gpa: 84 },
    { name: "Jane Smith", gpa: 76 },
    { name: "Bill McGill", gpa: 71 },
  ];

  expect(sortedStudents).toEqual(expectedSortedStudents);
});
