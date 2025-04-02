import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddPaymentMethod from "../addPaymentMethod"; 

global.fetch = jest.fn();

const mockLocalStorage = {
    getItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
});

describe("AddPaymentMethod", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockImplementation((key) => {
      const values = {
        "role": "student",
        "student_id": "test_student_id",
        "username": "Test User"
      };
      return values[key];
    });
    fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Success" })
      })
    );
  });

  test("renders form fields correctly", () => {
    render(<AddPaymentMethod />);

    expect(screen.getByLabelText(/Payment Method/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Card Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expiry Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CVV/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Billing Address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Payment Method/i })).toBeInTheDocument();
  });

  test("submits form data successfully", async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<AddPaymentMethod />);

    fireEvent.change(screen.getByLabelText(/Payment Method/i), { 
      target: { value: "Visa" } 
    });
    fireEvent.change(screen.getByLabelText(/Card Number/i), { 
      target: { value: "1234567812345678" } 
    });
    fireEvent.change(screen.getByLabelText(/Expiry Date/i), { 
      target: { value: "2025-12" } 
    });
    fireEvent.change(screen.getByLabelText(/CVV/i), { 
      target: { value: "123" } 
    });
    fireEvent.change(screen.getByLabelText(/Billing Address/i), { 
      target: { value: "123 Main St" } 
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Payment Method/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/student/payment_methods",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.any(String)
        })
      );
    });

    expect(alertMock).toHaveBeenCalledWith('Payment method added successfully!');
    alertMock.mockRestore();
  });

  test("handles form submission error", async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Test error" })
      })
    );

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<AddPaymentMethod />);

    fireEvent.change(screen.getByLabelText(/Payment Method/i), { 
      target: { value: "Visa" } 
    });
    fireEvent.change(screen.getByLabelText(/Card Number/i), { 
      target: { value: "1234567812345678" } 
    });
    fireEvent.change(screen.getByLabelText(/Expiry Date/i), { 
      target: { value: "2025-12" } 
    });
    fireEvent.change(screen.getByLabelText(/CVV/i), { 
      target: { value: "123" } 
    });
    fireEvent.change(screen.getByLabelText(/Billing Address/i), { 
      target: { value: "123 Main St" } 
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Payment Method/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error adding payment method: Test error');
    });
    alertMock.mockRestore();
  });

  test("validates required fields", async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<AddPaymentMethod />);
    
    fireEvent.click(screen.getByRole("button", { name: /Add Payment Method/i }));

    expect(alertMock).toHaveBeenCalledWith('All fields are required.');
    expect(fetch).not.toHaveBeenCalled();
    
    alertMock.mockRestore();
  });
});
