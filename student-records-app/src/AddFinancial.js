import React, { useState } from "react";
import axios from "axios";
import "./frontend/addFinancial.css";

function AddFinancial() {
  const [formData, setFormData] = useState({
    student_id: "",
    name_on_file: "",
    card_number: "",
    expiry_date: "",
    street: "",
    city: "",
    province: "",
    postal_code: "",
    country: "",
    payment_provider: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/add-finance", {
        student_id: formData.student_id,
        name_on_file: formData.name_on_file,
        card_number: formData.card_number,
        expiry_date: formData.expiry_date,
        billing_address: {
          street: formData.street,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postal_code,
          country: formData.country,
        },
        payment_provider: formData.payment_provider,
      });

      alert(response.data.message);
      setFormData({
        student_id: "",
        name_on_file: "",
        card_number: "",
        expiry_date: "",
        street: "",
        city: "",
        province: "",
        postal_code: "",
        country: "",
        payment_provider: "",
      });
    } catch (error) {
      alert("Error submitting financial data");
    }
  };

  return (
    <div className="container">
      <div className="add-financial-container">
        <h2>Add Payment Method</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="student_id" placeholder="Student ID" value={formData.student_id} onChange={handleChange} required />
          <input type="text" name="name_on_file" placeholder="Name on File" value={formData.name_on_file} onChange={handleChange} required />
          <input type="text" name="card_number" placeholder="Credit Card Number" maxLength="16" value={formData.card_number} onChange={handleChange} required />
          <input type="text" name="expiry_date" placeholder="MM/YY" value={formData.expiry_date} onChange={handleChange} required />
          <input type="text" name="street" placeholder="Street Address" value={formData.street} onChange={handleChange} required />
          <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
          <input type="text" name="province" placeholder="Province" value={formData.province} onChange={handleChange} required />
          <input type="text" name="postal_code" placeholder="Postal Code" value={formData.postal_code} onChange={handleChange} required />
          <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
          <input type="text" name="payment_provider" placeholder="Payment Provider (Stripe, PayPal, etc.)" value={formData.payment_provider} onChange={handleChange} required />
          <button type="submit">Submit Payment</button>
        </form>
      </div>
    </div>
  );
}

export default AddFinancial;
