import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StudentSearch from "../StudentSearch";
import axios from "axios";

// Mock axios properly
jest.mock('axios', () => ({
    get: jest.fn()
}));

describe("Selected Students Functionality", () => {
    const testStudents = [
        {name: "Alice", lastName: "Johnson", studentNumber: "10000001", gpa: 85, classes: ["MATH 101", "HIST 201"]},
        {name: "Bob", lastName: "Smith", studentNumber: "10000002", gpa: 72, classes: ["MATH 101", "BIOL 201"]}
    ];

    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = {
            getItem: jest.fn(() => 'admin'),
            removeItem: jest.fn()
        };
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        // Mock axios response
        axios.get.mockResolvedValue({
            data: {
                students: testStudents
            }
        });
    });

    // Clear all mocks after each test
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("selected students are stored in selectedStudents state", async () => {
        render(<StudentSearch />);
        
        // Wait for the component to load and display students
        await screen.findByText("Search for a student:");

        // Initially, there should be no selected students
        expect(screen.queryByText("Selected Students")).toBeInTheDocument();
        const selectedStudentsTable = screen.getAllByRole("table")[1]; // Second table is Selected Students
        expect(selectedStudentsTable).not.toHaveTextContent("Alice");

        // Select Alice
        const selectButtons = screen.getAllByText("Select Student");
        fireEvent.click(selectButtons[0]); // Select the first student (Alice)

        // Verify Alice appears in Selected Students section
        expect(selectedStudentsTable).toHaveTextContent("Alice");
        expect(selectedStudentsTable).toHaveTextContent("Johnson");
        expect(selectedStudentsTable).toHaveTextContent("10000001");

        // Select Bob
        fireEvent.click(selectButtons[1]); // Select the second student (Bob)

        // Verify both Alice and Bob are in Selected Students section
        expect(selectedStudentsTable).toHaveTextContent("Alice");
        expect(selectedStudentsTable).toHaveTextContent("Bob");

        // Remove Alice using the Remove Student button
        const removeButtons = screen.getAllByText("Remove Student");
        fireEvent.click(removeButtons[0]); // Remove the first student (Alice)

        // Verify Alice is removed but Bob remains
        expect(selectedStudentsTable).not.toHaveTextContent("Alice");
        expect(selectedStudentsTable).toHaveTextContent("Bob");
    });
}); 