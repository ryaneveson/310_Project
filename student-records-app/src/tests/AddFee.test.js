// AddFee.test.js
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddFee from "../FinancePages/AddFee";
import axios from "axios";
import { act } from "react-dom/test-utils";

jest.mock("axios");

const mockStudents = [
  {
    name: "Alice",
    lastName: "Johnson",
    studentNumber: "S1234",
    gpa: 3.5,
    classes: ["MATH 101", "PHYS 202"]
  },
  {
    name: "Bob",
    lastName: "Smith",
    studentNumber: "S5678",
    gpa: 3.2,
    classes: ["CHEM 101", "MATH 101"]
  }
];

describe("AddFee Component", () => {
  beforeEach(() => {
    localStorage.setItem("role", "admin");
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders loading state initially", () => {
    render(<AddFee />);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  test("redirects if user role is not found", () => {
    localStorage.removeItem("role");
    delete window.location;
    window.location = { href: "" };
    render(<AddFee />);
    expect(window.location.href).toBe("/");
  });

  test("renders access denied for non-admin users", async () => {
    localStorage.setItem("role", "student");
    render(<AddFee mockStudents={mockStudents} />);
    const accessDeniedText = await screen.findByText(/access denied/i);
    expect(accessDeniedText).toBeInTheDocument();
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });
  

  test("renders class checkboxes and students from mock data", async () => {
    render(<AddFee mockStudents={mockStudents} />);
    await waitFor(() => {
      expect(screen.getByTestId("checkboxes")).toBeInTheDocument();
    });
    expect(screen.getByTestId("MATH 101")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  test("filters students by class selection", async () => {
    render(<AddFee mockStudents={mockStudents} />);
    const mathCheckbox = screen.getByTestId("MATH 101");
    fireEvent.click(mathCheckbox);
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument(); // both are in MATH 101
    });
    const chemCheckbox = screen.getByTestId("CHEM 101");
    fireEvent.click(chemCheckbox);
    await waitFor(() => {
      expect(screen.queryByText("Alice")).not.toBeInTheDocument(); // Alice is not in CHEM 101
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });

  test("alerts on API failure", async () => {
    localStorage.setItem("role", "admin");
    axios.get.mockRejectedValue(new Error("Network error"));
    window.alert = jest.fn();
    await act(async () => {
      render(<AddFee />);
    });
    expect(window.alert).toHaveBeenCalledWith("error fetching students");
  });

  test("form validation prevents submission with missing fields", async () => {
    render(<AddFee mockStudents={mockStudents} />);
    const submitButton = screen.getByText(/submit fee/i);
    fireEvent.click(submitButton);
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("All fields are required and at least one student must be selected."));
  });

  test("allows selecting students and submitting valid form", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
    window.alert = jest.fn();
    render(<AddFee mockStudents={mockStudents} />);
    const selectButtons = screen.getAllByText("Select Student");
    fireEvent.click(selectButtons[0]);
    fireEvent.change(screen.getByPlaceholderText("Fee's Name . . ."), {
      target: { value: "Late Fee" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "50" },
    });
    fireEvent.change(screen.getByPlaceholderText("YYYY-MM-DD"), {
      target: { value: "2025-05-01" },
    });
    fireEvent.click(screen.getByText("Submit Fee"));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Fees added successfully for selected students.")
    );
  });
});
