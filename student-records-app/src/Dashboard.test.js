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

    test("renders without crashing", () => {
        render(<Dashboard />);
        expect(screen.getByText("Hi There")).toBeInTheDocument();
        expect(screen.getByText("Your Top Apps")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    test("redirects to home if no token is found", () => {
        render(<Dashboard />);
        expect(window.location.href).toBe("/");
    });

    test("displays username when token exists", () => {
        localStorage.setItem("token", "mockToken");
        render(<Dashboard />);
        expect(screen.getByText("Hi There")).toBeInTheDocument();
    });

    test("redirects to the correct pages when clicking app buttons", () => {
        render(<Dashboard />);

        fireEvent.click(screen.getByText("Academics"));
        expect(window.location.href).toBe("/Courses");

        fireEvent.click(screen.getByText("Finances"));
        expect(window.location.href).toBe("/Finances");
    });

    test("logs out and redirects to home when logout button is clicked", () => {
        localStorage.setItem("token", "mockToken");
        render(<Dashboard />);

        fireEvent.click(screen.getByText("Logout"));
        expect(localStorage.getItem("token")).toBeNull();
        expect(window.location.href).toBe("/");
    });
});
