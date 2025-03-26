import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AcademicDashboard from "../StudentPages/AcademicDashboard";

describe("Dashboard Component", () => {
    beforeEach(() => {
        localStorage.clear();
        delete window.location;
        window.location = { href: jest.fn()  };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("renders without crashing", () => {
        localStorage.setItem("role", "student");
        render(<AcademicDashboard />);
        expect(screen.getByText("Academic Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Current Semester")).toBeInTheDocument();
        expect(screen.getByText("Academic Progress")).toBeInTheDocument();
    });

    test("redirects to home if no token is found", () => {
        render(<AcademicDashboard />);
        expect(window.location.href).toBe("/");
    });

    test("redirects to the correct pages when clicking app buttons", () => {
        localStorage.setItem("role", "student");
        render(<AcademicDashboard />);

        fireEvent.click(screen.getByText("Course Registration"));
        expect(window.location.href).toBe("/courses");
        
        fireEvent.click(screen.getByText("Request Transcript"));
        expect(window.location.href).toBe("/courses");
    });
});
