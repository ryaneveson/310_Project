import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Dashboard from "./Dashboard";

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

        expect(screen.getByText("Hi There")).toBeInTheDocument();
        expect(screen.getByText("Your Top Apps")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    test("renders student dashboard when role is student", () => {
        localStorage.setItem("role", "student");
        render(<Dashboard />);

        expect(screen.getByText("Hello, Student!")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    test("redirects to the correct pages when clicking app buttons", () => {
        localStorage.setItem("role", "admin");
        render(<Dashboard />);

        fireEvent.click(screen.getByText("Academics"));
        expect(window.location.href).toBe("/Courses");

        fireEvent.click(screen.getByText("Finances"));
        expect(window.location.href).toBe("/Finances");
    });

    test("logs out and redirects to home when logout button is clicked", () => {
        localStorage.setItem("role", "admin");
        render(<Dashboard />);

        fireEvent.click(screen.getByText("Logout"));
        expect(localStorage.getItem("role")).toBeNull();
        expect(window.location.href).toBe("/");
    });
});
