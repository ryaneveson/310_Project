import { render, screen, waitFor } from "@testing-library/react";
import Finances from "./Finances";
import axios from "axios";

jest.mock("axios");

describe("Finances Component", () => {
  beforeEach(() => {
    localStorage.setItem("role", "student");
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders loading state initially", () => {
    render(<Finances />);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  test("renders financial data after fetching", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        finances: [
          { item_name: "payment", amount: 50, due_date: "2025-03-15", is_paid: true },
          { item_name: "tuition", amount: 200, due_date: "2025-03-20", is_paid: false },
          { item_name: "payment", amount: 30, due_date: "2025-03-10", is_paid: true },
        ],
      },
    });
    render(<Finances />);
    await waitFor(() => {
      expect(screen.getByText(/Current Balance: \$200/i)).toBeInTheDocument();
      expect(screen.getByText(/Due Date: (Tue|Wed|Thu), (1[8-9]|20) Mar 2025/i)).toBeInTheDocument();
      expect(screen.getByText(/Last Payment: \$30/i)).toBeInTheDocument();
      expect(screen.getByText(/Payment Date: (Sat|Sun|Mon), (0[8-9]|10) Mar 2025/i)).toBeInTheDocument();
    });
  });

  test("shows access denied message for non-student roles", async () => {
    localStorage.setItem("role", "admin");
    axios.get.mockResolvedValueOnce({
        data: {
          finances: [
            { item_name: "payment", amount: 50, due_date: "2025-03-15", is_paid: true },
            { item_name: "tuition", amount: 200, due_date: "2025-03-20", is_paid: false },
            { item_name: "payment", amount: 30, due_date: "2025-03-10", is_paid: true },
          ],
        },
      });
    render(<Finances />);
    await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  test("redirects to the homepage if no role is in localStorage", async () => {
    localStorage.removeItem("role");
    delete window.location;
    window.location = { href: "" };
    render(<Finances />);
    await waitFor(() => {
      expect(window.location.href).toBe("/");
    });
  });

  test("handles error during API call", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<Finances />);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Error fetching finances.");
    });
  });
});
