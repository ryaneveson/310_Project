import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import StudentRanking from "../studentRanking";

// Mock fetch globally
global.fetch = jest.fn();

describe('StudentRanking Component', () => {
  const mockStudents = {
    students: [
      {
        name: "Sami",
        lastName: "Jaffri",
        studentNumber: "10000008",
        major: "Computer Science",
        gpa: 100.00,
        classes: ["COSC 111", "COSC 121", "MATH 100"]
      },
      {
        name: "Dora",
        lastName: "Explora",
        studentNumber: "10000007",
        major: "Geography",
        gpa: 89.33,
        classes: ["COSC 310", "COSC 222", "COSC 221"]
      }
    ]
  };

  beforeEach(() => {
    // Reset fetch mock before each test
    fetch.mockReset();
    // Mock successful fetch response
    fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudents)
      })
    );
  });

  test("renders loading state initially", () => {
    render(<StudentRanking />);
    expect(screen.getByText("Loading student rankings...")).toBeInTheDocument();
  });

  test("renders student ranking table with data", async () => {
    render(<StudentRanking />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading student rankings...")).not.toBeInTheDocument();
    });

    // Check if table headers are present
    expect(screen.getByText("Rank")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("GPA")).toBeInTheDocument();

    // Check if mock student data is displayed
    expect(screen.getByText("Sami Jaffri")).toBeInTheDocument();
    expect(screen.getByText("Dora Explora")).toBeInTheDocument();
    expect(screen.getByText("100.00")).toBeInTheDocument();
    expect(screen.getByText("89.33")).toBeInTheDocument();
  });

  test("handles fetch error", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.reject(new Error("Failed to fetch"))
    );

    render(<StudentRanking />);

    await waitFor(() => {
      expect(screen.getByText("Error: Failed to fetch")).toBeInTheDocument();
    });
  });

  test("renders filter options", async () => {
    render(<StudentRanking />);

    await waitFor(() => {
      expect(screen.queryByText("Loading student rankings...")).not.toBeInTheDocument();
    });

    // Check if filter elements are present
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Min GPA:")).toBeInTheDocument();
    expect(screen.getByText("Max GPA:")).toBeInTheDocument();
    expect(screen.getByText("Course:")).toBeInTheDocument();
    expect(screen.getByText("Major:")).toBeInTheDocument();
    expect(screen.getByText("Year:")).toBeInTheDocument();
  });

});
