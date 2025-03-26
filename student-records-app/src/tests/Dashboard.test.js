import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Dashboard from "../Dashboard";

describe("Dashboard Component", () => {
    beforeEach(() => {
        localStorage.clear();
        delete window.location;
        window.location = { href: jest.fn() };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("redirects to home if no role is found", () => {
        render(<Dashboard />);
        expect(window.location.href).toBe("/");
    });

    test("renders admin dashboard when role is admin", () => {
        localStorage.setItem("role", "admin");
        render(<Dashboard />);

        expect(screen.getByText("Hi There Admin")).toBeInTheDocument();
        expect(screen.getByText("Administrative Tools")).toBeInTheDocument();
        expect(screen.getByText("Awaiting Your Action")).toBeInTheDocument();
    });

    test("redirects to the correct admin pages when clicking app buttons", () => {
        localStorage.setItem("role", "admin");
        render(<Dashboard />);

        fireEvent.click(screen.getByText("Course Management"));
        expect(window.location.href).toBe("/courses");

        fireEvent.click(screen.getByText("Grade Management"));
        expect(window.location.href).toBe("/editGrades");
    });

    test("renders student dashboard when role is admin", () => {
        localStorage.setItem("role", "student");
        localStorage.setItem("username", "student");
        render(<Dashboard />);

        expect(screen.getByText("Welcome, student!")).toBeInTheDocument();
        expect(screen.getByText("Quick Actions")).toBeInTheDocument();
        expect(screen.getByText("Academic Status")).toBeInTheDocument();
    });

    test("redirects to the correct student pages when clicking app buttons", () => {
        localStorage.setItem("role", "student");
        render(<Dashboard />);

        fireEvent.click(screen.getByText("Academic Dashboard"));
        expect(window.location.href).toBe("/academicdashboard");

        fireEvent.click(screen.getByText("Financial Dashboard"));
        expect(window.location.href).toBe("/finances");
    });
});
