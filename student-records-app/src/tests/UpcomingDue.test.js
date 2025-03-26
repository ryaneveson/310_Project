import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import UpcomingDue from "../FinancePages/UpcomingDue";
import axios from "axios";
import { act } from "react-dom/test-utils";

jest.mock("axios");

const testDues = [{
  item_name: "tuition",
  due_date: "2025-05-15T00:00:00Z",
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
},
{
    item_name: "tuition 2",
    due_date: "2025-02-15T00:00:00Z",
    amount: 1000
}];

describe("UpcomingDue Component", () => {
  beforeEach(() => {
    localStorage.setItem("role", "student");
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders loading state initially", () => {
    localStorage.clear();
    render(<UpcomingDue mockDues={testDues}/>);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  test("redirects if user role is not found", () => {
    localStorage.removeItem("role");
    delete window.location;
    window.location = { href: jest.fn() };

    render(<UpcomingDue mockDues={testDues}/>);
    expect(window.location.href).toBe("/");
  });

  test("renders access denied for non-student users", () => {
    localStorage.setItem("role", "admin");
    render(<UpcomingDue mockDues={testDues}/>);
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  test("fetches and displays payment history on successful API call", async () => {
    await act(async () => {
      render(<UpcomingDue mockDues={testDues}/>);
    });

    await waitFor(() => expect(screen.getByText(/Upcoming Dues/i)).toBeInTheDocument());
    const tableBody = screen.getByTestId("upcoming-table");
    const withinTable = within(tableBody);//ensures all of this is in the table body

    expect(withinTable.getByText(/tuition/i)).toBeInTheDocument();
    expect(withinTable.getByText(/(Tue|Wed|Thu), (1[3-5]) May 2025/i)).toBeInTheDocument();
    expect(withinTable.getByText(/1200.00/i)).toBeInTheDocument();
    expect(withinTable.getByText(/fee/i)).toBeInTheDocument();
    expect(withinTable.getByText(/(Tue|Wed|Thu), (0[8-9]|10) Apr 2025/i)).toBeInTheDocument();
    expect(withinTable.getByText(/1100.00/i)).toBeInTheDocument();

    expect(withinTable.queryByText(/payment/i)).not.toBeInTheDocument();
    expect(withinTable.queryByText(/(Sat|Sun|Mon), (0[8-9]|10) Mar 2025/i)).not.toBeInTheDocument();
    expect(withinTable.queryByText(/950.00/i)).not.toBeInTheDocument();
    expect(withinTable.queryByText(/tuition 2/i)).not.toBeInTheDocument();
    expect(withinTable.queryByText(/(Thu|Fri|Sat), (1[3-5]) Feb 2025/i)).not.toBeInTheDocument();
    expect(withinTable.queryByText(/1000.00/i)).not.toBeInTheDocument();
  });

  test("handles API error response", async () => {
    axios.get.mockRejectedValue({
      response: { data: { error: "Failed to fetch finances" } },
    });

    window.alert = jest.fn();

    await act(async () => {
      render(<UpcomingDue />);
    });

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Error: Failed to fetch finances"));
  });

  test("handles network error response", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));
    window.alert = jest.fn();

    await act(async () => {
      render(<UpcomingDue />);
    });

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Error fetching finances."));
  });
});