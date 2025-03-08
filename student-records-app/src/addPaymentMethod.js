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

  return (
    <div className="payment-method-container">
      <h2>Add Payment Method</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="payment-method">Payment Method:</label>
        <select
          id="payment-method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          required
        >
          <option value="">Select</option>
          <option value="Visa">Credit Card</option>
          <option value="MasterCard">Debit Card</option>
          <option value="DebitCard">PayPal</option>
        </select>

        <label htmlFor="card-number">Card Number:</label>
        <input
          id="card-number"
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          required
          maxLength="16"
        />

        <label htmlFor="expiry-date">Expiry Date:</label>
        <input
          id="expiry-date"
          type="month"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          required
        />

        <label htmlFor="cvv">CVV:</label>
        <input
          id="cvv"
          type="text"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          required
          maxLength="4"
        />

        <label htmlFor="billing-address">Billing Address:</label>
        <textarea
          id="billing-address"
          value={billingAddress}
          onChange={(e) => setBillingAddress(e.target.value)}
          required
        ></textarea>

        <button type="submit">Add Payment Method</button>
      </form>
    </div>
  );
}

export default AddPaymentMethod;
