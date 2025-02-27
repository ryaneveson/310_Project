import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Dashboard from "./AcademicDashboard";
import AcademicDashboard from "./AcademicDashboard";

describe("Dashboard Component", () => {
    beforeEach(() => {
        localStorage.clear();
        delete window.location;
        window.location = { href: jest.fn() };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("renders without crashing", () => {
        render(<AcademicDashboard />);
        expect(screen.getByText("Hi There")).toBeInTheDocument();
        expect(screen.getByText("GPA")).toBeInTheDocument();
        expect(screen.getByText("Course status")).toBeInTheDocument();
    });

    test("redirects to home if no token is found", () => {
        render(<AcademicDashboard />);
        expect(window.location.href).toBe("/");
    });

    test("displays username when token exists", () => {
        localStorage.setItem("token", "mockToken");
        render(<AcademicDashboard />);
        expect(screen.getByText("Hi There")).toBeInTheDocument();
    });

    test("redirects to the correct pages when clicking app buttons", () => {
        render(<AcademicDashboard />);

        fireEvent.click(screen.getByText("Course Registration"));
        expect(window.location.href).toBe("/Courses");
        
        fireEvent.click(screen.getByText("View Grades"));
        expect(window.location.href).toBe("/Dashboard");
        
        fireEvent.click(screen.getByText("Transcript Services"));
        expect(window.location.href).toBe("/Dashboard");
    });
});
