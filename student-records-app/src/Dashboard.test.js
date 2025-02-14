import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Dashboard from "./Dashboard";

const mockNavigate = jest.fn();

jest.mock("./Dashboard", () => (props) => {
    const ActualDashboard = jest.requireActual("./Dashboard").default;
    return <ActualDashboard {...props} navigate={mockNavigate} />;
});

describe("Dashboard Component", () => {
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockClear();
    });

    test("renders without crashing", () => {
        render(<Dashboard />);
        expect(screen.getByText("Hi There")).toBeInTheDocument();
        expect(screen.getByText("Your Top Apps")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    test("redirects to home if no token is found", () => {
        render(<Dashboard />);
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    test("displays username when token exists", () => {
        localStorage.setItem("token", "mockToken");
        render(<Dashboard />);
        expect(screen.getByText("Hi There")).toBeInTheDocument();
    });

    test("navigates to the correct pages when clicking app buttons", () => {
        render(<Dashboard />);
        
        fireEvent.click(screen.getByText("Academics"));
        expect(mockNavigate).toHaveBeenCalledWith("/Courses");

        fireEvent.click(screen.getByText("Finances"));
        expect(mockNavigate).toHaveBeenCalledWith("/Finances");
    });

    test("logs out and redirects to home when logout button is clicked", () => {
        localStorage.setItem("token", "mockToken");
        render(<Dashboard />);

        fireEvent.click(screen.getByText("Logout"));
        expect(localStorage.getItem("token")).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });
});
