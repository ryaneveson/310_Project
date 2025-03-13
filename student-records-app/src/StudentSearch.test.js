import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StudentSearch from "./StudentSearch";
const axios = require("axios");

jest.mock("axios");

const testStudents = [
    {name: "Alice", lastName: "Johnson", studentNumber: "10000001", gpa: 85, classes: ["MATH 101", "HIST 201", "SCIE 301", "ART 101", "ENGL 102"]},
    {name: "Bob", lastName: "Smith", studentNumber: "10000002", gpa: 72, classes: ["MATH 101", "BIOL 201", "PHYS 301", "CHEM 102", "PHIL 103"]},
    {name: "Charlie", lastName: "Brown", studentNumber: "10000003", gpa: 80, classes: ["MATH 101", "HIST 201", "ECON 101", "ART 101", "ENGL 103"]},
    {name: "David", lastName: "Davis", studentNumber: "10000004", gpa: 75, classes: ["MATH 201", "HIST 101", "PSYC 301", "MUSI 102", "BIOL 103"]},
    {name: "Eva", lastName: "Wilson", studentNumber: "10000005", gpa: 92, classes: ["CHEM 101", "MATH 301", "PHYS 101", "ART 101", "LITR 102"]},
    {name: "Frank", lastName: "Miller", studentNumber: "10000006", gpa: 69, classes: ["HIST 101", "COMP 201", "MATH 301", "PHIL 102", "SOCI 103"]},
    {name: "Grace", lastName: "Moore", studentNumber: "10000007", gpa: 78, classes: ["PHYS 101", "BIOL 102", "MATH 101", "HIST 102", "PSYC 101"]},
    {name: "Hannah", lastName: "Taylor", studentNumber: "10000008", gpa: 76, classes: ["CHEM 101", "HIST 103", "MATH 101", "PHIL 104", "BIOL 201"]},
    {name: "Isaac", lastName: "Anderson", studentNumber: "10000009", gpa: 87, classes: ["COMP 101", "MATH 301", "PHYS 101", "ART 102", "LITR 103"]},
    {name: "Jack", lastName: "Thomas", studentNumber: "10000010", gpa: 71, classes: ["MUSI 101", "MATH 201", "BIOL 102", "ART 101", "SOCI 104"]}
];

describe("StudentSearch Component", () => {
    test("renders without crashing", () => {
        render(<StudentSearch mockStudents={testStudents}/>);
        expect(screen.getByText("Search for a student:")).toBeInTheDocument();
        expect(screen.getByText("Filtered Students:")).toBeInTheDocument();
    });

    test("filters students by first name, last name and student number search", () => {
        render(<StudentSearch mockStudents={testStudents}/>);
        
        const searchInput = screen.getByPlaceholderText("Search for a student...");

        fireEvent.change(searchInput, { target: { value: "Alice" } });
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.queryByText("Bob")).not.toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: "Moore" } });
        expect(screen.getByText("Grace")).toBeInTheDocument();
        expect(screen.queryByText("Bob")).not.toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: "8" } });
        expect(screen.getByText("Hannah")).toBeInTheDocument();
        expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    });
    
    test("filters students by GPA range", () => {
        render(<StudentSearch mockStudents={testStudents}/>);

        const minGpaInput = screen.getByPlaceholderText("0");
        const maxGpaInput = screen.getByPlaceholderText("100");
        
        fireEvent.change(minGpaInput, { target: { value: "80" } });
        fireEvent.change(maxGpaInput, { target: { value: "90" } });
        
        expect(screen.queryByText("Alice")).toBeInTheDocument(); // Alice has 85 gpa
        expect(screen.queryByText("Bob")).not.toBeInTheDocument(); // Bob has 72 gpa
        expect(screen.queryByText("Eva")).not.toBeInTheDocument();// Eva has 92 gpa
    });

    test("filters students by selected classes", () => {
        render(<StudentSearch mockStudents={testStudents}/>);
        
        const mathCheckbox = screen.getByTestId("MATH 101");
        fireEvent.click(mathCheckbox);
        
        expect(screen.getByText("Alice")).toBeInTheDocument(); // Alice is in math 101
        expect(screen.queryByText("Eva")).not.toBeInTheDocument(); // Eva is not in math 101
    });

    test("toggles sidebar visibility", () => {
        render(<StudentSearch mockStudents={testStudents}/>);

        expect(screen.getByTestId("checkboxes")).toHaveStyle(`height: auto`);
        const toggleButton = screen.getByText("Collapse");
        fireEvent.click(toggleButton);
        expect(screen.getByTestId("checkboxes")).toHaveStyle(`height: 0`);
        expect(screen.getByText("Expand")).toBeInTheDocument();
        fireEvent.click(toggleButton);
        expect(screen.getByTestId("checkboxes")).toHaveStyle(`height: auto`);
    });

    test("clear and reset buttons work correctly", () => {
        render(<StudentSearch mockStudents={testStudents}/>);

        const searchInput = screen.getByPlaceholderText("Search for a student...");
        const minGpaInput = screen.getByPlaceholderText("0");
        const maxGpaInput = screen.getByPlaceholderText("100");
        const clearSearchButton = screen.getByText("Clear");
        const clearMinGpaButton = screen.getAllByTestId("reset")[1];
        const clearMaxGpaButton = screen.getAllByTestId("reset")[0];
        const resetButton = screen.getAllByTestId("reset")[2];
        
        fireEvent.change(searchInput, { target: { value: "Alice" } });
        fireEvent.click(clearSearchButton);
        expect(searchInput.value).toBe("");

        fireEvent.change(minGpaInput, { target: { value: "80" } });
        fireEvent.click(clearMinGpaButton);
        expect(minGpaInput.value).toBe("0");

        fireEvent.change(maxGpaInput, { target: { value: "90" } });
        fireEvent.click(clearMaxGpaButton);
        expect(maxGpaInput.value).toBe("100");

        screen.getAllByRole("checkbox").forEach(checkbox => {
            if (!checkbox.checked) {
                fireEvent.click(checkbox);
            }
        });
        fireEvent.click(resetButton);
        expect(screen.getAllByRole("checkbox").every(checkbox => !checkbox.checked)).toBe(true);
    });

});
