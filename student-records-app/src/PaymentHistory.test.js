import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import PaymentHistory from "./PaymentHistory";
import axios from "axios";
import { act } from "react-dom/test-utils";

jest.mock("axios");

const testPayments = [{
  item_name: "payment",
  due_date: "2025-02-15T00:00:00Z",
  amount: 1200
},
{
  item_name: "payment",
  due_date: "2025-03-10T00:00:00Z",
  amount: 950
},
{
  item_name: "fee",
  due_date: "2025-04-10T00:00:00Z",
  amount: 1100
}];

describe("PaymentHistory Component", () => {
  beforeEach(() => {
    localStorage.setItem("role", "student");
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders loading state initially", () => {
    localStorage.clear();
    render(<PaymentHistory mockPayments={testPayments}/>);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  test("redirects if user role is not found", () => {
    localStorage.removeItem("role");
    delete window.location;
    window.location = { href: jest.fn() };

    render(<PaymentHistory mockPayments={testPayments}/>);
    expect(window.location.href).toBe("/");
  });

  test("renders access denied for non-student users", () => {
    localStorage.setItem("role", "admin");
    render(<PaymentHistory mockPayments={testPayments}/>);
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  test("fetches and displays payment history on successful API call", async () => {
    await act(async () => {
      render(<PaymentHistory mockPayments={testPayments}/>);
    });

    await waitFor(() => expect(screen.getByText(/Payment History/i)).toBeInTheDocument());
    expect(screen.getByText(/Fri, \d{2} Feb 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/1200.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Sun, \d{2} Mar 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/950.00/i)).toBeInTheDocument();
    expect(screen.queryByText(/Wed, \d{2} Apr 2025/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/1100.00/i)).not.toBeInTheDocument();
  });

  test("handles API error response", async () => {
    axios.get.mockRejectedValue({
      response: { data: { error: "Failed to fetch finances" } },
    });

    window.alert = jest.fn();

    await act(async () => {
      render(<PaymentHistory />);
    });

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Error: Failed to fetch finances"));
  });

  test("handles network error response", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));
    window.alert = jest.fn();

    await act(async () => {
      render(<PaymentHistory />);
    });

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Error fetching finances."));
  });
});