import React, { useState } from "react";
import "./frontend/addPaymentMethod.css";
import useUser from "./utils/useUser";

function AddPaymentMethod() {
  const { userRole, studentId, handleLogout } = useUser();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [username, setUsername] = useState("");

  if (userRole !== "student") {
    return (
      <div className="dashboard-container">
        <h2>Access Denied</h2>
        <p>This page is only accessible to students.</p>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  const validateCardNumber = (number) => {
    const regex = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
    return regex.test(number);
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!paymentMethod || !cardNumber || !expiryDate || !cvv || !billingAddress) {
      alert("All fields are required.");
      return;
    }

    if (!validateCardNumber(cardNumber)) {
      alert("Card number must be in format: XXXX XXXX XXXX XXXX");
      return;
    }

    const formattedExpiryDate = expiryDate.split("-").map((part, index) => 
      index === 0 ? part.slice(2) : part
    ).reverse().join("/");

    const paymentData = {
      student_id: studentId,
      card_type: paymentMethod,
      card_number: cardNumber,
      card_name: username,
      card_address: billingAddress,
      expiry_date: formattedExpiryDate,
      cvv: cvv
    };
    console.log(paymentData);
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
        setPaymentMethod("");
        setCardNumber("");
        setExpiryDate("");
        setCvv("");
        setBillingAddress("");
      } else {
        alert(`Error: adding payment method: ${data.error}`);
        console.log(response);
        console.log(data.error);
      }
    } catch (error) {
      alert(`Error adding payment method: ${error.message}`);
    }
  };

  return (
    <div className="payment-method-container">
      <h2>Add Payment Method</h2>
      <form onSubmit={handleSubmit}>
      <label>Card Name:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>Payment Method:
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
            <option value="">Select</option>
            <option value="Visa">Visa</option>
            <option value="MasterCard">MasterCard</option>
            <option value="DebitCard">PayPal</option>
          </select>
        </label>
        <label>Card Number:
          <input type="text" value={cardNumber} onChange={handleCardNumberChange} placeholder="XXXX XXXX XXXX XXXX" maxLength="19" required />
        </label>
        <label>Expiry Date:
          <input type="month" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
        </label>
        <label>CVV:
          <input type="text" value={cvv} onChange={(e) => setCvv(e.target.value)} maxLength="3" required />
        </label>
        <label>Billing Address:
          <textarea value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} required />
        </label>
        <button type="submit">Add Payment Method</button>
      </form>
    </div>
  );
}

export default AddPaymentMethod;
