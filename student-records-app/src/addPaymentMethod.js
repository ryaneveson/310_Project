// AddPaymentMethod.js
import React, { useState } from "react";
import "./frontend/addPaymentMethod.css";

function AddPaymentMethod() {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic
    console.log({ paymentMethod, cardNumber, expiryDate, cvv, billingAddress });
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
      onChange: (e) => setCardNumber(e.target.value),
      maxLength: "16"
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
            {options.map((option) => (
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
