// AddPaymentMethod.js
import React, { useState } from "react";
import "./frontend/addPaymentMethod.css";

function AddPaymentMethod() {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  const validateCardNumber = (number) => {
    const regex = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
    return regex.test(number);
  };

  const formatCardNumber = (value) => {
    // Remove all spaces and non-digits
    const cleaned = value.replace(/\D/g, '');
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate that all fields are filled
    if (!paymentMethod || !cardNumber || !expiryDate || !cvv || !billingAddress) {
      alert("All fields are required.");
      return;
    }

    // Validate card number format
    if (!validateCardNumber(cardNumber)) {
      alert("Card number must be in format: XXXX XXXX XXXX XXXX");
      return;
    }

    // Format expiry date to MM/YY format
    const formattedExpiryDate = new Date(expiryDate).toLocaleDateString('en-US', {
      month: '2-digit',
      year: '2-digit'
    });

    // Create payment method data object
    const paymentData = {
      student_id: localStorage.getItem("student_id"), // Assuming student_id is stored in localStorage
      card_type: paymentMethod,
      card_number: cardNumber,
      card_name: localStorage.getItem("username"), // Using username as card_name
      card_address: billingAddress,
      expiry_date: formattedExpiryDate,
      cvv: cvv
    };

    try {
      const response = await fetch("http://localhost:5000/api/student/payment_methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Payment method added successfully!');
        // Reset form
        setPaymentMethod("");
        setCardNumber("");
        setExpiryDate("");
        setCvv("");
        setBillingAddress("");
      } else {
        alert(`Error adding payment method: ${data.error}`);
      }
    } catch (error) {
      alert(`Error adding payment method: ${error.message}`);
    }
  };

  const formFields = [
    {
      id: "payment-method",
      label: "Payment Method",
      type: "select",
      value: paymentMethod,
      onChange: (e) => setPaymentMethod(e.target.value),
      options: [
        { value: "", label: "Select" },
        { value: "Visa", label: "Visa" },
        { value: "MasterCard", label: "MasterCard" },
        { value: "DebitCard", label: "PayPal" }
      ]
    },
    {
      id: "card-number",
      label: "Card Number",
      type: "text",
      value: cardNumber,
      onChange: handleCardNumberChange,
      maxLength: "19",
      placeholder: "XXXX XXXX XXXX XXXX"
    },
    {
      id: "expiry-date",
      label: "Expiry Date",
      type: "month",
      value: expiryDate,
      onChange: (e) => setExpiryDate(e.target.value)
    },
    {
      id: "cvv",
      label: "CVV",
      type: "text",
      value: cvv,
      onChange: (e) => setCvv(e.target.value),
      maxLength: "4"
    },
    {
      id: "billing-address",
      label: "Billing Address",
      type: "textarea",
      value: billingAddress,
      onChange: (e) => setBillingAddress(e.target.value)
    }
  ];

  const renderField = (field) => {
    const { id, label, type, value, onChange, options, ...props } = field;

    return (
      <div key={id}>
        <label htmlFor={id}>{label}:</label>
        {type === "select" ? (
          <select id={id} value={value} onChange={onChange} required {...props}>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea id={id} value={value} onChange={onChange} required {...props} />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            required
            {...props}
          />
        )}
      </div>
    );
  };

  return (
    <div className="payment-method-container">
      <h2>Add Payment Method</h2>
      <form onSubmit={handleSubmit}>
        {formFields.map(renderField)}
        <button type="submit">Add Payment Method</button>
      </form>
    </div>
  );
}

export default AddPaymentMethod;
