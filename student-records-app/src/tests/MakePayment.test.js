import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import MakePayment from "../MakePayment";
import axios from "axios";

jest.mock("axios");

// Mock window.location
delete window.location;
window.location = { href: jest.fn() };

describe("MakePayment Component", () => {
  const mockPaymentMethods = [
    {
      card_type: "Visa",
      card_number: "1111 2222 3333 4444",
      card_name: "John Doe",
      card_address: "123 Main St",
      expiry_date: "12/25",
      cvv: "123",
    },
  ];

  const mockFinances = [
    {
      amount: 100,
      is_paid: false,
      due_date: new Date().toISOString(),
    },
    {
      amount: 200,
      is_paid: false,
      due_date: new Date(new Date().setDate(new Date().getDate() + 31)).toISOString(),
    },
  ];

  beforeEach(() => {
    localStorage.setItem("role", "student");

    axios.get.mockImplementation((url) => {
      if (url.includes("payment_methods")) {
        return Promise.resolve({ data: { payment_methods: mockPaymentMethods } });
      } else if (url.includes("finances")) {
        return Promise.resolve({ data: { finances: mockFinances } });
      }
    });
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders loading initially", async () => {
    render(<MakePayment />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });

  test("redirects to '/' if no role is found", () => {
    localStorage.removeItem("role");
    render(<MakePayment />);
    expect(window.location.href).toBe("/");
  });

  test("denies access if role is not 'student'", async () => {
    localStorage.setItem("role", "admin");
    render(<MakePayment />);
    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  test("renders payment form for student with data", async () => {
    localStorage.setItem("role", "student");
    render(<MakePayment />);
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Remaining Balance/i)).toBeInTheDocument();
    const option = within(screen.getByTestId("MakePayment-option"));
    expect(option.getByText(/Visa/)).toBeInTheDocument();
  });

  test("validates and submits payment", async () => {
    global.alert = jest.fn();
    render(<MakePayment />);
    await waitFor(() => screen.getByText(/confirm payment/i));
    fireEvent.change(screen.getByPlaceholderText("$0.00"), {
      target: { value: "100.00" },
    });
    fireEvent.click(screen.getByLabelText(/visa/i));
    fireEvent.change(screen.getByPlaceholderText("XXXX XXXX XXXX XXXX"), {
      target: { value: "1111 2222 3333 4444" },
    });
    fireEvent.change(screen.getByPlaceholderText("CVV"), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByPlaceholderText("MM/YY"), {
      target: { value: "2025-12" },
    });
    fireEvent.click(screen.getByText(/confirm payment/i));
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Payment of $100.00 confirmed")
      );
      expect(window.location.href).toBe("/Finances");
    });
  });

  test("shows validation error when card info is incorrect", async () => {
    render(<MakePayment />);
    await waitFor(() => screen.getByText(/confirm payment/i));
    fireEvent.change(screen.getByPlaceholderText("$0.00"), {
      target: { value: "100.00" },
    });
    fireEvent.click(screen.getByLabelText(/visa/i));
    fireEvent.change(screen.getByPlaceholderText("XXXX XXXX XXXX XXXX"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByText(/confirm payment/i));
    expect(screen.getByText(/invalid card details/i)).toBeInTheDocument();
  });
});
