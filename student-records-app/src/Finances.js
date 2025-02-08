import React, { useEffect, useState } from "react";
import "./finances.css";

function Finances() {
  const [billingMethods, setBillingMethods] = useState([]);
  const [itemsDue, setItemsDue] = useState([]);

  useEffect(() => {
    // Sample billing methods array
    setBillingMethods([
      { "Card Type": "Visa", "Card Number": "**** **** **** 1234", "Cardholder Name": "John Doe", "Billing Address": "123 Main St, City, Country" },
      { "Card Type": "MasterCard", "Card Number": "**** **** **** 5678", "Cardholder Name": "Jane Smith", "Billing Address": "456 Elm St, City, Country" }
    ]);

    // Sample items due array
    setItemsDue([
      ["course1", "500", "Jan 1"],
      ["course2", "500", "Jan 1"],
      ["fees", "250", "Sept 1"]
    ]);
  }, []);

  // Render billing methods table
  const renderBillingMethods = () => {
    return billingMethods.map((method, index) => (
      <div key={index}>
        <h4>{`Billing Method ${index + 1}`}</h4>
        <table>
          {Object.entries(method).map(([key, value]) => (
            <tr key={key}>
              <th>{key}</th>
              <td>{value}</td>
            </tr>
          ))}
        </table>
      </div>
    ));
  };

  // Render items due table
  const renderItemsDue = () => {
    return itemsDue.map((item, index) => (
      <tr key={index}>
        {item.map((detail, i) => (
          <td key={i}>{detail}</td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="container" id="finances">
      <h1>Financial Dashboard</h1>
      <div className="box-container">
        <p>Current Account Balance: {/* Replace with real data */}</p>
        <p>Amount due in next 30 days: {/* Replace with real data */}</p>
        <p>Total future amount due: {/* Replace with real data */}</p>
        <a href="/makePayment">Pay Tuition</a>
        <a href="/finances">Change financial information</a>

        <div className="info-table">
          <h3>Billing Methods:</h3>
          <div id="billing-tables">
            {renderBillingMethods()}
          </div>
        </div>

        <div className="info-table">
          <h3>Future Items Due</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Amount</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody id="items-due">
              {renderItemsDue()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Finances;
